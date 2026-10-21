import { Link } from 'react-router-dom'
import { ButtonLink, Card } from '@rpg/ui'

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
    <Card
      stretch
      header={{ title, description }}
      footer={
        <>
          <ButtonLink link={<Link to={viewHref} />} variant="outline" size="sm">
            View
          </ButtonLink>
          {showCreate && createHref ? (
            <ButtonLink link={<Link to={createHref} />} size="sm">
              Create
            </ButtonLink>
          ) : null}
        </>
      }
    />
  )
}
