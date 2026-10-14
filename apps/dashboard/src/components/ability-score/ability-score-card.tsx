import {
  ABILITY_ENTRIES,
  abilityModifier,
  formatSignedModifier,
  getAbilityCompactLabel,
  type Ability,
} from '@rpg/contracts'
import { cn, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'
import { forwardRef, type ReactNode } from 'react'

import {
  abilityScoreCardBodyPaddingClasses,
  abilityScoreCardFooterClasses,
  abilityScoreCardHeaderAdornmentClasses,
  abilityScoreCardHeaderClasses,
  abilityScoreCardModifierClasses,
  abilityScoreCardScoreRowClasses,
  abilityScoreCardVariants,
  type AbilityScoreCardState,
} from './ability-score-card.variants'

export type AbilityScoreCardProps = {
  ability: Ability
  value: number | null
  size?: 'sm' | 'md'
  footer?: ReactNode
  state?: AbilityScoreCardState
  headerAdornment?: ReactNode
  className?: string
  children?: ReactNode
  hideModifier?: boolean
  restingHover?: boolean
}

export const AbilityScoreCard = forwardRef<HTMLElement, AbilityScoreCardProps>(
  function AbilityScoreCard(
    {
      ability,
      value,
      size = 'md',
      footer,
      state = 'resting',
      headerAdornment,
      className,
      children,
      hideModifier = false,
      restingHover = false,
    },
    ref,
  ) {
    const fullName = ABILITY_ENTRIES[ability].label
    const compactLabel = getAbilityCompactLabel(ability)
    const modifierText =
      typeof value === 'number' ? formatSignedModifier(abilityModifier(value)) : '—'
    const suppressModifier = hideModifier || state === 'dragOver'

    return (
      <article
        ref={ref}
        aria-label={fullName}
        className={cn(abilityScoreCardVariants({ state, size, restingHover }), className)}
      >
        <div className={abilityScoreCardBodyPaddingClasses[size]}>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className={abilityScoreCardHeaderClasses}>
                  {compactLabel}
                  {headerAdornment ? (
                    <div className={abilityScoreCardHeaderAdornmentClasses}>{headerAdornment}</div>
                  ) : null}
                </div>
              </TooltipTrigger>
              <TooltipContent>{fullName}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <div className={abilityScoreCardScoreRowClasses}>{children}</div>

          {suppressModifier ? null : (
            <p className={abilityScoreCardModifierClasses} aria-live="polite">
              <span className="sr-only">Modifier </span>
              {modifierText}
            </p>
          )}
        </div>
        {footer ? <div className={abilityScoreCardFooterClasses}>{footer}</div> : null}
      </article>
    )
  },
)
