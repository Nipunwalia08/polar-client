'use client'
import Close from '@assets/svg/Close.svg'
import {
  addTeamMembersToTeamDoc,
  updateTeamMember,
} from '@firebase/firebaseInteractor'
import { Button, Switch, TextField } from '@mui/material'
// import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface EditTeamPopupProps {
  handleEditToggleOff: () => void
  teamData: any
  refreshPlease: () => void
}

function EditTeamPopup({
  handleEditToggleOff,
  teamData,
  refreshPlease,
}: EditTeamPopupProps) {
  const [teamMemberData, setTeamMemberData] = useState({
    name: teamData.name,
    active: teamData.active,
    teamName: teamData.teamName,
    email: teamData.email,
    id: teamData.id,
    adminId: teamData.adminId,
  })

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamMemberData({ ...teamMemberData, name: e.target.value })
  }

  const handleActiveChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTeamMemberData({ ...teamMemberData, active: e.target.checked })
  }

  const sendData = async () => {
    try {
      await updateTeamMember(teamMemberData as never)
      toast.success('Team Mate Added Successfully')
      // setPopupOpen(false)
      // setTeamNamePopup(false)
      handleEditToggleOff()
      refreshPlease()
    } catch (error) {
      console.log(`Error adding team mate: ${error}`)
      toast.error('Error adding team mate')
      return
    }
  }

  return (
    <>
      <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
      <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-2/6">
        <div className="flex bg-black justify-between p-2 rounded">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-white ml-2">
              Edit Team Mate
            </h1>
          </div>
          <button type="button" onClick={handleEditToggleOff}>
            <img className="cursor-pointer" src={Close.src} alt="" />
          </button>
        </div>

        <div className="my-2 px-2">
          <TextField
            className="w-full my-2"
            value={teamMemberData.name}
            label="Name"
            variant="outlined"
            onChange={handleNameChange}
          />
          <TextField
            className="w-full my-2"
            value={teamMemberData.email}
            label="Email"
            variant="outlined"
            disabled
          />
          Status:{' '}
          {teamMemberData?.active ? (
            <Switch defaultChecked onChange={handleActiveChange} />
          ) : (
            <Switch onChange={handleActiveChange} />
          )}
          {/* <TextField
            className="w-full my-2"
            value={teamData.role}
            label="Role"
            variant="outlined"
            onChange={handleEmailChange}
          />
          {teamData?.phone ? (
              <TextField
                className="w-full my-2"
                value={teamData.phone}
                label="Phone Number"
                variant="outlined"
                onChange={handlePhoneChange}
              />
          ): ''}

{teamData?.phone ? (
              <TextField
                className="w-full my-2"
                value={teamData.phone}
                label="Phone Number"
                variant="outlined"
                onChange={handlePhoneChange}
              />
          ): ''}

{teamData?.phone ? (
              <TextField
                className="w-full my-2"
                value={teamData.phone}
                label="Phone Number"
                variant="outlined"
                onChange={handlePhoneChange}
              />
          ): ''} */}
        </div>

        <div className="flex justify-end items-center my-6">
          <Button
            variant="contained"
            className="bg-theme text-white px-8 py-2 rounded mr-4"
            onClick={sendData}
          >
            Save
          </Button>
        </div>
      </div>
    </>
  )
}

export default EditTeamPopup
