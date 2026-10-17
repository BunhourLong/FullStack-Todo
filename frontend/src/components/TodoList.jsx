import { useState } from 'react'
import TodoItem from './TodoItem'

export default function TodoList({ todos, emptyText, onMove, onMoveEnd, ...itemProps }) {
  const [dragId, setDragId] = useState(null)

  if (!todos.length) return <p className="muted empty">{emptyText}</p>

  return (
    <ul className="todo-list">
      {todos.map((todo) => (
        <TodoItem
          key={todo.id}
          todo={todo}
          dragging={dragId === todo.id}
          onDragStart={() => setDragId(todo.id)}
          onDragEnd={() => {
            setDragId(null)
            onMoveEnd()
          }}
          onDragOver={(e) => {
            e.preventDefault()
            if (dragId && dragId !== todo.id) onMove(dragId, todo.id)
          }}
          {...itemProps}
        />
      ))}
    </ul>
  )
}
