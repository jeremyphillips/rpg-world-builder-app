'use client'

import { pickFieldChromeProps } from '../../../components/ui/field-chrome.variants'
import type { JoinedPairFieldConfig } from '../../field-config'
import { JoinedPairFieldForm } from '../../../components/ui/joined-pair-field-form.client'
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
      id={id}
      {...pickFieldChromeProps(config)}
      label={config.label}
      labelVisibility={labelVisibility}
      error={validation.error}
      hint={hintPresentation.text}
      hintPosition={hintPresentation.position}
      info={config.info}
      required={config.required}
      disabled={config.disabled}
      size={controlSize}
      width={config.width}
      showLayoutMessage={showLayoutMessage}
      start={controls.start}
      end={controls.end}
      startOccupant={startOccupant}
      endOccupant={endOccupant}
    />
  )
}
