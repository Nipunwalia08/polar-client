import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type PersistStoreType = {
  adminId: string
  companyId: string
  setAdminId: (token: string) => void
  setCompanyId: (companyId: string) => void
}

const usePersistStore = create<PersistStoreType>()(
  persist(
    (set) => ({
      adminId: '',
      companyId: '',
      setAdminId: (token: string) => set({ adminId: token }),
      setCompanyId: (companyId: string) => set({ companyId }),
    }),
    {
      name: 'persist-store',
    },
  ),
)

export default usePersistStore
