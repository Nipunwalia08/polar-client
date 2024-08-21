import { CampaignFlows } from '@firebase/config'
import { doc, getDoc, query } from 'firebase/firestore'
import { create } from 'zustand'
import usePersistStore from './usePersistStore'

type FlowItemType = {
  days: number | ''
  template: string
  fileUrl?: string | ''
}

export enum FlowKeys {
  campaignFlow = 'campaignFlow',
  idleFlow = 'idleFlow',
  notInterestedFlow = 'notInterestedFlow',
}

interface CampaignFlowStore {
  campaignFlow: FlowItemType[]
  idleFlow: FlowItemType[]
  notInterestedFlow: FlowItemType[]
  setFlow: (flowName: FlowKeys, index: number, flow: FlowItemType) => void
  insertFlow: (flowName: FlowKeys) => void
  deleteFlow: (flowName: FlowKeys, index: number) => void
}

const useCampaignFlowStore = create<CampaignFlowStore>((set) => ({
  campaignFlow: [{ days: '', template: '', fileUrl: '' }],
  idleFlow: [{ days: '', template: '', fileUrl: '' }],
  notInterestedFlow: [{ days: '', template: '', fileUrl: '' }],
  setFlow: (flowName, index, flow) => {
    set((state) => ({
      [flowName]: state[flowName].map((item, i) => (i === index ? flow : item)),
    }))
  },
  insertFlow: (flowName) => {
    set((state) => ({
      [flowName]: [...state[flowName], { days: '', template: '' }],
    }))
  },
  deleteFlow: (flowName, index) => {
    set((state) => ({
      [flowName]: state[flowName].filter((_, i) => i !== index),
    }))
  },
}))

export const refetchCampaignFlow = async () => {
  const flow = await getDoc(
    doc(CampaignFlows, usePersistStore.getState().adminId),
  )
  if (flow.exists()) {
    const data = flow.data()
    const campaignFlow: Record<FlowKeys, FlowItemType[]> = {
      campaignFlow: data.campaignFlow || [{ days: '', template: '' }],
      idleFlow: data.idleFlow || [{ days: '', template: '' }],
      notInterestedFlow: data.notInterestedFlow || [{ days: '', template: '' }],
    }
    useCampaignFlowStore.setState(campaignFlow)
  }
}

export default useCampaignFlowStore
