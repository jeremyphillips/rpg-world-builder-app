import { Link } from 'react-router-dom'
import { buttonVariants, Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@rpg/ui'

type HomebrewHubCardProps = {
  title: string
  description: string
  viewHref: string
  createHref?: string
  showCreate?: boolean
}

/** Hub card with View and optional Create actions. */
export function HomebrewHubCard({
  title,
  description,
  viewHref,
  createHref,
  showCreate = false,
}: HomebrewHubCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto gap-2">
        <Link to={viewHref} className={buttonVariants({ variant: 'outline', size: 'sm' })}>
          View
        </Link>
        {showCreate && createHref ? (
          <Link to={createHref} className={buttonVariants({ size: 'sm' })}>
            Create
          </Link>
        ) : null}
      </CardFooter>
    </Card>
  )
}
