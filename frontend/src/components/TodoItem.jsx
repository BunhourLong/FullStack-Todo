import { useState } from 'react'
import StatusSelect from './StatusSelect'

export default function TodoItem({
  todo,
  selected,
  onToggleSelect,
  onUpdate,
  onDelete,
  dragging,
  onDragStart,
  onDragEnd,
  onDragOver,
}) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(todo.title)

  const save = () => {
    if (title.trim()) onUpdate(todo.id, { title: title.trim() })
    else setTitle(todo.title)
    setEditing(false)
  }

  return (
    <li
      className={`todo ${dragging ? 'dragging' : ''} status-${todo.status.replace(' ', '-').toLowerCase()}`}
      draggable={!editing}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragOver={onDragOver}
    >
      <span className="handle" aria-hidden>⋮⋮</span>
      <input
        type="checkbox"
        aria-label={`Select ${todo.title}`}
        checked={selected.has(todo.id)}
        onChange={() => onToggleSelect(todo.id)}
      />
      <button
        className={`star ${todo.starred ? 'on' : ''}`}
        aria-label={todo.starred ? 'Unstar' : 'Star'}
        aria-pressed={todo.starred}
        onClick={() => onUpdate(todo.id, { starred: !todo.starred })}
      >
        {todo.starred ? '★' : '☆'}
      </button>

      {editing ? (
        <input
          className="title"
          autoFocus
          aria-label="Edit title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === 'Enter') save()
            if (e.key === 'Escape') {
              setTitle(todo.title)
              setEditing(false)
            }
          }}
        />
      ) : (
        <span className="title" onDoubleClick={() => setEditing(true)}>
          {todo.title}
        </span>
      )}

      <StatusSelect
        aria-label="Status"
        value={todo.status}
        onChange={(status) => onUpdate(todo.id, { status })}
      />
      <button onClick={() => setEditing(true)}>Edit</button>
      <button className="danger" onClick={() => onDelete(todo.id)}>
        Delete
      </button>
    </li>
  )
}
