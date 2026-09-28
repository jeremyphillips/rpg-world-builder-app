import { Fragment } from 'react'
import { StatusDot, Text, heroMetaClasses } from '@rpg/ui'

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
      {segments.map((segment, index) => (
        <Fragment key={`${segment.kind}-${index}`}>
          {index > 0 ? ' · ' : null}
          {segment.kind === 'status' ? (
            <>
              <StatusDot tone={meta.statusTone} />
              {segment.text}
            </>
          ) : (
            segment.text
          )}
        </Fragment>
      ))}
    </Text>
  )
}
