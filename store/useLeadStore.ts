import { Customer } from '@firebase/config'
import type { ILead } from '@type/collections'
import { getDocs, query, where } from 'firebase/firestore'
import { create } from 'zustand'
import usePersistStore from './usePersistStore'

export type ILeadSelect = ILead & { select: boolean }

interface ILeadStore {
  leads: ILeadSelect[]
  addLead: (lead: ILead) => void
  selectLead: (id: string) => void
  selectAll: () => void
}

const useLeadStore = create<ILeadStore>((set) => ({
  leads: [],
  addLead: (lead) =>
    set((state) => ({
      leads: [...state.leads, { ...lead, select: true }],
    })),
  selectLead: (id: string) =>
    set((state) => ({
      leads: state.leads.map((lead) =>
        lead.id === id ? { ...lead, select: !lead.select } : lead,
      ),
    })),
  selectAll: () =>
    set((state) => ({
      leads: state.leads.map((lead) => ({
        ...lead,
        select:
          state.leads.filter((lead) => lead.select === false).length !== 0,
      })),
    })),
}))

export const fetchLeads = async (selectedLeads?: string[]) => {
  const q = query(
    Customer,
    where('adminId', '==', usePersistStore.getState().adminId),
  )
  const leads = await getDocs(q)
  const leadsData = leads.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    select: selectedLeads?.includes(doc.id) || false,
  })) as ILeadSelect[]
  useLeadStore.setState({ leads: leadsData })
}

export default useLeadStore
