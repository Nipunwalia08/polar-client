'use client'

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

export default function ToastProvider({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      <ToastContainer stacked />
      {children}
    </>
  )
}
