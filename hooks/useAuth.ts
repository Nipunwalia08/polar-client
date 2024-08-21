import { auth } from '@firebase/config'
import useAuthStore from '@store/useAuthStore'
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { usePathname, useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const useAuth = ({
  loginURL,
  logoutURL,
}: { loginURL?: string; logoutURL?: string }) => {
  const auth = getAuth()
  const router = useRouter()
  const [isLoading, setLoading] = useState(true)
  const { user, isAuthenticated, setIsAuthenticated, setUser } = useAuthStore()

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser)
      setIsAuthenticated(!!currentUser)
      setLoading(false)
    })

    return () => unsubscribe()
  }, [auth, setUser, setIsAuthenticated])

  const signUp = (email: string, password: string) => {
    createUserWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        if (userCredentials) {
          setIsAuthenticated(true)
          setUser(userCredentials.user)
          loginURL && router.replace(loginURL)
        }
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const signIn = (email: string, password: string) => {
    signInWithEmailAndPassword(auth, email, password)
      .then((userCredentials) => {
        if (userCredentials) {
          setIsAuthenticated(true)
          setUser(userCredentials.user)
          loginURL && router.replace(loginURL)
        }
      })
      .catch((err) => {
        toast.error(err.message)
      })
  }

  const logOut = async () => {
    try {
      await signOut(auth)
      setIsAuthenticated(false)
      setUser(null)
      logoutURL && router.replace(logoutURL)
    } catch (err) {
      const error = err as Error
      console.error('Error signing out:', error)
      toast.error(error.message)
    }
  }

  return {
    user,
    isAuthenticated,
    signUp,
    signIn,
    signOut: logOut,
    isLoading,
  }
}

export default useAuth
