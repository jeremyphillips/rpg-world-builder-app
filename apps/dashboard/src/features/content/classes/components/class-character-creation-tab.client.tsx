'use client'

import { useCallback, useMemo } from 'react'
import { useFormContext, useWatch } from 'react-hook-form'
import { Button, Heading, Text } from '@rpg/ui'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor.client'
import type { ContentFormCtx } from '../../lib/forms/content-form-registry'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
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
import { characterCreationProficienciesFields } from '../lib/character-creation/class-character-creation-proficiencies-form-fields'
import type { CharacterCreationProficienciesForm } from '../lib/character-creation/class-character-creation-proficiencies-form-fields'
import { buildProficiencyChoiceTargetOptions } from '../lib/character-creation/class-starting-equipment-proficiency-targets.lib'

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
  const proficiencies = useWatch({
    name: 'characterCreation.proficiencies',
  }) as CharacterCreationProficienciesForm | undefined
  const enrichedFormCtx = useMemo((): ContentFormCtx => {
    const equipmentEntities = formCtx.options?.equipmentEntities ?? []
    const rulesetId = equipmentEntities[0]?.rulesetId ?? 'srd-cc-5.2.1'
    const proficiencyChoiceTargets = buildProficiencyChoiceTargetOptions({
      rulesetId,
      classId: formCtx.entityId ?? 'draft-class',
      proficiencies,
      equipment: equipmentEntities,
    })

    return {
      ...formCtx,
      options: {
        ...formCtx.options,
        proficiencyChoiceTargets,
      },
    }
  }, [formCtx, proficiencies])

  const optionFields = useMemo(
    () => startingEquipmentOptionItemFields(enrichedFormCtx),
    [enrichedFormCtx],
  )
  const chooseFields = useMemo(() => startingEquipmentChooseFields(), [])
  const makeOptionDefaults = useCallback(() => buildItemDefaultValues(optionFields), [optionFields])
  const editor = useMasterDetailArray(STARTING_EQUIPMENT_OPTIONS_FIELD_NAME, makeOptionDefaults)

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={enrichedFormCtx}
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
 * Character creation tab: starting equipment (optional) and class-owned skill
 * and tool proficiency choices under `characterCreation.proficiencies`.
 */
export function ClassCharacterCreationTab({ formCtx }: ClassCharacterCreationTabProps) {
  const startingEquipment = useWatch({ name: STARTING_EQUIPMENT_FIELD_NAME }) as
    | StartingEquipmentForm
    | undefined
  const proficienciesFields = useMemo(
    () => characterCreationProficienciesFields(formCtx),
    [formCtx],
  )
  const hasStartingEquipment = startingEquipment != null && typeof startingEquipment === 'object'

  return (
    <div className="space-y-8">
      <section aria-labelledby="class-starting-equipment-heading">
        <Heading variant="section" as="h3" id="class-starting-equipment-heading" className="mb-4">
          Starting equipment
        </Heading>
        {hasStartingEquipment ? (
          <StartingEquipmentEditor formCtx={formCtx} />
        ) : (
          <StartingEquipmentEmptyState formCtx={formCtx} />
        )}
      </section>

      <section aria-labelledby="class-character-creation-proficiencies-heading">
        <FormItems items={proficienciesFields} idPrefix="class-character-creation" />
      </section>
    </div>
  )
}
