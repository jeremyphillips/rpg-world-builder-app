import { createElement, useCallback, useMemo } from 'react'
import { useWatch } from 'react-hook-form'
import { buildItemDefaultValues, FormItems } from '@rpg/ui/form'

import { FormEmbeddedMasterDetailEditor } from '../../components/master-detail/form-embedded-master-detail-editor'
import type { ContentFormCtx } from '../../lib/forms/registry/content-form-registry'
import { useMasterDetailArray } from '../../lib/master-detail/use-master-detail-array'
import {
  ADD_STARTING_EQUIPMENT_OPTION_LABEL,
  STARTING_EQUIPMENT_OPTION_MASTER_DETAIL_ITEM_NOUN,
} from '../lib/character-creation/class-starting-equipment-form-labels'
import {
  STARTING_EQUIPMENT_FIELD_NAME,
  STARTING_EQUIPMENT_OPTIONS_FIELD_NAME,
  startingEquipmentOptionItemFields,
  startingEquipmentOptionCompactSummary,
  startingEquipmentOptionTitle,
  startingEquipmentSectionIntroFields,
  type StartingEquipmentForm,
  type StartingEquipmentOptionForm,
} from '../lib/character-creation/class-starting-equipment-form-fields'
import { characterCreationProficienciesFields } from '../lib/character-creation/class-character-creation-proficiencies-form-fields'
import type { CharacterCreationProficienciesForm } from '../lib/character-creation/class-character-creation-proficiencies-form-fields'
import { buildProficiencyChoiceTargetOptions } from '../lib/character-creation/class-starting-equipment-proficiency-targets.lib'
import { ToolProficiencyReciprocalCue } from './character-creation/tool-proficiency-reciprocal-cue'

export interface ClassCharacterCreationTabProps {
  formCtx: ContentFormCtx
}

function StartingEquipmentEditor({ formCtx }: { formCtx: ContentFormCtx }) {
  const proficiencies = useWatch({
    name: 'characterCreation.proficiencies',
  }) as CharacterCreationProficienciesForm | undefined
  const startingEquipment = useWatch({
    name: STARTING_EQUIPMENT_FIELD_NAME,
  }) as StartingEquipmentForm | undefined
  const enrichedFormCtx = useMemo((): ContentFormCtx => {
    const equipmentEntities = formCtx.options?.equipment?.visible ?? []
    const rulesetId = equipmentEntities[0]?.rulesetId ?? 'srd-cc-5.2.1'
    const proficiencyChoiceTargets = buildProficiencyChoiceTargetOptions({
      rulesetId,
      classId: formCtx.entityId ?? 'draft-class',
      proficiencies,
      equipment: equipmentEntities,
      startingEquipment,
    })

    return {
      ...formCtx,
      options: {
        ...formCtx.options,
        proficiencyChoiceTargets,
      },
    }
  }, [formCtx, proficiencies, startingEquipment])

  const optionFields = useMemo(
    () => startingEquipmentOptionItemFields(enrichedFormCtx),
    [enrichedFormCtx],
  )
  const makeOptionDefaults = useCallback(
    () => ({ ...buildItemDefaultValues(optionFields), available: true }),
    [optionFields],
  )
  const editor = useMasterDetailArray(STARTING_EQUIPMENT_OPTIONS_FIELD_NAME, makeOptionDefaults)

  return (
    <FormEmbeddedMasterDetailEditor
      formCtx={enrichedFormCtx}
      fieldName={STARTING_EQUIPMENT_OPTIONS_FIELD_NAME}
      itemFields={optionFields}
      itemNoun={STARTING_EQUIPMENT_OPTION_MASTER_DETAIL_ITEM_NOUN}
      listTitle="Packages"
      ariaLabel="Starting equipment packages"
      addLabel={ADD_STARTING_EQUIPMENT_OPTION_LABEL}
      idPrefix="class-starting-equipment-option"
      editor={editor}
      mapListItem={({ row }) => {
        const option = row as StartingEquipmentOptionForm | undefined
        return {
          title: startingEquipmentOptionTitle(option),
          eyebrow: startingEquipmentOptionCompactSummary(option),
        }
      }}
      access={{ kind: 'availability', fieldName: 'available' }}
    />
  )
}

/**
 * Character creation tab: starting equipment (optional) and class-owned skill
 * and tool proficiency choices under `characterCreation.proficiencies`.
 */
export function ClassCharacterCreationTab({ formCtx }: ClassCharacterCreationTabProps) {
  const introFields = useMemo(() => startingEquipmentSectionIntroFields(), [])
  const proficienciesFields = useMemo(
    () =>
      characterCreationProficienciesFields(formCtx, [
        {
          kind: 'slot',
          name: '_toolProficiencyReciprocalCue',
          render: () => createElement(ToolProficiencyReciprocalCue),
        },
      ]),
    [formCtx],
  )

  return (
    <div className="space-y-8">
      <section aria-labelledby="class-starting-equipment-heading">
        <div className="space-y-6">
          <FormItems items={introFields} idPrefix="class-starting-equipment" />
          <StartingEquipmentEditor formCtx={formCtx} />
        </div>
      </section>

      <section aria-labelledby="class-character-creation-proficiencies-heading">
        <FormItems items={proficienciesFields} idPrefix="class-character-creation" />
      </section>
    </div>
  )
}
