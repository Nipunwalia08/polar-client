import Layout from '@components/campaign/launch/Layout'
import { headers } from 'next/headers'
import React, { type ReactNode } from 'react'

const selectedTab: string[] = ['add-leads', 'select-template', 'summarize']

const LaunchCampaignLayout = ({
  children,
}: Readonly<{
  children: ReactNode
}>) => {
  const pathname = headers().get('x-pathname')
  return (
    <div
      className="mx-6 px-4 my-6 py-3 pb-0 bg-[#fff]"
      style={{
        borderRadius: '8px',
        border: ' 1px solid #DCDCDC',
      }}
    >
      <Layout
        selectedIndex={
          selectedTab
            ?.map((x, index) => (pathname?.includes(x) ? index : null))
            .filter((x) => x !== null)[0] || 0
        }
      />
      {children}
    </div>
  )
}

export default LaunchCampaignLayout
