import type { CampaignAvailabilityPresentation } from '@/lib/campaign-availability/campaign-availability-form-fields'

import type { ContentIdentityLayout } from '../fields/content-identity-form-fields'

export const CONTENT_FORM_IDENTITY_LAYOUT_INLINE = 'inline' satisfies ContentIdentityLayout
export const CONTENT_FORM_IDENTITY_LAYOUT_STACKED = 'stacked' satisfies ContentIdentityLayout
export const CONTENT_FORM_AVAILABILITY_PRESENTATION_DIALOG =
  'dialog' satisfies CampaignAvailabilityPresentation
export const CONTENT_FORM_AVAILABILITY_PRESENTATION_DISCLOSURE =
  'disclosure' satisfies CampaignAvailabilityPresentation
