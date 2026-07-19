'use client'

import { Link } from 'react-router-dom'
import { buttonVariants, Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@rpg/ui'

import { ROUTES } from '@/app/routes'

import type { CharacterCardViewModel } from '../lib/character-display'

export type CharacterListCardProps = {
  card: CharacterCardViewModel
}

/** Roster card for a standalone PC — name, summary line, and detail link. */
export function CharacterListCard({ card }: CharacterListCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{card.name}</CardTitle>
        <CardDescription>{card.summary}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto">
        <Link
          to={ROUTES.characters.detail(card.id)}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          View
        </Link>
      </CardFooter>
    </Card>
  )
}
