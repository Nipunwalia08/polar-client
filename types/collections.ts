import type { Timestamp } from 'firebase/firestore'

export interface ILeadConversion {
  fieldDatatype?: string
  fieldName?: string
  required?: boolean
}

export interface ICustomer {
  name: string
  email: string
  phone: string
  id?: string
}

export type ICustomerWithId = ICustomer & { id: string }

export interface IMessage {
  date: Timestamp
  message?: {
    text?: {
      body?: string
      type: string
    }
  }
  userMessage?: string
  outOfBoundQuestions?: string[]
}

export interface ICompanies {
  id?: string
  companyName?: string
  adminId?: string
  phoneNumberID?: string
  leadConversion?: ILeadConversion[]
  cta?: string[]
  botInfo?: {
    botName?: string
    botDescription?: string
    botTone?: string
    faqs: {
      question?: string
      answer?: string
    }[]
    services?: string
    summary?: string
    customFaq: {
      Question?: string
      Ans?: string
    }[]
  }
  companyDocs?: {
    fileUrl?: string
    fileName?: string
    filePath?: string
    id?: string[]
  }[]
  pineIds?: string[]
  bankDetails?: IBankDetails[]
}

export interface IAdmin {
  email: string
  name: string
  phoneNumber: string
  whatsappNumber?: string
  companyName: string
  webhookSecret: string
  businessId: string
  phoneNumberId: string
  steps: number
  id?: string
}

export interface ITeamMember {
  name: string
  teamName: string
  email: string
  adminId: string
  active: boolean
  assignedCampaigns?: string[]
  id?: string
}

export interface ILead {
  name: string
  email?: string
  phone: string
  adminId?: string
  assignedCampaigns?: string[]
  id?: string
}

export type CustomerLeads = ILead[]

export interface TeamMemberData {
  Array: ITeamMember[]
}

export interface ProfileData {
  name: string
  email: string
}

export interface ITemplates {
  name?: string
  description?: string
  type?: string
  link?: string
  id?: string
}

export interface INote {
  content?: string
  createdAt?: Timestamp
}

export interface ISchedule {
  datetime: Timestamp
  jobId?: string
}

export interface ICampaigns {
  listOfLeads?: number
  allLeads?: number
  acceptanceRate?: number
  replyRate?: number
  createdAt?: Timestamp
  active?: boolean
  name?: string
  customers?: string[]
  teamMembers?: string[]
  schedule?: ISchedule[]
  template?: ITemplates
  adminId?: string
  note?: INote
  id?: string
  tags?: Record<string, boolean>
  teamMember?: string
  notes?: string
}

export interface IBankRoi {
  tenure: number
  roi: string
}

export interface IBankDetails {
  bankName: string
  bankFoir: string
  bankLink: string
  bankRois: IBankRoi[]
}

export interface IUser {
  phone?: string
  messages?: IMessage[]
  bot?: boolean
  tags?: Record<string, boolean>
  teamMember?: string
  outOfBoundQuestions?: string[]
  notes?: INote
}

export interface LocalMessage {
  sender: 'user' | 'bot'
  text: string
  time: string
}

export interface IndividualMessage {
  id: number
  name?: string
  platform: 'WhatsApp'
  email?: string
  contact: string
  notes?: INote
  tags?: Record<string, boolean>
  messages?: LocalMessage[]
  customerId?: string
  teamMember?: string
  bot?: boolean
  outofboundquestions?: string[]
}

export interface CampaignMessage {
  id: number
  name?: string
  platform: 'WhatsApp'
  users: number
  members?: number[]
  notes?: string
  tags?: Record<string, boolean>
  campaignId?: string
  teamMember?: string
}
