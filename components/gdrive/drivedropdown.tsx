'use client'
import {
  Box,
  Button,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
} from '@mui/material'
import type { SelectInputProps } from '@mui/material/Select/SelectInput'
import { useEffect, useState } from 'react'

interface Props {
  onClose: () => void
  setUploadedFilesDatabase: React.Dispatch<React.SetStateAction<File[]>>
}

interface IFolder {
  id: string
  name: string
  mimeType: string
}

const DriveDropdown: React.FC<Props> = ({
  setUploadedFilesDatabase,
  onClose,
}) => {
  const [folders, setFolders] = useState<IFolder[]>([])
  const [files, setFiles] = useState<IFolder[]>([])
  const [selectedFolder, setSelectedFolder] = useState('')
  const [subFolders, setSubFolders] = useState<IFolder[]>([])
  const [subFiles, setSubFiles] = useState<IFolder[]>([])
  const [selectedSubFolder, setSelectedSubFolder] = useState('')
  const [selectedFile, setSelectedFile] = useState('')
  const [btnLoading, setBtnLoading] = useState(false)

  useEffect(() => {
    fetch('/api/googleDrive?folderId=17tTCUmiyCoPY4P0WuU3aCoxY6Og4euGt')
      .then((res) => res.json())
      .then((data) => {
        const folders = data.filter(
          (item: any) => item.mimeType === 'application/vnd.google-apps.folder',
        )
        const files = data.filter(
          (item: any) => item.mimeType !== 'application/vnd.google-apps.folder',
        )
        setFolders(folders)
        setFiles(files)
      })
  }, [])

  const handleFolderChange = (folderId: string) => {
    setSelectedFolder(folderId)
    setSubFolders([])
    setSubFiles([])
    setSelectedSubFolder('')
    setSelectedFile('')
    fetch(`/api/googleDrive?folderId=${folderId}`)
      .then((res) => res.json())
      .then((data) => {
        const subFolders = data.filter(
          (item: any) => item.mimeType === 'application/vnd.google-apps.folder',
        )
        const subFiles = data.filter(
          (item: any) => item.mimeType !== 'application/vnd.google-apps.folder',
        )
        setSubFolders(subFolders)
        setSubFiles(subFiles)
      })
  }

  const handleSubFolderChange = (subFolderId: string) => {
    setSelectedSubFolder(subFolderId)
    setSelectedFile('')
    fetch(`/api/googleDrive?folderId=${subFolderId}`)
      .then((res) => res.json())
      .then((data) => {
        const files = data.filter(
          (item: any) => item.mimeType !== 'application/vnd.google-apps.folder',
        )
        setSubFiles(files)
      })
  }

  const handleFileSelection = async () => {
    if (selectedFile) {
      setBtnLoading(true)
      const response = await fetch(`/api/googleDrive?fileId=${selectedFile}`)
      if (!response.ok) {
        console.error('Failed to fetch file')
        return
      }
      const data = await response.json()
      const blob = new Blob(
        [Uint8Array.from(atob(data.fileContent), (c) => c.charCodeAt(0))],
        { type: data.contentType },
      )
      const file = new File([blob], data.fileName, { type: data.contentType })
      console.log(file)

      setUploadedFilesDatabase([file])
      setBtnLoading(false)
      onClose()
    }
  }

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '70%' }}
    >
      <FormControl fullWidth>
        <InputLabel id="folder-select-label">Select Folder</InputLabel>
        <Select
          label="Select Folder"
          labelId="folder-select-label"
          value={selectedFolder}
          onChange={(e) => handleFolderChange(e.target.value)}
        >
          <MenuItem value="">
            <em>None</em>
          </MenuItem>
          {folders.map((folder) => (
            <MenuItem key={folder.id} value={folder.id}>
              {folder.name}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      {subFolders.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="subfolder-select-label">Select Sub Folder</InputLabel>
          <Select
            labelId="subfolder-select-label"
            label="Select Sub Folder"
            value={selectedSubFolder}
            onChange={(e) => handleSubFolderChange(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {subFolders.map((subFolder) => (
              <MenuItem key={subFolder.id} value={subFolder.id}>
                {subFolder.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {subFiles.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="subfile-select-label">Select File</InputLabel>
          <Select
            labelId="subfile-select-label"
            label="Select File"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {subFiles.map((file) => (
              <MenuItem key={file.id} value={file.id}>
                {file.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}

      {files.length > 0 && (
        <FormControl fullWidth>
          <InputLabel id="file-select-label">Select File</InputLabel>
          <Select
            labelId="file-select-label"
            label="Select File"
            value={selectedFile}
            onChange={(e) => setSelectedFile(e.target.value)}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {files.map((file) => (
              <MenuItem key={file.id} value={file.id}>
                {file.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      )}
      <Stack className="flex-row w-full justify-end items-center mt-2">
        {selectedFile && (
          <Button
            variant="contained"
            color="secondary"
            onClick={handleFileSelection}
            className="bg-theme normal-case"
            disabled={btnLoading}
          >
            {btnLoading ? <div className="loader" /> : 'Upload and Proceed'}
          </Button>
        )}
      </Stack>
    </Box>
  )
}

export default DriveDropdown
