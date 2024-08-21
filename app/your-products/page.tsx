'use client'
import {
  addBankDetails,
  addCtaToDb,
  deleteBank,
  getBankDetails,
  getCta,
} from '@firebase/firebaseInteractor'
import { Add, Close, Edit } from '@mui/icons-material'
import { Button, Dialog, styled } from '@mui/material'
import usePersistStore from '@store/usePersistStore'
import type { IBankDetails } from '@type/collections'
import React, { useCallback, useEffect, useState } from 'react'
import { toast } from 'react-toastify'

const BootstrapDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2),
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1),
  },
}))

function Page() {
  const { companyId } = usePersistStore()

  const [ctaSelected, setCtaSelected] = useState(false)
  const [addBankPopup, setAddBankPopup] = useState(false)
  const [editBankPopup, setEditBankPopup] = useState(false)
  const [bankDetails, setBankDetails] = useState({
    bankName: '',
    bankLink: '',
    bankFoir: '',
    bankRois: [
      { tenure: 3, roi: '' },
      { tenure: 6, roi: '' },
      { tenure: 9, roi: '' },
      { tenure: 12, roi: '' },
      { tenure: 24, roi: '' },
      { tenure: 36, roi: '' },
    ],
  })
  const [banks, setBanks] = useState<IBankDetails[]>([])
  const [currentBank, setCurrentBank] = useState<IBankDetails | null>(null)

  const handleClickOpen = () => {
    setAddBankPopup(true)
  }

  const handleClose = () => {
    setAddBankPopup(false)
    setEditBankPopup(false)
  }

  const handleCtaSelection = () => {
    setCtaSelected(true)
    fetchCtaData()
  }

  const handleCtaDeselection = () => {
    setCtaSelected(false)
  }

  const handleDeleteBank = async (bankName: string) => {
    await deleteBank(companyId, bankName)
    fetchBankData()
  }

  const handleEditBank = (bank: IBankDetails) => {
    setCurrentBank(bank)
    setBankDetails(bank)
    setEditBankPopup(true)
  }

  const handleRoiData = (e: any, index: number) => {
    const newRois = [...bankDetails.bankRois]
    console.log('hello')
    console.log(e.target.value)
    newRois[index].roi = e.target.value
    setBankDetails({ ...bankDetails, bankRois: newRois })
  }

  const submitData = async () => {
    await addBankDetails(companyId, bankDetails, false)
    toast.success('Bank Added Successfully')
    setBankDetails({
      bankName: '',
      bankLink: '',
      bankFoir: '',
      bankRois: [
        { tenure: 3, roi: '' },
        { tenure: 6, roi: '' },
        { tenure: 9, roi: '' },
        { tenure: 12, roi: '' },
        { tenure: 24, roi: '' },
        { tenure: 36, roi: '' },
      ],
    })
    setAddBankPopup(false)
    fetchBankData()
  }

  const submitEditData = async () => {
    if (currentBank) {
      console.log(bankDetails)
      await addBankDetails(companyId, bankDetails, true)
      toast.success('Bank Updated Successfully')
      setBankDetails({
        bankName: '',
        bankLink: '',
        bankFoir: '',
        bankRois: [
          { tenure: 3, roi: '' },
          { tenure: 6, roi: '' },
          { tenure: 9, roi: '' },
          { tenure: 12, roi: '' },
          { tenure: 24, roi: '' },
          { tenure: 36, roi: '' },
        ],
      })
      setEditBankPopup(false)
      setCurrentBank(null)
      fetchBankData()
    }
  }

  const fetchBankData = useCallback(async () => {
    const bankData = await getBankDetails(companyId)
    setBanks(bankData || [])
  }, [companyId])

  useEffect(() => {
    if (companyId) {
      fetchBankData()
    }
  }, [companyId, fetchBankData])

  const [ctaData, setCtaData] = useState<string[]>([])

  const [fetchedCtaData, setFetchedCtaData] = useState<string[] | null>(null)

  const fetchCtaData = async () => {
    const data = await getCta(companyId)
    setFetchedCtaData(data || [])
  }

  return (
    <div className="flex flex-col justify-center ml-12">
      <div className="flex w-fit mt-8 rounded p-4 py-2 bg-gray-100 items-center shadow">
        <Button
          className={`rounded mx-2 px-6 py-3 ${!ctaSelected ? 'bg-theme text-white' : 'text-black'}`}
          onClick={handleCtaDeselection}
        >
          Bank Management
        </Button>
        <Button
          className={`rounded mx-2 px-6 py-3 ${ctaSelected ? 'bg-theme text-white' : 'text-black'}`}
          onClick={handleCtaSelection}
        >
          CTA Management
        </Button>
      </div>

      {ctaSelected && (
        <>
          <form
            action=""
            className="flex flex-col p-4 mt-4 bg-white mr-16 shadow rounded-lg"
          >
            <label htmlFor="ctaInput">Enter CTA</label>
            <input
              type="text"
              id="ctaInput"
              className="border rounded mt-2 p-2"
              placeholder="Enter CTA"
              value={ctaData[0]}
              onChange={(e) => {
                // set 0th index of array
                setCtaData([e.target.value, ''])
              }}
            />
            <label htmlFor="ctaProfileInput">Profile</label>
            <input
              type="text"
              id="ctaProfileInput"
              className="border rounded mt-2 p-2"
              placeholder="Enter Profile"
              value={ctaData[1]}
              onChange={(e) => {
                // set 1st index of array
                setCtaData([...ctaData.slice(0, 1), e.target.value])
              }}
            />
            <div className="flex justify-end my-8">
              <Button
                className="bg-theme text-lg px-16 py-2 text-white rounded"
                onClick={async () => {
                  // check for non empty fields
                  if (!ctaData[0] || !ctaData[1]) {
                    return toast.error('Please fill all the fields')
                  }
                  await addCtaToDb(companyId, ctaData)
                  setCtaData(['', ''])
                  fetchCtaData()
                }}
              >
                Save
              </Button>
            </div>
          </form>

          {fetchedCtaData &&
            fetchedCtaData[0] !== '' &&
            fetchedCtaData[1] !== '' && (
              <div className="p-4 rounded mt-4 flex mr-16 w-fit">
                <div className="flex flex-col justify-center">
                  <h1 className="text-2xl font-semibold my-2">CTA :</h1>
                  <h1 className="text-2xl font-semibold my-2">Profile :</h1>
                </div>
                <div className="flex flex-col justify-center">
                  <span className="bg-theme px-4 py-2 text-white rounded w-fit ml-4 my-2">
                    {fetchedCtaData[0]}
                  </span>
                  <span className="bg-theme px-4 py-2 text-white rounded w-fit ml-4 my-2">
                    {fetchedCtaData[1]}
                  </span>
                </div>
              </div>
            )}
        </>
      )}

      {!ctaSelected && (
        <div className="shadow mr-16 mt-4">
          <div className="flex justify-between items-center p-4 bg-white rounded">
            <h1 className="text-2xl font-semibold">Bank Management</h1>
            <Button
              className="bg-theme text-white px-6 py-2 rounded flex items-center justify-center"
              onClick={handleClickOpen}
            >
              <Add />
              <span className="ml-2">Add Bank</span>
            </Button>
          </div>
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-2 text-center">Bank Name</th>
                <th className="p-2 text-center">Action</th>
              </tr>
            </thead>
            <tbody>
              {banks.map((instBank, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="p-2 text-center">{instBank.bankName}</td>
                  <td className="p-2 flex justify-center">
                    <Button
                      className="bg-[#D0FF84] text-black px-4 py-2 rounded mx-2"
                      onClick={() => handleEditBank(instBank)}
                    >
                      Edit
                    </Button>
                    <Button
                      className="bg-[#FFA09A] text-black px-4 py-2 rounded mx-2"
                      onClick={() => handleDeleteBank(instBank.bankName)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {addBankPopup && (
        <>
          <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={addBankPopup}
          >
            <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded">
              <div className="flex justify-between p-2 rounded">
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold m-2">Add Bank</h1>
                </div>
                <Close onClick={handleClose} className="cursor-pointer" />
              </div>
              <form
                action=""
                className="flex flex-col px-6 bg-white shadow rounded-lg"
              >
                <label htmlFor="bankName" className="mt-4 font-semibold">
                  Name of the Bank
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  className="border rounded mt-2 p-2"
                  placeholder="Enter Name"
                  value={bankDetails.bankName}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, bankName: e.target.value })
                  }
                />
                <label htmlFor="bankLink" className="mt-4 font-semibold">
                  Onboarding Link
                </label>
                <input
                  type="text"
                  id="bankLink"
                  name="bankLink"
                  className="border rounded mt-2 p-2"
                  placeholder="Upload Link"
                  value={bankDetails.bankLink}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, bankLink: e.target.value })
                  }
                />
                <label htmlFor="bankFoir" className="mt-4 font-semibold">
                  Foir (in %)
                </label>
                <input
                  type="text"
                  id="bankFoir"
                  name="bankFoir"
                  className="border rounded mt-2 p-2"
                  placeholder="Enter Foir Value"
                  value={String(bankDetails.bankFoir)}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      bankFoir: e.target.value,
                    })
                  }
                />
                <label className="mt-4 font-semibold">Tenure</label>
                <div className="grid grid-cols-2 gap-4">
                  {bankDetails.bankRois.map((data, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center my-2"
                    >
                      <span>{data.tenure} months</span>
                      <div className="flex items-center border px-2">
                        <input
                          className="py-2 px-2"
                          placeholder="Enter ROI Value"
                          type="text"
                          onChange={(e) => handleRoiData(e, index)}
                          value={data.roi}
                        />
                        <span>%</span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex justify-end my-8">
                  <button
                    type="button"
                    className="bg-theme text-lg px-16 py-2 text-white rounded"
                    onClick={submitData}
                  >
                    Add
                  </button>
                </div>
              </form>
            </div>
          </BootstrapDialog>
        </>
      )}

      {editBankPopup && (
        <>
          <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
          <BootstrapDialog
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={editBankPopup}
          >
            <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded">
              <div className="flex justify-between p-2 rounded">
                <div className="flex items-center">
                  <h1 className="text-2xl font-semibold m-2">Edit Bank</h1>
                </div>
                <Close onClick={handleClose} className="cursor-pointer" />
              </div>
              <form
                action=""
                className="flex flex-col px-6 bg-white shadow rounded-lg"
              >
                <label htmlFor="bankName" className="mt-4 font-semibold">
                  Name of the Bank
                </label>
                <input
                  type="text"
                  id="bankName"
                  name="bankName"
                  className="border rounded mt-2 p-2"
                  placeholder="Enter Name"
                  value={bankDetails.bankName}
                  readOnly={true}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, bankName: e.target.value })
                  }
                />
                <label htmlFor="bankLink" className="mt-4 font-semibold">
                  Onboarding Link
                </label>
                <input
                  type="text"
                  id="bankLink"
                  name="bankLink"
                  className="border rounded mt-2 p-2"
                  placeholder="Upload Link"
                  value={bankDetails.bankLink}
                  onChange={(e) =>
                    setBankDetails({ ...bankDetails, bankLink: e.target.value })
                  }
                />
                <label htmlFor="bankFoir" className="mt-4 font-semibold">
                  Foir (in %)
                </label>
                <input
                  type="text"
                  id="bankFoir"
                  name="bankFoir"
                  className="border rounded mt-2 p-2"
                  placeholder="Enter Foir Value"
                  value={String(bankDetails.bankFoir)}
                  onChange={(e) =>
                    setBankDetails({
                      ...bankDetails,
                      bankFoir: e.target.value,
                    })
                  }
                />
                <label className="mt-4 font-semibold">Tenure</label>
                <div className="grid grid-cols-2 gap-4">
                  {bankDetails.bankRois.map((data, index) => (
                    <div
                      key={index}
                      className="flex justify-between items-center my-2"
                    >
                      <span>{data.tenure} months</span>
                      <div className="flex items-center border px-2">
                        <input
                          className="py-2 px-2"
                          placeholder="Enter ROI Value"
                          type="text"
                          onChange={(e) => handleRoiData(e, index)}
                          value={String(data.roi)}
                        />
                        <span>%</span>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end my-8">
                  <button
                    type="button"
                    className="bg-theme text-lg px-16 py-2 text-white rounded"
                    onClick={submitEditData}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </BootstrapDialog>
        </>
      )}
    </div>
  )
}

export default Page
