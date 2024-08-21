import { Campaigns } from '@firebase/config'
import type { ICampaigns } from '@type/collections'
import { doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { create } from 'zustand'
import usePersistStore from './usePersistStore'

export type ICampaignWithId = ICampaigns & { id: string }

type StatusFilter = 'active' | 'inactive' | null

type initialState = {
  campaigns: ICampaignWithId[]
  query: string
  filteredCampaigns: ICampaignWithId[]
  statusFilter: StatusFilter
  setCampaigns: (campaigns: ICampaignWithId[]) => void
  setQuery: (query: string) => void
  setStatusFilter: (status: StatusFilter) => void
  applyFilter: ({
    statusFilter,
    query,
  }: { statusFilter?: StatusFilter; query?: string }) => void
}

const useCampaignStore = create<initialState>((set) => ({
  campaigns: [],
  filteredCampaigns: [],
  statusFilter: null,
  query: '',
  setCampaigns: (campaigns) => set({ campaigns }),
  applyFilter: (updatedState) =>
    set((state) => {
      const newState = {
        ...state,
        ...updatedState,
      }
      const filteredCampaigns = state.campaigns.filter((template) => {
        if (
          newState.statusFilter &&
          (newState.statusFilter === 'active') !== template.active
        )
          return false
        if (
          newState.query &&
          !template?.name?.toLowerCase()?.includes(newState.query.toLowerCase())
        )
          return false
        return true
      })
      return { filteredCampaigns }
    }),
  setQuery: (query) =>
    set((state) => {
      state.applyFilter({ query })
      return { query }
    }),
  setStatusFilter: (status) =>
    set((state) => {
      if (!status) return { statusFilter: status, filteredCampaigns: [] }
      state.applyFilter({ statusFilter: status })
      return { statusFilter: status }
    }),
}))

export const refetchCampaigns = async () => {
  const q = query(
    Campaigns,
    where('adminId', '==', usePersistStore.getState().adminId),
  )
  const snapshot = await getDocs(q)
  const data: ICampaignWithId[] = []
  for (const doc of snapshot.docs) {
    data.push({ ...(doc.data() as ICampaigns), id: doc.id })
  }
  useCampaignStore.getState().setCampaigns(data)
}

export const setActive = async (id: string, active: boolean) => {
  const campaigns: ICampaignWithId[] = [
    ...useCampaignStore.getState().campaigns,
  ]
  const index = campaigns.findIndex((campaign) => campaign.id === id)
  campaigns[index].active = active
  await setDoc(
    doc(Campaigns, id),
    {
      active,
    },
    { merge: true },
  )
  useCampaignStore.setState({ campaigns })
}

export default useCampaignStore
