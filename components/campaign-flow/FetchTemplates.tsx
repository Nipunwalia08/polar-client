'use client'

import { refetchCampaignFlow } from '@store/useCampaignFlowStore'
import { refetchTemplates } from '@store/useTemplateStore'
import { useEffect } from 'react'

const FetchTemplates = () => {
  useEffect(() => {
    refetchTemplates()
    refetchCampaignFlow()
  }, [])
  return null
}

export default FetchTemplates
