import { onAuthStateChanged } from 'firebase/auth'
import { createContext, ReactNode, useEffect, useState } from 'react'
import { auth } from '../services/firebaseConnection'

interface AuthProviderProps {
  children: ReactNode
}

interface UserProps {
  uid: string
  name: string | null
  email: string | null
}

type AuthContextData = {
  signed: boolean
  loadingAuth: boolean
  handleInfoUser: ({ name, email, uid }: UserProps) => void
  user: UserProps | null
}

export const AuthContext = createContext({} as AuthContextData)

function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null)
  const [loadingAuth, setLoadingAuth] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser({
          uid: user.uid,
          name: user?.displayName,
          email: user?.email,
        })
        setLoadingAuth(false)
      } else {
        setUser(null)
        setLoadingAuth(false)
      }
    })

    return () => {
      unsub()
    }
  }, [])

  function handleInfoUser({ email, name, uid }: UserProps) {
    setUser({
      email,
      name,
      uid,
    })
  }

  return (
    <AuthContext.Provider
      value={{ signed: !!user, loadingAuth, handleInfoUser, user }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export default AuthProvider
