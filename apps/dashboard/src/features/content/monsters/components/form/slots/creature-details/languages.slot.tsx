import { useFormContext, useWatch } from 'react-hook-form'
import { CheckboxOption } from '@rpg/ui'

import { EntityCard } from '@/features/content'

import type { ContentFormCtx } from '../../../../../lib/forms/registry/content-form-registry'
import { MONSTER_UNDERSTANDS_ONLY_LABEL } from '../../../../lib/monster-form-labels'
import type { MonsterFormValues } from '../../../../lib/monster-form-values'
import { MonsterCreatureDetailsLanguagesAddField } from '../../monster-creature-details-languages-add-field'
import { MonsterCreatureDetailsRemoveRowButton } from '../../monster-creature-details-slot-parts'

function MonsterLanguageFluencyRowTrailing({
  entry,
  index,
  label,
  speaks,
  values,
}: {
  entry: MonsterFormValues['proficiencies']['languages'][number]
  index: number
  label: string
  speaks: boolean
  values: MonsterFormValues
}) {
  const form = useFormContext<MonsterFormValues>()

  return (
    <div className="flex flex-wrap items-center justify-end gap-2">
      <CheckboxOption
        shell="outlined"
        id={`monster-language-${entry.language}-understands-only`}
        label={MONSTER_UNDERSTANDS_ONLY_LABEL}
        checked={!speaks}
        onCheckedChange={(understandsOnly) => {
          form.setValue(
            `proficiencies.languages.${index}.speaks`,
            understandsOnly ? false : undefined,
            { shouldDirty: true },
          )
        }}
      />
      <MonsterCreatureDetailsRemoveRowButton
        label={label}
        onRemove={() =>
          form.setValue(
            'proficiencies.languages',
            (values.proficiencies.languages ?? []).filter((row) => row.language !== entry.language),
            { shouldDirty: true },
          )
        }
      />
    </div>
  )
}

export function MonsterCreatureDetailsLanguagesSlot({ ctx }: { ctx: ContentFormCtx }) {
  const values = useWatch<MonsterFormValues>() as MonsterFormValues | undefined

  if (!values?.proficiencies) return null

  return (
    <div className="flex flex-col gap-2">
      <MonsterCreatureDetailsLanguagesAddField ctx={ctx} />
      {(values.proficiencies.languages ?? []).map((entry, index) => {
        const label = ctx.languageVocabulary?.labelById[entry.language] ?? entry.language
        const speaks = entry.speaks !== false
        return (
          <EntityCard
            density="compact"
            key={entry.language}
            entity={{ heading: label }}
            trailing={{
              kind: 'utility',
              content: (
                <MonsterLanguageFluencyRowTrailing
                  entry={entry}
                  index={index}
                  label={label}
                  speaks={speaks}
                  values={values}
                />
              ),
            }}
          />
        )
      })}
    </div>
  )
}
