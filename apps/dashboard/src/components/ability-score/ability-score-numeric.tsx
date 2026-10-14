'use client'

import { ABILITY_ENTRIES, type Ability } from '@rpg/contracts'
import { cn, NumberStepperStepButton } from '@rpg/ui'
import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react'

import { AbilityScoreCard } from './ability-score-card'
import {
  abilityScoreCardScoreCenterClasses,
  abilityScoreCardScoreValueClasses,
  abilityScoreCardStepperButtonAppearance,
  abilityScoreCardStepperButtonSize,
  abilityScoreCardStepperStackClasses,
  type AbilityScoreCardState,
} from './ability-score-card.variants'

export type AbilityScoreNumericProps = {
  ability: Ability
  value: number | null
  min: number
  max: number
  onCommit: (value: number | null) => void
  clearable?: boolean
  disabled?: boolean
  size?: 'sm' | 'md'
  state?: AbilityScoreCardState
  footer?: ReactNode
  headerAdornment?: ReactNode
  invalid?: boolean
}

function parseDraftInteger(draft: string): number | null {
  const trimmed = draft.trim()
  if (trimmed === '') return null
  if (!/^-?\d+$/.test(trimmed)) return null
  return Number(trimmed)
}

export function AbilityScoreNumeric({
  ability,
  value,
  min,
  max,
  onCommit,
  clearable = false,
  disabled = false,
  size = 'md',
  state = 'resting',
  footer,
  headerAdornment,
  invalid = false,
}: AbilityScoreNumericProps) {
  const fullName = ABILITY_ENTRIES[ability].label
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const skipBlurCommitRef = useRef(false)

  const displayValue = value
  const outOfRange = typeof displayValue === 'number' && (displayValue < min || displayValue > max)
  const ariaInvalid = invalid || outOfRange

  useEffect(() => {
    if (!editing) {
      setDraft(displayValue === null ? '' : String(displayValue))
    }
  }, [displayValue, editing])

  const commitDraft = useCallback(() => {
    const parsed = parseDraftInteger(draft)
    if (parsed === null) {
      if (clearable && draft.trim() === '') {
        if (value !== null) onCommit(null)
      }
      setDraft(displayValue === null ? '' : String(displayValue))
      setEditing(false)
      return
    }
    if (parsed < min || parsed > max) {
      setDraft(displayValue === null ? '' : String(displayValue))
      setEditing(false)
      return
    }
    if (parsed !== value) onCommit(parsed)
    setEditing(false)
  }, [clearable, displayValue, draft, max, min, onCommit, value])

  const beginEditing = useCallback(() => {
    if (disabled) return
    setDraft(displayValue === null ? '' : String(displayValue))
    setEditing(true)
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      inputRef.current?.select()
    })
  }, [disabled, displayValue])

  const handleScoreKeyDown = (event: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      beginEditing()
    }
  }

  const handleInputKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      commitDraft()
      inputRef.current?.blur()
    }
    if (event.key === 'Escape') {
      event.preventDefault()
      skipBlurCommitRef.current = true
      setDraft(displayValue === null ? '' : String(displayValue))
      setEditing(false)
      inputRef.current?.blur()
    }
  }

  const handleInputBlur = () => {
    if (skipBlurCommitRef.current) {
      skipBlurCommitRef.current = false
      return
    }
    commitDraft()
  }

  const step = (direction: 'increase' | 'decrease') => {
    if (typeof value !== 'number') return
    const next = direction === 'increase' ? value + 1 : value - 1
    if (next !== value) onCommit(next)
  }

  const resolveStepDisabled = (direction: 'increase' | 'decrease') => {
    if (disabled || typeof value !== 'number') return true
    if (value >= min && value <= max) {
      return direction === 'increase' ? value >= max : value <= min
    }
    if (value > max) {
      return direction === 'increase'
    }
    if (value < min) {
      return direction === 'decrease'
    }
    return true
  }

  const scoreCell = editing ? (
    <input
      ref={inputRef}
      type="text"
      inputMode="numeric"
      aria-label={`${fullName} score`}
      aria-invalid={ariaInvalid || undefined}
      className={cn(
        abilityScoreCardScoreCenterClasses,
        abilityScoreCardScoreValueClasses,
        'border-0 bg-transparent p-0 outline-none focus-visible:ring-0',
      )}
      value={draft}
      onChange={(event) => setDraft(event.target.value)}
      onBlur={handleInputBlur}
      onKeyDown={handleInputKeyDown}
    />
  ) : (
    <button
      type="button"
      disabled={disabled}
      aria-label={`${fullName} score`}
      aria-invalid={ariaInvalid || undefined}
      className={cn(
        abilityScoreCardScoreCenterClasses,
        abilityScoreCardScoreValueClasses,
        disabled && 'text-muted-foreground',
        state === 'draggingFrom' && 'opacity-50',
      )}
      onClick={beginEditing}
      onKeyDown={handleScoreKeyDown}
    >
      {displayValue === null ? '—' : displayValue}
    </button>
  )

  return (
    <AbilityScoreCard
      ability={ability}
      value={displayValue}
      size={size}
      state={state}
      footer={footer}
      headerAdornment={headerAdornment}
      interaction={disabled ? 'none' : 'numeric'}
    >
      <span aria-hidden />
      {scoreCell}
      <div className={abilityScoreCardStepperStackClasses}>
        <NumberStepperStepButton
          direction="increase"
          size={abilityScoreCardStepperButtonSize}
          appearance={abilityScoreCardStepperButtonAppearance}
          disabled={resolveStepDisabled('increase')}
          aria-label={`Increase ${fullName} score`}
          onClick={() => step('increase')}
        />
        <NumberStepperStepButton
          direction="decrease"
          size={abilityScoreCardStepperButtonSize}
          appearance={abilityScoreCardStepperButtonAppearance}
          disabled={resolveStepDisabled('decrease')}
          aria-label={`Decrease ${fullName} score`}
          onClick={() => step('decrease')}
        />
      </div>
    </AbilityScoreCard>
  )
}
