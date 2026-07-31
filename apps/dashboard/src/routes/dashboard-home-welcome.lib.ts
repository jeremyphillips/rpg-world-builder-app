export type DashboardWelcomeState = 'empty' | 'campaigns_only' | 'characters_only' | 'active'

const DASHBOARD_WELCOME_COPY = {
  empty: {
    titlePrefix: 'Welcome',
    body: 'Start by creating a campaign or building a character of your own.',
  },
  campaigns_only: {
    titlePrefix: 'Welcome back',
    body: 'Continue a campaign or create your first character.',
  },
  characters_only: {
    titlePrefix: 'Welcome back',
    body: 'Continue building your characters or start a campaign.',
  },
  active: {
    titlePrefix: 'Welcome back',
    body: 'Continue where you left off.',
  },
} as const satisfies Record<DashboardWelcomeState, { titlePrefix: string; body: string }>

export function resolveDashboardWelcomeState(input: {
  hasCampaigns: boolean
  hasCharacters: boolean
}): DashboardWelcomeState {
  if (!input.hasCampaigns && !input.hasCharacters) return 'empty'
  if (input.hasCampaigns && !input.hasCharacters) return 'campaigns_only'
  if (!input.hasCampaigns && input.hasCharacters) return 'characters_only'
  return 'active'
}

export function resolveDashboardWelcomeCopy(input: {
  hasCampaigns: boolean
  hasCharacters: boolean
  displayName?: string | null
}): { title: string; body: string } {
  const state = resolveDashboardWelcomeState(input)
  const copy = DASHBOARD_WELCOME_COPY[state]
  const title = input.displayName ? `${copy.titlePrefix}, ${input.displayName}` : copy.titlePrefix

  return { title, body: copy.body }
}
