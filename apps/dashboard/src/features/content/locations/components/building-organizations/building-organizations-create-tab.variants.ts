import { cn } from '@rpg/ui'

export {
  createTabDiscoveryBodyClasses as buildingOrganizationsDiscoveryBodyClasses,
  createTabDiscoveryControlsClasses as buildingOrganizationsDiscoveryControlsClasses,
  createTabDiscoveryCreateActionClasses as buildingOrganizationsDiscoveryCreateActionClasses,
  createTabDiscoveryListClasses as buildingOrganizationsDiscoveryListClasses,
  createTabIntroClasses as buildingOrganizationsTabIntroClasses,
  createTabPanelStackClasses as buildingOrganizationsCreateTabClasses,
} from '@/lib/create-flow'

export const buildingOrganizationsIssueListClasses = cn(
  'list-disc space-y-1 pl-5 text-sm text-destructive',
)
