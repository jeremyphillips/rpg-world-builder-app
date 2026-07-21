import { useParams } from 'react-router-dom'
import { DataTable } from '@rpg/ui'
import type { CharacterClass } from '@rpg/contracts'

import { ROUTES } from '@/app/routes'
import {
  formatContentCreateHeading,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
  getContentTypeMidSentenceLabel,
} from '@/features/content/lib/content-type-labels'
import { useClasses } from '../hooks/use-classes'
import { classColumns, classFilters } from '../lib/classes-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewRowActions } from '../../lib/overview/content-overview-row-actions'

function ClassRowActions({ row, campaignId }: { row: CharacterClass; campaignId: string }) {
  return (
    <ContentOverviewRowActions
      campaignId={campaignId}
      editHref={ROUTES.content.classes.edit(campaignId, row.id)}
      enabled={true}
      onToggleEnabled={() => {}}
      itemLabel={getContentTypeMidSentenceLabel('classes')}
    />
  )
}

export function ClassesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('classes')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.classes.create(campaignId)}
      newLabel={formatContentCreateHeading('classes')}
    >
      <DataTable
        columns={classColumns(campaignId)}
        data={classes}
        filters={classFilters}
        rowActions={(row) => <ClassRowActions row={row} campaignId={campaignId} />}
        caption={formatContentOverviewCaption('classes', 'Character')}
      />
    </ContentOverviewShell>
  )
}
