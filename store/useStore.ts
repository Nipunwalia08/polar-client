import { create } from 'zustand'

interface UserState {
  email: string
  isAdmin: boolean | null
  header: string
  campaignLaunchTabIndex: number
  setUser: (email: string, isAdmin: boolean | null) => void
  clearUser: () => void
  setHeader: (header: string) => void
  setCampaignLaunchTabIndex: (index: number) => void
}

const useUserStore = create<UserState>((set) => ({
  email: '',
  isAdmin: null,
  header: 'Dashboard',
  campaignLaunchTabIndex: 0,
  setUser: (email, isAdmin) => set({ email, isAdmin }),
  clearUser: () => set({ email: '', isAdmin: null }),
  setHeader: (header) => set({ header }),
  setCampaignLaunchTabIndex: (index) => set({ campaignLaunchTabIndex: index }),
}))

export default useUserStore
