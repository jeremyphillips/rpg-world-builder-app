import { Button } from '@rpg/ui'

export type AutoFillRemainingActionProps = {
  label: string
  onAutoFill: () => void
}

/** MVP: single strategy button; future: dropdown trigger for multiple fill strategies. */
export function AutoFillRemainingAction({ label, onAutoFill }: AutoFillRemainingActionProps) {
  return (
    <Button type="button" variant="text" size="sm" className="font-normal" onClick={onAutoFill}>
      {label}
    </Button>
  )
}
