'use client'

import CustomTab from '@components/global/CustomTab'
import { Tab, Tabs } from '@mui/material'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import useUserStore from '@store/useStore'
import { useRouter, useSearchParams } from 'next/navigation'
import React, { type FC, useEffect } from 'react'
import { toast } from 'react-toastify'

const selectedTab: string[] = ['add-leads', 'select-template', 'summarize']

const Layout: FC<{ selectedIndex: number }> = ({ selectedIndex }) => {
  const searchParams = useSearchParams()
  const {
    campaignLaunchTabIndex: tabIndex,
    setCampaignLaunchTabIndex: setTabIndex,
  } = useUserStore()
  useEffect(() => {
    setTabIndex(selectedIndex)
  }, [selectedIndex, setTabIndex])
  const router = useRouter()
  const { template } = useGlobalCampaignStore()

  return (
    <Tabs
      value={tabIndex}
      onChange={(_e, val) => {
        const campaignId = searchParams.get('id')
        if (!campaignId && val !== 0) {
          return toast.error('Please add leads first')
        }
        if (val === 2 && template?.id === '') {
          return toast.error('Please select a template first')
        }
        router.push(
          `/campaign/launch/${selectedTab[val]}${
            campaignId ? `?id=${campaignId}` : ''
          }`,
        )
        setTabIndex(val)
      }}
      aria-label="Tabs example"
      sx={{
        '& .MuiTabs-flexContainer': {
          justifyContent: 'space-between',
          background: '#F2F2F2',
          filter: 'drop-shadow(0px 0px 30px rgba(0, 0, 0, 0.05))',
          borderRadius: '16px',
          padding: '8px',
        },
        '& .MuiTab-root': {
          textTransform: 'none',
          fontWeight: '400',
          minWidth: 'auto',
          minHeight: 'fit-content',
          padding: '8px 30px',
          borderRadius: '8px',
          margin: '0 4px',
          '&.Mui-selected': {
            backgroundColor: 'black',
            color: 'white',
            position: 'relative',
          },
          '&:not(.Mui-selected)': {
            backgroundColor: '#f2f2f2',
            color: 'black',
          },
          '&:not(.Mui-selected) > div > span': {
            backgroundColor: 'black',
            color: 'white',
          },
        },
      }}
    >
      <Tab label={<CustomTab label="Add Leads" number={1} />} />
      <Tab label={<CustomTab label="Select Template" number={2} />} />
      <Tab label={<CustomTab label="Summarize & Launch" number={3} />} />
    </Tabs>
  )
}

export default Layout
