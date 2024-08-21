'use client'
import Close from '@assets/svg/Close.svg'
import DriveDropdown from '@components/gdrive/drivedropdown'
import type React from 'react'

interface Props {
  open: boolean
  onClose: () => void
  setUploadedFilesDatabase: React.Dispatch<React.SetStateAction<File[]>>
}

const DatabaseModal: React.FC<Props> = ({
  open,
  onClose,
  setUploadedFilesDatabase,
}) => {
  if (!open) return null

  return (
    <>
      <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
      <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-3/6">
        <div className="flex bg-black justify-between p-2 rounded">
          <div className="flex items-center">
            <h1 className="text-lg font-semibold text-white ml-2">
              Select from Database
            </h1>
          </div>
          <button type="button" onClick={onClose}>
            <img className="cursor-pointer" src={Close.src} alt="Close" />
          </button>
        </div>
        <div className="my-10 px-4 flex flex-col items-center">
          <DriveDropdown
            setUploadedFilesDatabase={setUploadedFilesDatabase}
            onClose={onClose}
          />
        </div>
      </div>
    </>
  )
}

export default DatabaseModal
