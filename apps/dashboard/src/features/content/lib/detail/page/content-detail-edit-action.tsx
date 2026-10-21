import { Link } from 'react-router-dom'
import { ActionIcon, ButtonLink } from '@rpg/ui'

export interface ContentDetailEditActionProps {
  to: string
}

export function ContentDetailEditAction({ to }: ContentDetailEditActionProps) {
  return (
    <ButtonLink
      link={<Link to={to} />}
      variant="outline"
      size="sm"
      density="compact"
      className="inline-flex items-center"
    >
      <ActionIcon action="edit" step="sm" aria-hidden />
      Edit
    </ButtonLink>
  )
}
