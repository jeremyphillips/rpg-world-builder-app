import type { ReactNode } from 'react'
import { Card } from '@rpg/ui'

export type StarterActionCardProps = {
  title: string
  description: string
  actions: ReactNode
}

/** Lightweight starter card for dashboard entry-point actions. */
export function StarterActionCard({ title, description, actions }: StarterActionCardProps) {
  return <Card stretch header={{ title, description }} footer={actions} />
}
