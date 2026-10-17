import { useState } from 'react'
import HomeScreen from './HomeScreen'
import { STATUSES } from '../../constants/status'
import {
  useAddTodo,
  useBulkStatus,
  useDeleteTodos,
  useProfile,
  useSaveOrder,
  useSetTodos,
  useTodos,
  useUpdateProfile,
  useUpdateTodo,
} from '../../query/api'

// Shown until the profile loads (or if the database has none).
const GUEST = { username: 'Guest', email: '' }

export default function HomeContainer() {
  const [filter, setFilter] = useState('All')
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(new Set())

  const filters = { status: filter === 'All' ? undefined : filter, q: search.trim() || undefined }
  const { data: todos = [] } = useTodos(filters)
  const { data: profile = GUEST } = useProfile()
  const setTodos = useSetTodos(filters)
  const addTodo = useAddTodo()
  const updateTodo = useUpdateTodo()
  const bulkStatus = useBulkStatus()
  const removeTodos = useDeleteTodos()
  const saveOrder = useSaveOrder()
  const updateProfile = useUpdateProfile()

  const saveProfile = ({ username, email }) =>
    updateProfile.mutate({ id: profile.username, username, email })

  const deleteTodos = (ids) => {
    removeTodos.mutate([...ids])
    setSelected(new Set())
  }

  const setSelectedStatus = (status) => {
    bulkStatus.mutate({ ids: [...selected], status })
    setSelected(new Set())
  }

  const toggleSelect = (id) =>
    setSelected((prev) => {
      const next = new Set(prev)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const selectAll = (checked) =>
    setSelected(checked ? new Set(todos.map((t) => t.id)) : new Set())

  // Reorders on screen while dragging; onMoveEnd saves it.
  const moveTodo = (fromId, toId) =>
    setTodos((prev) => {
      const next = [...prev]
      const from = next.findIndex((t) => t.id === fromId)
      const [item] = next.splice(from, 1)
      next.splice(next.findIndex((t) => t.id === toId), 0, item)
      return next
    })

  return (
    <HomeScreen
      profile={profile}
      onProfileSave={saveProfile}
      todos={todos}
      filtered={Boolean(filters.status || filters.q)}
      filter={filter}
      onFilterChange={setFilter}
      search={search}
      onSearchChange={setSearch}
      selected={selected}
      onToggleSelect={toggleSelect}
      onSelectAll={selectAll}
      onAdd={(title) => addTodo.mutate({ title, status: STATUSES[0] })}
      onUpdate={(id, changes) => updateTodo.mutate({ id, changes })}
      onDelete={(id) => deleteTodos(new Set([id]))}
      onBulkDelete={() => deleteTodos(selected)}
      onBulkStatus={setSelectedStatus}
      onMove={moveTodo}
      onMoveEnd={() => saveOrder.mutate(todos.map((t) => t.id))}
    />
  )
}
