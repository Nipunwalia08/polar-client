import BackArrow from '@assets/svg/BackArrow.svg'
import { Customer, WhatsappMessages } from '@firebase/config'
import { deleteTeamMember } from '@firebase/firebaseInteractor'
import {
  Box,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { ICustomer } from '@type/collections'
import { getDoc, getDocs, query, where } from 'firebase/firestore'
import Link from 'next/link'
import React, { useEffect, useState } from 'react'

interface ActivePopupProps {
  setActivePopup: (value: boolean) => void
  teamData: any
  handleEditToggleOn: () => void
  refreshPlease: () => void
}

const ActivePopup = ({
  setActivePopup,
  teamData,
  handleEditToggleOn,
  refreshPlease,
}: ActivePopupProps) => {
  const handleDeleteTeam = () => {
    deleteTeamMember(teamData.id)
    setActivePopup(false)
    refreshPlease()
  }
  const [customers, setCustomers] = useState<ICustomer[]>([])
  useEffect(() => {
    ;(async () => {
      const users = await getDocs(
        query(WhatsappMessages, where('teamMember', '==', teamData.id)),
      )
      if (users.empty) return
      const data: ICustomer[] = []
      for (const doc of users.docs) {
        const phone = doc.data().phone
        data.push({
          ...((
            await getDocs(query(Customer, where('phone', '==', phone)))
          ).docs[0].data() as ICustomer),
          id: doc.id,
        } as ICustomer)
      }
      setCustomers(data)
    })()
  }, [teamData])

  return (
    <div className="flex flex-col justify-center items-center">
      <div className="w-5/6 mt-8 rounded p-4 pb-0 bg-white shadow flex">
        <div className="back-btn w-1/12 cursor-pointer">
          <Box
            component="img"
            src={BackArrow.src}
            alt=""
            onClick={() => {
              setActivePopup(false)
            }}
          />
        </div>
        <div className="profile-data flex flex-col w-9/12">
          {/* <img src={ProfileSvg.src} alt="" className='w-36 h-36 rounded-full' /> */}
          <div className="flex items-center">
            <h1 className="text-2xl font-semibold mr-7">{teamData.name}</h1>
            {teamData.active ? (
              <Button
                variant="contained"
                className="bg-[#D0FF84] hover:bg-[#D0FF84] shadow-none text-black px-4 py-2 rounded"
              >
                Active
              </Button>
            ) : (
              <Button
                variant="contained"
                className="bg-[#FEADAD] hover:bg-[#FEADAD] shadow-none text-black px-4 py-2 rounded"
              >
                InActive
              </Button>
            )}
          </div>
          <div className="mt-4 flex">
            <div className="lhs mr-4">
              <h3 className="text-lg py-4">Role :</h3>
              <h3 className="text-lg py-4">Assigned Campaigns :</h3>
              <h3 className="text-lg py-4">Assigned Chats :</h3>
              <h3 className="text-lg py-4">Reply Rate :</h3>
            </div>
            <div className="rhs ml-4">
              <h3 className="text-lg py-4">Team</h3>
              <h3 className="text-lg py-4">
                {teamData?.assignedCampaigns
                  ? teamData?.assignedCampaigns.join(', ')
                  : 0}
              </h3>
              <h3 className="text-lg py-4">
                {teamData?.assignedChats ? teamData?.assignedChats : 0}
              </h3>
              <h3 className="text-lg py-4">
                {teamData?.replyRate ? teamData?.replyRate : '0%'}
              </h3>
            </div>
          </div>
        </div>
        <div className="profile-data w-2/12 flex justify-around items-start ">
          <button
            type="button"
            className="bg-black text-white px-6 py-2 rounded"
            onClick={handleEditToggleOn}
          >
            Edit
          </button>
          <button
            type="button"
            className="bg-[#F40000] text-white px-6 py-2 rounded"
            onClick={handleDeleteTeam}
          >
            Delete
          </button>
        </div>
      </div>
      <TableContainer component={Paper} className="mt-5 w-5/6">
        <Table sx={{ minWidth: 700 }} aria-label="customized table">
          <TableHead className="bg-black">
            <TableRow>
              <TableCell className="py-2 text-white" align="center">
                Name
              </TableCell>
              <TableCell className="py-2 text-white" align="center">
                Phone
              </TableCell>
              <TableCell className="py-2 text-white" align="center">
                Email
              </TableCell>
              <TableCell className="py-2 text-white" align="center">
                Chat
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {customers?.map((customer) => (
              <TableRow key={customer?.id}>
                <TableCell align="center">{customer?.name || '-'}</TableCell>
                <TableCell align="center">{customer?.phone}</TableCell>
                <TableCell align="center">{customer?.email || '-'}</TableCell>
                <TableCell align="center">
                  <Link href="/chat">
                    <Button
                      variant="contained"
                      className="px-3 py-2 bg-[#D0FF84] hover:bg-[#D0FF84] rounded-md text-black shadow-none normal-case"
                    >
                      Open Chat
                    </Button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default ActivePopup
