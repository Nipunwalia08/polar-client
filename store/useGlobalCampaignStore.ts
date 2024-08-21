import dayjs from 'dayjs'
import { create } from 'zustand'

interface Schedule {
  date: dayjs.Dayjs | null
  time: dayjs.Dayjs | null
}

interface Template {
  id?: string
  link?: string
}

interface GlobalCampaignState {
  name?: string | undefined
  customers?: string[] | undefined
  teamMembers?: string[] | undefined
  schedule?: Schedule[] | undefined
  template?: Template | undefined
  setName: (name: string) => void
  setCustomers: (customers: string[]) => void
  setTeamMembers: (teamMembers: string[]) => void
  setSchedule: (schedule: Schedule[]) => void
  setTemplate: (template: Template) => void
}

export const useGlobalCampaignStore = create<GlobalCampaignState>((set) => ({
  name: '',
  customers: [],
  teamMembers: [],
  schedule: [{ date: dayjs(), time: dayjs() }],
  template: {
    id: '',
    link: '',
  },
  setName: (name) => set({ name }),
  setCustomers: (customers) => set({ customers }),
  setTeamMembers: (teamMembers) => set({ teamMembers }),
  setSchedule: (schedule) => set({ schedule }),
  setTemplate: (template) => set({ template }),
}))
