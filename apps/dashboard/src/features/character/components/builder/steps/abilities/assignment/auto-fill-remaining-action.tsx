import { Button } from '@rpg/ui'

import { abilityRecommendationCalloutActionClasses } from '../recommendation/ability-recommendation.variants'

export type AutoFillRemainingActionProps = {
  label: string
  onAutoFill: () => void
}

/** MVP: single strategy button; future: dropdown trigger for multiple fill strategies. */
export function AutoFillRemainingAction({ label, onAutoFill }: AutoFillRemainingActionProps) {
  return (
    <Button
      type="button"
      variant="link"
      size="sm"
      className={abilityRecommendationCalloutActionClasses}
      onClick={onAutoFill}
    >
      {label}
    </Button>
  )
}
