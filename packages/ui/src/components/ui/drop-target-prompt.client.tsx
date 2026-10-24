'use client'
import { Icon } from './icon/icon'

import * as React from 'react'
import { cn } from '../../lib/utils'
import { Button } from './button.client'
import { resolveDropTargetCopy, resolveDropTargetRequirements } from './drop-target-copy.lib'
import {
  resolveDropTargetLayoutBehavior,
  resolveDropTargetPromptState,
  resolveDropTargetPromptTitle,
  type DropTargetPromptState,
} from './drop-target-prompt.lib'
import {
  dropTargetActionsVariants,
  dropTargetDescriptionVariants,
  dropTargetIconVariants,
  dropTargetLayoutPreserveHiddenVariants,
  dropTargetRequirementsVariants,
  dropTargetSurfaceVariants,
  dropTargetTitleVariants,
} from './drop-target.variants'

export type { DropTargetPromptState } from './drop-target-prompt.lib'

export interface DropTargetPromptProps extends React.HTMLAttributes<HTMLDivElement> {
  accept: string[]
  multiple?: boolean
  maxSize?: number
  density?: 'compact' | 'comfortable'
  layout?: 'inline' | 'cover'
  state?: DropTargetPromptState
  showBrowse?: boolean
  onBrowse?: () => void
  disabled?: boolean
}

interface DropTargetPromptIdleChromeProps {
  description: string
  requirements?: string
  showBrowse: boolean
  disabled: boolean
  hideInPlace: boolean
  onBrowse?: () => void
}

function DropTargetPromptIdleChrome({
  description,
  requirements,
  showBrowse,
  disabled,
  hideInPlace,
  onBrowse,
}: DropTargetPromptIdleChromeProps) {
  const preservedHiddenClass = hideInPlace ? dropTargetLayoutPreserveHiddenVariants : undefined

  return (
    <>
      <p
        className={cn(dropTargetDescriptionVariants(), preservedHiddenClass)}
        aria-hidden={hideInPlace || undefined}
      >
        {description}
      </p>
      {showBrowse ? (
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={disabled}
          tabIndex={hideInPlace ? -1 : undefined}
          aria-hidden={hideInPlace || undefined}
          className={preservedHiddenClass}
          onClick={onBrowse}
        >
          <Icon name="upload" size="sm" />
          Browse files
        </Button>
      ) : null}
      {requirements ? (
        <p
          className={cn(dropTargetRequirementsVariants(), preservedHiddenClass)}
          aria-hidden={hideInPlace || undefined}
        >
          {requirements}
        </p>
      ) : null}
    </>
  )
}

function resolveDropTargetPromptIconName(
  state: DropTargetPromptState,
  useImageIcon: boolean,
): 'cloud-upload' | 'image' | 'file' {
  if (state === 'active') return 'cloud-upload'
  return useImageIcon ? 'image' : 'file'
}

function DropTargetPromptIcon({
  state,
  density,
  useImageIcon,
}: {
  state: DropTargetPromptState
  density: 'compact' | 'comfortable'
  useImageIcon: boolean
}) {
  const name = resolveDropTargetPromptIconName(state, useImageIcon)
  return (
    <Icon
      name={name}
      size={density === 'compact' ? '3xl' : 'owner'}
      className={cn(
        dropTargetIconVariants({ density, state }),
        density === 'comfortable' && 'ui-empty-state-well__icon--lg',
      )}
    />
  )
}

export function DropTargetPrompt({
  accept,
  multiple = false,
  maxSize,
  density = 'comfortable',
  layout = 'inline',
  state: stateProp,
  showBrowse = false,
  onBrowse,
  disabled = false,
  className,
  id,
  'aria-describedby': ariaDescribedby,
  'aria-invalid': ariaInvalid,
  onDragOver,
  onDragLeave,
  onDrop,
  ...props
}: DropTargetPromptProps) {
  const state = resolveDropTargetPromptState(disabled, stateProp)
  const copy = resolveDropTargetCopy({ accept, multiple })
  const requirements = resolveDropTargetRequirements({ accept, maxSize })
  const { hideIdleChromeInPlace, showIdleChrome } = resolveDropTargetLayoutBehavior(layout, state)
  const title = resolveDropTargetPromptTitle(state, copy.title)

  return (
    <div
      id={id}
      aria-describedby={ariaDescribedby}
      aria-invalid={ariaInvalid}
      className={cn(dropTargetSurfaceVariants({ layout, density, state }), className)}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      {...props}
    >
      <DropTargetPromptIcon state={state} density={density} useImageIcon={copy.useImageIcon} />
      <div className={dropTargetActionsVariants}>
        <p className={dropTargetTitleVariants({ density, state })}>{title}</p>
        {showIdleChrome ? (
          <DropTargetPromptIdleChrome
            description={copy.description}
            requirements={requirements}
            showBrowse={showBrowse}
            disabled={disabled}
            hideInPlace={hideIdleChromeInPlace}
            onBrowse={onBrowse}
          />
        ) : null}
      </div>
    </div>
  )
}
