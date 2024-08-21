'use client'

import { Campaigns } from '@firebase/config'
import { Checkbox, TableCell, TableRow } from '@mui/material'
import type { ILeadSelect } from '@store/useLeadStore'
import useLeadStore, { fetchLeads } from '@store/useLeadStore'
import type { ICampaigns } from '@type/collections'
import { doc, getDoc } from 'firebase/firestore'
import React, { useEffect, useState, type FC } from 'react'

const LeadRow: FC<{ lead: ILeadSelect; leads?: string[] }> = ({
  lead,
  leads,
}) => {
  const { selectLead } = useLeadStore()
  return (
    <TableRow>
      <TableCell align="center" sx={{ width: 100, py: 1.5 }}>
        <Checkbox
          checked={lead.select}
          onChange={() => selectLead(lead?.id || '')}
          defaultChecked={leads?.includes(lead?.id || '')}
          color="info"
        />
      </TableCell>
      <TableCell align="left">{lead.name}</TableCell>
      <TableCell align="left">{lead.phone}</TableCell>
      <TableCell align="left">{lead.email}</TableCell>
    </TableRow>
  )
}

const LeadTable: FC<{ id: string }> = ({ id }) => {
  const { leads } = useLeadStore()
  const [campaign, setCampaign] = useState<ICampaigns>()
  // useEffect(() => {
  //   console.log(leads)
  // }, [leads])
  useEffect(() => {
    ;(async () => {
      if (!id) {
        fetchLeads()
        return
      }
      const campaign = (await getDoc(doc(Campaigns, id))).data() as ICampaigns
      setCampaign(campaign)
      fetchLeads(campaign?.customers)
    })()
  }, [id])
  return leads.map((lead) => (
    <LeadRow key={lead.id} lead={lead} leads={campaign?.customers} />
  ))
}

export default LeadTable
