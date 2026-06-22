import { Link } from 'react-router-dom'
import { buttonVariants } from '@rpg/ui'

export interface ContentDetailEditActionProps {
  to: string
}

export function ContentDetailEditAction({ to }: ContentDetailEditActionProps) {
  return (
    <Link to={to} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
      Edit
    </Link>
  )
}
