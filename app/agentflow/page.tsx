'use client'
import DocumentUpload from '@components/agentflow/documentupload'
import LeadConversion from '@components/agentflow/leadConversion'
import SummaryFaq from '@components/agentflow/summaryFaq'
import { Companies } from '@firebase/config'
import {
  Box,
  Button,
  MenuItem,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from '@mui/material'
import usePersistStore from '@store/usePersistStore'
import {
  collection,
  getDocs,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface CustomTabProps {
  label: string
  number: number
}

const CustomTab: React.FC<CustomTabProps> = ({ label, number }) => (
  <Box sx={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
    <Box
      component="span"
      sx={{
        position: 'absolute',
        left: 0,
        top: '50%',
        transform: 'translate(-50%, -50%)',
        backgroundColor: 'white',
        borderRadius: '50%',
        width: 24,
        height: 24,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'black',
      }}
    >
      {number}
    </Box>
    <Box sx={{ marginLeft: '20px' }}>{label}</Box>
  </Box>
)

const App: React.FC = () => {
  const [tabIndex, setTabIndex] = useState(0)
  const [agentName, setAgentName] = useState('')
  const [description, setDescription] = useState('')
  const [tonality, setTonality] = useState('')
  const { adminId } = usePersistStore()

  useEffect(() => {
    const fetchData = async () => {
      if (!adminId) return

      try {
        const q = query(Companies, where('adminId', '==', adminId))
        const querySnapshot = await getDocs(q)

        if (!querySnapshot.empty) {
          for (const doc of querySnapshot.docs) {
            const data = doc.data()
            if (data.botInfo) {
              setAgentName(data.botInfo.botName || '')
              setDescription(data.botInfo.botDescription || '')
              setTonality(data.botInfo.botTone || '')
            }
          }
        }
      } catch (e) {
        console.error('Error fetching document: ', e)
      }
    }

    fetchData()
  }, [adminId])

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabIndex(newValue)
  }

  const handleSave = async () => {
    try {
      if (!agentName || !description || !tonality) {
        toast.error('Required fields are missing')
        return
      }

      const q = query(Companies, where('adminId', '==', adminId))
      const querySnapshot = await getDocs(q)

      if (querySnapshot.empty) {
        toast.error('No matching company found')
        return
      }
      for (const doc of querySnapshot.docs) {
        const existingBotInfo = doc.data().botInfo || {}

        await updateDoc(doc.ref, {
          botInfo: {
            ...existingBotInfo,
            botName: agentName,
            botDescription: description,
            botTone: tonality,
          },
        })
      }

      toast.success('Persona saved successfully')
    } catch (e) {
      console.error('Error updating document: ', e)
      toast.error('Error updating document')
    }
  }
  return (
    <Stack className="px-10 py-8 pb-0">
      <Tabs
        value={tabIndex}
        onChange={handleTabChange}
        aria-label="Tabs example"
        sx={{
          '& .MuiTabs-flexContainer': {
            justifyContent: 'space-between',
            background: '#F2F2F2',
            filter: 'drop-shadow(0px 0px 30px rgba(0, 0, 0, 0.05))',
            borderRadius: '16px',
            padding: '8px',
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: '400',
            minWidth: 'auto',
            minHeight: 'fit-content',
            padding: '8px 30px',
            borderRadius: '8px',
            margin: '0 4px',
            '&.Mui-selected': {
              backgroundColor: 'black',
              color: 'white',
              position: 'relative',
            },
            '&:not(.Mui-selected)': {
              backgroundColor: '#f2f2f2',
              color: 'black',
            },
            '&:not(.Mui-selected) > div > span': {
              backgroundColor: 'black',
              color: 'white',
            },
          },
        }}
      >
        <Tab label={<CustomTab label="Persona" number={1} />} />
        <Tab
          label={
            <CustomTab label="Document Upload/ Agent Training" number={2} />
          }
        />
        <Tab label={<CustomTab label="Summary & FAQs" number={3} />} />
        <Tab label={<CustomTab label="Capture Leads" number={4} />} />
      </Tabs>

      <TabPanel value={tabIndex} index={0}>
        <Stack spacing={3}>
          <TextField
            label="Agent Name"
            value={agentName}
            onChange={(e) => setAgentName(e.target.value)}
            fullWidth
            required
          />
          <TextField
            label="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            multiline
            rows={4}
            fullWidth
            required
          />
          <TextField
            select
            label="Tonality"
            value={tonality}
            onChange={(e) => setTonality(e.target.value)}
            required
            fullWidth
          >
            <MenuItem value="Formal">Formal</MenuItem>
            <MenuItem value="Friendly">Friendly</MenuItem>
            <MenuItem value="Informative">Informative</MenuItem>
          </TextField>
          <Stack className="w-full items-end">
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
              onClick={handleSave}
            >
              Save
            </Button>
          </Stack>
        </Stack>
      </TabPanel>
      <TabPanel value={tabIndex} index={1}>
        <DocumentUpload />
      </TabPanel>
      <TabPanel value={tabIndex} index={2}>
        <SummaryFaq />
      </TabPanel>
      <TabPanel value={tabIndex} index={3}>
        <LeadConversion />
      </TabPanel>
    </Stack>
  )
}

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 6 }}>
          <Stack>{children}</Stack>
        </Box>
      )}
    </div>
  )
}

export default App
