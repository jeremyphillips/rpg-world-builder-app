import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import { EXPANDED_MEDIA_FIELD_PRESENTATION, ManagedMediaField } from '@/features/media'

type CampaignSettingsIdentityMediaFieldProps = {
  campaignId: string
}

/** Opens the identity media manager once when routed from a failed banner upload alert. */
export function CampaignSettingsIdentityMediaField({
  campaignId,
}: CampaignSettingsIdentityMediaFieldProps) {
  const location = useLocation()
  const navigate = useNavigate()
  const handledOpenRef = useRef(false)
  const shouldOpenMediaManager = Boolean(
    location.state && (location.state as { openMediaManager?: boolean }).openMediaManager,
  )

  useEffect(() => {
    if (!shouldOpenMediaManager || handledOpenRef.current) return
    handledOpenRef.current = true
    navigate(location.pathname, { replace: true, state: null })
  }, [location.pathname, navigate, shouldOpenMediaManager])

  return (
    <ManagedMediaField
      config={{
        domain: 'campaign',
        presentation: EXPANDED_MEDIA_FIELD_PRESENTATION,
      }}
      scope={{ kind: 'campaign-identity', campaignId }}
      name="media"
      label="Campaign images"
      initialOpen={shouldOpenMediaManager}
    />
  )
}
