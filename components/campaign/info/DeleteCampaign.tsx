'use client'

import { Campaigns } from '@firebase/config'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import DialogTitle from '@mui/material/DialogTitle'
import { deleteDoc, doc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import React, { useState } from 'react'

type DeleteCampaignProps = {
  open: boolean
  name?: string
  id: string
  setOpen: (value: boolean) => void
}

const DeleteCampaign = ({ open, setOpen, name, id }: DeleteCampaignProps) => {
  const handleClose = () => setOpen(false)
  const router = useRouter()
  const [loading, setLoading] = useState<boolean>(false)
  return (
    <Dialog
      open={open}
      onClose={handleClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">Delete Campaign</DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Are you sure you want to delete campaign with name "{name}"?
          <br />
          This action cannot be undone.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose}>Cancel</Button>
        <Button
          variant="contained"
          onClick={async () => {
            setLoading(true)
            await deleteDoc(doc(Campaigns, id))
            router.replace('/campaign/manage')
            setLoading(false)
            handleClose()
          }}
          autoFocus
          className="bg-red-500 hover:bg-red-600 text-white"
          disabled={loading}
        >
          {loading ? <div className="loader" /> : 'Delete'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default DeleteCampaign
