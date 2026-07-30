import type { ReactNode } from 'react'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@rpg/ui'

export type StarterActionCardProps = {
  title: string
  description: string
  actions: ReactNode
}

/** Lightweight starter card for dashboard entry-point actions. */
export function StarterActionCard({ title, description, actions }: StarterActionCardProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardFooter className="mt-auto flex flex-wrap gap-2">{actions}</CardFooter>
    </Card>
  )
}
