import { UserRound } from 'lucide-react'
import { Link } from 'react-router-dom'
import { Text } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import {
  PERSONAL_WORKSPACE_TOPBAR_LABEL,
  personalWorkspaceTopbarTitleClasses,
} from './personal-workspace-topbar-title.variants'

/** Linked personal workspace title for non-campaign dashboard routes. */
export function PersonalWorkspaceTopbarTitle() {
  return (
    <Link to={ROUTES.home} className={personalWorkspaceTopbarTitleClasses.root}>
      <UserRound aria-hidden className={personalWorkspaceTopbarTitleClasses.icon} />
      <Text as="span" className={personalWorkspaceTopbarTitleClasses.label}>
        {PERSONAL_WORKSPACE_TOPBAR_LABEL}
      </Text>
    </Link>
  )
}
