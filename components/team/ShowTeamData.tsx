'use client'
import BackArrow from '@assets/svg/BackArrow.svg'
import CloseSvg from '@assets/svg/Close.svg'
import MoreBtnSvg from '@assets/svg/MoreBtn.svg'
import PencilSvg from '@assets/svg/Pencil.svg'
import ProfileSvg from '@assets/svg/Profile.svg'
import RecallIconSvg from '@assets/svg/RecallCloseIcon.svg'
import SearchSvg from '@assets/svg/Search.svg'
import { getTeamMembers } from '@firebase/firebaseInteractor'
import { Close as CloseSvgBtn } from '@mui/icons-material'
import { Button } from '@mui/material'
import React, { useEffect, useState } from 'react'
import ActivePopup from './ActivePopup'
import EditTeamPopup from './EditTeamPopup'

interface ShowTeamDataProps {
  inviteTeam: () => void
  teamData: any
  refreshPlease: () => void
}

const ShowTeamData = ({
  inviteTeam,
  teamData,
  refreshPlease,
}: ShowTeamDataProps) => {
  const [member, _setMember] = useState(true)
  const [recallPopup, _setRecallPopup] = useState(false)
  const [activePopup, setActivePopup] = useState(false)

  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState([])

  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedRows(teamData.map((_: any, index: any) => index) as never[])
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (index: number) => {
    if (selectedRows.includes(index as never)) {
      setSelectedRows(selectedRows.filter((row) => row !== index))
    } else {
      setSelectedRows([...(selectedRows as never[]), index as never])
    }
  }

  const [selectedIndex, setSelectedIndex] = useState(0)

  const [searchQuery, setSearchQuery] = useState('')
  const handleSearchChange = (e: any) => {
    setSearchQuery(e.target.value)
  }

  const filteredData = teamData.filter((member: any) => {
    const query = searchQuery.toLowerCase()
    return member.name.toLowerCase().includes(query)
  })

  console.log('team data ha bhai', teamData)

  const [editTeamMatePopup, setEditTeamMatePopup] = useState(false)

  const handleEditToggleOn = () => {
    setEditTeamMatePopup(true)
  }

  const handleEditToggleOff = () => {
    setTimeout(() => {
      setEditTeamMatePopup(false)
      setActivePopup(false)
      refreshPlease()
    }, 1000)
  }

  return (
    <>
      {!activePopup && (
        <div className="flex flex-col justify-center items-center">
          <div className="w-5/6 mt-8 rounded p-4 pb-8 bg-[#F4F4F4] shadow-lg">
            {/* <div className="flex items-center">
              <h1 className="text-2xl font-semibold">
                Your are in <span className="text-[#211AEB]">Tanishq</span> team
              </h1>
              <img src={PencilSvg.src} alt="" className="ml-4 cursor-pointer" />
            </div> */}
            <div className="flex mt-6 justify-end">
              {/* <div className="flex">
                <Button
                  variant="contained"
                  className={`${member ? 'bg-black text-white px-8 py-2 rounded' : 'border border-black bg-white text-black px-8 py-2 ml-2 rounded'}`}
                  onClick={() => {
                    setMember(true)
                  }}
                >
                  Members
                </Button>
                <button className={`${!member?'bg-black text-white px-8 py-2 rounded ml-2':'border border-black bg-white text-black px-8 py-2 ml-2 rounded'}`} onClick={()=>{setMember(false)}}>Invite</button>
              </div> */}
              <div className="flex">
                <div className="flex bg-white border px-2 rounded mr-2">
                  <img src={SearchSvg.src} alt="" />
                  <input
                    type="text"
                    placeholder="Select Users and Teams"
                    className="px-4 py-2 focus:outline-none"
                    onChange={handleSearchChange}
                    value={searchQuery}
                  />
                </div>
                <Button
                  variant="contained"
                  className="bg-theme px-4 text-white ml-2 rounded"
                  onClick={inviteTeam}
                >
                  Add Member
                </Button>
              </div>
            </div>
          </div>
          <div className="w-5/6 shadow">
            <table className="w-full border-collapse">
              {member && (
                <>
                  <thead>
                    <tr className="bg-black text-white">
                      <th className="p-2">
                        <input
                          type="checkbox"
                          checked={selectAll}
                          onChange={handleSelectAll}
                        />
                      </th>
                      <th className="p-2 text-center">Name</th>
                      <th className="p-2 text-center">Role</th>
                      <th className="p-2 text-center">Asigned Campaigns</th>
                      <th className="p-2 text-center">Asigned Chats</th>
                      <th className="p-2 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {searchQuery === '' &&
                      teamData?.map((member: any, index: any) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="p-2 flex justify-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(index as never)}
                              onChange={() => handleSelectRow(index)}
                            />
                          </td>
                          <td className="p-2 text-center cursor-pointer">
                            <button
                              className="w-full text-center"
                              type="button"
                              onClick={() => {
                                setActivePopup(true)
                                setSelectedIndex(index)
                              }}
                            >
                              {member.name}
                            </button>
                          </td>
                          <td className="p-2 text-center">Team</td>
                          <td className="p-2 text-center">
                            {member?.assignedCampaigns?.length}
                          </td>
                          <td className="p-2 text-center">0</td>
                          <td className="p-2 flex justify-center">
                            {member.active ? (
                              <Button
                                variant="contained"
                                className="bg-[#D0FF84] hover:bg-[#D0FF84] shadow-none text-black px-4 py-2 rounded"
                                onClick={() => {
                                  setActivePopup(true)
                                  setSelectedIndex(index)
                                }}
                              >
                                Active
                              </Button>
                            ) : (
                              <Button
                                variant="contained"
                                className="bg-[#FEADAD] hover:bg-[#FEADAD] shadow-none text-black px-4 py-2 rounded"
                                onClick={() => {
                                  setActivePopup(true)
                                  setSelectedIndex(index)
                                }}
                              >
                                InActive
                              </Button>
                            )}
                            {/* <img src={MoreBtnSvg.src} alt="" className='ml-2 cursor-pointer' /> */}
                          </td>
                        </tr>
                      ))}

                    {searchQuery !== '' &&
                      filteredData.length !== 0 &&
                      filteredData?.map((member: any, index: any) => (
                        <tr key={index} className="bg-white border-b">
                          <td className="p-2 flex justify-center">
                            <input
                              type="checkbox"
                              checked={selectedRows.includes(index as never)}
                              onChange={() => handleSelectRow(index)}
                            />
                          </td>
                          <td className="p-2 text-center cursor-pointer">
                            <button
                              className="w-full text-center"
                              type="button"
                              onClick={() => {
                                setActivePopup(true)
                                setSelectedIndex(index)
                              }}
                            >
                              {member.name}
                            </button>
                          </td>
                          <td className="p-2 text-center">Team</td>
                          <td className="p-2 text-center">0</td>
                          <td className="p-2 text-center">0</td>
                          <td className="p-2 flex justify-center">
                            <Button
                              variant="contained"
                              className="bg-[#D0FF84] hover:bg-[#D0FF84] shadow-none text-black px-4 py-2 rounded"
                              onClick={() => {
                                setActivePopup(true)
                                setSelectedIndex(index)
                              }}
                            >
                              Active
                            </Button>
                            {/* <img src={MoreBtnSvg.src} alt="" className='ml-2 cursor-pointer' /> */}
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </>
              )}

              {!member && (
                <>
                  <div className="" />
                </>
                // <>
                //   <thead>
                //     <tr className="bg-black text-white">
                //       <th className="p-2 text-center">Email</th>
                //       <th className="p-2 text-center">Date</th>
                //       <th className="p-2 text-center">Role</th>
                //       <th className="p-2 text-center">Status</th>
                //     </tr>
                //   </thead>
                //   <tbody>
                //     <tr className="bg-white border-b">
                //       <td className="p-2 text-center">
                //         tanishqsoni0309@gmail.com
                //       </td>
                //       <td className="p-2 text-center">June 03 2024</td>
                //       <td className="p-2 text-center">User</td>
                //       <td className="p-2 flex justify-center">
                //         <button
                //           className="bg-[#D0FF84] text-black px-4 py-2 rounded"
                //           onClick={() => {
                //             setRecallPopup(true)
                //           }}
                //         >
                //           Recall Invite
                //         </button>
                //         <img
                //           src={MoreBtnSvg.src}
                //           alt=""
                //           className="ml-2 cursor-pointer"
                //         />
                //       </td>
                //     </tr>
                //     {/* Repeat the above <tr> block for each row of data */}
                //   </tbody>
                // </>
              )}
            </table>
          </div>
          {recallPopup && (
            <>
              <div className="" />
            </>
            // <>
            // <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
            // <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-1/3">
            //   <div className="flex justify-end p-4 rounded">
            //     {/* <img className='cursor-pointer text-black' src={CloseSvg.src} alt="" onClick={()=>setRecallPopup(false)} /> */}
            //     <CloseSvgBtn
            //       sx={{ cursor: 'pointer' }}
            //       onClick={() => {
            //         setRecallPopup(false)
            //       }}
            //     />
            //   </div>
            //   <div className="flex flex-col">
            //     <img src={RecallIconSvg.src} alt="" className="w-20 mx-auto" />
            //     <h3 className="text-center mt-2">Tanishq Soni</h3>
            //     <p className="text-center mt-2 w-full text-wrap">
            //       Do you really want to recall invite for{' '}
            //       <span className="text-blue-600">
            //         tanishqsoni0309@gmail.com?
            //       </span>
            //     </p>
            //   </div>
            //   <div className="flex justify-center items-center my-8">
            //     <Button className="py-2 px-8 flex items-center rounded bg-[#F40000] text-white">
            //       <span className="ml-2">Recall Invite</span>
            //     </Button>
            //   </div>
            // </div>
            // </>
          )}
        </div>
      )}

      {activePopup && (
        <>
          <ActivePopup
            setActivePopup={setActivePopup}
            teamData={teamData[selectedIndex]}
            handleEditToggleOn={handleEditToggleOn}
            refreshPlease={refreshPlease}
          />

          {editTeamMatePopup && (
            <EditTeamPopup
              handleEditToggleOff={handleEditToggleOff}
              teamData={teamData[selectedIndex]}
              refreshPlease={refreshPlease}
            />
          )}
        </>
      )}
    </>
  )
}

export default ShowTeamData
