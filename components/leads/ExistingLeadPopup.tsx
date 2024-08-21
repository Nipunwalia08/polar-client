'use client'
import AddTeamMates from '@assets/svg/AddTeamMates.svg'
import Close from '@assets/svg/Close.svg'
import { customerLeads } from '@firebase/firebaseInteractor'
import { Button } from '@mui/material'
import usePersistStore from '@store/usePersistStore'
import type { CustomerLeads, ILead } from '@type/collections'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { toast } from 'react-toastify'

interface ExistingLeadPopupProps {
  handleCloseLeadPopup: () => void
  setExistingLeadPopup: (value: boolean) => void
  existingLeadsData: ILead[]
}

export const ExistingLeadPopup = ({
  handleCloseLeadPopup,
  existingLeadsData,
  setExistingLeadPopup,
}: ExistingLeadPopupProps) => {
  const [btnLoading, setBtnLoading] = useState(false)

  const router = useRouter()

  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])

  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedRows(existingLeadsData.map((_, index) => index) as never[])
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

  const handleExistingLeads = () => {
    setBtnLoading(true)
    setTimeout(async () => {
      const dataToSend = existingLeadsData.filter((_, index) =>
        selectedRows.includes(index as never),
      )
      console.log(dataToSend)
      const exixtingLeads = await customerLeads(dataToSend as never[], false)

      console.log(exixtingLeads)

      setSelectedRows([])
      toast.success('Leads overwritten successfully')
      router.push('/leads/manage')
      setBtnLoading(false)
    }, 500)
  }

  return (
    <>
      <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
      <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-2/6">
        <div className="flex bg-black justify-between p-2 rounded">
          <div className="flex items-center">
            <img src={AddTeamMates.src} alt="" />
            <h1 className="text-lg font-semibold text-white ml-2">
              Duplicate Leads
            </h1>
          </div>
          <button type="button" onClick={handleCloseLeadPopup}>
            <img className="cursor-pointer" src={Close.src} alt="" />
          </button>
        </div>

        {/* mapping the existing lead data with checkbox */}

        <div className="my-10 px-4">
          <input
            type="checkbox"
            checked={selectAll}
            onChange={handleSelectAll}
            id="selectAll"
          />
          <label
            className="ml-2 font-semibold text-xl cursor-pointer"
            htmlFor="selectAll"
          >
            Select All
          </label>
          {existingLeadsData?.map((data, index) => (
            <div key={index} className="flex items-center my-2">
              <input
                type="checkbox"
                className="mr-2"
                onChange={() => handleSelectRow(index)}
                checked={selectedRows.includes(index)}
              />
              <div className="flex flex-col">
                <h3>
                  <span className="font-bold">Name: </span>
                  {data.name}
                </h3>
                {data.email && (
                  <h3>
                    <span className="font-bold">Email: </span>
                    {data.email}
                  </h3>
                )}
                <h3>
                  <span className="font-bold">Phone Number: </span>
                  {data.phone}
                </h3>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-end items-center my-6">
          <Button
            variant="contained"
            className="bg-theme text-white px-8 py-2 rounded mr-4"
            onClick={() => {
              setExistingLeadPopup(false)
            }}
          >
            Ignore
          </Button>
          <Button
            disabled={btnLoading}
            variant="contained"
            className="bg-theme text-white px-8 py-2 rounded mr-4"
            onClick={handleExistingLeads}
          >
            {btnLoading ? <div className="loader" /> : 'Overwrite'}
          </Button>
        </div>
      </div>
    </>
  )
}
