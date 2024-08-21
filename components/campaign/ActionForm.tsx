'use client'

import { Campaigns, storage } from '@firebase/config'
import CloseIcon from '@mui/icons-material/Close'
import { InputLabel } from '@mui/material'
import Button from '@mui/material/Button'
import Dialog from '@mui/material/Dialog'
import DialogActions from '@mui/material/DialogActions'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import IconButton from '@mui/material/IconButton'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'
import { useGlobalCampaignStore } from '@store/useGlobalCampaignStore'
import { refetchTemplates } from '@store/useTemplateStore'
import type { ITemplates } from '@type/collections'
import { doc, getDoc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import { useSearchParams } from 'next/navigation'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'
import InputBox from '../global/InputBox'

type TemplateFormProps = {
  open: boolean
  setOpen: (value: boolean) => void
  _data?: ITemplates
  onSave: (data: ITemplates) => Promise<void>
}

const TemplateForm = ({ open, setOpen, _data, onSave }: TemplateFormProps) => {
  const setTemplate = useGlobalCampaignStore((state) => state.setTemplate)
  const handleClose = () => setOpen(false)
  const [loading, setLoading] = useState<boolean>(false)
  const [data, _setData] = useState<ITemplates>(
    _data || {
      name: '',
      description: '',
      type: '',
      link: '',
    },
  )
  const searchParam = useSearchParams()
  const campaignId = searchParam.get('id')!

  const fetchSelectedTemplate = async () => {
    if (campaignId) {
      const campaignDoc = await getDoc(doc(Campaigns, campaignId as string))
      if (campaignDoc.exists()) {
        const campaignData = campaignDoc.data()
        if (campaignData?.template?.id === _data?.id) {
          const imageUrl = campaignData?.template?.link
          setData('link', imageUrl)
        }
      }
    }
  }

  useEffect(() => {
    fetchSelectedTemplate()
  }, [campaignId, _data?.id])

  const [file, setFile] = useState<File | null>(null)

  const setData = (key: string, value: string) =>
    _setData((prev) => ({ ...prev, [key]: value }))

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFile(file)
    }
  }

  const handleUpload = async () => {
    if (file) {
      const storageRef = ref(
        storage,
        `${data.type === 'image' ? 'TemplateImages' : 'TemplateVideos'}/${file.name}`,
      )
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      setData('link', downloadURL)
      setTemplate({ id: _data?.id, link: downloadURL })
      if (campaignId) {
        await setDoc(
          doc(Campaigns, campaignId),
          {
            template: {
              id: _data?.id,
              link: downloadURL,
            },
          },
          { merge: true },
        )
      }
      // Refetch templates here
      await fetchSelectedTemplate()
      await refetchTemplates()
    } else {
      toast.error('Error while uploading a file')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} fullWidth>
      <form
        onSubmit={async (e) => {
          e.preventDefault()
          if (!file && (data.type === 'image' || data.type === 'video')) {
            toast.error('Please upload a file to proceed')
            return
          }
          setLoading(true)
          if (data.type !== 'text') {
            await handleUpload()
          }
          await onSave(data)
          // _setData({
          //   name: '',
          //   description: '',
          //   type: '',
          //   link: ''
          // })
          setFile(null)
          setLoading(false)
          setOpen(false)
          // window.location.reload()
        }}
      >
        <DialogTitle
          sx={{
            m: 0,
            px: 4,
            py: 1,
            backgroundColor: 'black',
            color: 'white',
            fontWeight: 'normal',
          }}
          id="customized-dialog-title"
        >
          Select Template
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 5,
            color: 'white',
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent dividers className="flex flex-col gap-5">
          <InputBox
            type="text"
            id="name"
            label="Name your template"
            placeholder="Enter Name"
            value={data.name || ''}
            onChange={(value) => setData('name', value)}
            readOnly={true}
          />
          <InputBox
            id="description"
            label="Description"
            placeholder="Enter Description"
            textarea
            value={data.description || ''}
            onChange={(value) => setData('description', value)}
            readOnly={true}
          />
          <div>
            <InputLabel id="type" className="text-black mb-1">
              Type
            </InputLabel>
            <Select
              labelId="type"
              displayEmpty
              className="w-full rounded-md text-sm"
              defaultValue=""
              value={data.type}
              onChange={(e) => setData('type', e.target.value)}
              readOnly
            >
              <MenuItem value="">Type</MenuItem>
              <MenuItem value="text">Text</MenuItem>
              <MenuItem value="image">Image</MenuItem>
              <MenuItem value="video">Video</MenuItem>
            </Select>
          </div>
          {data.type === 'image' && (
            <div>
              <InputLabel id="image-upload" className="text-black mb-1">
                Upload Image
              </InputLabel>
              <Button
                variant="contained"
                component="label"
                sx={{ marginTop: 1 }}
              >
                Choose File
                <input
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {file && <span style={{ marginLeft: '10px' }}>{file.name}</span>}
              {data.link && (
                <img
                  src={data.link}
                  alt="Uploaded"
                  style={{ marginTop: '10px', maxHeight: '150px' }}
                />
              )}
            </div>
          )}
          {data.type === 'video' && (
            <div>
              <InputLabel id="video-upload" className="text-black mb-1">
                Upload Video
              </InputLabel>
              <Button
                variant="contained"
                component="label"
                sx={{ marginTop: 1 }}
              >
                Choose File
                <input
                  type="file"
                  accept="video/*"
                  hidden
                  onChange={handleFileChange}
                />
              </Button>
              {file && <span style={{ marginLeft: '10px' }}>{file.name}</span>}
              {data.link && (
                // biome-ignore lint/a11y/useMediaCaption: Captions na hai
                <video
                  controls
                  style={{ marginTop: '10px', maxHeight: '150px' }}
                >
                  <source src={data.link} type="video/mp4" />
                  {/* <track
                    src="path/to/your/captions.vtt"
                    kind="captions"
                    srcLang="en"
                    label="English captions"
                    default
                  /> */}
                  Your browser does not support the video tag.
                </video>
              )}
            </div>
          )}
        </DialogContent>
        <DialogActions>
          {data.type === 'text' ? (
            <Button
              variant="contained"
              className="bg-theme flex items-center px-10 py-2 rounded-md mr-2 normal-case"
              disabled={loading}
              type="submit"
              onClick={async () => {
                setTemplate({ id: _data?.id, link: '' })
                if (campaignId) {
                  await setDoc(
                    doc(Campaigns, campaignId),
                    {
                      template: {
                        id: _data?.id,
                        link: '',
                      },
                    },
                    { merge: true },
                  )
                }
                await onSave(data)
              }}
            >
              {loading ? <div className="loader" /> : 'Select'}
            </Button>
          ) : (
            <Button
              variant="contained"
              className="bg-theme flex items-center px-10 py-2 rounded-md mr-2 normal-case"
              disabled={loading}
              type="submit"
            >
              {loading ? <div className="loader" /> : 'Upload & Select'}
            </Button>
          )}
        </DialogActions>
      </form>
    </Dialog>
  )
}

export default TemplateForm
