'use client'

import { Templates } from '@firebase/config'
import Button from '@mui/material/Button'
import usePersistStore from '@store/usePersistStore'
import { addDoc } from 'firebase/firestore'
import React, { useState } from 'react'
import { FaCirclePlus } from 'react-icons/fa6'
import TemplateForm from './TemplateForm'

const AddTemplate = ({ edit }: { edit?: boolean }) => {
  const [open, setOpen] = useState(false)
  const { adminId } = usePersistStore()

  return (
    <React.Fragment>
      <Button
        variant="contained"
        onClick={() => setOpen(true)}
        className="bg-theme flex items-center px-5 py-2 rounded-md mr-2"
      >
        <FaCirclePlus className="min-w-6" />
        <div className="normal-case min-w-24">
          {edit ? 'Edit' : 'Add'} Template
        </div>
      </Button>
      <TemplateForm
        open={open}
        setOpen={setOpen}
        onSave={async (data) => {
          await addDoc(Templates, { ...data, adminId })
        }}
      />
    </React.Fragment>
  )
}

export default AddTemplate
