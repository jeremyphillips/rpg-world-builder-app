import { ActionButton } from '@rpg/ui'

type ChoiceAddActionProps = {
  compactAddLabel: string
  isFull: boolean
  onClick: () => void
}

export function ChoiceAddAction({ compactAddLabel, isFull, onClick }: ChoiceAddActionProps) {
  return (
    <ActionButton
      action={isFull ? 'edit' : 'add'}
      variant="text"
      tone="accent"
      density="compact"
      onClick={onClick}
    >
      {compactAddLabel}
    </ActionButton>
  )
}
