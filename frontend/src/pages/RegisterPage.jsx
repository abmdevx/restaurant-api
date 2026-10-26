import { AuthLayout } from '../layouts/AuthLayout'
import { AuthForm } from './AuthForm'

export function RegisterPage() {
  return <AuthLayout title="Make room for more." subtitle="Create your account and bring a little more ease to every service."><AuthForm mode="register" /></AuthLayout>
}
