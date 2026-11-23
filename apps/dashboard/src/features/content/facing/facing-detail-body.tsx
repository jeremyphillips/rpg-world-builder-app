import { facingInvalidMessage, type FacingResolution } from '@rpg/contracts'
import { FacingBody, Icon, SemanticText, Text } from '@rpg/ui'

import { ContentTableView } from '../components/tables/content-table-view'

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
    return <FacingDetailGuidance message={facingInvalidMessage(resolution.code, 'detail')} />
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
