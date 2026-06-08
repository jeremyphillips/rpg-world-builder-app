import { useParams } from 'react-router-dom'

/** Placeholder detail route so post-create navigation resolves. */
export function CampaignDetail() {
  const { campaignId } = useParams<{ campaignId: string }>()

  return (
    <div className="mx-auto max-w-3xl space-y-2">
      <h2 className="text-2xl font-semibold tracking-tight">Campaign</h2>
      <p className="text-muted-foreground">Campaign ID: {campaignId}</p>
    </div>
  )
}
