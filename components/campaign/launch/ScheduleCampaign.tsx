'use client'

import { Campaigns, Customer, TeamMembers } from '@firebase/config'
import { Button } from '@mui/material'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import useUserStore from '@store/useStore'
import type { ISchedule } from '@type/collections'
import { Timestamp, arrayUnion, doc, getDoc, setDoc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import React, { useState, type FC } from 'react'
import { toast } from 'react-toastify'

const ScheduleCampaign: FC<{ campaignId?: string }> = ({ campaignId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleLaunchCampaign = async () => {
    const name = useGlobalCampaignStore.getState().name
    const schedule = useGlobalCampaignStore.getState().schedule
    const teamMembers = useGlobalCampaignStore.getState().teamMembers

    const scheduled: ISchedule[] = []
    if (schedule) {
      for (const datetime of schedule) {
        if (!datetime) continue
        scheduled.push({
          datetime: Timestamp.fromDate(
            new Date(
              `${datetime.date?.format('YYYY-MM-DD')}T${datetime.time?.format('HH:mm:ss')}`,
            ),
          ),
        })
      }
    }
    const data = {
      name,
      schedule: scheduled,
      teamMembers,
    }

    if (campaignId) {
      await setDoc(doc(Campaigns, campaignId), data, { merge: true })
      await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/campaign/launch`, {
        method: 'POST',
        body: JSON.stringify({ campaignId }),
        headers: {
          'Content-Type': 'application/json',
        },
      })
      // iterate on TeamMembers in campaign and add them to TeamMembers collection
      if (teamMembers) {
        for (const team of teamMembers) {
          const teamMemberRef = doc(TeamMembers, team)
          await setDoc(
            teamMemberRef,
            { assignedCampaigns: arrayUnion(name) },
            { merge: true },
          )
        }
      }

      // get the leads from campaiign db and the set this inside leads also

      const campaignRef = doc(Campaigns, campaignId)
      const campaignDoc = await getDoc(campaignRef)
      const campaignData = campaignDoc.data()
      console.log('campaignData', campaignData)
      const leads = campaignData?.customers
      if (leads) {
        for (const lead of leads) {
          const leadRef = doc(Customer, lead)
          await setDoc(
            leadRef,
            { assignedCampaigns: arrayUnion(name) },
            { merge: true },
          )
        }
      }

      toast.success('Campaign launched successfully')
      //   router.replace(`/campaign/launch/add-leads?id=${id}`)
      router.push(`/campaign/${campaignId}`)
    }
    // setTabIndex(1)

    //   console.log('@!data', data)
  }
  return (
    <Button
      variant="contained"
      className="bg-theme text-white px-8 py-2 rounded mt-8 mb-4 normal-case"
      onClick={async () => {
        setLoading(true)
        await handleLaunchCampaign()

        setLoading(false)
      }}
      disabled={loading}
    >
      {loading ? <div className="loader" /> : 'Launch Campaign'}
    </Button>
  )
}

export default ScheduleCampaign
