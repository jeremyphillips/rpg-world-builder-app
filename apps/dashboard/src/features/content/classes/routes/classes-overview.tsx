import { useParams } from 'react-router-dom'
import type { CharacterClass, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCreateHeading,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useClasses } from '../hooks/use-classes'
import { classColumns, classFilterSchema } from '../lib/classes-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table.client'

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
      <ContentOverviewTable<WithCampaignAccess<CharacterClass>>
        contentTypeKey="classes"
        campaignId={campaignId}
        columns={
          classColumns(campaignId) as ColumnDef<WithCampaignAccess<CharacterClass>, unknown>[]
        }
        filterSchema={classFilterSchema}
        data={classes as WithCampaignAccess<CharacterClass>[]}
        caption={formatContentOverviewCaption('classes', 'Character')}
        getEditHref={(row) => ROUTES.content.classes.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
