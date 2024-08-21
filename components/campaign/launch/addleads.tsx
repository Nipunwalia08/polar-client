'use client'

import Campaign from '@assets/campaign.png'
import AddTeamMates from '@assets/svg/AddTeamMates.svg'
import Close from '@assets/svg/Close.svg'
import UploadFillSvg from '@assets/svg/UploadFill.svg'
import { getLeads } from '@firebase/firebaseInteractor'
import { UploadFile } from '@mui/icons-material'
import {
  Box,
  Button,
  Checkbox,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import usePersistStore from '@store/usePersistStore'
import useUserStore from '@store/useStore'
import { CustomerLeads } from '@type/collections'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import React, { useState, type ChangeEvent } from 'react'
import { toast } from 'react-toastify'

const normalizeHeader = (header: string): string => {
  const lowerHeader = header.toLowerCase()
  if (lowerHeader.includes('name')) return 'name'
  if (lowerHeader.includes('email')) return 'email'
  if (
    lowerHeader.includes('phone') ||
    lowerHeader.includes('contact') ||
    lowerHeader.includes('mobile') ||
    lowerHeader.includes('number')
  )
    return 'phone'
  return header
}

interface FileData {
  name: string
  email: string
  phone: string
}

const Leads = () => {
  const [scrapeLeadsPopup, setScrapeLeadsPopup] = useState(false)
  // const handleLeadPopup = () => {
  //   setScrapeLeadsPopup(true)
  // }

  const handleCloseLeadPopup = () => {
    setScrapeLeadsPopup(false)
  }

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [fileData, setFileData] = useState<FileData[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = React.useState(0)
  const [buffer, setBuffer] = React.useState(10)
  const [_, setSaveSelectedFiles] = useState(false)

  const progressRef = React.useRef(() => {})

  React.useEffect(() => {
    progressRef.current = () => {
      if (progress > 100) {
        setProgress(0)
        setBuffer(10)
      } else {
        const diff = Math.random() * 10
        const diff2 = Math.random() * 10
        setProgress(progress + diff)
        setBuffer(progress + diff + diff2)
      }
    }
  })

  React.useEffect(() => {
    const timer = setInterval(() => {
      progressRef.current()
    }, 500)

    return () => {
      clearInterval(timer)
    }
  }, [])

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    setLoading(true)
    const files = Array.from(e.target.files || [])
    if (files.length > 0) {
      setUploadedFiles(files)
      console.log('Files uploaded:', files)
    }
    setLoading(false)
  }

  const handleSaveSelectedFiles = () => {
    // check if user has selected any file

    if (uploadedFiles.length === 0) {
      toast.error('No file uploaded')
      return
    }

    setSaveSelectedFiles(true)
    processFiles(uploadedFiles)
  }

  const processFiles = (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = (event) => {
        const csvData = event.target?.result as string
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: normalizeHeader,
          complete: (results) => {
            const data = results.data as FileData[]
            const hasRequiredFields = data.every((row) => row.name && row.phone)
            if (!hasRequiredFields) {
              toast.error(
                "Some error occurred: 'name' or 'phone' field is missing.",
              )
              return
            }
            setScrapeLeadsPopup(false)
            setUploadedFiles([])
            setFileData((prevData) => [...prevData, ...data])
          },
          error: (error: Error) => {
            console.error('Error parsing CSV file:', error)
          },
        })
      }
      reader.onerror = (event) => {
        console.error('Error reading file:', event)
      }
      reader.readAsText(file)
    }
  }

  const [selectAll, setSelectAll] = useState(false)
  const [selectedRows, setSelectedRows] = useState<number[]>([])
  const setCustomers = useGlobalCampaignStore((state) => state.setCustomers)

  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedRows(fileData.map((_data, index) => index))
    } else {
      setSelectedRows([])
    }
  }

  const handleSelectRow = (index: number) => {
    if (selectedRows.includes(index)) {
      setSelectedRows(selectedRows.filter((row) => row !== index))
    } else {
      setSelectedRows([...selectedRows, index])
    }
  }
  const saveFileDataToStore = () => {
    const selectedLeads = selectedRows.map((index) => fileData[index].phone)
    setCustomers(selectedLeads)
  }
  return (
    <>
      {!(fileData.length > 0) && (
        <Stack spacing={3} className="items-center mb-5">
          <Box component="img" width="20vw" src={Campaign.src} />
          <Stack className="w-full items-center">
            <Typography sx={{ textAlign: 'center' }}>
              Your Leads will start appearing here once you create a campaign
            </Typography>
            <Button
              variant="contained"
              sx={{
                borderRadius: '8px',
                background:
                  ' var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
                padding: '10px 60px',
                width: 'fit-content',
                mt: '20px',
                textTransform: 'none',
                fontWeight: '400',
                fontSize: '16px',
              }}
              // onClick={handleLeadPopup}
              href="/campaign/launch/add-leads"
            >
              Add Leads
            </Button>
          </Stack>
        </Stack>
      )}

      {fileData.length > 0 && (
        <>
          <div className="mr-16 shadow">
            <table className="w-full border-collapse">
              <thead>
                <tr className="bg-black text-white">
                  <th className="p-2">
                    <Checkbox
                      color="info"
                      checked={selectAll}
                      onChange={handleSelectAll}
                      className="text-white"
                    />
                  </th>
                  <th className="p-2 text-center">Name</th>
                  <th className="p-2 text-center">Email</th>
                  <th className="p-2 text-center">Phone Number</th>
                </tr>
              </thead>
              <tbody>
                {fileData.map((data, index) => (
                  <tr key={index} className="bg-white border-b">
                    <td className="p-2 flex justify-center items-center">
                      <Checkbox
                        color="info"
                        checked={selectedRows.includes(index)}
                        onChange={() => handleSelectRow(index)}
                      />
                    </td>
                    <td className="p-2 text-center">{data.name}</td>
                    <td className="p-2 text-center">{data.email}</td>
                    <td className="p-2 text-center">{data.phone}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="my-4 flex justify-end mx-4">
            <Button
              variant="contained"
              className="bg-theme text-white px-8 py-2 rounded mr-12"
              onClick={saveFileDataToStore}
            >
              Next
            </Button>
          </div>
        </>
      )}

      {scrapeLeadsPopup && (
        <>
          <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
          <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-2/6">
            <div className="flex bg-black justify-between p-2 rounded">
              <div className="flex items-center">
                <Image
                  src={AddTeamMates}
                  alt=""
                  width={25}
                  height={25}
                  className="mx-2"
                />
                <h1 className="text-lg font-semibold text-white ml-2">
                  Scrape Leads
                </h1>
              </div>
              <button type="button" onClick={handleCloseLeadPopup}>
                <img className="cursor-pointer" src={Close.src} alt="" />
              </button>
            </div>
            <div className="my-10 px-4 flex justify-center">
              <Button
                variant="outlined"
                className="border border-black px-8 py-2 rounded mr-2"
                href="/campaign/launch/add-leads"
              >
                Select from Database
              </Button>
              <label
                htmlFor="uploadFile"
                className="cursor-pointer border border-black px-8 py-2 rounded mr-2 flex items-center"
              >
                <UploadFile className="mr-2" />
                Add new Leads
              </label>
              <input
                type="file"
                className="border-none hidden"
                id="uploadFile"
                multiple
                onChange={handleFileUpload}
                // accept only csv files
                accept=".csv"
              />
            </div>
            {loading &&
              uploadedFiles &&
              uploadedFiles.map((file, index) => (
                <Box key={index} sx={{ width: '100%', mt: 4 }}>
                  <Box
                    sx={{
                      mb: 2,
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid #B0B0B0',
                      borderRadius: 1,
                      p: 2,
                    }}
                  >
                    <Box
                      component="img"
                      src={UploadFillSvg.src}
                      sx={{ height: '40px', mr: 2 }}
                    />
                    <Stack className="w-full">
                      <Typography variant="body1" sx={{ flexGrow: 1 }}>
                        {file.name}
                      </Typography>
                      <LinearProgress
                        variant="buffer"
                        color="inherit"
                        value={progress}
                        valueBuffer={buffer}
                        sx={{
                          flexGrow: 2,
                          mt: 1,
                          mr: 3,
                          height: 4,
                          borderRadius: 5,
                          color: '#7C36FE',
                        }}
                      />
                    </Stack>
                    <Stack alignItems="end">
                      <Typography variant="body2" sx={{ minWidth: 50 }}>
                        Uploading...
                      </Typography>
                    </Stack>
                  </Box>
                </Box>
              ))}

            <Box sx={{ mb: 2, mt: 3 }}>
              {uploadedFiles.map((doc, index) => (
                <Box
                  key={index}
                  sx={{
                    mb: 2,
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #B0B0B0',
                    borderRadius: 1,
                    p: 2,
                  }}
                >
                  <Box
                    component="img"
                    src={UploadFillSvg.src}
                    sx={{ height: '40px', mr: 2 }}
                  />
                  <Stack className="w-full">
                    <Typography variant="body1" sx={{ flexGrow: 1 }}>
                      {doc.name}
                    </Typography>
                    <LinearProgress
                      color="inherit"
                      variant="determinate"
                      value={100}
                      sx={{
                        flexGrow: 2,
                        mt: 1,
                        mr: 3,
                        height: 4,
                        borderRadius: 5,
                        color: '#7C36FE',
                      }}
                    />
                  </Stack>
                  <Stack alignItems="end">
                    {/* <IconButton color="error" onClick={() => handleDelete(index)}>
                                <Box component="img" src={Delete.src} sx={{ height: "28px", width: "28px" }}></Box>
                            </IconButton> */}
                    <Typography variant="body2" sx={{ minWidth: 50 }}>
                      100%
                    </Typography>
                  </Stack>
                </Box>
              ))}
            </Box>
            <div className="flex justify-end items-center my-6">
              <Button
                variant="contained"
                className="bg-theme text-white px-8 py-2 rounded mr-4"
                onClick={handleSaveSelectedFiles}
              >
                Save
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default Leads
