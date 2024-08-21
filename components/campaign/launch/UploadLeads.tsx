'use client'

import VisuallyHiddenInput from '@components/global/VisuallyHiddenInput'
import { Customer } from '@firebase/config'
import { Button } from '@mui/material'
import useLeadStore, { fetchLeads } from '@store/useLeadStore'
import usePersistStore from '@store/usePersistStore'
import type { ICampaigns, ILead } from '@type/collections'
import {
  addDoc,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import React from 'react'
import type { ChangeEvent, FC } from 'react'
import { FiUpload } from 'react-icons/fi'
import { toast } from 'react-toastify'
import * as XLSX from 'xlsx'

const UploadLeads: FC<{ campaignId?: string }> = ({ campaignId }) => {
  const { selectLead, addLead } = useLeadStore()
  const handleFileUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const uploadedFile = event.target.files?.[0]

    if (!uploadedFile) return

    const reader = new FileReader()
    reader.readAsArrayBuffer(uploadedFile)
    reader.onload = (e) => {
      const arrayBuffer = e?.target?.result
      parseFileData(arrayBuffer)
    }
    reader.onerror = (error: any) => {
      toast.error(error?.message)
    }
  }
  const addOrUpdateLead = async (lead: ILead) => {
    const existingLead = (
      await getDocs(query(Customer, where('phone', '==', lead.phone)))
    ).docs?.[0]
    let id: string
    if (existingLead?.exists()) {
      id = existingLead.id
      selectLead(id)
      await updateDoc(doc(Customer, existingLead.id), lead as any)
    } else {
      const ref = await addDoc(Customer, {
        ...lead,
        adminId: usePersistStore.getState().adminId,
      })
      addLead({ ...lead, id: ref.id })
      id = ref.id
    }
    if (!campaignId) return
    const campaign = (
      await getDoc(doc(Customer, campaignId))
    ).data() as ICampaigns
    const leads = campaign.customers || []
    if (leads.includes(id)) return
    leads.push(id)
    await updateDoc(doc(Customer, campaignId), {
      customers: leads,
    })
  }
  const parseFileData = async (arrayBuffer: any) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: 'array' })
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const parsedData: string[][] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
      })
      for (let i = 0; i < 3; i++) {
        const key = parsedData?.[0]?.[i]?.toLowerCase()
        if (key.includes('name')) parsedData[0][i] = 'name'
        if (key.includes('phone')) parsedData[0][i] = 'phone'
        if (key.includes('email')) parsedData[0][i] = 'email'
      }
      for (let i = 1; i < parsedData.length; i++) {
        const lead: any = {}
        for (let j = 0; j < 3; j++)
          if (parsedData[i][j])
            lead[parsedData[0][j]] = parsedData[i][j]?.toString()
        await addOrUpdateLead(lead)
      }
      toast.success('Leads uploaded successfully')
    } catch (error: any) {
      toast.error(error.message)
    }
  }
  return (
    <Button
      variant="outlined"
      className="normal-case px-6 py-2 rounded mr-12 flex items-center gap-2"
      component="label"
      htmlFor="upload-file"
    >
      <FiUpload />
      Upload Leads
      <VisuallyHiddenInput
        type="file"
        accept=".csv,.xlsx"
        id="upload-file"
        onChange={handleFileUpload}
      />
    </Button>
  )
}

export default UploadLeads
