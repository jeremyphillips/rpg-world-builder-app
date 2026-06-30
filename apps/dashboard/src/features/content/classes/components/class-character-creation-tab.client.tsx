'use client'

import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button, Text } from '@rpg/ui'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import { FormEmbeddedMasterDetailEditor } from '../../components/form-embedded-master-detail-editor.client'
import type { ContentFormCtx } from '../../lib/content-form-registry'
import { useMasterDetailArray } from '../../lib/use-master-detail-array'
import {
  ADD_STARTING_EQUIPMENT_LABEL,
  ADD_STARTING_EQUIPMENT_OPTION_LABEL,
  STARTING_EQUIPMENT_EMPTY_MESSAGE,
  STARTING_EQUIPMENT_OPTION_NOUN,
} from '../lib/character-creation/class-starting-equipment-form-labels'
import {
  STARTING_EQUIPMENT_FIELD_NAME,
  STARTING_EQUIPMENT_OPTIONS_FIELD_NAME,
  startingEquipmentChooseFields,
  startingEquipmentOptionItemFields,
  startingEquipmentOptionTitle,
  type StartingEquipmentForm,
  type StartingEquipmentOptionForm,
} from '../lib/character-creation/class-starting-equipment-form-fields'
import { startingEquipmentDefaultValues } from '../lib/character-creation/class-starting-equipment-form-values'

export interface ClassCharacterCreationTabProps {
  formCtx: ContentFormCtx
}

function StartingEquipmentEmptyState({ formCtx }: { formCtx: ContentFormCtx }) {
  const { setValue } = useFormContext()

  return (
    <div className="space-y-3">
      <Text variant="muted" className="text-sm">
        {STARTING_EQUIPMENT_EMPTY_MESSAGE}
      </Text>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => {
          setValue(STARTING_EQUIPMENT_FIELD_NAME, startingEquipmentDefaultValues(formCtx), {
            shouldDirty: true,
          })
        }}
      >
        {ADD_STARTING_EQUIPMENT_LABEL}
      </Button>
    </div>
  )
}

function StartingEquipmentEditor({ formCtx }: { formCtx: ContentFormCtx }) {
  const optionFields = useMemo(() => startingEquipmentOptionItemFields(formCtx), [formCtx])
  const chooseFields = useMemo(() => startingEquipmentChooseFields(), [])
  const makeOptionDefaults = useCallback(() => buildItemDefaultValues(optionFields), [optionFields])
  const editor = useMasterDetailArray(STARTING_EQUIPMENT_OPTIONS_FIELD_NAME, makeOptionDefaults)

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={formCtx}
      fieldName={STARTING_EQUIPMENT_OPTIONS_FIELD_NAME}
      itemFields={optionFields}
      itemNoun={STARTING_EQUIPMENT_OPTION_NOUN}
      ariaLabel="Starting equipment packages"
      addLabel={ADD_STARTING_EQUIPMENT_OPTION_LABEL}
      emptyListLabel="No packages yet. Add one to get started."
      idPrefix="class-starting-equipment-option"
      editor={editor}
      leadingContent={
        <FormItems
          items={chooseFields}
          idPrefix="class-starting-equipment"
          namePrefix={STARTING_EQUIPMENT_FIELD_NAME}
        />
      }
      mapListItem={({ row }) => ({
        title: startingEquipmentOptionTitle(row as StartingEquipmentOptionForm | undefined),
      })}
    />
  )
}

/**
 * Character creation tab: optional starting equipment with a top-level choose
 * count and master-detail packages (`standard`, `gold`, etc.) each containing
 * fixed items, pool choices, wealth grants, and modifiers.
 */
export function ClassCharacterCreationTab({ formCtx }: ClassCharacterCreationTabProps) {
  const startingEquipment = useWatch({ name: STARTING_EQUIPMENT_FIELD_NAME }) as
    | StartingEquipmentForm
    | undefined
  const hasStartingEquipment = startingEquipment != null && typeof startingEquipment === 'object'

  if (!hasStartingEquipment) {
    return <StartingEquipmentEmptyState formCtx={formCtx} />
  }

  return <StartingEquipmentEditor formCtx={formCtx} />
}
