'use client'

import useAuth from '@hooks/useAuth'
import { usePathname } from 'next/navigation'
import React, { type ReactNode } from 'react'

const RouteProtectProvider = ({
  children,
}: Readonly<{ children: ReactNode }>) => {
  const pathname = usePathname()
  const { isLoading } = useAuth({
    loginURL: '/dashboard',
    logoutURL: '/',
  })
  return pathname === '/' ? (
    children
  ) : (
    <>
      {isLoading && (
        <div className="z-[100] fixed bg-white h-screen w-screen">
          Loading...
        </div>
      )}
      {children}
    </>
  )
}

export default RouteProtectProvider
