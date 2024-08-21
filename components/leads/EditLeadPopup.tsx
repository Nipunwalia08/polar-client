'use client'
import Close from '@assets/svg/Close.svg'
import { Customer } from '@firebase/config'
import { getLeads } from '@firebase/firebaseInteractor'
import { Button, TextField } from '@mui/material'
import { doc, updateDoc } from 'firebase/firestore'
import type React from 'react'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface Lead {
  name: string
  email: string
  phone: string
  id: string
  setEditLeadPopup: (value: boolean) => void
  setFileData: (value: any) => void
}

const EditLeadPopup = ({
  name,
  email,
  phone,
  id,
  setEditLeadPopup,
  setFileData,
}: Lead) => {
  const [updatedData, setUpdatedData] = useState({
    name,
    email,
    phone,
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedData({ ...updatedData, name: e.target.value })
  }

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedData({ ...updatedData, email: e.target.value })
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUpdatedData({ ...updatedData, phone: e.target.value })
  }

  const saveUpdatedDatatoDb = async () => {
    await updateDoc(doc(Customer, id), updatedData)

    toast.success('Leads overwritten successfully')
    const responseData = await getLeads()
    setFileData(responseData || ([] as any))
    setEditLeadPopup(false)
  }

  return (
    <>
      <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
      <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-2/6">
        <div className="flex bg-black justify-between p-2 rounded">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-white ml-2">
              Scrape Leads
            </h1>
          </div>
          <button type="button" onClick={() => setEditLeadPopup(false)}>
            <img className="cursor-pointer" src={Close.src} alt="" />
          </button>
        </div>

        <div className="my-2 px-2">
          <TextField
            className="w-full my-2"
            value={updatedData.name}
            label="Name"
            variant="outlined"
            onChange={handleNameChange}
          />
          <TextField
            className="w-full my-2"
            value={updatedData.email}
            label="Email"
            variant="outlined"
            onChange={handleEmailChange}
          />
          <TextField
            className="w-full my-2"
            value={updatedData.phone}
            label="Phone Number"
            variant="outlined"
            onChange={handlePhoneChange}
          />
        </div>

        <div className="flex justify-end items-center my-6">
          <Button
            variant="contained"
            className="bg-theme text-white px-8 py-2 rounded mr-4"
            onClick={saveUpdatedDatatoDb}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

export default EditLeadPopup
