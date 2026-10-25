import HomeContainer from './screens/Home/HomeContainer'
import LoginForm from './components/LoginForm'
import { useLogin, useSession } from './query/api'

export default function App() {
  const { data: loggedIn, isPending } = useSession()
  const login = useLogin()

  // Blank while the refresh cookie is checked, so a logged-in reload doesn't flash the login form.
  if (isPending) return null
  if (!loggedIn) return <LoginForm onLogin={login.mutate} error={login.error} pending={login.isPending} />
  return <HomeContainer />
}
