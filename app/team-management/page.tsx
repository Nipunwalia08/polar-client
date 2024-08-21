'use client'

import AddiconSvg from '@assets/svg/AddIcon.svg'
import AddTeamMates from '@assets/svg/AddTeamMates.svg'
import Close from '@assets/svg/Close.svg'
import NoTeamSvg from '@assets/svg/NoTeam.svg'
import ShowTeamData from '@components/team/ShowTeamData'
import { auth } from '@firebase/config'
import {
  addTeamMembersToTeamDoc,
  getTeamMembers,
} from '@firebase/firebaseInteractor'
import { Delete } from '@mui/icons-material'
import { Button } from '@mui/material'
import useAuthStore from '@store/useAuthStore'
import usePersistStore from '@store/usePersistStore'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface TeamData {
  name: string
  teamName: string
  email: string
  adminId: string
  active: boolean
  id?: string | undefined
}

function page() {
  const { adminId } = usePersistStore()

  const [isTeamExist, setTeamExist] = useState(false)
  const [teamAddedStatus, setTeamAddedStatus] = useState(false)

  const [displayTeamData, setDisplayTeamData] = useState<TeamData[]>([])

  // biome-ignore lint/correctness/useExhaustiveDependencies: Need to run only on teamAddedStatus Change
  useEffect(() => {
    if (adminId) {
      const getTeamMembersFromDb = async () => {
        const teamMembers = await getTeamMembers(adminId || '')
        console.log(teamMembers)
        if (teamMembers.length > 0) {
          console.log('team exists')
          setTeamExist(true)
          setDisplayTeamData(teamMembers)
        } else {
          console.log('team does not exist')
          setTeamExist(false)
        }
      }
      getTeamMembersFromDb()
    }
  }, [teamAddedStatus, adminId])

  const [popupOpen, setPopupOpen] = useState(false)
  const [teamNamePopupOpen, setTeamNamePopup] = useState(false)

  const inviteTeam = () => {
    // make bg screen opacity 50% and show invite team modal
    setPopupOpen(true)
  }

  const [teamData, setTeamData] = useState([
    {
      teamMateName: '',
      teamMateEmail: '',
      teamMatePassword: '',
      teamName: '',
      active: true,
    },
  ])

  const AddMultipleTeam = () => {
    console.log(teamData)
    setTeamData([
      ...teamData,
      {
        teamMateName: '',
        teamMateEmail: '',
        teamMatePassword: '',
        teamName: '',
        active: true,
      },
    ])
  }

  // const teamNamePopup = () => {
  //   // make sure all fields are filled
  //   for (const team of teamData) {
  //     if (
  //       team.teamMateName === '' ||
  //       team.teamMateEmail === '' ||
  //       team.teamMatePassword === ''
  //     ) {
  //       toast.error('Please fill all the fields')
  //       return
  //     }
  //   }

  //   setTeamNamePopup(true)
  // }

  const handleDeleteTeamMate = (index: number) => {
    const newData = teamData.filter((_, i) => i !== index)
    setTeamData(newData)
  }

  const setTeamDataHandler = (e: React.ChangeEvent<HTMLInputElement>) => {
    const [name, index] = e.target.name.split('-')
    const value = e.target.value
    const newData = teamData.map((team, i) => {
      if (i === Number(index)) {
        return {
          ...team,
          [name]: value,
          teamName: 'test',
          active: true,
        }
      }
      return team
    })
    setTeamData(newData)
  }

  // const setTeamNameToTeamData = (e: React.ChangeEvent<HTMLInputElement>) => {
  const setTeamNameToTeamData = () => {
    const newData = teamData.map((team) => {
      return {
        ...team,
        // teamName: e.target.value,
        teamMateName: 'test',
        active: true,
      }
    })
    setTeamData(newData)
  }
  const { user } = useAuthStore()

  const createTeam = async () => {
    // make sure all fields are filled
    // setTeamNameToTeamData()

    // if (teamData[0].teamName === '') {
    //   toast.error('Please fill all the fields')
    //   return
    // }
    console.log('team data yehi h', teamData)

    for (const team of teamData) {
      const teamData = {
        Array: [
          {
            name: team.teamMateName,
            teamName: team.teamName,
            email: team.teamMateEmail,
            adminId: adminId || '',
            active: team.active,
          },
        ],
      }
      try {
        await createUserWithEmailAndPassword(
          auth,
          team.teamMateEmail,
          team.teamMatePassword,
        )
        setTimeout(() => {
          console.log('User created successfully + ', user)
        }, 4000)
      } catch (error) {
        console.log(`Error creating user: ${error}`)
        toast.error('Error creating user')
        return
      }

      try {
        await addTeamMembersToTeamDoc(teamData as never)
        toast.success('Team Mate Added Successfully')
        setPopupOpen(false)
        setTeamNamePopup(false)
        setTeamData([
          {
            teamMateName: '',
            teamMateEmail: '',
            teamMatePassword: '',
            teamName: '',
            active: true,
          },
        ])
        setTeamAddedStatus(!teamAddedStatus)
      } catch (error) {
        console.log(`Error adding team mate: ${error}`)
        toast.error('Error adding team mate')
        return
      }
    }
  }

  const refreshPlease = () => {
    console.log('refreshing.....$$$$$$$$$')
    setTeamAddedStatus(!teamAddedStatus)
  }

  return (
    <>
      {!isTeamExist && (
        <div className="flex flex-col justify-center items-center">
          <img src={NoTeamSvg.src} alt="" />
          <Button
            className="bg-theme text-white px-4 py-2 mt-4 rounded"
            onClick={inviteTeam}
          >
            Invite Members
          </Button>
        </div>
      )}
      {isTeamExist && (
        <ShowTeamData
          inviteTeam={inviteTeam}
          teamData={displayTeamData}
          refreshPlease={refreshPlease}
        />
      )}

      {popupOpen && (
        <>
          <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
          <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded ">
            <div className="flex bg-black justify-between p-2 rounded">
              <div className="flex items-center">
                <img src={AddTeamMates.src} alt="" />
                <h1 className="text-lg font-semibold text-white ml-2">
                  Invite Your Teammates
                </h1>
              </div>
              <button type="button" onClick={() => setPopupOpen(false)}>
                <img src={Close.src} alt="" />
              </button>
            </div>
            <div className="flex flex-col max-h-96 overflow-y-scroll">
              <p className="text-center w-2/3 mx-auto my-6">
                It's much more effective to use Polar in teams. Onboard your
                team member by sending an invite.
              </p>
              {/* {teamData[0].teamMateName} */}
              {teamData.length > 0 &&
                teamData.map((team, index): any => {
                  return (
                    <div
                      key={index}
                      className="flex w-full mt-16 px-4 items-end"
                    >
                      <div className="flex flex-col w-1/3 mx-4">
                        <label htmlFor="email">Name</label>
                        <input
                          className="border px-4 py-2 rounded mt-2"
                          placeholder="Name"
                          type="text"
                          name={`teamMateName-${index}`}
                          id="name"
                          onChange={setTeamDataHandler}
                          value={team.teamMateName}
                        />
                      </div>
                      <div className="flex flex-col w-1/3 mx-4">
                        <label htmlFor="email">Email</label>
                        <input
                          className="border px-4 py-2 rounded mt-2"
                          placeholder="Email"
                          type="email"
                          name={`teamMateEmail-${index}`}
                          id="email"
                          onChange={setTeamDataHandler}
                          value={team.teamMateEmail}
                        />
                      </div>
                      <div className="flex flex-col w-1/3 mx-4">
                        <label htmlFor="email">Passowrd</label>
                        <input
                          className="border px-4 py-2 rounded mt-2"
                          placeholder="Password"
                          type="password"
                          name={`teamMatePassword-${index}`}
                          id="password"
                          onChange={setTeamDataHandler}
                          value={team.teamMatePassword}
                        />
                      </div>
                      {/* delete button */}
                      {index > 0 && (
                        <button
                          type="button"
                          className="flex items-center mb-2 cursor-pointer"
                          onClick={() => {
                            handleDeleteTeamMate(index)
                          }}
                        >
                          <Delete sx={{ color: 'red' }} />
                        </button>
                      )}
                    </div>
                  )
                })}
              <div className="flex p-4 justify-center items-center">
                <Button
                  variant="outlined"
                  className="py-2 px-8 flex items-center rounded border border-black"
                  onClick={AddMultipleTeam}
                >
                  <img src={AddiconSvg.src} alt="" />
                  <span className="ml-2">Add Seat</span>
                </Button>
              </div>
              <div className="flex justify-end my-4">
                <Button
                  className="bg-theme text-white px-8 py-2 rounded mr-4"
                  // onClick={teamNamePopup}
                  onClick={createTeam}
                >
                  Invite Member
                </Button>
              </div>
            </div>

            {teamNamePopupOpen && (
              <>
                <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
                <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-11/12">
                  <div className="flex bg-black justify-between p-2 rounded">
                    <div className="flex items-center">
                      <h1 className="text-lg font-semibold text-white ml-2">
                        Create a Team
                      </h1>
                    </div>
                    <button
                      type="button"
                      onClick={() => setTeamNamePopup(false)}
                    >
                      <img className="cursor-pointer" src={Close.src} alt="" />
                    </button>
                  </div>
                  <div className="mt-10 px-4">
                    <div className="flex flex-col mx-4">
                      <label htmlFor="email">
                        Give your team a name here
                        <span className="text-red-600">*</span>
                      </label>
                      <input
                        className="border px-4 py-2 rounded mt-2"
                        placeholder="Team Name"
                        type="text"
                        name="teamName"
                        id="teamName"
                        onChange={setTeamNameToTeamData}
                      />
                    </div>
                  </div>
                  <div className="flex justify-center items-center my-6">
                    <Button
                      variant="contained"
                      className="bg-black text-white px-8 py-2 rounded mr-4"
                      onClick={createTeam}
                    >
                      Create Team
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  )
}

export default page
