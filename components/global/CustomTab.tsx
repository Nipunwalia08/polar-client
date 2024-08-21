import { Box, Tab } from '@mui/material'
import Link from 'next/link'
import React, { type FC } from 'react'

interface CustomTabProps {
  label: string
  number: number
}

const CustomTab: FC<CustomTabProps> = ({ label, number }) => (
  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    <Box
      component="span"
      sx={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
      }}
    >
      {number}
    </Box>
    <Box sx={{ marginLeft: '20px' }}>{label}</Box>
  </Box>
)

export default CustomTab
