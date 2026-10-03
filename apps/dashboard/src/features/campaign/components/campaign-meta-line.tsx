import { InlineMetadata, StatusDot, Text, heroMetaClasses } from '@rpg/ui'

import { buildCampaignMetaSegments, type CampaignMeta } from '../lib/campaign-meta.lib'

export type CampaignMetaLineProps = {
  meta: CampaignMeta
  includeRecency: boolean
  countsPending?: boolean
}

export function CampaignMetaLine({ meta, includeRecency, countsPending }: CampaignMetaLineProps) {
  const segments = buildCampaignMetaSegments(meta, { includeRecency, countsPending })

  return (
    <Text variant="muted" className={heroMetaClasses} as="span">
      <InlineMetadata role="supporting" density="comfortable" wrap>
        {segments.map((segment, index) => (
          <InlineMetadata.Item key={`${segment.kind}-${index}`}>
            {segment.kind === 'status' ? (
              <>
                <StatusDot tone={meta.statusTone} />
                {segment.text}
              </>
            ) : (
              segment.text
            )}
          </InlineMetadata.Item>
        ))}
      </InlineMetadata>
    </Text>
  )
}
