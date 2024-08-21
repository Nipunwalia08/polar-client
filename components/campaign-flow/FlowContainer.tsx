'use client'

import { CampaignFlows, storage } from '@firebase/config'
import { Button, InputLabel, MenuItem, Select, TextField } from '@mui/material'
import useCampaignFlowStore, {
  type FlowKeys,
} from '@store/useCampaignFlowStore'
import usePersistStore from '@store/usePersistStore'
import useTemplateStore from '@store/useTemplateStore'
import { doc, setDoc } from 'firebase/firestore'
import { getDownloadURL, ref, uploadBytes } from 'firebase/storage'
import type React from 'react'
import { useEffect, useState } from 'react'
import { FaCirclePlus } from 'react-icons/fa6'
import { GoArrowDown, GoArrowRight } from 'react-icons/go'
import { toast } from 'react-toastify'

type FlowContainerProps = {
  flowName: FlowKeys
  title: string
}

const FlowContainer = ({ flowName, title }: FlowContainerProps) => {
  const data = useCampaignFlowStore((state) => state[flowName])
  const { insertFlow, deleteFlow, setFlow } = useCampaignFlowStore()
  const token = usePersistStore((state) => state.adminId)
  const templates = useTemplateStore((state) => state.templates)
  const [files, setFiles] = useState<Record<number, File | null>>({})
  const [fileNames, setFileNames] = useState<Record<number, string | null>>({})

  const handleFileChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0]
    if (file) {
      setFiles((prev) => ({ ...prev, [index]: file }))
      setFileNames((prev) => ({ ...prev, [index]: file.name }))
    }
  }

  const handleUpload = async (type: string, file: File) => {
    if (file) {
      const storageRef = ref(
        storage,
        `${type === 'image' ? 'TemplateImages' : 'TemplateVideos'}/${file.name}`,
      )
      await uploadBytes(storageRef, file)
      const downloadURL = await getDownloadURL(storageRef)
      return downloadURL
    }
  }

  const handleSaveWorkflow = async () => {
    // Validate data
    for (let i = 0; i < data.length; i++) {
      const item = data[i]
      if (item.days === '' || item.template === '') {
        return toast.error('Please fill all the fields')
      }
    }

    // Upload file if applicable and update the flow data
    const updatedData = await Promise.all(
      data.map(async (item, index) => {
        const template = templates.find((t) => t.id === item.template)
        if (template?.type !== 'text' && files[index]) {
          const downloadURL = await handleUpload(
            template?.type || '',
            files[index],
          )
          return { ...item, fileUrl: downloadURL }
        }
        return item
      }),
    )

    // Remove undefined fields
    const cleanedData = updatedData.map((item) => {
      const { fileUrl, ...rest } = item
      return {
        ...rest,
        ...(fileUrl ? { fileUrl } : {}),
      }
    })

    setDoc(
      doc(CampaignFlows, token),
      {
        [flowName]: cleanedData,
      },
      { merge: true },
    )
    toast.success('Workflow saved successfully')
  }

  useEffect(() => {
    const initializeFileNames = () => {
      const initialFileNames: Record<number, string | null> = {}
      data.forEach((item, index) => {
        if (item.fileUrl) {
          // Remove base path and decode %20 to spaces
          const basePathRegex = /TemplateImages%2F|TemplateVideos%2F/
          const cleanedUrl = item.fileUrl
            .replace(basePathRegex, '')
            .replace(/%20/g, ' ')
          // Extract the filename from the cleaned URL
          const urlSegments = cleanedUrl.split('/')
          const fileNameWithParams = urlSegments.pop() || ''
          const fileName = fileNameWithParams.split('?')[0]
          initialFileNames[index] = fileName || null
        } else {
          initialFileNames[index] = null
        }
      })
      setFileNames(initialFileNames)
    }

    initializeFileNames()
  }, [data])

  return (
    <div>
      <h2 className="font-semibold">{title}</h2>
      {data.map((item, index) => (
        <div key={index} className="flex flex-col">
          {index !== 0 ? <GoArrowDown className="size-6 mt-1 w-72" /> : null}
          <div className="mt-4 flex items-center gap-6">
            <TextField
              variant="outlined"
              type="number"
              label="Days"
              className="min-w-72"
              InputProps={{
                style: { borderRadius: 10 },
              }}
              value={item.days}
              onChange={(e) =>
                setFlow(flowName, index, {
                  days:
                    e.target.value === ''
                      ? ''
                      : Number.parseInt(e.target.value),
                  template: item.template,
                })
              }
            />
            <GoArrowRight className="size-10" />
            <Select
              labelId="type"
              displayEmpty
              className="w-full rounded-md text-sm"
              defaultValue=""
              fullWidth
              value={item.template}
              onChange={(e) =>
                setFlow(flowName, index, {
                  days: item.days,
                  template: e.target.value as string,
                })
              }
              sx={{
                borderRadius: '10px !important',
              }}
            >
              <MenuItem value="">Select Template</MenuItem>
              {templates.map((template) => (
                <MenuItem key={template.id} value={template.id}>
                  {template.name}
                </MenuItem>
              ))}
            </Select>
            {index !== 0 ? (
              <Button
                variant="contained"
                sx={{ px: 7, py: 1 }}
                className="normal-case"
                onClick={() => deleteFlow(flowName, index)}
              >
                Delete
              </Button>
            ) : null}
          </div>
          {item.template &&
            templates.find((t) => t.id === item.template)?.type !== 'text' && (
              <div className="mt-4 flex items-center gap-6">
                <InputLabel id="file-upload" className="text-black mt-1">
                  {templates.find((t) => t.id === item.template)?.type ===
                  'image'
                    ? 'Upload Image'
                    : 'Upload Video'}
                </InputLabel>
                <Button
                  variant="contained"
                  component="label"
                  sx={{ marginTop: 1 }}
                >
                  Choose File
                  <input
                    type="file"
                    accept={
                      templates.find((t) => t.id === item.template)?.type ===
                      'image'
                        ? 'image/*'
                        : 'video/*'
                    }
                    hidden
                    onChange={(e) => handleFileChange(index, e)}
                  />
                </Button>
                {files[index] ? (
                  <span style={{ marginLeft: '10px' }}>
                    {files[index]?.name}
                  </span>
                ) : (
                  <span style={{ marginLeft: '10px' }}>{fileNames[index]}</span>
                )}
              </div>
            )}
        </div>
      ))}
      <div className="flex justify-end items-center mt-10">
        <Button
          variant="contained"
          className="bg-theme flex items-center px-5 py-2 rounded-md mr-2"
          onClick={() => insertFlow(flowName)}
        >
          <FaCirclePlus className="min-w-6" />
          <div className="normal-case min-w-24">Add Template</div>
        </Button>
        <Button
          variant="contained"
          className="bg-theme flex items-center px-5 py-2 rounded-md mr-2"
          onClick={handleSaveWorkflow}
        >
          <div className="normal-case min-w-24">Save Workflow</div>
        </Button>
      </div>
    </div>
  )
}

export default FlowContainer
