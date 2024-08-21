'use client'
import BackArrow from '@assets/svg/BackArrow.svg'
import { Button } from '@mui/material'
import type { ILead } from '@type/collections'
import type React from 'react'

interface viewFullDetail {
  setViewFullDetail: React.Dispatch<React.SetStateAction<boolean>>
  selectedLead: ILead
  setEditLeadPopup: React.Dispatch<React.SetStateAction<boolean>>
  handleDeleteLead: (id: string, phone: string) => void
  setSelectForEditData?: React.Dispatch<React.SetStateAction<any>>
}

const excludedFields = ['email', 'phone', 'adminId', 'id']

function ViewFullDetail({
  setViewFullDetail,
  selectedLead,
  setEditLeadPopup,
  handleDeleteLead,
  setSelectForEditData,
}: viewFullDetail) {
  const filteredKeys: Array<
    'name' | 'email' | 'phone' | 'adminId' | 'assignedCampaigns' | 'id'
  > = Object.keys(selectedLead).filter(
    (key) => !excludedFields.includes(key),
  ) as any

  return (
    <div className="flex flex-col justify-center items-center mt-8">
      <div className="w-5/6 flex flex-col p-4 pb-8 bg-white shadow">
        <div className="mt-8 rounded flex">
          <div className="back-btn w-1/12 cursor-pointer">
            <button
              type="button"
              onClick={() => {
                setViewFullDetail(false)
              }}
            >
              <img src={BackArrow.src} alt="" />
            </button>
          </div>
          <div className="profile-data flex flex-col w-9/12">
            {/* <img src={ProfileSvg.src} alt="" className='w-36 h-36 rounded-full' /> */}
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold">{selectedLead.name}</h1>
            </div>
            <div className="mt-4 flex">
              <div className="lhs mr-4">
                <h3 className="text-lg py-4">
                  {selectedLead?.email ? 'Email' : ''}
                </h3>
                <h3 className="text-lg py-4">Phone Number :</h3>
                <h3 className="text-lg py-4">Assigned Agent :</h3>
                <h3 className="text-lg py-4">Active Campaign :</h3>
                {filteredKeys.map((key, index) => (
                  <h3 key={index} className="text-lg py-4 capitalize">
                    {key.replace(/([A-Z])/g, ' $1')}:
                  </h3>
                ))}
              </div>
              <div className="rhs ml-4">
                <h3 className="text-lg py-4">{selectedLead?.email}</h3>
                <h3 className="text-lg py-4">{selectedLead?.phone}</h3>
                <h3 className="text-lg py-4">
                  {selectedLead?.assignedCampaigns?.length
                    ? selectedLead.assignedCampaigns.join(', ')
                    : 0}
                </h3>
                <h3 className="text-lg py-4">
                  {selectedLead?.assignedCampaigns
                    ? selectedLead?.assignedCampaigns.join(', ')
                    : 0}
                </h3>
                {filteredKeys.map((key, index) => (
                  <h3 key={index} className="text-lg py-4">
                    {Array.isArray(selectedLead?.[key])
                      ? (selectedLead?.[key] as string[])?.join(', ')
                      : selectedLead[key] || 'N/A'}
                  </h3>
                ))}
              </div>
            </div>
          </div>
          <div className="profile-data w-2/12 flex justify-around items-start ">
            <button
              type="button"
              className="bg-black text-white px-6 py-2 rounded"
              onClick={() => {
                setEditLeadPopup(true)
                if (selectedLead) {
                  setSelectForEditData?.(selectedLead)
                }
                setEditLeadPopup(true)
              }}
            >
              Edit
            </button>
            <button
              type="button"
              className="bg-[#F40000] text-white px-6 py-2 rounded"
              onClick={() => {
                handleDeleteLead(selectedLead.id || '', selectedLead.phone)
              }}
            >
              Delete
            </button>
          </div>
        </div>
        <div className="flex justify-end mr-4">
          <Button className="flex bg-theme px-6 py-2 text-white">Chat</Button>
        </div>
      </div>
    </div>
  )
}

export default ViewFullDetail
