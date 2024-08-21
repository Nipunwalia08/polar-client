'use client'
import SearchSvg from '@assets/svg/Search.svg'
import EditLeadPopup from '@components/leads/EditLeadPopup'
import ViewFullDetail from '@components/leads/ViewFullDetail'
import { Customer, WhatsappMessages } from '@firebase/config'
import { deleteLead, getLeads } from '@firebase/firebaseInteractor'
import { Add, Close, Percent } from '@mui/icons-material'
import { Button } from '@mui/material'
import usePersistStore from '@store/usePersistStore'
import type { ILead } from '@type/collections'
import { deleteDoc, doc } from 'firebase/firestore'
import { useRouter } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'

const page = () => {
  const router = useRouter()

  const [fileData, setFileData] = useState<ILead[]>([])
  const [loadingId, setLoadingId] = useState<string | null>(null)

  const { companyId } = usePersistStore()

  useEffect(() => {
    async function fetchLeadData() {
      const responseData = await getLeads()
      console.log(responseData)
      setFileData(responseData || [])
    }

    fetchLeadData()
  }, [])

  async function handleDeleteLead(id: string, phone: string) {
    console.log('deleting lead', id)
    setLoadingId(id)
    await deleteDoc(doc(Customer, id))
    await deleteDoc(doc(WhatsappMessages, `${companyId}-${phone}`))
    const responseData = await getLeads()
    setFileData(responseData || [])
    if (viewFullDetail) {
      setViewFullDetail(false)
    }
    setLoadingId(null)
  }

  const [editLeadPopup, setEditLeadPopup] = useState(false)
  const [selectForEditData, setSelectForEditData] = useState<ILead>({
    name: '',
    email: '',
    phone: '',
    id: '',
  })

  const handleEditLead = (index: number) => {
    setEditLeadPopup(true)
    setSelectForEditData(fileData[index])
  }

  const [viewFullDetail, setViewFullDetail] = useState(false)
  const [selectedLead, setSelectedLead] = useState<ILead>({
    name: '',
    email: '',
    phone: '',
  })

  const handleViewFullDetail = (index: number) => {
    console.log('index', index)
    setViewFullDetail(true)
    setSelectedLead(fileData[index])
  }

  const [searchQuery, setSearchQuery] = useState<string>('')
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
  }

  const filteredData = fileData.filter((member) => {
    const query = searchQuery.toLowerCase()
    console.log('email', member?.email, 'query', query)
    const email = member?.email?.toLowerCase() || ''
    return (
      member?.name?.toLowerCase()?.includes(query) ||
      email.includes(query) ||
      member?.phone?.toLowerCase()?.includes(query)
    )
  })

  return (
    <>
      {!viewFullDetail && (
        <div className="flex flex-col justify-center ml-12">
          <div className="flex justify-between items-center p-4 bg-white rounded my-4 mr-16">
            <h1 className="text-2xl font-semibold">List of Leads</h1>
            <Button
              variant="contained"
              className="bg-theme text-white px-6 py-2 rounded flex items-center justify-center"
              onClick={() => {
                router.push('/leads/scrape')
              }}
            >
              <Add />
              <span className="ml-2">Add Leads</span>
            </Button>
          </div>
          <div className="flex justify-end mr-14 my-2">
            <div className="flex bg-white border px-2 rounded mr-2">
              <img src={SearchSvg.src} alt="" />
              <input
                type="text"
                placeholder="Search Leads"
                className="px-4 py-2 focus:outline-none"
                onChange={handleSearchChange}
                value={searchQuery}
              />
            </div>
          </div>
          <div className="mr-16 mt-4">
            <div className="w-full">
              {(filteredData.length !== 0 ? filteredData : fileData).map(
                (member, index) => (
                  <div
                    key={index}
                    className="bg-white border flex justify-between items-center p-4 my-2"
                  >
                    <div className="p-2">
                      <h3>
                        <span className="font-bold">Name: </span>
                        <button
                          className="cursor-pointer"
                          type="button"
                          onClick={() => handleViewFullDetail(index)}
                        >
                          {member.name}
                        </button>
                      </h3>
                      {member.email && (
                        <h3>
                          <span className="font-bold">Email: </span>
                          {member.email}
                        </h3>
                      )}
                      <h3>
                        <span className="font-bold">Phone Number: </span>
                        {member.phone}
                      </h3>
                    </div>
                    <div className="p-2 flex justify-center">
                      <Button
                        className="bg-[#D0FF84] text-black px-4 py-2 rounded mx-2"
                        onClick={() => {
                          handleEditLead(index)
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        className="bg-[#FFA09A] text-black px-4 py-2 rounded mx-2"
                        onClick={() =>
                          handleDeleteLead(member.id || '', member.phone)
                        }
                      >
                        {loadingId === member.id ? (
                          <div className="loader" />
                        ) : (
                          'Delete'
                        )}
                      </Button>
                    </div>
                  </div>
                ),
              )}
            </div>
          </div>
        </div>
      )}

      {editLeadPopup && (
        <EditLeadPopup
          name={selectForEditData.name}
          email={selectForEditData.email || ''}
          phone={selectForEditData.phone}
          id={selectForEditData.id || ''}
          setEditLeadPopup={setEditLeadPopup}
          setFileData={setFileData}
        />
      )}

      {viewFullDetail && (
        <ViewFullDetail
          setViewFullDetail={setViewFullDetail}
          selectedLead={selectedLead}
          setEditLeadPopup={setEditLeadPopup}
          handleDeleteLead={handleDeleteLead}
          setSelectForEditData={setSelectForEditData}
        />
      )}
    </>
  )
}

export default page
