'use client'

import { Link } from 'lucide-react'
import { Button, Text } from '@rpg/ui'

export type ProficiencyEquipmentLinkCueProps = {
  message: string
  onNavigate?: () => void
  navigateLabel?: string
}

export function ProficiencyEquipmentLinkCue({
  message,
  onNavigate,
  navigateLabel = 'View',
}: ProficiencyEquipmentLinkCueProps) {
  if (!message.trim()) return null

  return (
    <div className="flex items-start gap-2">
      <Link className="mt-0.5 size-4 shrink-0 text-muted-foreground" aria-hidden />
      <div className="space-y-1">
        <Text variant="muted" className="text-sm">
          {message}
        </Text>
        {onNavigate ? (
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0"
            onClick={onNavigate}
          >
            {navigateLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
