import axios from 'axios'
import { keepPreviousData, QueryClient, useMutation, useQuery, useQueryClient } from '@tanstack/react-query'

const API = 'http://localhost:3000/api'

// Must match the values the API accepts (CreateTodoDto).
export const STATUSES = ['TODO', 'IN PROGRESS', 'DONE'] as const
export type Status = (typeof STATUSES)[number]
export type Todo = { id: number; title: string; status: Status; starred: boolean; position: number }
export type TodoFilters = { status?: Status; q?: string }
export type Profile = { username: string; displayName: string; email: string }

type Method = 'GET' | 'POST' | 'PATCH' | 'DELETE'

export const queryClient = new QueryClient()

// The access token lives in memory only. After a reload, the HttpOnly refresh cookie gets a new one.
let accessToken: string | null = null
let refreshing: Promise<boolean> | null = null

declare module 'axios' {
  interface AxiosRequestConfig { retried?: boolean }
}

const api = axios.create({ baseURL: API })
// Only the auth routes need the refresh cookie.
const auth = axios.create({ baseURL: `${API}/auth`, withCredentials: true })

api.interceptors.request.use((config) => {
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

// The access token expired: get a new one with the refresh cookie and retry once.
api.interceptors.response.use(undefined, async (error) => {
  if (error.response?.status !== 401) throw error
  if (!error.config.retried && (await refresh())) return api({ ...error.config, retried: true })
  endSession()
  throw error
})

// One refresh at a time: each refresh cookie works once, so a second parallel
// refresh would replay a used cookie and the server would end the session.
const refresh = () =>
  (refreshing ??= auth
    .post('/refresh')
    .then(({ data }) => {
      accessToken = data.accessToken
      return true
    })
    .catch(() => false)
    .finally(() => (refreshing = null)))

// Drop the old user's cached data, then show the login form.
const endSession = () => {
  accessToken = null
  queryClient.removeQueries({ predicate: (q) => q.queryKey[0] !== 'session' })
  queryClient.setQueryData(['session'], false)
}

const request = <T = null>(path: string, method: Method = 'GET', body?: object): Promise<T> =>
  api.request({ url: path, method, data: body }).then((res) => res.data)

// true when logged in. On page load it tries the refresh cookie, so a reload keeps you logged in.
export const useSession = () =>
  useQuery({ queryKey: ['session'], queryFn: refresh, staleTime: Infinity, retry: false })

export const useLogin = () =>
  useMutation({
    mutationFn: async (creds: { email: string; password: string }) => {
      const { data } = await auth.post('/login', creds).catch((e) => {
        const status = e.response?.status
        throw new Error(status === 401 ? 'Wrong email or password.' : `Login failed (${status ?? 'network error'}).`)
      })
      accessToken = data.accessToken
      queryClient.setQueryData(['session'], true)
    },
  })

export const useLogout = () => useMutation({ mutationFn: () => auth.post('/logout'), onSettled: endSession })

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
