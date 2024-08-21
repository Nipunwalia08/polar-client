'use client'
import Campaign from '@assets/campaign.png'
import CampaignTable from '@components/campaign/manage/CampaignTable'
import FilterCampaign from '@components/campaign/manage/FilterCampaign'
import SearchCampaign from '@components/campaign/manage/SearchCampaign'
import { Box, Button, Stack, Typography } from '@mui/material'
import useCampaignStore, { refetchCampaigns } from '@store/useCampaignStore'
import type { Metadata } from 'next'
import Link from 'next/link'
import React, { useEffect } from 'react'

// export const metadata: Metadata = {
//   title: 'Campaign Management',
// }

const CampaignManagement = () => {
  const { campaigns } = useCampaignStore()
  useEffect(() => {
    refetchCampaigns()
  }, [])
  return (
    <>
      {campaigns.length > 0 && (
        <main className="px-8 py-5">
          <div className="flex items-center mt-3">
            <SearchCampaign />
            <FilterCampaign />
            <Link href="/campaign/launch/add-leads">
              <Button
                variant="contained"
                className="bg-theme flex items-center px-5 py-2 rounded-md mr-2 normal-case min-w-36"
              >
                New Campaign
              </Button>
            </Link>
          </div>

          <CampaignTable />
        </main>
      )}
      {campaigns.length === 0 && (
        <Stack
          spacing={3}
          className="mx-6 px-4 my-6 py-4 pb-0 bg-[#fff] items-center justify-center"
          sx={{
            borderRadius: '8px',
            border: ' 1px solid #DCDCDC',
          }}
        >
          <Box component="img" width="20vw" src={Campaign.src} />
          <Stack className="w-full items-center">
            <Typography sx={{ textAlign: 'center' }}>
              Your Leads will start appearing here once you create a campaign
            </Typography>
            <Button
              variant="contained"
              sx={{
                borderRadius: '8px',
                background:
                  ' var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
                padding: '10px 60px',
                width: 'fit-content',
                mt: '20px',
                textTransform: 'none',
                fontWeight: '400',
                fontSize: '16px',
                mb: 4,
              }}
              // onClick={handleLeadPopup}
              href="/campaign/launch/add-leads"
            >
              New Campaign
            </Button>
          </Stack>
        </Stack>
      )}
    </>
  )
}

export default CampaignManagement
