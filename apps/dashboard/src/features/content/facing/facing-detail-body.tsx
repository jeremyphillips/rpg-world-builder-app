import type { FacingResolution } from '@rpg/contracts'
import { FacingBody, Icon, SemanticText, Text } from '@rpg/ui'

import { ContentTableView } from '../components/tables/content-table-view'

const FACING_INVALID_DETAIL_MESSAGES = {
  'missing-kind': 'This feature is missing a kind.',
  'missing-id': 'This feature is missing an identifier.',
  'host-mismatch': 'This feature does not belong on this detail host.',
} as const

function FacingDetailGuidance({ message }: { message: string }) {
  return (
    <Text variant="caption">
      <SemanticText tone="neutral" emphasis="low" icon={<Icon name="info" size="xs" />}>
        {message}
      </SemanticText>
    </Text>
  )
}

/** Published detail body for one structured facing resolution (no preview chrome). */
export function FacingDetailBody({ resolution }: { resolution: FacingResolution }) {
  if (resolution.status === 'invalid') {
    return <FacingDetailGuidance message={FACING_INVALID_DETAIL_MESSAGES[resolution.code]} />
  }

  if (resolution.status === 'ready') {
    return (
      <FacingBody
        blocks={resolution.document.blocks}
        proseTone="default"
        renderTable={(table) => <ContentTableView table={table} />}
      />
    )
  }

  if (resolution.status === 'incomplete') {
    return (
      <>
        {resolution.document ? (
          <FacingBody
            blocks={resolution.document.blocks}
            proseTone="default"
            renderTable={(table) => <ContentTableView table={table} />}
          />
        ) : null}
        <FacingDetailGuidance message={resolution.guidance} />
      </>
    )
  }

  return <FacingDetailGuidance message={resolution.guidance} />
}
