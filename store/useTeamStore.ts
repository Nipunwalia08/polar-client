import type { ITeamMember } from '@type/collections'
import { create } from 'zustand'

type TeamStore = {
  team: ITeamMember[]
  setTeam: (team: ITeamMember[]) => void
}

const useTeamStore = create<TeamStore>((set) => ({
  team: [],
  setTeam: (team) => set({ team }),
}))

export default useTeamStore
