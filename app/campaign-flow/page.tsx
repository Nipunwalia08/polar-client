import FetchTemplates from '@components/campaign-flow/FetchTemplates'
import FlowContainer from '@components/campaign-flow/FlowContainer'
import { Card } from '@mui/material'
import { FlowKeys } from '@store/useCampaignFlowStore'
import type { Metadata } from 'next'
import React from 'react'

export const metadata: Metadata = {
  title: 'Campaign Flow',
}

const CampaignFlow = () => {
  return (
    <Card
      sx={{
        margin: 5,
        boxShadow: '0 0 6px 0 #00000029',
        px: 4,
        py: 3,
      }}
    >
      <FetchTemplates />
      <FlowContainer
        flowName={FlowKeys.campaignFlow}
        title="Campaign Messages"
      />
      <FlowContainer
        flowName={FlowKeys.idleFlow}
        title="If Replied but the user is Idle"
      />
      <FlowContainer
        flowName={FlowKeys.notInterestedFlow}
        title="If Not Interested"
      />
    </Card>
  )
}

export default CampaignFlow
