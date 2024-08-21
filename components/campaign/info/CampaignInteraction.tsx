'use client'

import { Button } from '@mui/material'
import { useRouter } from 'next/navigation'
import React, { useState, type FC } from 'react'
import DeleteCampaign from './DeleteCampaign'

const CampaignInteraction: FC<{ id: string; name?: string }> = ({
  id,
  name,
}) => {
  const router = useRouter()

  const [open, setOpen] = useState(false)
  return (
    <div className="flex justify-end gap-3 mt-4">
      <Button
        variant="contained"
        className="normal-case px-8"
        onClick={() => {
          router.push(`/campaign/launch/add-leads?id=${id}`)
        }}
      >
        Edit
      </Button>
      <Button
        variant="contained"
        className="normal-case px-8 bg-red-500 hover:bg-red-600"
        onClick={() => setOpen(true)}
      >
        Delete
      </Button>
      <DeleteCampaign open={open} setOpen={setOpen} id={id} name={name} />
    </div>
  )
}

export default CampaignInteraction
