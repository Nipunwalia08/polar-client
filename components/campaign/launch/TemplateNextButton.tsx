'use client'

import { Campaigns } from '@firebase/config'
import { Button } from '@mui/material'
import useCampaignStore from '@store/useCampaignStore'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import useUserStore from '@store/useStore'
import type { ICampaigns } from '@type/collections'
import { Timestamp, addDoc, doc, setDoc, updateDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import React, { useState, type FC } from 'react'
import { toast } from 'react-toastify'

const TemplateNextButton: FC<{ campaignId?: string }> = ({ campaignId }) => {
  const template = useGlobalCampaignStore((state) => state.template)
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const { setCampaignLaunchTabIndex: setTabIndex } = useUserStore()
  const handleNextLeads = async () => {
    const id: string = campaignId || ''
    if (template?.id === '') {
      return toast.error('Please select a template first')
    }
    setTabIndex(2)
    router.push(`/campaign/launch/summarize?id=${id}`)
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

export default TemplateNextButton
