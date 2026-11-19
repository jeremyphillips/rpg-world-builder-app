import type { DisplayConfig } from '@rpg/ui/form'

export const MECHANICS_LEAD_COPY =
  'Choose a rules-era preset to quickly configure core mechanics. You can customize individual mechanics after choosing a preset.'

export const MECHANICS_LEAD_COPY_DISPLAY: DisplayConfig = {
  kind: 'display',
  id: 'mechanics-lead-copy',
  content: {
    variant: 'text',
    text: MECHANICS_LEAD_COPY,
    role: 'muted',
  },
}
