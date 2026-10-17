import { STATUSES } from '../query/api'
import StatusSelect from './StatusSelect'

export default function Toolbar({
  filter,
  onFilterChange,
  search,
  onSearchChange,
  selectedCount,
  allSelected,
  onSelectAll,
  onBulkDelete,
  onBulkStatus,
}) {
  return (
    <section className="toolbar">
      <div className="filters" role="group" aria-label="Filter by status">
        {['All', ...STATUSES].map((s) => (
          <button key={s} aria-pressed={filter === s} onClick={() => onFilterChange(s)}>
            {s}
          </button>
        ))}
      </div>
      <input
        type="search"
        aria-label="Search todos"
        placeholder="Search by title"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
      />
      <div className="bulk">
        <label>
          <input
            type="checkbox"
            checked={allSelected}
            onChange={(e) => onSelectAll(e.target.checked)}
          />
          Select all
        </label>
        {selectedCount > 0 && (
          <>
            <span className="muted">{selectedCount} selected</span>
            <StatusSelect
              aria-label="Set status for selected"
              value=""
              placeholder="Set status…"
              onChange={(s) => s && onBulkStatus(s)}
            />
            <button className="danger" onClick={onBulkDelete}>
              Delete selected
            </button>
          </>
        )}
      </div>
    </section>
  )
}
