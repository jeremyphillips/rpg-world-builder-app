import { Link } from 'react-router-dom'
import { ActionIcon, buttonVariants, cn } from '@rpg/ui'

export interface ContentDetailEditActionProps {
  to: string
}

export function ContentDetailEditAction({ to }: ContentDetailEditActionProps) {
  return (
    <Link
      to={to}
      className={cn(
        buttonVariants({ variant: 'outline', size: 'sm' }),
        'inline-flex items-center gap-2',
      )}
    >
      <ActionIcon action="edit" step="sm" aria-hidden />
      Edit
    </Link>
  )
}
