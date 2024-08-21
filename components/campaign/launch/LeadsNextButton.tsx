'use client'

import { Campaigns } from '@firebase/config'
import { Button } from '@mui/material'
import useLeadStore from '@store/useLeadStore'
import usePersistStore from '@store/usePersistStore'
import useUserStore from '@store/useStore'
import type { ICampaigns } from '@type/collections'
import { Timestamp, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import React, { useState, type FC } from 'react'

const LeadsNextButton: FC<{ campaignId?: string }> = ({ campaignId }) => {
  const { adminId } = usePersistStore()
  const leads = useLeadStore((state) => state.leads)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { setCampaignLaunchTabIndex: setTabIndex } = useUserStore()
  const handleNextLeads = async () => {
    let id: string = campaignId || ''
    if (campaignId) {
      await setDoc(
        doc(Campaigns, campaignId),
        {
          customers: leads.filter((lead) => lead.select).map((lead) => lead.id),
        },
        { merge: true },
      )
    } else {
      const campaign: ICampaigns = {
        name: '',
        customers: leads
          .filter((lead) => lead.select)
          .map((lead) => lead.id as string),
        active: true,
        acceptanceRate: 0,
        replyRate: 0,
        createdAt: Timestamp.now(),
        adminId,
      }
      id = (await addDoc(Campaigns, campaign)).id
    }
    setTabIndex(1)
    router.replace(`/campaign/launch/add-leads?id=${id}`)
    router.push(`/campaign/launch/select-template?id=${id}`)
  }
  return (
    <Button
      variant="contained"
      className="bg-theme text-white px-8 py-2 rounded mr-12"
      onClick={async () => {
        setLoading(true)
        await handleNextLeads()
        setLoading(false)
      }}
      disabled={loading}
    >
      {loading ? <div className="loader" /> : 'Next'}
    </Button>
  )
}

export default LeadsNextButton
