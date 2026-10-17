import { STATUSES } from '../constants/status'

export default function StatusSelect({ value, onChange, placeholder, ...props }) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value)} {...props}>
      {placeholder && <option value="">{placeholder}</option>}
      {STATUSES.map((s) => (
        <option key={s}>{s}</option>
      ))}
    </select>
  )
}
