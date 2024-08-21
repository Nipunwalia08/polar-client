'use client'

import CloseIcon from '@mui/icons-material/Close'
import { InputLabel } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { refetchTemplates } from '@store/useTemplateStore'
import type { ITemplates } from '@type/collections'
import React, { useState } from 'react'
import InputBox from '../global/InputBox'

type TemplateFormProps = {
  open: boolean
  setOpen: (value: boolean) => void
  _data?: ITemplates
  onSave: (data: ITemplates) => Promise<void>
}

const TemplateForm = ({ open, setOpen, _data, onSave }: TemplateFormProps) => {
  const handleClose = () => setOpen(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [data, _setData] = useState<ITemplates>(
    _data || {
      name: '',
      description: '',
      type: '',
    },
  )
  const setData = (key: string, value: string) =>
    _setData((prev) => ({ ...prev, [key]: value }))

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          setLoading(true)
          await onSave(data)
          refetchTemplates()
          _setData({
            name: '',
            description: '',
            type: '',
          })
          setLoading(false)
          setOpen(false)
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 4,
            py: 1,
            backgroundColor: 'black',
            color: 'white',
            fontWeight: 'normal',
          }}
          id="customized-dialog-title"
        >
          Add Template
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 5,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers className="flex flex-col gap-5">
          <InputBox
            type="text"
            id="name"
            label="Name your template"
            placeholder="Enter Name"
            value={data.name || ''}
            onChange={(value) => setData('name', value)}
            readOnly={false}
          />
          <InputBox
            id="description"
            label="Description"
            placeholder="Enter Description"
            textarea
            value={data.description || ''}
            onChange={(value) => setData('description', value)}
            readOnly={false}
          />
          <div>
            <InputLabel id="type" className="text-black mb-1">
              Select Type
            </InputLabel>
            <Select
              labelId="type"
              displayEmpty
              className="w-full rounded-md text-sm"
              defaultValue=""
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
            >
              <MenuItem value="">Select Type</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </Select>
          </div>
        </DialogContent>
        <DialogActions>
          <Button
            variant="contained"
            className="bg-theme flex items-center px-10 py-2 rounded-md mr-2 normal-case"
            disabled={loading}
            type="submit"
          >
            {loading ? <div className="loader" /> : 'Save'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TemplateForm
