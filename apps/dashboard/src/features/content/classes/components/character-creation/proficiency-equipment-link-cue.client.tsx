'use client'

import { Link } from 'lucide-react'
import { Button, Text } from '@rpg/ui'

import {
  formatProficiencyLinkEquipmentCue,
  formatProficiencyLinkProficiencyCue,
} from '../../lib/character-creation/class-character-creation-link-labels'

export type ProficiencyEquipmentLinkCueProps = {
  variant: 'equipment' | 'proficiency'
  choiceLabel: string
  packageLabel?: string
  onNavigate?: () => void
}

export function ProficiencyEquipmentLinkCue({
  variant,
  choiceLabel,
  packageLabel,
  onNavigate,
}: ProficiencyEquipmentLinkCueProps) {
  const message =
    variant === 'equipment'
      ? formatProficiencyLinkEquipmentCue(choiceLabel)
      : packageLabel
        ? formatProficiencyLinkProficiencyCue(packageLabel)
        : ''

  if (!message) return null

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
            {variant === 'equipment' ? 'View choice' : 'View grant'}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
