import { Templates } from '@firebase/config'
import type { ITemplates } from '@type/collections'
import { doc, getDocs, query, setDoc, where } from 'firebase/firestore'
import { create } from 'zustand'
import usePersistStore from './usePersistStore'

type ITemplateWithId = ITemplates & { id: string }

type initialState = {
  templates: ITemplateWithId[]
  query: string
  filteredTemplates: ITemplateWithId[]
  setTemplates: (templates: ITemplateWithId[]) => void
  setQuery: (query: string) => void
}

const useTemplateStore = create<initialState>((set) => ({
  templates: [],
  filteredTemplates: [],
  query: '',
  setTemplates: (templates) => set({ templates }),
  setQuery: (query) =>
    set((state) => {
      const filteredTemplates = state.templates.filter((template) => {
        if (template.name && template.description) {
          return (
            template.name.toLowerCase().includes(query.toLowerCase()) ||
            template.description.toLowerCase().includes(query.toLowerCase())
          )
        }
      })
      return { query, filteredTemplates }
    }),
}))

export const refetchTemplates = async () => {
  const q = query(
    Templates,
    where('adminId', '==', usePersistStore.getState().adminId),
  )
  const snapshot = await getDocs(q)
  const data: ITemplateWithId[] = []
  for (const doc of snapshot.docs) {
    data.push({ ...(doc.data() as ITemplates), id: doc.id })
  }
  useTemplateStore.getState().setTemplates(data)
}

export default useTemplateStore
