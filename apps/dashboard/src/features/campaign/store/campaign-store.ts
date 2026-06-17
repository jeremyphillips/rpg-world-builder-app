import { create } from 'zustand'

interface CampaignStore {
  activeCampaignId: string | null
  setActiveCampaignId: (id: string | null) => void
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  activeCampaignId: null,
  setActiveCampaignId: (id) => set({ activeCampaignId: id }),
}))
