'use client'
import BackArrow from '@assets/svg/BackArrow.svg'
import PencilSvg from '@assets/svg/PencilWhite.svg'
import ProfileSvg from '@assets/svg/Profile.svg'
import {
  getProfileData,
  setProfileUpdatedData,
} from '@firebase/firebaseInteractor'
import { Box, Button, TextField } from '@mui/material'
import usePersistStore from '@store/usePersistStore'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

function page({
  searchParams: { tab },
}: {
  searchParams: {
    tab: number
  }
}) {
  const { adminId } = usePersistStore()

  // const [activePopup, setActivePopup] = useState(false)
  const [menus, _] = useState([
    {
      id: 1,
      name: 'Account',
    },
    {
      id: 2,
      name: 'Payment Management',
    },
  ])

  console.log('tab', typeof tab)

  const [selectedMenu, setSelectedMenu] = useState(Number(tab) || 1)

  const [editProfilePopup, setEditProfilePopup] = useState(false)
  const [updatedPasswordPopup, setUpdatedPasswordPopup] = useState(false)

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
  })

  useEffect(() => {
    if (adminId) {
      const getProfileDataFromDB = async () => {
        const profileDataFromDb = await getProfileData(adminId || '')
        console.log(profileDataFromDb)
        setProfileData(profileDataFromDb)
      }
      getProfileDataFromDB()
    }
  }, [adminId])

  const handleNameChange = (e: any) => {
    setProfileData({ ...profileData, name: e.target.value })
  }

  const handleEmailChange = (e: any) => {
    setProfileData({ ...profileData, email: e.target.value })
  }

  const saveProfileInfo = async () => {
    await setProfileUpdatedData(adminId || '', profileData)
    setEditProfilePopup(false)
    toast.success('Profile Updated Successfully')
  }

  return (
    <div className="flex flex-col justify-center items-center rounded">
      <div className="w-5/6 mt-8 p-4 bg-[#F2F2F2] shadow flex rounded">
        {menus.map((menu, index) => (
          <div key={index} className="flex items-center mx-2">
            <button
              type="button"
              onClick={() => {
                setSelectedMenu(index + 1)
              }}
            >
              <h1
                className={`text-lg font-semibold px-4 py-2 rounded-lg ${selectedMenu === index + 1 ? 'bg-black text-white' : ''} cursor-pointer`}
              >
                {menu.name}
              </h1>
            </button>
          </div>
        ))}
      </div>
      {selectedMenu === 1 && !editProfilePopup && !updatedPasswordPopup && (
        <div className="w-5/6 p-4 bg-white shadow h-[40rem] flex items-center  justify-center rounded">
          <div className="flex items-center flex-col justify-center">
            {/* <img src={ProfileSvg.src} alt="" className='w-32 h-32 my-2' /> */}
            <h1 className="text-xl font-semibold my-2">{profileData.name}</h1>
            <span className="email mb-2">{profileData.email}</span>
            <div className="btns flex mt-4">
              <Button
                variant="contained"
                className="bg-theme flex items-center justify-center px-4 py-2 text-white rounded"
                onClick={() => {
                  setEditProfilePopup(true)
                }}
              >
                Edit Profile <img src={PencilSvg.src} alt="" className="ml-2" />
              </Button>
              <Button
                variant="contained"
                className="bg-theme text-center px-4 py-2 text-white ml-2 rounded"
                onClick={() => {
                  setUpdatedPasswordPopup(true)
                }}
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      )}

      {selectedMenu === 1 && editProfilePopup && (
        <>
          <div className="w-5/6 rounded p-4 pb-8 bg-white shadow flex flex-col">
            <div className="back-btn cursor-pointer flex items-center">
              <button
                type="button"
                onClick={() => {
                  setEditProfilePopup(false)
                }}
              >
                <img src={BackArrow.src} alt="" />
              </button>
              <h2 className="ml-4 font-semibold text-lg">Edit Profile</h2>
            </div>
            <div className="profile-data flex flex-col justify-center items-center">
              {/* <img src={ProfileSvg.src} alt="" className='w-36 h-36 rounded-full' /> */}
              {/* <div className="flex items-center mt-4">
                                <button className='bg-black px-4 py-2 rounded ml-4 flex text-white' onClick={() => { setActivePopup(true) }}><img src={PencilSvg.src} alt="" className='mr-2' /> Edit Profile </button>
                            </div> */}
              <div className="mt-4 flex flex-col w-full">
                <label htmlFor="name" className="my-2">
                  Name
                </label>
                <input
                  type="text"
                  name=""
                  id="name"
                  className="border rounded px-4 py-2"
                  value={profileData.name}
                  onChange={handleNameChange}
                />
                <label htmlFor="email" className="my-2">
                  Email Id
                </label>
                <input
                  type="text"
                  name=""
                  id="email"
                  className="border rounded px-4 py-2"
                  value={profileData.email}
                  onChange={handleEmailChange}
                />
              </div>
            </div>
            <div className="profile-data flex justify-end my-4">
              <Button
                variant="contained"
                className="bg-theme text-white px-6 py-2 rounded"
                onClick={saveProfileInfo}
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}

      {selectedMenu === 1 && updatedPasswordPopup && (
        <>
          <div className="w-5/6 rounded p-4 pb-8 bg-white shadow flex flex-col">
            <div className="back-btn cursor-pointer flex items-center">
              <Box
                component="img"
                src={BackArrow.src}
                onClick={() => {
                  setUpdatedPasswordPopup(false)
                }}
              />
              <h2 className="ml-4 font-semibold text-lg">Update Password</h2>
            </div>
            <div className="profile-data flex flex-col justify-center items-center">
              <div className="mt-4 flex flex-col w-full">
                {/* <TextField className='my-2' id="outlined-basic" label="Name" variant="outlined" />
                    <TextField className='my-2' id="outlined-basic" label="Email" variant="outlined" /> */}
                <TextField
                  className="my-2"
                  id="outlined-password-input"
                  label="Old Password"
                  type="password"
                  autoComplete="current-password"
                />
                <TextField
                  className="my-2"
                  id="outlined-password-input"
                  label="New Password"
                  type="password"
                  autoComplete="current-password"
                />
                <TextField
                  className="my-2"
                  id="outlined-password-input"
                  label="Confirm Password"
                  type="password"
                  autoComplete="current-password"
                />
              </div>
            </div>
            <div className="profile-data flex justify-end my-4">
              <Button
                variant="contained"
                className="bg-theme text-white px-6 py-2 rounded"
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default page
