'use client'
import AddTeamMates from '@assets/svg/AddTeamMates.svg'
import Close from '@assets/svg/Close.svg'
import UploadFillSvg from '@assets/svg/UploadFill.svg'
import DatabaseModal from '@components/leads/DatabaseModel'
import { ExistingLeadPopup } from '@components/leads/ExistingLeadPopup'
import { customerLeads } from '@firebase/firebaseInteractor'
import { Add, UploadFile } from '@mui/icons-material'
import DeleteIcon from '@mui/icons-material/Delete'
import FilterListIcon from '@mui/icons-material/FilterList'
import SaveIcon from '@mui/icons-material/Save'
import SortIcon from '@mui/icons-material/Sort'
import {
  Box,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import {
  Button,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Grid,
} from '@mui/material'
import type { ILead } from '@type/collections'
import { normalizeHeader } from '@utils/leads/helpers'
import Papa from 'papaparse'
import React, { useState, type ChangeEvent, useEffect } from 'react'
import { toast } from 'react-toastify'

interface FileData {
  name: string
  email: string
  phone: string
}

function Page() {
  const [btnLoading, setBtnLoading] = useState(false)
  const [scrapeLeadsPopup, setScrapeLeadsPopup] = useState(true)
  const [databaseModalOpen, setDatabaseModalOpen] = useState(false)

  const handleLeadPopup = () => {
    setScrapeLeadsPopup(true)
  }

  const handleCloseLeadPopup = () => {
    // if user closes the popup, reset the uploaded files
    setUploadedFiles([])
    setScrapeLeadsPopup(false)
  }

  const handleOpenDatabaseModal = () => {
    // setScrapeLeadsPopup(false);
    setDatabaseModalOpen(true)
  }

  const handleCloseDatabaseModal = () => {
    setDatabaseModalOpen(false)
  }

  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [uploadedFilesDatabase, setUploadedFilesDatabase] = useState<File[]>([])
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
    setBtnLoading(true)
    setTimeout(() => {
      if (uploadedFiles.length === 0) {
        toast.error('No file uploaded')
        setBtnLoading(false)
        return
      }
      setSaveSelectedFiles(true)
      processFiles(uploadedFiles)
      setBtnLoading(false)
    }, 2000)
  }

  const handleSaveSelectedFilesDatabase = () => {
    setBtnLoading(true)
    setTimeout(() => {
      if (uploadedFilesDatabase.length === 0) {
        toast.error('No file uploaded')
        setBtnLoading(false)
        return
      }
      setSaveSelectedFiles(true)
      processFilesDatabase(uploadedFilesDatabase)
      setBtnLoading(false)
    }, 2000)
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
            console.log('result data is', results.data)
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
            // add all row number to selected rows
            setSelectedRows(results.data.map((_, index) => index) as never[])
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

  const [fileDataDatabase, setFileDataDatabase] = useState<any[]>([])
  const [allRowsSelected, setAllRowsSelected] = useState(false)
  const [checkedRows, setCheckedRows] = useState([])
  const [filterModalOpen, setFilterModalOpen] = useState(false)
  const [selectedHeaders, setSelectedHeaders] = useState<any[]>([])

  const handleSelectAllRows = (e: any) => {
    console.log('fileData is', fileDataDatabase)
    setAllRowsSelected(e.target.checked)
    if (e.target.checked) {
      setCheckedRows(fileDataDatabase.map((_, index) => index as never))
    } else {
      setCheckedRows([])
    }
  }

  const handleSelectSingleRow = (index: any) => {
    setCheckedRows((prevSelected) =>
      prevSelected.includes(index as never)
        ? prevSelected.filter((row) => row !== index)
        : [...prevSelected, index as never],
    )
  }

  const toggleHeaderSelection = (header: any) => {
    setSelectedHeaders((prevSelected: any) =>
      prevSelected.includes(header)
        ? prevSelected.filter((h: any) => h !== header)
        : [...prevSelected, header],
    )
  }

  const processFilesDatabase = (files: File[]) => {
    for (const file of files) {
      const reader = new FileReader()
      reader.onload = (event: ProgressEvent<FileReader>) => {
        const csvData = event.target?.result as string
        Papa.parse(csvData, {
          header: true,
          skipEmptyLines: true,
          transformHeader: normalizeHeader,
          complete: (results) => {
            console.log('result data is', results.data)
            const data = results.data as object[]
            const hasFields = data.every((row) => Object.keys(row).length > 0)
            if (!hasFields) {
              toast.error(
                'Some error occurred: The file does not contain any valid data.',
              )
              return
            }
            setScrapeLeadsPopup(false)
            setUploadedFiles([])
            setFileDataDatabase(data)
            setSelectedHeaders(Object.keys(data[0]))
            setFilteredData(data)
            setFilterValues({})
          },
          error: (error: any) => {
            console.error('Error parsing CSV file:', error)
          },
        })
      }
      reader.onerror = (event: ProgressEvent<FileReader>) => {
        console.error('Error reading file:', event)
      }
      reader.readAsText(file)
    }
  }

  const [selectAll, setSelectAll] = useState(true)
  const [selectedRows, setSelectedRows] = useState([])

  const handleSelectAll = () => {
    setSelectAll(!selectAll)
    if (!selectAll) {
      setSelectedRows(fileData.map((_, index) => index) as never[])
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

  const [existingLeadPopup, setExistingLeadPopup] = useState(false)
  const [existingLeadsData, setExistingLeadsData] = useState<ILead[]>([])

  const hanleSaveFileToDb = async () => {
    console.log('Saving selected files to db', fileData)
    const dataToSend = fileData.filter((_, index: any) =>
      selectedRows.includes(index as never),
    )
    console.log(dataToSend)
    const exixtingLeads = await customerLeads(dataToSend, true)
    if (exixtingLeads && exixtingLeads.length > 0) {
      toast.warning('Some leads already exists in the database')
      setExistingLeadPopup(true)
      setSelectedRows([])
      setFileData([])
      setUploadedFiles([])
      setSaveSelectedFiles(false)
      setExistingLeadsData(exixtingLeads as never[])
      return
    }

    // router.push('/leads/manage')
  }

  const removeFromFileData = () => {
    const dataToSend = fileData.filter(
      (_, index) => !selectedRows.includes(index as never),
    )
    setFileData(dataToSend)
    setSelectedRows([])
  }

  const removeFromFileDataDatabase = () => {
    const dataToSend = fileDataDatabase.filter(
      (_, index) => !checkedRows.includes(index as never),
    )
    setFileDataDatabase(dataToSend)
    setCheckedRows([])
  }

  const hanleSaveFileToDbDatabase = async () => {
    console.log('Saving selected files to db', fileDataDatabase)
    const dataToSend = fileDataDatabase.filter((_, index: any) => {
      console.log('index', index)
      return checkedRows.includes(index as never)
    })
    console.log('data to send', dataToSend)
    saveNow(dataToSend)
  }

  const saveNow = async (dataToSend: any) => {
    console.log('Saving selected files to db -->', dataToSend)

    const exixtingLeads = await customerLeads(dataToSend, true)
    if (exixtingLeads && exixtingLeads.length > 0) {
      toast.warning('Some leads already exists in the database')
      setExistingLeadPopup(true)
      setCheckedRows([])
      setFileDataDatabase([])
      setUploadedFilesDatabase([])
      setSaveSelectedFiles(false)
      setExistingLeadsData(exixtingLeads as never[])
      return
    }

    // router.push('/leads/manage')
  }

  const [anchorEl, setAnchorEl] = useState(null)
  const [filterColumn, setFilterColumn] = useState('')
  const [filterValues, setFilterValues] = useState<Record<string, any>>({})
  const [filteredData, setFilteredData] = useState<any[]>([])

  const handleFilterMenuOpen = (event: any, header: any) => {
    setAnchorEl(event.currentTarget)
    setFilterColumn(header)
  }

  const handleFilterMenuClose = () => {
    setAnchorEl(null)
    setFilterColumn('')
  }

  const handleFilterChange = (event: any, value: any) => {
    setFilterValues((prevFilters: any) => ({
      ...prevFilters,
      [filterColumn]: {
        ...prevFilters[filterColumn],
        [value]: event.target.checked,
      },
    }))
  }

  const applyFilter = () => {
    const filteredData = fileDataDatabase.filter((row) =>
      Object.keys(filterValues).every((column) =>
        Object.keys(filterValues[column]).every((value) =>
          filterValues[column][value] ? row[column] === value : true,
        ),
      ),
    )
    setFilteredData(filteredData)
    handleFilterMenuClose()
  }

  return (
    <div className="flex flex-col justify-center ml-12">
      <div className="flex justify-between items-center p-4 bg-white rounded my-4 mr-16">
        <h1 className="text-2xl font-semibold">List of Leads</h1>
        {fileData.length > 0 && (
          <>
            <div className="flex">
              <Button className="bg-theme text-white px-6 py-2 rounded flex items-center justify-center mx-1">
                <SortIcon />
                <span className="ml-2">Filter</span>
              </Button>
              <Button
                className="bg-theme text-white px-6 py-2 rounded flex items-center justify-center mx-1"
                onClick={handleLeadPopup}
              >
                <Add />
                <span className="ml-2">Scrape Leads</span>
              </Button>
              <Button
                className={`${selectedRows.length === 0 ? 'bg-gray-200' : 'bg-[#D0FF84]'} text-black px-4 py-2 rounded mx-2 flex items-center justify-center`}
                // make it disabled if no row is selected
                disabled={selectedRows.length === 0}
                onClick={hanleSaveFileToDb}
              >
                <SaveIcon />
                <span className="ml-2">Save</span>
              </Button>
              <Button
                className={`${selectedRows.length === 0 ? 'bg-gray-200' : 'bg-[#FFA09A]'} text-black px-4 py-2 rounded mx-2 flex items-center justify-center`}
                disabled={selectedRows.length === 0}
                onClick={removeFromFileData}
              >
                <DeleteIcon />
                <span className="ml-2">Delete</span>
              </Button>
            </div>
          </>
        )}

        {fileDataDatabase.length > 0 && (
          <>
            <div className="flex">
              <Button
                className="bg-theme text-white px-6 py-2 rounded flex items-center justify-center mx-1"
                onClick={() => {
                  setFilterModalOpen(true)
                }}
              >
                <SortIcon />
                <span className="ml-2">Filter</span>
              </Button>
              <Button
                className={`${checkedRows.length === 0 ? 'bg-gray-200' : 'bg-[#D0FF84]'} text-black px-4 py-2 rounded mx-2 flex items-center justify-center`}
                // make it disabled if no row is selected
                disabled={checkedRows.length === 0}
                onClick={hanleSaveFileToDbDatabase}
              >
                <SaveIcon />
                <span className="ml-2">Save</span>
              </Button>
              <Button
                className={`${checkedRows.length === 0 ? 'bg-gray-200' : 'bg-[#FFA09A]'} text-black px-4 py-2 rounded mx-2 flex items-center justify-center`}
                disabled={checkedRows.length === 0}
                onClick={removeFromFileDataDatabase}
              >
                <DeleteIcon />
                <span className="ml-2">Delete</span>
              </Button>
            </div>
          </>
        )}
      </div>
      {!(fileData.length > 0) && !(fileDataDatabase.length > 0) && (
        <div className="shadow mr-16 mt-4 flex flex-col h-full">
          <div className="flex-grow">
            <div
              className="flex justify-center items-center"
              style={{ height: 'calc(100vh - 240px)' }}
            >
              <Button
                variant="contained"
                className="bg-theme"
                onClick={handleLeadPopup}
              >
                Scrape Leads
              </Button>
            </div>
          </div>
        </div>
      )}

      {scrapeLeadsPopup && (
        <>
          <div className="bg-black bg-opacity-50 fixed top-0 left-0 w-full h-full z-50" />
          <div className="bg-white fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50 rounded w-2/6">
            <div className="flex bg-black justify-between p-2 rounded">
              <div className="flex items-center">
                <img src={AddTeamMates.src} alt="" />
                <h1 className="text-lg font-semibold text-white ml-2">
                  Scrape Leads
                </h1>
              </div>
              <button type="button" onClick={handleCloseLeadPopup}>
                <img className="cursor-pointer" src={Close.src} alt="" />
              </button>
            </div>
            <div className="my-10 px-4 flex justify-center">
              <label
                htmlFor="uploadFile"
                className="cursor-pointer border border-black px-8 py-2 rounded mr-2 flex items-center"
              >
                <UploadFile className="mr-2" />
                Upload CSV
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
              <Button
                variant="outlined"
                className="border border-black px-8 py-2 rounded mr-2"
                onClick={handleOpenDatabaseModal}
              >
                Select from Database
              </Button>
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

            {loading &&
              uploadedFilesDatabase &&
              uploadedFilesDatabase.map((file, index) => (
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
              {uploadedFilesDatabase.map((doc, index) => (
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
                onClick={() => {
                  if (uploadedFiles.length > 0) {
                    handleSaveSelectedFiles()
                  } else if (uploadedFilesDatabase.length > 0) {
                    handleSaveSelectedFilesDatabase()
                  }
                }}
                disabled={btnLoading}
              >
                {btnLoading ? <div className="loader" /> : 'Save'}
              </Button>
            </div>
          </div>
        </>
      )}

      {fileData.length > 0 && (
        <div className="mr-16 shadow">
          <table className="w-full border-collapse">
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
                <th className="p-2 text-center">Email</th>
                <th className="p-2 text-center">Phone Number</th>
              </tr>
            </thead>
            <tbody>
              {fileData.map((data, index) => (
                <tr key={index} className="bg-white border-b">
                  <td className="p-2 flex justify-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.includes(index as never)}
                      onChange={() => handleSelectRow(index)}
                    />
                  </td>
                  <td className="p-2 text-center">{data.name}</td>
                  <td className="p-2 text-center">
                    {data.email ? data.email : 'N/A'}
                  </td>
                  <td className="p-2 text-center">{data.phone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {fileDataDatabase.length > 0 && (
        <div className="mr-16 shadow">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-black text-white">
                <th className="p-2">
                  <input
                    type="checkbox"
                    checked={allRowsSelected}
                    onChange={handleSelectAllRows}
                  />
                </th>
                {selectedHeaders.map((header, index) => (
                  <th key={index} className="p-2 text-center">
                    <div className="flex items-center justify-center">
                      {header}
                      <IconButton
                        size="small"
                        onClick={(e) => handleFilterMenuOpen(e, header)}
                      >
                        <FilterListIcon className="text-white" />
                      </IconButton>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(filteredData.length > 0 ? filteredData : fileDataDatabase).map(
                (data, rowIndex) => (
                  <tr key={rowIndex} className="bg-white border-b">
                    <td className="p-2 flex justify-center">
                      <input
                        type="checkbox"
                        checked={checkedRows.includes(rowIndex as never)}
                        onChange={() => handleSelectSingleRow(rowIndex)}
                      />
                    </td>
                    {selectedHeaders.map((key, colIndex) => (
                      <td key={colIndex} className="p-2 text-center">
                        {data[key] ? data[key] : 'N/A'}
                      </td>
                    ))}
                  </tr>
                ),
              )}
            </tbody>
          </table>
        </div>
      )}

      <Dialog open={Boolean(anchorEl)} onClose={handleFilterMenuClose}>
        <DialogTitle>Filter {filterColumn}</DialogTitle>
        <DialogContent>
          <Grid container>
            {Array.from(
              new Set(fileDataDatabase.map((row) => row[filterColumn])),
            ).map((value, index) => (
              <Grid item xs={12} key={index}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={filterValues[filterColumn]?.[value] || false}
                      onChange={(e) => handleFilterChange(e, value)}
                    />
                  }
                  label={value || 'N/A'}
                />
              </Grid>
            ))}
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={applyFilter} color="primary" variant="contained">
            Apply
          </Button>
        </DialogActions>
      </Dialog>

      {selectedHeaders && fileDataDatabase.length > 0 && (
        <Dialog
          open={filterModalOpen}
          onClose={() => setFilterModalOpen(false)}
        >
          <DialogTitle>Select Headers to Display</DialogTitle>
          <DialogContent>
            <Grid container>
              {Object.keys(fileDataDatabase[0]).map((header, index) => (
                <Grid item xs={12} key={index}>
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={selectedHeaders.includes(header)}
                        onChange={() => toggleHeaderSelection(header)}
                      />
                    }
                    label={header}
                  />
                </Grid>
              ))}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button
              onClick={() => setFilterModalOpen(false)}
              color="primary"
              variant="contained"
            >
              Apply
            </Button>
          </DialogActions>
        </Dialog>
      )}

      {existingLeadPopup && (
        <ExistingLeadPopup
          handleCloseLeadPopup={handleCloseLeadPopup}
          existingLeadsData={existingLeadsData}
          setExistingLeadPopup={setExistingLeadPopup}
        />
      )}

      <DatabaseModal
        open={databaseModalOpen}
        onClose={handleCloseDatabaseModal}
        setUploadedFilesDatabase={setUploadedFilesDatabase}
      />
    </div>
  )
}

export default Page
