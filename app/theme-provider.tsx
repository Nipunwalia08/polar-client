'use client'

import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider, createTheme } from '@mui/material/styles'
import React, { type ReactNode } from 'react'
import Satoshi from './font'

const theme = createTheme({
  palette: {
    primary: {
      main: '#000',
    },
  },
  typography: {
    fontFamily: Satoshi.style.fontFamily,
  },
})

export default function MuiThemeProvider({
  children,
}: { children: ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
