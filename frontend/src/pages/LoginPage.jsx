import { useLocation } from 'react-router-dom'
import { AuthLayout } from '../layouts/AuthLayout'
import { AuthForm } from './AuthForm'

export function LoginPage() {
  const location = useLocation()
  const subtitle = location.state?.registered ? 'Your account is ready. Sign in to continue.' : 'Sign in to continue your Restora journey.'
  return <AuthLayout title="Welcome back." subtitle={subtitle}><AuthForm mode="login" /></AuthLayout>
}
