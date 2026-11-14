'use client'

import { buildFieldShellProps } from '../../field-shell-props.lib'
import type { JoinedPairFieldConfig } from '../../../field-config'
import { JoinedPairFieldForm } from '../../../../components/ui/joined-pair-field-form.client'
import { useJoinedPairFieldRendererState } from './joined-pair-field-renderer-state.client'

export interface JoinedPairFieldRendererProps {
  config: JoinedPairFieldConfig
  id: string
  namePrefix?: string
  /** Hoist hint/error to a parent anatomy row message track (e.g. optional disclosure). */
  showLayoutMessage?: boolean
  rowAwareHints?: boolean
}

/** RHF adapter for standalone `joinedPair` fields — one controller per bound occupant. */
export function JoinedPairFieldRenderer({
  config,
  id,
  namePrefix,
  showLayoutMessage = true,
  rowAwareHints,
}: JoinedPairFieldRendererProps) {
  const {
    controlSize,
    startOccupant,
    endOccupant,
    controls,
    validation,
    hintPresentation,
    labelVisibility,
  } = useJoinedPairFieldRendererState(config, id, namePrefix, { rowAwareHints })

  return (
    <JoinedPairFieldForm
      {...buildFieldShellProps(
        {
          config,
          id,
          hint: hintPresentation.text,
          hintPosition: hintPresentation.position,
          presentationSize: controlSize,
          controlSize,
        },
        { error: validation.error },
        { sizes: 'none', label: 'visible' },
      )}
      labelVisibility={labelVisibility}
      size={controlSize}
      showLayoutMessage={showLayoutMessage}
      start={controls.start}
      end={controls.end}
      startOccupant={startOccupant}
      endOccupant={endOccupant}
    />
  )
}
