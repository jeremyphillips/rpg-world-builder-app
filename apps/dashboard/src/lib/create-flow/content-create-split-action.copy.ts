export const CONTENT_CREATE_FROM_SCRATCH_LABEL = 'Create from scratch' as const
export const CONTENT_CREATE_START_WITH_SETUP_LABEL = 'Start with setup…' as const
export const CONTENT_CREATE_QUICK_CREATE_LABEL = 'Quick create…' as const

export function contentCreateFromScratchDescription(entityLabel: string): string {
  return `Blank ${entityLabel} form`
}

export function contentCreateStartWithSetupDescription(entityLabel: string): string {
  return `Pre-fill the full ${entityLabel} form`
}

export function contentCreateQuickCreateDescription(): string {
  return 'Create with minimal setup'
}
