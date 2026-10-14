import {
  ABILITY_ENTRIES,
  abilityModifier,
  formatSignedModifier,
  getAbilityCompactLabel,
  type Ability,
} from '@rpg/contracts'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@rpg/ui'
import { cn } from '@rpg/ui'
import { forwardRef, type ReactNode } from 'react'

import {
  abilityScoreCardBodyPaddingClasses,
  abilityScoreCardFooterClasses,
  abilityScoreCardHeaderAdornmentClasses,
  abilityScoreCardHeaderClasses,
  abilityScoreCardModifierClasses,
  abilityScoreCardScoreCenterClasses,
  abilityScoreCardScoreRowClasses,
  abilityScoreCardScoreValueClassesFor,
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
  children?: ReactNode
  hideModifier?: boolean
  interaction?: 'none' | 'select' | 'numeric'
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
      children,
      hideModifier = false,
      interaction = 'none',
    },
    ref,
  ) {
    const fullName = ABILITY_ENTRIES[ability].label
    const compactLabel = getAbilityCompactLabel(ability)
    const modifierText =
      typeof value === 'number' ? formatSignedModifier(abilityModifier(value)) : '—'
    const suppressModifier = hideModifier || state === 'dragOver'
    const scoreRow = children ?? (
      <>
        <span aria-hidden />
        <span
          className={cn(
            abilityScoreCardScoreCenterClasses,
            abilityScoreCardScoreValueClassesFor(size),
          )}
        >
          {value === null ? '—' : value}
        </span>
        <span aria-hidden />
      </>
    )

    return (
      <article
        ref={ref}
        aria-label={fullName}
        className={abilityScoreCardVariants({ state, size, interaction })}
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

          <div className={abilityScoreCardScoreRowClasses}>{scoreRow}</div>

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
