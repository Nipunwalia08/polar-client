'use client'

import ToastProvider from '@components/providers/ToastProvider'
import './globals.css'
import MenuBars from '@components/global/MenuBars'
import RouteProtectProvider from '@components/global/RouteProtectProvider'
import { Stack } from '@mui/material'
import clsx from 'clsx'
import { usePathname } from 'next/navigation'
import Satoshi from './font'
import MuiThemeProvider from './theme-provider'

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname() as string
  const noLayoutRoutes = ['/', '/signup']

  const shouldShowLayout = !noLayoutRoutes.includes(pathname)
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="/logo.svg" type="image/x-icon" />
      </head>
      <body
        className={clsx('bg-[#F7F9FF] h-screen', Satoshi.className)}
        suppressHydrationWarning
      >
        <RouteProtectProvider>
          <MuiThemeProvider>
            <ToastProvider>
              {shouldShowLayout && <MenuBars />}
              {shouldShowLayout && (
                <Stack className="ml-[6rem] pt-[72px]">{children}</Stack>
              )}
              {!shouldShowLayout && <Stack>{children}</Stack>}
            </ToastProvider>
          </MuiThemeProvider>
        </RouteProtectProvider>
      </body>
    </html>
  )
}
