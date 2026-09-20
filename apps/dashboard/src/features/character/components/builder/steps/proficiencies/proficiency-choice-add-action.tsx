import { Button } from '@rpg/ui'
import { Pencil, Plus } from 'lucide-react'

type ProficiencyChoiceAddActionProps = {
  compactAddLabel: string
  isFull: boolean
  onClick: () => void
}

export function ProficiencyChoiceAddAction({
  compactAddLabel,
  isFull,
  onClick,
}: ProficiencyChoiceAddActionProps) {
  return (
    <Button type="button" variant="text" tone="accent" density="compact" onClick={onClick}>
      {isFull ? <Pencil aria-hidden /> : <Plus aria-hidden />}
      {compactAddLabel}
    </Button>
  )
}
