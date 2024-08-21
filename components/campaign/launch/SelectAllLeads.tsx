'use client'

import { Checkbox } from '@mui/material'
import useLeadStore from '@store/useLeadStore'
import React from 'react'

const SelectAllLeads = () => {
  const checked = useLeadStore(
    (state) => !state.leads.filter((lead) => lead.select === false).length,
  )
  const { selectAll } = useLeadStore()
  return (
    <Checkbox
      checked={checked}
      color="info"
      className="text-white"
      onChange={selectAll}
    />
  )
}

export default SelectAllLeads
