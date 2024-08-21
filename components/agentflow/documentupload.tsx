'use client'
import Delete from '@assets/svg/Delete.svg'
import UploadSvg from '@assets/svg/Upload.svg'
import UploadFillSvg from '@assets/svg/UploadFill.svg'
import { Companies } from '@firebase/config' // Adjust the import path
import { singleFileUpload } from '@firebase/firebaseInteractor'
import {
  Box,
  Button,
  IconButton,
  LinearProgress,
  Stack,
  Typography,
} from '@mui/material'
import {
  deletePineconeDocsByNamespace,
  deletePineconeDocsByNamespaceAndId,
} from '@pinecone/pineconeInteractor' // Adjust the import path
import usePersistStore from '@store/usePersistStore'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import React, { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface Document {
  fileName: string
  fileUrl: string
}

const FileUploadComponent: React.FC = () => {
  const [file, setFile] = useState<File | null>(null)
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [progress, setProgress] = React.useState(0)
  const [buffer, setBuffer] = React.useState(10)

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

  const { companyId, adminId } = usePersistStore()

  useEffect(() => {
    if (companyId && adminId) {
      fetchDocuments()
    }
  }, [companyId, adminId])

  const fetchDocuments = async () => {
    console.log('Fetching')

    try {
      const companyDoc = await getDoc(doc(Companies, companyId))
      if (companyDoc.exists()) {
        const companyData = companyDoc.data()
        setDocuments(companyData.companyDocs || [])
      }
    } catch (error) {
      console.error('Error fetching documents:', error)
    }
  }

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setFile(event.target.files[0])
    }
  }
  const handleDeleteAll = async () => {
    const bool = await deletePineconeDocsByNamespace(companyId)
    fetchDocuments()
    if (bool) {
      toast.success('Database cleared successfully')
    } else {
      toast.error('Error clearing database')
    }
  }

  const handleUpload = async () => {
    if (!file) return
    setLoading(true)

    try {
      const buffer = await file.arrayBuffer() // Convert file to ArrayBuffer
      const base64 = btoa(String.fromCharCode(...new Uint8Array(buffer)))
      console.log(buffer, companyId)

      // Call the backend API instead of processDocs
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/pinecone/process-docs`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            buffer: base64,
            namespace: companyId,
          }),
        },
      )

      // if (!response?.body?.success) {
      //   throw new Error('Failed to process document');
      // }

      const docs = await response.json()
      if (!docs.success) toast.error('Error while processing documents')
      console.log('docs', docs)

      await singleFileUpload(adminId, companyId, file, docs.vecIds)
      console.log('File processed successfully')
      fetchDocuments() // Refresh the list of documents after upload
      setFile(null) // Clear the selected file after upload
      toast.success('File uploaded for Agent Training')
    } catch (error) {
      console.error('Error processing file:', error)
      toast.error('Error processing file')
    } finally {
      setLoading(false)
    }
  }

  const handleRemove = () => {
    setFile(null)
  }

  const handleDelete = async (index: number) => {
    try {
      const company = await getDoc(doc(Companies, companyId))
      const companyData = company.data()
      if (!companyData) return
      const pineid = companyData.companyDocs[index].id
      const updatedDocuments = documents.filter((_, i) => i !== index)
      if (companyData.companyDocs.length === 1) {
        await deletePineconeDocsByNamespace(companyId)
        await fetchDocuments()
        return
      }

      const vecId = await deletePineconeDocsByNamespaceAndId(companyId, pineid)
      await updateDoc(doc(Companies, companyId), {
        companyDocs: updatedDocuments,
        pineIds: vecId,
      })
      setDocuments(updatedDocuments)
      fetchDocuments()
    } catch (error) {
      console.error('Error deleting document:', error)
    }
  }

  return (
    <Stack sx={{}}>
      <Typography variant="h5" gutterBottom>
        Upload Documents
      </Typography>
      <Box
        sx={{
          border: '2px dashed #ccc',
          p: 2,
          pt: 10,
          borderRadius: 2,
          mb: 2,
          textAlign: 'center',
          position: 'relative',
          background: '#fff',
        }}
      >
        <input
          type="file"
          accept=".pdf"
          onChange={handleFileChange}
          style={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            opacity: 0,
            cursor: 'pointer',
          }}
        />
        <Stack className="flex flex-col gap-2">
          <Box component="img" src={UploadSvg.src} sx={{ height: '70px' }} />
          <Typography variant="body1" sx={{ mb: 2 }}>
            Drag and drop or{' '}
            <span
              style={{
                color: '#211AEB',
                cursor: 'pointer',
                textDecoration: 'underline',
              }}
            >
              browse
            </span>{' '}
            your file
          </Typography>
        </Stack>
      </Box>
      {file && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2">Selected File: {file.name}</Typography>
        </Box>
      )}
      <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={handleRemove}
          disabled={!file}
          sx={{ textTransform: 'none' }}
        >
          Remove
        </Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpload}
          disabled={!file || loading}
          sx={{ textTransform: 'none' }}
        >
          Start Training
        </Button>
      </Box>

      {loading && file && (
        <Box sx={{ width: '100%', mt: 4 }}>
          <Box
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #B0B0B0',
              borderRadius: 1,
              p: 2,
              background: '#FFF',
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
      )}

      <Box sx={{ mb: 2, mt: 3 }}>
        {documents.map((doc, index) => (
          <Box
            key={index}
            sx={{
              mb: 2,
              display: 'flex',
              alignItems: 'center',
              border: '1px solid #B0B0B0',
              borderRadius: 1,
              p: 2,
              background: '#FFF',
            }}
          >
            <Box
              component="img"
              src={UploadFillSvg.src}
              sx={{ height: '40px', mr: 2 }}
            />
            <Stack className="w-full">
              <Typography variant="body1" sx={{ flexGrow: 1 }}>
                {doc.fileName}
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
              <IconButton color="error" onClick={() => handleDelete(index)}>
                <Box
                  component="img"
                  src={Delete.src}
                  sx={{ height: '28px', width: '28px' }}
                />
              </IconButton>
              <Typography variant="body2" sx={{ minWidth: 50 }}>
                100%
              </Typography>
            </Stack>
          </Box>
        ))}
      </Box>
      {documents.length > 1 && (
        <Stack>
          <Button
            variant="contained"
            color="primary"
            onClick={handleDeleteAll}
            sx={{ textTransform: 'none' }}
          >
            Delete All
          </Button>
        </Stack>
      )}
    </Stack>
  )
}

export default FileUploadComponent
