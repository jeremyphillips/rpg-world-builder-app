import { cn } from '@rpg/ui'

export {
  createTabComposerReviewClasses as buildingOrganizationsComposerClasses,
  createTabComposerStackClasses as buildingOrganizationsComposerHeadingClasses,
  createTabDiscoveryBodyClasses as buildingOrganizationsDiscoveryBodyClasses,
  createTabDiscoveryControlsClasses as buildingOrganizationsDiscoveryControlsClasses,
  createTabDiscoveryCreateActionClasses as buildingOrganizationsDiscoveryCreateActionClasses,
  createTabDiscoveryListClasses as buildingOrganizationsDiscoveryListClasses,
  createTabDiscoveryStackClasses as buildingOrganizationsDiscoveryClasses,
  createTabIntroClasses as buildingOrganizationsTabIntroClasses,
  createTabPanelStackClasses as buildingOrganizationsCreateTabClasses,
  createTabStageSubheadingClasses as buildingOrganizationsStageSubheadingClasses,
} from '@/lib/create-flow/create-tab-content.variants'

export const buildingOrganizationsComposerSummaryRowsClasses = cn('flex flex-col')

export const buildingOrganizationsIssueListClasses = cn(
  'list-disc space-y-1 pl-5 text-sm text-destructive',
)

export const buildingOrganizationsChooseExistingClasses = cn('')
