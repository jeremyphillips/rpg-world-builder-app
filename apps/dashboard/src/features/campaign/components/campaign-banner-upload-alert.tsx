import { Link, useLocation, useParams } from 'react-router-dom'
import { Alert, Button } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

export function CampaignBannerUploadAlert() {
  const location = useLocation()
  const { campaignId } = useParams<{ campaignId: string }>()
  const failed = Boolean(
    location.state && (location.state as { bannerUploadFailed?: boolean }).bannerUploadFailed,
  )

  if (!failed || !campaignId) return null

  return (
    <Alert
      variant="warning"
      title="Banner image not saved"
      description="Your campaign was created, but the banner image was not saved."
      actions={
        <Link
          to={ROUTES.campaign.settings(campaignId)}
          state={{ openMediaManager: true }}
          className="inline-flex"
        >
          <Button type="button" variant="outline">
            Open Campaign settings
          </Button>
        </Link>
      }
    />
  )
}
