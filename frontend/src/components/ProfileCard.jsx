import { useState } from 'react'

export default function ProfileCard({ profile, onSave }) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(profile)

  if (!editing)
    return (
      <section className="card profile">
        <div className="avatar" aria-hidden>
          {profile.username[0]?.toUpperCase()}
        </div>
        <div>
          <strong>{profile.username}</strong>
          <div className="muted">{profile.email || 'No email set'}</div>
        </div>
        <button onClick={() => (setDraft(profile), setEditing(true))}>Edit profile</button>
      </section>
    )

  const submit = (e) => {
    e.preventDefault()
    if (!draft.username.trim()) return
    onSave({ ...draft, username: draft.username.trim() })
    setEditing(false)
  }

  return (
    <form className="card profile" onSubmit={submit}>
      <label>
        Username
        <input
          required
          value={draft.username}
          onChange={(e) => setDraft({ ...draft, username: e.target.value })}
        />
      </label>
      <label>
        Email
        <input
          type="email"
          required
          value={draft.email}
          onChange={(e) => setDraft({ ...draft, email: e.target.value })}
        />
      </label>
      <button type="submit">Save</button>
      <button type="button" onClick={() => setEditing(false)}>
        Cancel
      </button>
    </form>
  )
}
