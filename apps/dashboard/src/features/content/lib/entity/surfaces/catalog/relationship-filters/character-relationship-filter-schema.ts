import { CHARACTER_TYPE_IDS, getCharacterTypeLabel } from '@rpg/contracts'

import {
  createChipsFilter,
  createEqualsFilter,
  createFilterSchema,
  type FilterCatalogLayoutConfig,
  type FilterSchema,
} from '@rpg/ui/filters'

import { collectPresentValues, presentFilterValuesInOrder } from './relationship-filter-options.lib'
import {
  RELATIONSHIP_FILTER_ALL,
  RELATIONSHIP_FILTER_ALL_LABEL,
  RELATIONSHIP_FILTER_CLASS_LABEL,
  RELATIONSHIP_FILTER_TYPE_LABEL,
} from './relationship-filter.constants'

export type CharacterRelationshipFilterState = {
  characterType?: typeof RELATIONSHIP_FILTER_ALL | 'pc' | 'npc'
  classId?: string
}

const CHARACTER_RELATIONSHIP_FILTER_FIELD_ORDER = {
  primaryFieldIds: ['characterType'],
  filterRowFieldIds: ['classId'],
} as const satisfies FilterCatalogLayoutConfig<CharacterRelationshipFilterState>

export function resolveCharacterRelationshipFilterLayout<TData>(
  schema: FilterSchema<TData, CharacterRelationshipFilterState>,
): FilterCatalogLayoutConfig<CharacterRelationshipFilterState> {
  const schemaFieldIds = new Set(schema.fields.map((field) => field.id))

  return {
    primaryFieldIds: CHARACTER_RELATIONSHIP_FILTER_FIELD_ORDER.primaryFieldIds.filter((fieldId) =>
      schemaFieldIds.has(fieldId),
    ),
    filterRowFieldIds: CHARACTER_RELATIONSHIP_FILTER_FIELD_ORDER.filterRowFieldIds.filter(
      (fieldId) => schemaFieldIds.has(fieldId),
    ),
  }
}

export type CreateCharacterRelationshipFilterSchemaArgs<TData> = {
  rows: readonly TData[]
  getCharacterType: (row: TData) => 'pc' | 'npc'
  getClassIds: (row: TData) => readonly string[]
  resolveClassLabel: (classId: string) => string
}

function collectPresentClassIds<TData>(
  rows: readonly TData[],
  getClassIds: (row: TData) => readonly string[],
): Set<string> {
  const present = new Set<string>()
  for (const row of rows) {
    for (const classId of getClassIds(row)) {
      if (classId) present.add(classId)
    }
  }
  return present
}

export function createCharacterRelationshipFilterSchema<TData>(
  args: CreateCharacterRelationshipFilterSchemaArgs<TData>,
): FilterSchema<TData, CharacterRelationshipFilterState> {
  const presentTypes = collectPresentValues(args.rows, args.getCharacterType)
  const typeOptions = presentFilterValuesInOrder(CHARACTER_TYPE_IDS, presentTypes)
  const presentClassIds = collectPresentClassIds(args.rows, args.getClassIds)
  const classOptions = [...presentClassIds].sort((left, right) =>
    args.resolveClassLabel(left).localeCompare(args.resolveClassLabel(right)),
  )
  const fields = []

  if (typeOptions.length > 1) {
    fields.push(
      createChipsFilter<TData, CharacterRelationshipFilterState, 'characterType'>({
        id: 'characterType',
        label: RELATIONSHIP_FILTER_TYPE_LABEL,
        selectionMode: 'single-required',
        allValue: RELATIONSHIP_FILTER_ALL,
        defaultValue: RELATIONSHIP_FILTER_ALL,
        isValueConstraining: (value) =>
          typeof value === 'string' && value !== RELATIONSHIP_FILTER_ALL,
        options: [
          { value: RELATIONSHIP_FILTER_ALL, label: RELATIONSHIP_FILTER_ALL_LABEL },
          ...typeOptions.map((characterType) => ({
            value: characterType,
            label: getCharacterTypeLabel(characterType),
          })),
        ],
        matches: (row, value) => args.getCharacterType(row) === value,
      }),
    )
  }

  if (classOptions.length > 1) {
    fields.push(
      createEqualsFilter<TData, CharacterRelationshipFilterState, 'classId', string>({
        id: 'classId',
        label: RELATIONSHIP_FILTER_CLASS_LABEL,
        layout: 'floating',
        width: 'lg',
        showAllOption: true,
        allOptionLabel: RELATIONSHIP_FILTER_ALL_LABEL,
        options: classOptions.map((classId) => ({
          value: classId,
          label: args.resolveClassLabel(classId),
        })),
        getValue: (row) => args.getClassIds(row)[0] ?? '',
        matches: (row, value) => typeof value === 'string' && args.getClassIds(row).includes(value),
      }),
    )
  }

  return createFilterSchema(fields, {
    sanitizeState: (state) => {
      const patch: Partial<CharacterRelationshipFilterState> = {}
      if (
        state.characterType &&
        state.characterType !== RELATIONSHIP_FILTER_ALL &&
        !presentTypes.has(state.characterType)
      ) {
        patch.characterType = RELATIONSHIP_FILTER_ALL
      }
      if (state.classId && !presentClassIds.has(state.classId)) {
        patch.classId = undefined
      }
      return patch
    },
  })
}
