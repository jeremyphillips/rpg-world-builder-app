import {
  ABILITY_ENTRIES,
  abilityModifier,
  formatSignedModifier,
  getAbilityCompactLabel,
  type Ability,
} from '@rpg/contracts'
import { cn } from '@rpg/ui'
import { forwardRef, type ReactNode } from 'react'

import {
  abilityScoreCardBodyPaddingClasses,
  abilityScoreCardFooterClasses,
  abilityScoreCardHeaderAdornmentClasses,
  abilityScoreCardHeaderClasses,
  abilityScoreCardHeaderLabelClasses,
  abilityScoreCardModifierClasses,
  abilityScoreCardScoreCenteredSlotClasses,
  abilityScoreCardScoreRowVariants,
  abilityScoreCardScoreSlotMinHeightClassesFor,
  abilityScoreCardScoreValueClassesFor,
  abilityScoreCardVariants,
  type AbilityScoreCardScoreLayout,
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
  scoreLayout?: AbilityScoreCardScoreLayout
  /** Overrides the article `aria-label` (e.g. choose trigger copy). */
  ariaLabel?: string
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
      scoreLayout = 'centered',
      ariaLabel,
    },
    ref,
  ) {
    const fullName = ABILITY_ENTRIES[ability].label
    const compactLabel = getAbilityCompactLabel(ability)
    const modifierText =
      typeof value === 'number' ? formatSignedModifier(abilityModifier(value)) : '—'
    const suppressModifier = hideModifier || state === 'dragOver'
    const scoreRow = children ?? (
      <span
        className={cn(
          abilityScoreCardScoreCenteredSlotClasses,
          abilityScoreCardScoreValueClassesFor(size),
        )}
      >
        {value === null ? '—' : value}
      </span>
    )

    return (
      <article
        ref={ref}
        aria-label={ariaLabel ?? fullName}
        className={abilityScoreCardVariants({ state, size, interaction, scoreLayout })}
      >
        <div className={abilityScoreCardBodyPaddingClasses[size]}>
          <div className={abilityScoreCardHeaderClasses}>
            <span aria-hidden className="col-start-1" />
            <span className={abilityScoreCardHeaderLabelClasses}>{compactLabel}</span>
            {headerAdornment ? (
              <div className={abilityScoreCardHeaderAdornmentClasses}>{headerAdornment}</div>
            ) : (
              <span aria-hidden className="col-start-3" />
            )}
          </div>

          <div
            className={cn(
              abilityScoreCardScoreRowVariants({ layout: scoreLayout }),
              abilityScoreCardScoreSlotMinHeightClassesFor(size),
            )}
          >
            {scoreRow}
          </div>

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
