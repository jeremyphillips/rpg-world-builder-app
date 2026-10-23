import { Button, Icon, Text } from '@rpg/ui'

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
    <div className="flex items-start gap-2 text-sm">
      <Icon name="link" size="inline" className="mt-0.5 shrink-0 text-muted-foreground" />
      <div className="space-y-1">
        <Text variant="supporting">{message}</Text>
        {onNavigate ? (
          <Button type="button" variant="text" tone="accent" size="sm" onClick={onNavigate}>
            {navigateLabel}
          </Button>
        ) : null}
      </div>
    </div>
  )
}
