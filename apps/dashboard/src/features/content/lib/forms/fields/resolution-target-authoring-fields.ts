import {
  CREATURE_SIZES,
  DEFAULT_RESOLUTION_TARGET,
  EFFECT_CONDITION_IDS,
  MEASURED_RANGE_FEET,
  RESOLUTION_TARGET_KINDS,
  formatAreaOccupantCreaturePhrase,
  formatResolutionRequirementRowTitle,
  formatResolutionTargetFromParts,
  getCreatureSizeLabel,
  getEffectConditionLabel,
  getResolutionTargetKindLabel,
  resolutionTargetCountSelectOptions,
  type ResolutionTarget,
  type ResolutionTargetKind,
  type ResolutionTargetProximity,
} from '@rpg/contracts'
import {
  combineFieldVisibilityAll,
  type ArrayConfig,
  type FieldChrome,
  type FieldOption,
  type FieldVisibility,
  type FormItem,
  type InlineSentenceFieldConfig,
} from '@rpg/ui/form'

const REQUIREMENT_STAT_BLOCK_HINT = 'Optional restrictions on who can be targeted.'
const TARGET_DEFAULT_COUNT = DEFAULT_RESOLUTION_TARGET.count
const TARGET_DEFAULT_KIND = DEFAULT_RESOLUTION_TARGET.kind
const TARGET_DEFAULT_DISTANCE_FT = DEFAULT_RESOLUTION_TARGET.proximity.distance.value
const TARGET_DEFAULT_PROXIMITY_KIND = DEFAULT_RESOLUTION_TARGET.proximity.kind

const RESOLUTION_REQUIREMENT_EDITABLE_KINDS = new Set([
  'size',
  'creature-type',
  'condition',
  'any-of',
  'written',
])

/** Rows without fields (sight, willing) stay summary-only — no disclosure caret. */
export function resolveResolutionRequirementCollapsible(values: Record<string, unknown>): boolean {
  const kind = values.kind
  return typeof kind === 'string' && RESOLUTION_REQUIREMENT_EDITABLE_KINDS.has(kind)
}
const WRITTEN_CLAUSE_HINT = 'A full clause, such as "that is a demon."'

const SIZE_COMPARISON_OPTIONS = [
  { value: 'or-smaller', label: 'or smaller' },
  { value: 'or-larger', label: 'or larger' },
  { value: 'only', label: 'only' },
] as const

function sizeRequirementRow(sizeOptions: readonly FieldOption[]): FormItem {
  return {
    kind: 'row',
    heading: { label: 'Eligible sizes' },
    visibility: whenKind('size'),
    spacing: 'compact',
    fields: [
      {
        type: 'select',
        name: 'bound',
        label: 'Size',
        labelVisibility: 'srOnly',
        placeholder: 'Choose a size...',
        options: [...sizeOptions],
        width: 'auto',
      },
      {
        type: 'select',
        name: 'comparison',
        label: 'Size limit',
        labelVisibility: 'srOnly',
        defaultValue: 'or-smaller',
        options: [...SIZE_COMPARISON_OPTIONS],
        width: 'auto',
      },
    ],
  }
}

function whenKind(kind: string): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values) => values.kind === kind,
  }
}

function whenConditionRequirementFamily(): FieldVisibility {
  return {
    dependsOn: ['kind'],
    visibleWhen: (values) => values.kind === 'condition' || values.kind === 'any-of',
  }
}

function whenConditionAllowsWillingAlternative(): FieldVisibility {
  return {
    dependsOn: ['kind', 'presence'],
    visibleWhen: (values) =>
      values.kind === 'any-of' || (values.kind === 'condition' && values.presence !== 'lacks'),
  }
}

function applyFieldVisibility<T extends { visibility?: FieldVisibility }>(
  item: T,
  visibility?: FieldVisibility,
): T {
  if (!visibility) return item
  if (!item.visibility) return { ...item, visibility }
  return { ...item, visibility: combineFieldVisibilityAll(item.visibility, visibility) }
}

function requirementKind(item: unknown): string | undefined {
  if (!item || typeof item !== 'object') return undefined
  const kind = (item as { kind?: unknown }).kind
  return typeof kind === 'string' ? kind : undefined
}

function hasRequirementKind(items: unknown[], kinds: readonly string[]): boolean {
  return items.some((item) => {
    const kind = requirementKind(item)
    return kind !== undefined && kinds.includes(kind)
  })
}

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((id): id is string => typeof id === 'string' && id.length > 0)
}

function creatureTypeLabelFor(options: readonly FieldOption[]): (id: string) => string {
  const labels = new Map(options.map((option) => [String(option.value), option.label]))
  return (id) => labels.get(id) ?? id
}

/** Chip or row title for one requirement — incomplete type label or configured copy. */
export function formatResolutionRequirementSummary(
  row: unknown,
  creatureTypeLabel: (id: string) => string,
): string {
  return formatResolutionRequirementRowTitle(row, { creatureTypeLabel })
}

function menuItem(
  id: string,
  label: string,
  description: string,
  searchTerms: readonly string[],
  appendDefaults: Record<string, unknown>,
  blockedBy: readonly string[],
) {
  return {
    id,
    label,
    description,
    searchTerms,
    appendDefaults,
    duplicatePolicy: 'block' as const,
    isDuplicate: (items: unknown[]) => hasRequirementKind(items, blockedBy),
  }
}

/** Natural-language add menu. Adding a row does not fill in a placeholder value. */
export function buildResolutionRequirementAddMenu() {
  return {
    groups: [{ id: 'requirement', label: 'Requirement' }],
    enableSearch: true,
    items: [
      menuItem(
        'sight-actor',
        'You can see it',
        'Dominate Mind: one creature you can see',
        ['sight', 'see', 'dominate'],
        { kind: 'sight', who: 'actor' },
        ['sight'],
      ),
      menuItem(
        'sight-target',
        'It can see you',
        'Horrific Visage: a creature that can see you',
        ['sight', 'see', 'visage'],
        { kind: 'sight', who: 'target' },
        ['sight'],
      ),
      menuItem(
        'sight-both',
        'You can see each other',
        'You can see it, and it can see you',
        ['sight', 'see'],
        { kind: 'sight', who: 'both' },
        ['sight'],
      ),
      menuItem(
        'size',
        'Creature size',
        'Constrict: one Large or smaller creature',
        ['size', 'large', 'smaller', 'constrict'],
        { kind: 'size', comparison: 'or-smaller' },
        ['size'],
      ),
      menuItem(
        'creature-type',
        'Creature type',
        'Possession: one Humanoid',
        ['type', 'humanoid', 'undead', 'possession'],
        { kind: 'creature-type', mode: 'include' },
        ['creature-type'],
      ),
      menuItem(
        'condition',
        'Has a condition',
        'Trample: that has the Prone condition',
        ['condition', 'prone', 'trample'],
        { kind: 'condition', presence: 'has' },
        ['condition', 'any-of'],
      ),
      menuItem(
        'willing',
        'Willing',
        'Up to three willing creatures',
        ['willing'],
        { kind: 'willing' },
        ['willing', 'any-of'],
      ),
      menuItem(
        'written',
        'Something else',
        'A written clause, such as "that is a demon"',
        ['written', 'demon', 'else'],
        { kind: 'written' },
        ['written'],
      ),
    ],
  }
}

function readProximity(value: unknown, distance: unknown): ResolutionTargetProximity | undefined {
  if (value === 'touch') return { kind: 'touch' }
  const measured =
    typeof distance === 'number' && Number.isInteger(distance) && distance > 0
      ? { value: distance, unit: 'ft' as const }
      : undefined
  if (value === 'reach') return measured ? { kind: 'reach', distance: measured } : { kind: 'reach' }
  if (value === 'distance' && measured) return { kind: 'distance', distance: measured }
  return undefined
}

/** Live stat-block sentence for the target fields. Incomplete targets return nothing. */
export function formatResolutionTargetAuthoringPreview(
  values: Record<string, unknown>,
  prefix: string,
  creatureTypeOptions: readonly FieldOption[] = [],
): string | undefined {
  const count = values[`${prefix}.count`]
  const kind = values[`${prefix}.kind`]
  if (typeof count !== 'number' || !Number.isInteger(count) || count < 1) return undefined
  if (kind !== 'creature' && kind !== 'object' && kind !== 'creature-or-object') return undefined
  const proximity = readProximity(
    values[`${prefix}.proximity.kind`],
    values[`${prefix}.proximity.distance.value`],
  )
  if (!proximity) return undefined
  const countKind = values[`${prefix}.countKind`]
  const requirements = values[`${prefix}.requirements`]
  const target: ResolutionTarget = {
    count,
    kind: kind as ResolutionTargetKind,
    proximity,
    ...(countKind === 'exact' || countKind === 'up-to' ? { countKind } : {}),
    ...(Array.isArray(requirements)
      ? { requirements: requirements as ResolutionTarget['requirements'] }
      : {}),
  }
  return formatResolutionTargetFromParts(target, {
    creatureTypeLabel: creatureTypeLabelFor(creatureTypeOptions),
  })
}

function whenTargetProximityKind(prefix: string, kind: string): FieldVisibility {
  return {
    dependsOn: [`${prefix}.proximity.kind`],
    visibleWhen: (values) => values[`${prefix}.proximity.kind`] === kind,
  }
}

function targetSentenceField(
  prefix: string,
  creatureTypeOptions: readonly FieldOption[],
  options?: { visibility?: FieldVisibility; sentenceStyle?: 'monster' | 'spell' },
): InlineSentenceFieldConfig {
  const sentenceStyle = options?.sentenceStyle ?? 'monster'
  const touchSegment =
    sentenceStyle === 'spell'
      ? ([
          {
            kind: 'text' as const,
            value: 'you touch',
            tone: 'label' as const,
            visibility: whenTargetProximityKind(prefix, 'touch'),
          },
        ] as const)
      : []
  const reachSegment =
    sentenceStyle === 'spell'
      ? ([
          {
            kind: 'text' as const,
            value: 'within your reach',
            tone: 'label' as const,
            visibility: whenTargetProximityKind(prefix, 'reach'),
          },
        ] as const)
      : []
  const distanceLead =
    sentenceStyle === 'spell'
      ? ({
          kind: 'text' as const,
          value: 'within',
          tone: 'label' as const,
          visibility: whenTargetProximityKind(prefix, 'distance'),
        } as const)
      : { kind: 'text' as const, value: 'within', tone: 'label' as const }
  const distancePairVisibility =
    sentenceStyle === 'spell' ? whenTargetProximityKind(prefix, 'distance') : options?.visibility

  const field: InlineSentenceFieldConfig = {
    type: 'inlineSentence',
    name: `_${prefix.replaceAll('.', '_')}_sentence`,
    label: 'Target',
    segments: [
      {
        kind: 'select',
        name: `${prefix}.countKind`,
        options: [
          { value: 'exact', label: 'exactly' },
          { value: 'up-to', label: 'up to' },
        ],
        ariaLabel: 'Count limit',
        width: 'sm',
        defaultValue: 'exact',
      },
      {
        kind: 'select',
        name: `${prefix}.count`,
        options: resolutionTargetCountSelectOptions().map((option) => ({
          value: String(option.value),
          label: option.label,
        })),
        ariaLabel: 'Count',
        width: 'sm',
        defaultValue: String(TARGET_DEFAULT_COUNT),
      },
      {
        kind: 'select',
        name: `${prefix}.kind`,
        options: RESOLUTION_TARGET_KINDS.map((kind) => ({
          value: kind,
          label: getResolutionTargetKindLabel(kind),
        })),
        ariaLabel: 'Target kind',
        width: 'lg',
        defaultValue: TARGET_DEFAULT_KIND,
      },
      ...touchSegment,
      ...reachSegment,
      distanceLead,
      {
        kind: 'joinedPair',
        ariaLabel: 'Distance',
        ...(distancePairVisibility ? { visibility: distancePairVisibility } : {}),
        start: {
          kind: 'select',
          name: `${prefix}.proximity.distance.value`,
          options: MEASURED_RANGE_FEET.map((feet) => ({ value: feet, label: String(feet) })),
          digits: 3,
          allowCustom: true,
          ariaLabel: 'Distance',
          defaultValue: TARGET_DEFAULT_DISTANCE_FT,
        },
        end: { kind: 'label', text: 'ft.', ariaLabel: 'Distance unit' },
      },
    ],
    derivedMeta: {
      dependsOn: [
        `${prefix}.count`,
        `${prefix}.countKind`,
        `${prefix}.kind`,
        `${prefix}.proximity.kind`,
        `${prefix}.proximity.distance.value`,
        `${prefix}.requirements`,
      ],
      metaWhen: (values) => {
        const sentence = formatResolutionTargetAuthoringPreview(values, prefix, creatureTypeOptions)
        if (!sentence) return undefined
        return { rows: [{ label: 'Reads as', value: sentence }] }
      },
    },
  }
  return applyFieldVisibility(field, options?.visibility)
}

/** Live preview for area-occupant requirement lists. */
export function formatResolutionOccupantAuthoringPreview(
  values: Record<string, unknown>,
  requirementsPath: string,
  creatureTypeOptions: readonly FieldOption[] = [],
): string | undefined {
  const requirements = values[requirementsPath]
  if (!Array.isArray(requirements) || requirements.length === 0) return undefined
  const phrase = formatAreaOccupantCreaturePhrase(requirements, {
    creatureTypeLabel: creatureTypeLabelFor(creatureTypeOptions),
  })
  return `Each ${phrase} in the area`
}

function requirementArray(
  requirementsPath: string,
  creatureTypeOptions: readonly FieldOption[],
  visibility?: FieldVisibility,
  options?: {
    label?: string
    previewPath?: string
    hint?: string
    fieldChrome?: FieldChrome
  },
): ArrayConfig {
  const labelFor = creatureTypeLabelFor(creatureTypeOptions)
  const conditionOptions = EFFECT_CONDITION_IDS.map((id) => ({
    value: id,
    label: getEffectConditionLabel(id),
  }))
  const sizeOptions = CREATURE_SIZES.map((id) => ({ value: id, label: getCreatureSizeLabel(id) }))
  const field: ArrayConfig = {
    kind: 'array',
    name: requirementsPath,
    label: options?.label ?? 'Requirements',
    hint: options?.hint ?? REQUIREMENT_STAT_BLOCK_HINT,
    ...(options?.fieldChrome ? { fieldChrome: options.fieldChrome } : {}),
    emptyState: 'none',
    addAction: { label: 'Add a requirement', menu: buildResolutionRequirementAddMenu() },
    item: {
      collapsible: true,
      resolveCollapsible: resolveResolutionRequirementCollapsible,
      reorder: false,
      header: {
        fallback: (index) => `Requirement ${index + 1}`,
        primary: (values) => formatResolutionRequirementSummary(values, labelFor),
      },
    },
    fields: [
      sizeRequirementRow(sizeOptions),
      {
        type: 'select',
        name: 'mode',
        label: 'Creature type',
        options: [
          { value: 'include', label: 'Is' },
          { value: 'exclude', label: "Isn't" },
        ],
        defaultValue: 'include',
        visibility: whenKind('creature-type'),
      },
      {
        type: 'select',
        name: 'presence',
        label: 'Target conditions',
        width: 'auto',
        options: [
          { value: 'has', label: 'Has' },
          { value: 'lacks', label: "Doesn't have" },
        ],
        defaultValue: 'has',
        visibility: whenConditionRequirementFamily(),
      },
      {
        type: 'combobox',
        name: 'conditionIds',
        label: 'Conditions',
        labelVisibility: 'srOnly',
        placeholder: 'Add conditions...',
        noun: { singular: 'condition', plural: 'conditions' },
        multiple: true,
        options: conditionOptions,
        visibility: whenKind('any-of'),
      },
      {
        type: 'combobox',
        name: 'ids',
        label: 'Conditions',
        labelVisibility: 'srOnly',
        placeholder: 'Add conditions...',
        noun: { singular: 'condition', plural: 'conditions' },
        multiple: true,
        options: conditionOptions,
        visibility: whenKind('condition'),
      },
      {
        type: 'combobox',
        name: 'ids',
        label: 'Which ones',
        noun: { singular: 'option', plural: 'options' },
        multiple: true,
        options: [...creatureTypeOptions],
        visibility: whenKind('creature-type'),
      },
      {
        type: 'checkbox',
        name: 'willing',
        label: 'Also allow willing creatures',
        hint: 'Willing creatures qualify even without any of the selected conditions.',
        visibility: whenConditionAllowsWillingAlternative(),
      },
      {
        type: 'text',
        name: 'text',
        label: 'Clause',
        placeholder: 'that is a demon',
        hint: WRITTEN_CLAUSE_HINT,
        visibility: whenKind('written'),
      },
    ],
  }
  return applyFieldVisibility(field, visibility)
}

/**
 * Shared target sentence and requirement list. `prefix` is the resolution target
 * path (`resolution.target`). Creature-specific rows stay on screen when the kind
 * changes; validation reports them instead of clearing them.
 */
export function resolutionTargetAuthoringFields(options: {
  prefix: string
  creatureTypeOptions?: readonly FieldOption[]
  visibility?: FieldVisibility
  /** Spell resolution supplies its own proximity-kind select. */
  externalProximitySelect?: boolean
  /** When false, proximity kind is not authored here (monster saves use inline feet only). Default true. */
  includeProximityKindSelect?: boolean
  sentenceStyle?: 'monster' | 'spell'
  requirementsFieldChrome?: FieldChrome
}): FormItem[] {
  const creatureTypeOptions = options.creatureTypeOptions ?? []
  const requirementsPath = `${options.prefix}.requirements`
  const showProximityKindSelect =
    options.includeProximityKindSelect !== false && !options.externalProximitySelect
  const proximity: FormItem = {
    type: 'select',
    name: `${options.prefix}.proximity.kind`,
    label: 'Reach or range',
    options: [
      { value: 'reach', label: 'Reach' },
      { value: 'distance', label: 'Range' },
    ],
    defaultValue: TARGET_DEFAULT_PROXIMITY_KIND,
  }
  return [
    ...(showProximityKindSelect ? [applyFieldVisibility(proximity, options.visibility)] : []),
    targetSentenceField(options.prefix, creatureTypeOptions, {
      visibility: options.visibility,
      sentenceStyle: options.sentenceStyle,
    }),
    requirementArray(requirementsPath, creatureTypeOptions, options.visibility, {
      fieldChrome: options.requirementsFieldChrome,
    }),
  ]
}

export function resolutionOccupantRequirementsFields(options: {
  requirementsPath: string
  creatureTypeOptions?: readonly FieldOption[]
  visibility?: FieldVisibility
  legend?: string
  description?: string
  hint?: string
  /** Embed only the requirement array inside an existing group. */
  fieldsOnly?: boolean
  requirementsFieldChrome?: FieldChrome
}): FormItem[] {
  const creatureTypeOptions = options.creatureTypeOptions ?? []
  const requirementField = requirementArray(
    options.requirementsPath,
    creatureTypeOptions,
    options.visibility,
    {
      label: 'Requirements',
      hint: options.hint,
      fieldChrome: options.requirementsFieldChrome,
    },
  )
  if (options.fieldsOnly) {
    return [requirementField]
  }
  return [
    {
      kind: 'group',
      legend: options.legend ?? 'Creatures in the area',
      description: options.description ?? REQUIREMENT_STAT_BLOCK_HINT,
      visibility: options.visibility,
      fields: [requirementField],
    },
  ]
}
