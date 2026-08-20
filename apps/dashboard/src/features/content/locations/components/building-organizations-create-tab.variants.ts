import { cn } from '@rpg/ui'

export {
  createTabComposerReviewClasses as buildingOrganizationsComposerClasses,
  createTabComposerStackClasses as buildingOrganizationsComposerHeadingClasses,
  createTabDiscoveryBodyClasses as buildingOrganizationsDiscoveryBodyClasses,
  createTabDiscoveryControlsClasses as buildingOrganizationsDiscoveryControlsClasses,
  createTabDiscoveryCreateActionClasses as buildingOrganizationsDiscoveryCreateActionClasses,
  createTabDiscoveryListClasses as buildingOrganizationsDiscoveryListClasses,
  createTabIntroClasses as buildingOrganizationsTabIntroClasses,
  createTabPanelStackClasses as buildingOrganizationsCreateTabClasses,
} from '@/lib/create-flow/create-tab-content.variants'

export const buildingOrganizationsComposerSummaryRowsClasses = cn('flex flex-col')

export const buildingOrganizationsIssueListClasses = cn(
  'list-disc space-y-1 pl-5 text-sm text-destructive',
)

/** 2px — stage heading row to helper copy. */
export const buildingOrganizationsStageSubheadingClasses = cn('flex flex-col gap-0.5')

/** 10px — stage subheading block to stage body (search, form, …). */
export const buildingOrganizationsStageStackClasses = cn('flex flex-col gap-2.5')

/** Heading row with optional trailing stage action (Choose existing, …). */
export const buildingOrganizationsStageHeadingRowClasses = cn(
  'flex items-center justify-between gap-2',
)
