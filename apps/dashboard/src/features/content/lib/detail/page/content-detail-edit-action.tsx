import { Link } from 'react-router-dom'
import { ActionIcon } from '@rpg/ui'

import { pageChromeOutlineActionClasses } from '@/components/layout/page-chrome/page-chrome-action.variants'

export interface ContentDetailEditActionProps {
  to: string
}

export function ContentDetailEditAction({ to }: ContentDetailEditActionProps) {
  return (
    <Link to={to} className={pageChromeOutlineActionClasses}>
      <ActionIcon action="edit" step="sm" aria-hidden />
      Edit
    </Link>
  )
}
