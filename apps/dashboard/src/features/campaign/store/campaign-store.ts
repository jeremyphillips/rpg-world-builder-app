import { create } from 'zustand'

interface CampaignStore {
  preferredCampaignId: string | null
  setPreferredCampaignId: (id: string | null) => void
}

export const useCampaignStore = create<CampaignStore>((set) => ({
  preferredCampaignId: null,
  setPreferredCampaignId: (id) => set({ preferredCampaignId: id }),
}))
