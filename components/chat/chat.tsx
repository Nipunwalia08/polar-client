'use client'
import LinkedInIcon from '@assets/linkedin.png'
import WhatsAppIcon from '@assets/whatsapp.png'
import {
  Admin,
  Campaigns,
  Customer,
  TeamMembers,
  WhatsappMessages,
  db,
} from '@firebase/config'
import {
  deleteOutOfBoundQuestion,
  fromOutOfBoundToCustomFaq,
} from '@firebase/firebaseInteractor'
import useFetchMessages, { type IMergedData } from '@hooks/useFetchMessages'
import { Add, Delete, Edit } from '@mui/icons-material'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import SearchIcon from '@mui/icons-material/Search'
import SendIcon from '@mui/icons-material/Send'
import {
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  IconButton,
  InputAdornment,
  List,
  ListItem,
  ListItemText,
  MenuItem,
  Modal,
  Select,
  Stack,
  Switch,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import Badge from '@mui/material/Badge'
import { styled } from '@mui/material/styles'
import usePersistStore from '@store/usePersistStore'
import type {
  CampaignMessage,
  ICampaigns,
  ITeamMember,
  IndividualMessage,
  LocalMessage,
} from '@type/collections'
import clsx from 'clsx'
import {
  Timestamp,
  doc,
  getDoc,
  getDocs,
  query,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore'
import React, { useEffect, useRef, useState } from 'react'
import { toast } from 'react-toastify'
import Notes from './Notes'

const SmallAvatar = styled(Avatar)(({ theme }) => ({
  width: 22,
  height: 22,
  border: `2px solid ${theme.palette.background.paper}`,
}))

const Chat: React.FC = () => {
  const [agentActive, setAgentActive] = useState(true)
  const [ofbquestions, setOfbquestions] = useState<string[]>([])
  const [selectedType, setSelectedType] = useState<'individual' | 'campaign'>(
    'individual',
  )
  const [campaigns, setCampaigns] = useState<CampaignMessage[]>([])
  const [expandedCampaign, setExpandedCampaign] = useState<number | null>(null)
  const [selectedIndividual, setSelectedIndividual] =
    useState<IndividualMessage | null>(null)
  const [individuals, setIndividuals] = useState<IndividualMessage[]>([])
  const [selectedCampaign, setSelectedCampaign] = useState<
    (typeof campaigns)[0] | null
  >(null)
  const [message, setMessage] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const { adminId, companyId } = usePersistStore()
  const [open, setOpen] = useState(false)
  const [selectedQuestion, setSelectedQuestion] = useState('')
  const [selectedQuestionId, setSelectedQuestionId] = useState<number | null>(
    null,
  )
  const [answer, setAnswer] = useState('')

  const handleIgnore = async (questionId: number) => {
    console.log(`Ignored: ${questionId}`)
    const contactId = selectedIndividual?.contact // Provide a default value if contact is undefined
    const wpid = `${companyId}-${contactId}`
    console.log(questionId, wpid)
    await deleteOutOfBoundQuestion(questionId, wpid)
  }

  const handleAddClick = (question: string, id: number) => {
    setSelectedQuestion(question)
    setSelectedQuestionId(id)
    setOpen(true)
  }

  const handleAddToCustomFaq = async () => {
    console.log(
      `Question: ${selectedQuestion}, Answer: ${answer}, Question ID: ${selectedQuestionId}`,
    )
    const contactId = selectedIndividual?.contact // Provide a default value if contact is undefined
    const wpid = `${companyId}-${contactId}`
    await fromOutOfBoundToCustomFaq(
      selectedQuestion,
      answer,
      companyId,
      selectedQuestionId as number,
      wpid,
    )
    setOpen(false)
    setAnswer('')
  }

  async function sendMessage(
    data: any,
    phoneNumberId: string,
    webhookSecret: string,
  ) {
    // console.log('phoneNumberId', phoneNumberId)
    // console.log('webhookSecret', process.env.ACCESS_TOKEN)
    console.log(JSON.stringify(data))

    try {
      const url = `https://graph.facebook.com/${process.env.NEXT_PUBLIC_VERSION}/${phoneNumberId}/messages`
      const headers = {
        Authorization: `Bearer ${webhookSecret}`,
        'Content-Type': 'application/json',
      }

      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: data,
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const resData = await response.json()
      console.log(resData)

      return resData
    } catch (error) {
      console.log(error)
    }
  }

  const getCustomTextInput = (recipient: string, text: string) => {
    return JSON.stringify({
      messaging_product: 'whatsapp',
      preview_url: false,
      recipient_type: 'individual',
      to: recipient,
      type: 'text',
      text: {
        body: text,
      },
    })
  }

  const handleSendMessage = async () => {
    if (message.trim() && selectedIndividual) {
      const newMessage: LocalMessage = {
        sender: 'bot',
        text: message,
        time: 'Now',
      }
      setSelectedIndividual({
        ...selectedIndividual,
        messages: [
          ...(selectedIndividual.messages as LocalMessage[]),
          newMessage,
        ],
      })
      setMessage('')
    }
    const phone = selectedIndividual?.contact as string
    console.log(message, companyId, selectedIndividual?.contact)
    const companyExists = await getDoc(doc(Admin, adminId)).then((doc) =>
      doc.data(),
    )
    if (!companyExists) {
      toast.error('Company not found')
      return
    }

    if (!companyExists.phoneNumberId) {
      toast.error('Phone Number ID not found')
      return
    }

    const key = `${companyId}-${phone}`
    const messageInput = getCustomTextInput(phone, message)
    console.log(messageInput)
    const { messages } = await sendMessage(
      messageInput,
      companyExists.phoneNumberId,
      companyExists.webhookSecret,
    )
    console.log(messages)
    const userexist = await getDoc(doc(WhatsappMessages, key)).then((doc) =>
      doc.data(),
    )
    if (userexist === undefined) {
      console.log('no doc')
      const textData = {
        status: 'success',
        messageId: messages[0].id,
        message: JSON.parse(messageInput),
        date: Timestamp.now(),
        usermessage: null,
      }
      console.log(textData)
      const datatemp = {
        messages: [textData],
        phoneNumber: phone,
        bot: true,
        comid: key,
      }
      setDoc(doc(WhatsappMessages, key), { ...datatemp })
    } else {
      const textData = {
        status: 'success',
        messageId: messages[0].id,
        message: JSON.parse(messageInput),
        date: Timestamp.now(),
        usermessage: null,
      }
      console.log(textData)
      setDoc(doc(WhatsappMessages, key), {
        ...userexist,
        messages: [...userexist.messages, textData],
      })
    }
  }
  const handleSelectType = async (type: 'individual' | 'campaign') => {
    if (type === 'campaign') {
      try {
        const campaigns = await fetchCampaigns(individuals)
        console.log('Campaigns: ', campaigns)
        setCampaigns(campaigns)
      } catch (error) {
        console.error('Error fetching campaigns:', error)
      }
    }
    setSelectedType(type)
    setExpandedCampaign(null)
    setSelectedIndividual(null)
    setSelectedCampaign(null)
  }

  const handleToggleCampaign = (campaign: CampaignMessage) => {
    setExpandedCampaign(expandedCampaign === campaign?.id ? null : campaign?.id)
    setSelectedIndividual(null)
    setSelectedCampaign(campaign)
  }

  const { mergedData } = useFetchMessages()

  const convertToIndividuals = (data: IMergedData): IndividualMessage[] => {
    return data.map((entry, index) => {
      const messages = entry?.user?.messages?.flatMap((msg) => {
        const userMessages: LocalMessage[] = []
        if (msg?.userMessage) {
          userMessages.push({
            sender: 'user',
            text: msg?.userMessage,
            time: new Date(msg.date.seconds * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })
        }
        if (msg.message?.text?.body) {
          userMessages.push({
            sender: 'bot',
            text: msg.message.text.body,
            time: new Date(msg.date.seconds * 1000).toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            }),
          })
        }
        return userMessages
      })

      return {
        id: index + 1,
        name: entry.customerDetails?.name,
        platform: 'WhatsApp',
        email:
          entry.customerDetails?.email ||
          `${entry.customerDetails?.name?.toLowerCase()}@example.com`, // Dummy email as a placeholder
        contact: `${entry.customerDetails?.phone}`,
        notes: entry.user?.notes,
        tags: entry?.user?.tags,
        messages: messages,
        customerId: entry.customerDetails?.id,
        teamMember: entry?.user?.teamMember,
        bot: entry?.user?.bot,
        outofboundquestions: entry?.user?.outOfBoundQuestions,
      }
    })
  }
  useEffect(() => {
    console.log('message updated')
    const individuals = convertToIndividuals(mergedData)
    setIndividuals(individuals)
    console.log(individuals)
    console.log(selectedIndividual)

    if (selectedIndividual) {
      const selectedIndividualData = individuals.find(
        (ind) => ind.id === selectedIndividual.id,
      )
      if (selectedIndividualData) {
        handleSelectIndividual(selectedIndividualData)
      }
    }
  }, [mergedData])

  const fetchCampaigns = async (
    individuals: IndividualMessage[],
  ): Promise<CampaignMessage[]> => {
    console.log('Indi: ', individuals)
    const campaignsSnapshot = await getDocs(
      query(Campaigns, where('adminId', '==', adminId)),
    )

    const campaigns = campaignsSnapshot.docs
      .map((doc, index) => {
        const campaignData = doc.data() as ICampaigns
        const campaignMembers = campaignData.customers || []

        // Find the individual IDs of the members
        const members = campaignMembers
          .map((customerId) => {
            const individual = individuals.find(
              (ind) => ind.customerId === `${customerId}`,
            )
            return individual ? individual.id : null
          })
          .filter((member) => member !== null) // Remove null values

        console.log('members:', members)
        // Check if members length is greater than 0
        if (members.length > 0) {
          return {
            id: index + 1,
            name: campaignData.name || `Campaign ${index + 1}`,
            platform: 'WhatsApp',
            users: members.length,
            members: members,
            notes:
              'Lorem Ipsum is simply dummy text of the printing and typesetting industry...',
            tags: campaignData?.tags,
            campaignId: doc.id,
            teamMember: campaignData?.teamMember,
          }
        }
      })
      .filter((campaign) => !!campaign) as CampaignMessage[]

    return campaigns
  }

  const handleSelectIndividual = (individual: IndividualMessage) => {
    setSelectedIndividual(individual)
    setAgentActive(individual?.bot!)
    setOfbquestions(individual?.outofboundquestions || [])
    setAssignTeamIndividual(individual?.teamMember || '')
  }

  const filteredIndividuals = individuals.filter((individual) =>
    individual.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const filteredCampaigns = campaigns?.filter((campaign) =>
    campaign?.name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const getAvatarIcon = (platform: string) => {
    switch (platform) {
      case 'WhatsApp':
        return <Box component="img" src={WhatsAppIcon.src} />
      case 'LinkedIn':
        return <Box component="img" src={LinkedInIcon.src} />
      default:
        return null
    }
  }
  const getAvatarImg = (platform: string) => {
    switch (platform) {
      case 'WhatsApp':
        return (
          <Box
            component="img"
            src={WhatsAppIcon.src}
            sx={{ width: '25px', height: '25px' }}
          />
        )
      case 'LinkedIn':
        return (
          <Box
            component="img"
            src={LinkedInIcon.src}
            sx={{ width: '25px', height: '25px' }}
          />
        )
      default:
        return null
    }
  }

  const getInitials = (name?: string) => {
    return name
      ?.split(' ')
      ?.map((part) => part[0])
      ?.join('')
  }
  const [teamMembers, setTeamMembers] = useState<ITeamMember[]>([])
  const [assignTeamIndividual, setAssignTeamIndividual] = useState<string>('')
  const [assignTeamCampaign, setAssignTeamCampaign] = useState<string>('')

  useEffect(() => {
    ;(async () => {
      const teamMembers = await getDocs(
        query(TeamMembers, where('adminId', '==', adminId)),
      )
      if (teamMembers.empty) return
      const members = teamMembers.docs.map(
        (doc) => ({ ...doc.data(), id: doc.id }) as ITeamMember,
      )
      setTeamMembers(members)
    })()
  }, [adminId])

  const tags = [
    {
      title: 'Interested',
      key: 'interested',
    },
    {
      title: 'Not Interested',
      key: 'notInterested',
    },
    {
      title: 'Human Intervention Needed',
      key: 'humanAgent',
    },
  ]

  const handleSwitchTags = async (tag: string, state: boolean) => {
    setSelectedIndividual({
      ...selectedIndividual!,
      tags: {
        ...selectedIndividual?.tags,
        [tag]: state,
      },
    })
    await setDoc(
      doc(WhatsappMessages, `${companyId}-${selectedIndividual?.contact}`),
      {
        tags: {
          ...selectedIndividual?.tags,
          [tag]: state,
        },
      },
      { merge: true },
    )
  }
  const listRef = useRef<HTMLUListElement>(null)

  useEffect(() => {
    if (listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight
    }
  }, [selectedIndividual, selectedIndividual?.messages])
  const handleAgentBot = async (state: boolean) => {
    console.log(state)

    setAgentActive(state)
    setSelectedIndividual({
      ...selectedIndividual!,
    })
    await setDoc(
      doc(WhatsappMessages, `${companyId}-${selectedIndividual?.contact}`),
      {
        bot: state,
      },
      { merge: true },
    )
  }
  const handleSwitchCampaignTags = async (tag: string, state: boolean) => {
    setSelectedCampaign({
      ...selectedCampaign!,
      tags: {
        ...selectedCampaign?.tags,
        [tag]: state,
      },
    })
    await setDoc(
      doc(Campaigns, `${companyId}-${selectedCampaign?.id}`),
      {
        tags: {
          ...selectedCampaign?.tags,
          [tag]: state,
        },
      },
      { merge: true },
    )
  }

  return (
    <div
      className="flex m-6"
      style={{
        borderRadius: '8px',
        border: '1px solid #DCDCDC',
        background: '#FFF',
        boxShadow: '0px 1px 9.6px 0px rgba(0, 0, 0, 0.08)',
      }}
    >
      <div className="flex flex-col w-1/4">
        <div style={{ borderRadius: '8px', background: '#F0F0F0' }}>
          <h2 className="text-xl font-bold mb-4">
            <TextField
              variant="outlined"
              placeholder="Search"
              fullWidth
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton>
                      <SearchIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{
                '& .MuiInputBase-root': {
                  padding: '0px 8px',
                  height: '45px',
                },
              }}
              className="m-4 mb-0 w-[88%] bg-white"
            />
          </h2>
        </div>
        <div className="p-4 border-r flex flex-col w-full">
          <div className="mb-4 flex flex-row gap-4">
            <Button
              variant="contained"
              sx={{
                borderRadius: '5px',
                color: '#fff',
                textTransform: 'none',
              }}
              className={`w-full text-black bg-white border border-black hover:bg-white ${selectedType === 'individual' && 'bg-theme text-white'}`}
              onClick={() => handleSelectType('individual')}
            >
              Individual
            </Button>
            <Button
              variant="contained"
              sx={{
                borderRadius: '5px',
                color: '#000',
                textTransform: 'none',
              }}
              className={`w-full text-black bg-white border border-black hover:bg-white ${selectedType === 'campaign' && 'bg-theme text-white'}`}
              onClick={() => handleSelectType('campaign')}
            >
              Campaign
            </Button>
          </div>
          <List className="max-h-[62vh] min-h-[62vh] overflow-y-scroll">
            {selectedType === 'individual'
              ? (filteredIndividuals.length > 0
                  ? filteredIndividuals
                  : individuals
                ).map((individual, index) => (
                  <ListItem
                    key={index}
                    button
                    onClick={() => {
                      console.log(individual)
                      handleSelectIndividual(individual)
                    }}
                  >
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      sx={{ marginRight: '8px' }}
                      badgeContent={
                        <SmallAvatar alt="Remy Sharp">
                          {getAvatarIcon(individual.platform)}
                        </SmallAvatar>
                      }
                    >
                      <Avatar
                        alt="Travis Howard"
                        sx={{ bgcolor: '#200099', marginRight: '8px' }}
                      >
                        {getInitials(individual?.name)}
                      </Avatar>
                    </Badge>

                    <ListItemText
                      primary={individual.name}
                      secondary={individual.platform}
                    />
                  </ListItem>
                ))
              : (filteredCampaigns.length > 0
                  ? filteredCampaigns
                  : campaigns
                )?.map((campaign, index) => (
                  <React.Fragment key={index}>
                    <ListItem
                      button
                      onClick={() => handleToggleCampaign(campaign)}
                    >
                      <Badge
                        sx={{ marginRight: '8px' }}
                        overlap="circular"
                        anchorOrigin={{
                          vertical: 'bottom',
                          horizontal: 'right',
                        }}
                        badgeContent={
                          <SmallAvatar alt="Remy Sharp">
                            {getAvatarIcon(campaign?.platform)}
                          </SmallAvatar>
                        }
                      >
                        <Avatar
                          alt="Travis Howard"
                          sx={{ bgcolor: '#000', marginRight: '8px' }}
                        >
                          C
                        </Avatar>
                      </Badge>
                      <ListItemText
                        primary={campaign?.name}
                        secondary={`Users: ${campaign?.users}`}
                      />
                      {expandedCampaign === campaign?.id ? (
                        <ExpandLess />
                      ) : (
                        <ExpandMore />
                      )}
                    </ListItem>
                    <Collapse
                      in={expandedCampaign === campaign?.id}
                      timeout="auto"
                      unmountOnExit
                    >
                      <List component="div" disablePadding>
                        {campaign?.members?.map((memberId) => {
                          const individual = individuals.find(
                            (ind) => ind.id === memberId,
                          )
                          if (!individual) return null
                          return (
                            <ListItem
                              key={individual.id}
                              button
                              onClick={() => handleSelectIndividual(individual)}
                              className="pl-8"
                            >
                              <Badge
                                overlap="circular"
                                anchorOrigin={{
                                  vertical: 'bottom',
                                  horizontal: 'right',
                                }}
                                sx={{ marginRight: '8px' }}
                                badgeContent={
                                  <SmallAvatar alt="Remy Sharp">
                                    {getAvatarIcon(individual.platform)}
                                  </SmallAvatar>
                                }
                              >
                                <Avatar
                                  alt="Travis Howard"
                                  sx={{
                                    bgcolor: '#200099',
                                    marginRight: '8px',
                                  }}
                                >
                                  {getInitials(individual.name)}
                                </Avatar>
                              </Badge>
                              <ListItemText
                                primary={individual.name}
                                secondary={individual.platform}
                              />
                            </ListItem>
                          )
                        })}
                      </List>
                    </Collapse>
                  </React.Fragment>
                ))}
          </List>
        </div>
      </div>
      <div className="flex-1 p-4">
        <div className="flex justify-between items-center mb-4">
          <div>
            {selectedIndividual ? (
              <Stack className="flex flex-row gap-3 items-center">
                <Typography variant="h5">{selectedIndividual.name} </Typography>
                {getAvatarImg(selectedIndividual.platform)}
              </Stack>
            ) : selectedCampaign ? (
              <Stack className="flex flex-row gap-3 items-center">
                <Typography variant="h5">{selectedCampaign.name} </Typography>
                {getAvatarImg(selectedCampaign.platform)}
              </Stack>
            ) : (
              <Typography variant="h5">
                Select an individual or campaign
              </Typography>
            )}
          </div>
          <div>
            {selectedIndividual || selectedCampaign ? (
              <>
                <Tooltip title="Turn Agent off to converse directly with the customer">
                  <Switch
                    checked={agentActive}
                    onClick={() => handleAgentBot(!agentActive)}
                    color="primary"
                  />
                </Tooltip>
                <span>Agent</span>
              </>
            ) : (
              <></>
            )}
          </div>
        </div>
        <Divider />
        <div className="mt-4">
          <List
            ref={listRef}
            className="max-h-[62vh] min-h-[62vh] overflow-y-scroll"
          >
            {selectedIndividual ? (
              selectedIndividual.messages?.map((msg, index) => (
                <ListItem key={index}>
                  <ListItemText
                    sx={{
                      display: 'flex',
                      alignItems:
                        msg.sender === 'user' ? 'flex-end' : 'flex-start',
                      flexDirection: 'column',
                    }}
                    primary={
                      <span
                        style={{
                          background:
                            msg.sender === 'user' ? '#4286f5' : '#ececec',
                          padding: '5px 12px',
                          borderRadius: '8px',
                          color: msg.sender === 'user' ? '#fefefe' : '#1e1e1e',
                          display: 'flex',
                          maxWidth: msg.sender === 'user' ? '100%' : '500px',
                        }}
                      >
                        {msg.text}
                      </span>
                    }
                    secondary={msg.time}
                    className={
                      msg.sender === 'user' ? 'text-right' : 'text-left'
                    }
                  />
                </ListItem>
              ))
            ) : selectedCampaign ? (
              <Typography variant="body1">
                Select an individual from the campaign to view messages
              </Typography>
            ) : (
              <Typography variant="body1">
                Select a campaign to view individuals
              </Typography>
            )}
          </List>
        </div>

        {!agentActive && selectedIndividual && (
          <div className="mt-4 flex">
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
            <Button
              variant="contained"
              color="primary"
              className="ml-2"
              onClick={handleSendMessage}
            >
              <SendIcon />
            </Button>
          </div>
        )}
      </div>
      <div className="w-1/4 p-4 border-l max-h-[83vh] overflow-y-scroll">
        {selectedIndividual ? (
          <>
            <Select
              labelId="type"
              displayEmpty
              className="w-full rounded-md text-sm mb-4"
              defaultValue=""
              value={assignTeamIndividual}
              onChange={async (e) => {
                setAssignTeamIndividual(e.target.value)
                await updateDoc(
                  doc(
                    WhatsappMessages,
                    `${companyId}-${selectedIndividual.contact}`,
                  ),
                  {
                    teamMember: e.target.value,
                  },
                )
              }}
            >
              <MenuItem value="">Assign Member</MenuItem>
              {teamMembers?.map((member) => (
                <MenuItem key={member.id} value={member.id}>
                  {member.name}
                </MenuItem>
              ))}
            </Select>
            <div className="mb-4 border border-gray-100 rounded">
              <div className="bg-gray-100 p-2 flex items-center justify-between">
                <div className="flex">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-2">
                    <span>{getInitials(selectedIndividual.name)}</span>
                  </div>
                  <Typography variant="h6">
                    {selectedIndividual.name}
                  </Typography>
                </div>
                <Edit />
              </div>
              <div className="my-2 p-2">
                <Typography
                  variant="body2"
                  className="flex justify-between my-1"
                >
                  <span>Email: </span> <span> {selectedIndividual.email} </span>
                </Typography>
                <Typography
                  variant="body2"
                  className="flex justify-between my-1"
                >
                  <span>Contact: </span>{' '}
                  <span> {selectedIndividual.contact} </span>
                </Typography>
                <Typography
                  variant="body2"
                  className="flex justify-between my-1"
                >
                  <span>Platform: </span>{' '}
                  <span> {selectedIndividual.platform} </span>
                </Typography>
              </div>
            </div>
            <div className="mb-4">
              <Notes
                notes={selectedIndividual.notes}
                phone={selectedIndividual.contact}
              />
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <Typography variant="h6">Tags</Typography>
              <div className="flex flex-wrap gap-2 mt-2">
                {tags.map((tag) =>
                  selectedIndividual?.tags?.[tag.key] ? (
                    <Chip
                      key={tag.key}
                      label={tag.title}
                      onDelete={() => handleSwitchTags(tag.key, false)}
                      color="primary"
                      className="bg-theme"
                    />
                  ) : (
                    <Button
                      key={tag.key}
                      variant="outlined"
                      className="normal-case h-fit py-[0.24rem] px-3 rounded-full text-[13px]"
                      onClick={() => handleSwitchTags(tag.key, true)}
                    >
                      {tag.title}
                    </Button>
                  ),
                )}
              </div>
            </div>
            <div>
              <Typography variant="h6">Out Of Bound Questions</Typography>
              <div className="flex flex-wrap gap-2 mt-2">
                {ofbquestions.length === 0 && (
                  <>
                    <Typography sx={{ fontStyle: 'italic', fontSize: '14px' }}>
                      Successfully Handled all the Questions
                    </Typography>
                  </>
                )}
                {ofbquestions.map((tag, id) => (
                  <div key={id} className="flex flex-col gap-2">
                    <Chip
                      label={tag}
                      color="primary"
                      className="bg-theme w-[300px]"
                    />
                    <Stack className="flex-row">
                      <Button
                        sx={{ color: '#d33030' }}
                        onClick={() => handleIgnore(id)}
                      >
                        Ignore
                      </Button>
                      <Button
                        onClick={() => handleAddClick(tag, id)}
                        sx={{ color: '#229733' }}
                      >
                        Add
                      </Button>
                    </Stack>
                  </div>
                ))}
              </div>
              <Modal open={open} onClose={() => setOpen(false)}>
                <div
                  style={{
                    padding: 20,
                    background: 'white',
                    margin: 'auto',
                    marginTop: '15%',
                    width: 400,
                  }}
                >
                  <Typography variant="h6">Add Custom FAQ</Typography>
                  <Typography variant="body1">{selectedQuestion}</Typography>
                  <TextField
                    label="Answer"
                    fullWidth
                    multiline
                    rows={4}
                    value={answer}
                    onChange={(e) => setAnswer(e.target.value)}
                    margin="normal"
                  />
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleAddToCustomFaq}
                    style={{ marginTop: 10, textTransform: 'none' }}
                  >
                    Add
                  </Button>
                </div>
              </Modal>
            </div>
          </>
        ) : (
          selectedCampaign && (
            <>
              <Select
                labelId="type"
                displayEmpty
                className="w-full rounded-md text-sm mb-4"
                defaultValue=""
                value={assignTeamCampaign}
                onChange={async (e) => {
                  setAssignTeamCampaign(e.target.value)
                  await updateDoc(doc(Campaigns, selectedCampaign.campaignId), {
                    teamMember: e.target.value,
                  })
                }}
              >
                <MenuItem value="">Assign Member</MenuItem>
                {teamMembers?.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name}
                  </MenuItem>
                ))}
              </Select>
              <div className="mb-4 border border-gray-100 rounded">
                <div className="bg-gray-100 p-1 flex items-center">
                  <div className="w-8 h-8 rounded-full bg-black text-white flex items-center justify-center mr-2">
                    <span>C</span>
                  </div>
                  <div className="flex items-center">
                    <Typography variant="h6" className="font-semibold">
                      {selectedCampaign.name}
                    </Typography>
                    <div className="ml-2">
                      {getAvatarImg(selectedCampaign.platform)}
                    </div>
                  </div>
                </div>
                <div className="campaign-details p-2">
                  <Typography variant="body2">
                    Total users: {selectedCampaign.users}
                  </Typography>
                  <Typography variant="body2">
                    Platform: {selectedCampaign.platform}
                  </Typography>
                </div>
              </div>
              <div className="mb-4">
                <Notes />
              </div>
              <div>
                <Typography variant="h6">Add Tags</Typography>
                <div className="flex flex-wrap gap-2 mt-2">
                  {tags.map((tag) =>
                    selectedCampaign?.tags?.[tag.key] ? (
                      <Chip
                        key={tag.key}
                        label={tag.title}
                        onDelete={() =>
                          handleSwitchCampaignTags(tag.key, false)
                        }
                        color="primary"
                        className="bg-theme"
                      />
                    ) : (
                      <Button
                        key={tag.key}
                        variant="outlined"
                        className="normal-case h-fit py-[0.24rem] px-3 rounded-full text-[13px]"
                        onClick={() => handleSwitchCampaignTags(tag.key, true)}
                      >
                        {tag.title}
                      </Button>
                    ),
                  )}
                </div>
              </div>
            </>
          )
        )}
      </div>
    </div>
  )
}

export default Chat
