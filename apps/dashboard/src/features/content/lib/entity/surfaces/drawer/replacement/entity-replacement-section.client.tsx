'use client'

import * as React from 'react'

import { Heading, Text } from '@rpg/ui'

import { ENTITY_REPLACEMENT_CURRENT_UNAVAILABLE_MESSAGE } from './entity-replacement-current.lib'
import type { EntityReplacementCurrentSnapshot } from './entity-replacement-current.types'
import { EntityReplacementCurrentField } from './entity-replacement-current-field.client'
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
    <>
      {current ? (
        <div className="mb-3">
          <EntityReplacementCurrentField
            label={labels.currentLabel}
            entity={current.entity}
            imageKey={current.imageKey}
          />
          {current.unavailable ? (
            <Text variant="muted" className="mt-2 text-sm" role="status">
              {unavailableMessage}
            </Text>
          ) : null}
        </div>
      ) : null}
      {showNewSection ? (
        <div className="space-y-2">
          <Heading variant="label" as="p">
            {labels.newLabel}
          </Heading>
          {newHelper ? (
            typeof newHelper === 'string' ? (
              <Text variant="muted" className="text-sm">
                {newHelper}
              </Text>
            ) : (
              newHelper
            )
          ) : null}
          {children}
        </div>
      ) : null}
    </>
  )
}
