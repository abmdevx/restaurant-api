import { useMemo, useState } from 'react'
import { logoutUser } from '../api/authApi'
import { AuthContext } from './authContext'

const SESSION_KEY = 'restora_user'

function readStoredUser() {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY)) || null
  } catch {
    localStorage.removeItem(SESSION_KEY)
    return null
  }
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  const signIn = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextUser))
  }

  const signOut = async () => {
    try {
      await logoutUser()
    } finally {
      setUser(null)
      localStorage.removeItem(SESSION_KEY)
    }
  }

  const value = useMemo(() => ({ user, signIn, signOut }), [user])
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
