import * as React from 'react'

import { Heading, Text } from '@rpg/ui'

import { ENTITY_REPLACEMENT_CURRENT_UNAVAILABLE_MESSAGE } from './entity-replacement-current.lib'
import type { EntityReplacementCurrentSnapshot } from './entity-replacement-current.types'
import { EntityReplacementCurrentField } from './entity-replacement-current-field'
import { resolveReplacementFieldLabels } from './entity-replacement-field-labels'

export type EntityReplacementSectionProps = {
  entityLabel: string
  current?: EntityReplacementCurrentSnapshot | null
  showNewSection?: boolean
  newHelper?: React.ReactNode
  unavailableMessage?: string
  children?: React.ReactNode
}

export function EntityReplacementSection({
  entityLabel,
  current,
  showNewSection = true,
  newHelper,
  unavailableMessage = ENTITY_REPLACEMENT_CURRENT_UNAVAILABLE_MESSAGE,
  children,
}: EntityReplacementSectionProps) {
  const labels = resolveReplacementFieldLabels(entityLabel)

  return (
    <div className="flex flex-col gap-3">
      {current ? (
        <div className="flex flex-col gap-2">
          <EntityReplacementCurrentField
            label={labels.currentLabel}
            entity={current.entity}
            displayImage={current.displayImage}
            fallback={current.fallback}
          />
          {current.unavailable ? (
            <Text variant="supporting" role="status">
              {unavailableMessage}
            </Text>
          ) : null}
        </div>
      ) : null}
      {showNewSection ? (
        <div className="flex flex-col gap-2">
          <Heading variant="label" as="p">
            {labels.newLabel}
          </Heading>
          {newHelper ? (
            typeof newHelper === 'string' ? (
              <Text variant="supporting">{newHelper}</Text>
            ) : (
              newHelper
            )
          ) : null}
          {children}
        </div>
      ) : null}
    </div>
  )
}
