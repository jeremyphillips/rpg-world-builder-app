import { useParams } from 'react-router-dom'
import type { ClassListItem, WithCampaignAccess } from '@rpg/contracts'
import type { ColumnDef } from '@rpg/ui'

import { ROUTES } from '@/app/routes'
import {
  formatContentCreateHeading,
  formatContentOverviewCaption,
  getContentTypeCollectionLabel,
} from '@/features/content/lib/content-type-labels'
import { useClasses, useClassesUsageMeta } from '../hooks/use-classes'
import { classColumns, classFilterSchema } from '../lib/classes-overview-columns'
import { ContentOverviewShell } from '../../lib/overview/content-overview-shell'
import { ContentOverviewTable } from '../../lib/overview/content-overview-table'

export function ClassesOverview() {
  const { campaignId = '' } = useParams<{ campaignId: string }>()
  const { data: classes = [], isPending, isError } = useClasses(campaignId)
  const { data: usageMeta } = useClassesUsageMeta(campaignId)
  const usageSummaryLabels = usageMeta?.usageSummaryLabels
  const overviewUsageScope = usageMeta?.overviewUsageScope

  return (
    <ContentOverviewShell
      heading={getContentTypeCollectionLabel('classes')}
      campaignId={campaignId}
      isPending={isPending}
      isError={isError}
      newHref={ROUTES.content.classes.create(campaignId)}
      newLabel={formatContentCreateHeading('classes')}
    >
      <ContentOverviewTable<WithCampaignAccess<ClassListItem>>
        contentTypeKey="classes"
        campaignId={campaignId}
        columns={
          classColumns(campaignId, { usageSummaryLabels, overviewUsageScope }) as ColumnDef<
            WithCampaignAccess<ClassListItem>,
            unknown
          >[]
        }
        filterSchema={classFilterSchema}
        data={classes as WithCampaignAccess<ClassListItem>[]}
        caption={formatContentOverviewCaption('classes', 'Character')}
        getEditHref={(row) => ROUTES.content.classes.edit(campaignId, row.id)}
      />
    </ContentOverviewShell>
  )
}
