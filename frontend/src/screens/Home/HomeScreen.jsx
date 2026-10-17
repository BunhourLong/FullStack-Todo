import ProfileCard from '../../components/ProfileCard'
import TodoForm from '../../components/TodoForm'
import Toolbar from '../../components/Toolbar'
import TodoList from '../../components/TodoList'

export default function HomeScreen({
  profile,
  onProfileSave,
  todos,
  filtered,
  filter,
  onFilterChange,
  search,
  onSearchChange,
  selected,
  onToggleSelect,
  onSelectAll,
  onAdd,
  onUpdate,
  onDelete,
  onBulkDelete,
  onBulkStatus,
  onMove,
  onMoveEnd,
}) {
  return (
    <main className="home">
      <header className="home-header">
        <h1>Todos</h1>
        <span className="greeting">Hi, {profile.username}</span>
      </header>

      <ProfileCard profile={profile} onSave={onProfileSave} />
      <TodoForm onAdd={onAdd} />
      <Toolbar
        filter={filter}
        onFilterChange={onFilterChange}
        search={search}
        onSearchChange={onSearchChange}
        selectedCount={selected.size}
        allSelected={todos.length > 0 && todos.every((t) => selected.has(t.id))}
        onSelectAll={onSelectAll}
        onBulkDelete={onBulkDelete}
        onBulkStatus={onBulkStatus}
      />
      <TodoList
        todos={todos}
        emptyText={filtered ? 'No todos match.' : 'No todos yet. Add one above.'}
        selected={selected}
        onToggleSelect={onToggleSelect}
        onUpdate={onUpdate}
        onDelete={onDelete}
        onMove={onMove}
        onMoveEnd={onMoveEnd}
      />
    </main>
  )
}
