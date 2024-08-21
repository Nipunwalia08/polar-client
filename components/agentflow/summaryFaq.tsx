import { Companies } from '@firebase/config' // Adjust the import path based on your Firebase setup
import { Edit } from '@mui/icons-material'
import { Delete, ExpandMore } from '@mui/icons-material'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { fetchDocFromPinecone } from '@pinecone/fetchDocFromPinecone'
import usePersistStore from '@store/usePersistStore'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import type React from 'react'
import { useEffect, useState } from 'react'
import { toast } from 'react-toastify'

interface FAQ {
  Question: string
  Ans: string
  id?: string
}

interface CompanyData {
  id?: string
  adminId?: string
  botInfo?: {
    botName?: string
    botDescription?: string
    botTone?: string
    faqs: FAQ[]
    services?: string
    summary?: string
    customFaq: FAQ[]
  }
  companyDocs?: {
    fileUrl?: string
    fileName?: string
    filePath?: string
  }[]
  leadConversion?: {
    fieldDatatype?: string
    fieldName?: string
    required?: string
  }[]
  phoneNumberID?: string
}

const AiAgentDetails: React.FC = () => {
  const [summary, setSummary] = useState<string>('')
  const [services, setServices] = useState<string>('')
  const [faq, setFaq] = useState<FAQ[]>([])
  const [custfaq, setCustfaq] = useState<FAQ[]>([])
  const [ques, setQues] = useState<string>('')
  const [ans, setAns] = useState<string>('')
  const [addfaq, setAddfaq] = useState<boolean>(false)
  const [editfaq, setEditfaq] = useState<boolean>(false)
  const [faqid, setFaqid] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(false)
  const { companyId } = usePersistStore()

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const docRef = doc(Companies, companyId)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data() as CompanyData
        setSummary(data.botInfo?.summary || '')
        setServices(data.botInfo?.services || '')
        setFaq(data.botInfo?.faqs || [])
        setCustfaq(data.botInfo?.customFaq || [])
      } else {
        console.error('No such document!')
      }
    } catch (error) {
      console.error('Error fetching document:', error)
    }
  }

  const handleAddFaq = async () => {
    try {
      const faqRef = doc(Companies, companyId)
      const newFaq = {
        Question: ques,
        Ans: ans,
        id: Date.now().toString(), // Use a unique ID for each FAQ
      }

      const updatedCustomFaq = [...custfaq, newFaq]

      await updateDoc(faqRef, {
        'botInfo.customFaq': updatedCustomFaq,
      })

      setCustfaq(updatedCustomFaq)
      setAddfaq(false)
      setQues('')
      setAns('')
      toast.success('FAQ added successfully')
    } catch (error) {
      console.error('Error adding FAQ:', error)
    }
  }

  const handleEditFaq = async () => {
    try {
      const faqRef = doc(Companies, companyId)
      const updatedFaq = {
        Question: ques,
        Ans: ans,
      }

      const updatedFaqList = custfaq.map((item) =>
        item.id === faqid ? { ...updatedFaq, id: faqid } : item,
      )

      await updateDoc(faqRef, {
        'botInfo.customFaq': updatedFaqList,
      })

      setCustfaq(updatedFaqList)
      setEditfaq(false)
      setQues('')
      setAns('')
      toast.success('Custom FAQ updated successfully')
    } catch (error) {
      console.error('Error editing FAQ:', error)
    }
  }

  const handleDeleteFaq = async (item: FAQ) => {
    try {
      const faqRef = doc(Companies, companyId)

      const updatedFaqList = custfaq.filter((f) => f.id !== item.id)

      await updateDoc(faqRef, {
        'botInfo.customFaq': updatedFaqList,
      })

      setCustfaq(updatedFaqList)
      toast.success('FAQ deleted successfully')
    } catch (error) {
      console.error('Error deleting FAQ:', error)
    }
  }

  const handleFetchDetails = async () => {
    try {
      setLoading(true)
      await fetchDocFromPinecone(companyId)
      fetchData()
    } catch (error) {
      console.error('Error fetching document:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-4">
        <Typography
          variant="h4"
          component="h1"
          className="font-[500] text-[28px]"
        >
          Summary
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={handleFetchDetails}
          disabled={loading}
          className="normal-case"
          startIcon={<Edit />}
        >
          {loading ? 'Fetching details' : 'Fetch details'}
        </Button>
      </div>
      <div
        className="bg-white p-6 rounded-lg"
        style={{ border: '1px solid #D6D6D6 ' }}
      >
        <div className="p-4 rounded-lg mb-4">
          <div className="mb-4">
            <Typography variant="body1">{summary || 'No summary'}</Typography>
          </div>
          <hr />
          <div className="mt-4 mb-4">
            <Typography variant="h6" component="h3" className="mb-2">
              Products & Services offered:
            </Typography>
            <BulletPointList text={services} />
          </div>
          <hr />
          <div className="mb-4 mt-4">
            <Typography
              variant="h6"
              component="h3"
              className="mb-2 text-[28px] font-[500]"
            >
              FAQs
            </Typography>
            {faq.length > 0 ? (
              faq.map((element, index) => (
                <Accordion
                  key={index}
                  sx={{
                    background: '#fefefe',
                    borderRadius: '0px',
                    mt: '12px',
                    p: 1,
                    color: '#1e1e1e',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{element.Question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{element.Ans}</Typography>
                  </AccordionDetails>
                </Accordion>
              ))
            ) : (
              <Typography>No FAQs</Typography>
            )}
          </div>
          <hr />
          <div className="mt-4">
            <Stack className="flex-row justify-between items-center">
              <Typography
                variant="h6"
                component="h3"
                className="mb-2 text-[28px] font-[500]"
              >
                Custom FAQs
              </Typography>
              <Button
                variant="contained"
                type="submit"
                sx={{
                  borderRadius: '8px',
                  background:
                    ' var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
                  padding: '10px 30px',
                  width: '150px',
                  textTransform: 'none',
                  fontWeight: '400',
                  fontSize: '16px',
                }}
                onClick={() => {
                  setAddfaq(!addfaq)
                  setAns('')
                  setQues('')
                }}
              >
                <AddCircleIcon sx={{ color: '#fff', marginRight: '6px' }} /> Add
              </Button>
            </Stack>

            {(addfaq || editfaq) && (
              <Stack direction="column" spacing={2} className="mt-4 mb-2">
                <TextField
                  label="Question"
                  variant="outlined"
                  value={ques}
                  onChange={(e) => setQues(e.target.value)}
                />
                <TextField
                  label="Answer"
                  variant="outlined"
                  value={ans}
                  onChange={(e) => setAns(e.target.value)}
                />
                {addfaq && (
                  <Stack className="w-full items-end">
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        borderRadius: '8px',
                        background:
                          ' var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
                        padding: '10px 30px',
                        width: '150px',
                        textTransform: 'none',
                        fontWeight: '400',
                        fontSize: '16px',
                      }}
                      onClick={handleAddFaq}
                    >
                      Save
                    </Button>
                  </Stack>
                )}
                {editfaq && (
                  <Stack className="w-full items-end">
                    <Button
                      variant="contained"
                      type="submit"
                      sx={{
                        borderRadius: '8px',
                        background:
                          ' var(--Linear, linear-gradient(270deg, #211AEB -36.04%, #7C36FE 100%))',
                        padding: '10px 30px',
                        width: '150px',
                        textTransform: 'none',
                        fontWeight: '400',
                        fontSize: '16px',
                      }}
                      onClick={handleEditFaq}
                    >
                      Edit
                    </Button>
                  </Stack>
                )}
              </Stack>
            )}

            {custfaq.map((element, index) => (
              <div key={index} className="flex items-center mt-4">
                <Accordion
                  className="w-full"
                  sx={{
                    background: '#fefefe',
                    borderRadius: '0px',
                    mt: '12px',
                    p: 1,
                    color: '#1e1e1e',
                  }}
                >
                  <AccordionSummary expandIcon={<ExpandMore />}>
                    <Typography>{element.Question}</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Typography>{element.Ans}</Typography>
                  </AccordionDetails>
                </Accordion>
                <IconButton
                  onClick={() => {
                    setAns(element.Ans)
                    setQues(element.Question)
                    setEditfaq(true)
                    setFaqid(element.id || '')
                  }}
                  className="ml-2 mt-2"
                >
                  <Edit className="text-[#7C36FE]" />
                </IconButton>
                <IconButton
                  onClick={() => handleDeleteFaq(element)}
                  className="mt-2"
                >
                  <Delete className="text-[#e55b51]" />
                </IconButton>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  )
}

interface BulletPointListProps {
  text: string | null
}

const BulletPointList: React.FC<BulletPointListProps> = ({ text }) => {
  if (!text) {
    return <>NoServices</>
  }

  const points = text.split('- ').slice(1)

  return (
    <ul>
      {points.map((point, index) => (
        <li key={index}>{point.replace('-', '')}</li>
      ))}
    </ul>
  )
}

export default AiAgentDetails
