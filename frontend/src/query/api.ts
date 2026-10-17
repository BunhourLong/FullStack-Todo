import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API = 'http://localhost:3000/api'

export type Status = 'TODO' | 'IN PROGRESS' | 'DONE'
export type Todo = { id: number; title: string; status: Status; starred: boolean; position: number }
export type TodoFilters = { status?: Status; q?: string }
export type Profile = { username: string; displayName: string; email: string }

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

const request = <T = null>(path: string, method: Method = 'GET', body?: object): Promise<T> =>
  fetch(API + path, {
    method,
    headers: body ? { 'Content-Type': 'application/json' } : undefined,
    body: body && JSON.stringify(body),
  }).then((res) => {
    if (!res.ok) throw new Error(`${method} ${API}${path} failed: ${res.status}`)
    return method === 'GET' || method === 'POST' ? res.json() : null
  })

// GET /todos?status=DONE&q=milk — the server does the filtering and search.
export const useTodos = (filters: TodoFilters) =>
  useQuery({
    queryKey: ['todos', filters],
    queryFn: () => {
      const params = Object.entries(filters).filter(([, v]) => v) as [string, string][]
      return request<Todo[]>(`/todos?${new URLSearchParams(params)}`)
    },
    // Keep showing the old list while a new filter or search loads.
    placeholderData: keepPreviousData,
  })

// Changes the list on screen only. Dragging uses it; useSaveOrder saves on drop.
export const useSetTodos = (filters: TodoFilters) => {
  const queryClient = useQueryClient()
  return (update: (prev: Todo[]) => Todo[]) =>
    queryClient.setQueryData<Todo[]>(['todos', filters], (prev = []) => update(prev))
}

// After any todo change, refetch so the screen matches the database.
const useTodoMutation = <T,>(mutationFn: (vars: T) => Promise<unknown>) => {
  const queryClient = useQueryClient()
  return useMutation({
    mutationFn,
    onError: console.error,
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['todos'] }),
  })
}

export const useAddTodo = () =>
  useTodoMutation((todo: Pick<Todo, 'title' | 'status'>) => request('/todos', 'POST', todo))

export const useUpdateTodo = () =>
  useTodoMutation(({ id, changes }: { id: number; changes: Partial<Todo> }) =>
    request(`/todos/${id}`, 'PATCH', changes))

export const useBulkStatus = () =>
  useTodoMutation((body: { ids: number[]; status: Status }) => request('/todos/bulk', 'PATCH', body))

export const useDeleteTodos = () =>
  useTodoMutation((ids: number[]) => request('/todos/bulk', 'DELETE', { ids }))

// ids are the visible todos in their new order.
export const useSaveOrder = () =>
  useTodoMutation((ids: number[]) => request('/todos/order', 'PATCH', { ids }))

// There is a single profile; GET /profile returns a list with it.
export const useProfile = () =>
  useQuery({
    queryKey: ['profile'],
    queryFn: () => request<Profile[]>('/profile').then(([p]) => p ?? null) })

export const useUpdateProfile = () => {
  const queryClient = useQueryClient()
  return useMutation({
    // The profile's id is its username, so PATCH the old one even when renaming.
    mutationFn: ({ id, ...changes }: { id: string } & Partial<Profile>) =>
      request(`/profile/${id}`, 'PATCH', changes),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['profile'] }),
    onError: console.error,
  })
}
