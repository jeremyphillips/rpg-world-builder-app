import { Heading, Spinner, Text } from '@rpg/ui'

import { NarrowPage } from '@/components/layout/page/narrow-page'

import { DashboardHomeSections } from './dashboard-home-sections'
import { DashboardHomeStarterCards } from './dashboard-home-starter-cards'
import { useDashboardHomeViewModel } from './use-dashboard-home-view-model'

export function DashboardHome() {
  const {
    isPending,
    welcome,
    sections,
    campaignsError,
    showAllCampaignsLink,
    campaignRowsPresent,
  } = useDashboardHomeViewModel()

  if (isPending) {
    return (
      <NarrowPage>
        <div className="flex justify-center">
          <Spinner />
        </div>
      </NarrowPage>
    )
  }

  return (
    <NarrowPage rhythm="relaxed">
      <div className="space-y-1">
        <Heading variant="page" as="h1">
          {welcome.title}
        </Heading>
        {welcome.body ? <Text variant="muted">{welcome.body}</Text> : null}
      </div>

      <DashboardHomeSections
        sections={sections}
        campaignsError={campaignsError}
        showAllCampaignsLink={showAllCampaignsLink}
      />

      {sections.some((section) => section.kind === 'starterCards') ? (
        <DashboardHomeStarterCards hasCampaignRows={campaignRowsPresent} />
      ) : null}
    </NarrowPage>
  )
}
