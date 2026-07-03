import type {
  CodeRef,
  CreateEpicInput,
  CreateTicketInput,
  UpdateEpicInput,
  UpdateTicketInput,
} from '@rpg/contracts/dev-bench'

function trimOptional(value: string | undefined): string | undefined {
  if (value === undefined) {
    return undefined
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

function trimNullable(value: string | null | undefined): string | null | undefined {
  if (value === undefined) {
    return undefined
  }

  if (value === null) {
    return null
  }

  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

function trimStringArray(values: string[]): string[] {
  return values.map((value) => value.trim()).filter((value) => value.length > 0)
}

function trimCodeRefs(refs: CodeRef[]): CodeRef[] {
  return refs.map((ref) => ({
    ...(ref.packageName !== undefined && { packageName: trimOptional(ref.packageName) }),
    path: ref.path.trim(),
    ...(ref.symbol !== undefined && { symbol: trimOptional(ref.symbol) }),
    ...(ref.lineStart !== undefined && { lineStart: ref.lineStart }),
    ...(ref.lineEnd !== undefined && { lineEnd: ref.lineEnd }),
    ...(ref.note !== undefined && { note: trimOptional(ref.note) }),
  }))
}

type TrimUpdateFieldRule<T> = {
  key: keyof T
  trim?: (value: unknown) => unknown
}

function buildTrimmedUpdateInput<T extends Record<string, unknown>>(
  input: T,
  rules: readonly TrimUpdateFieldRule<T>[],
): Partial<T> {
  const result: Partial<T> = {}

  for (const { key, trim } of rules) {
    const value = input[key]
    if (value === undefined) continue
    result[key] = (trim ? trim(value) : value) as T[keyof T]
  }

  return result
}

const UPDATE_TICKET_TRIM_RULES: TrimUpdateFieldRule<UpdateTicketInput>[] = [
  { key: 'title', trim: (value) => (value as string).trim() },
  { key: 'description', trim: (value) => trimOptional(value as string | undefined) },
  { key: 'type' },
  { key: 'status' },
  { key: 'priority' },
  { key: 'size' },
  { key: 'area', trim: (value) => trimOptional(value as string | undefined) },
  { key: 'epicId', trim: (value) => trimNullable(value as string | null | undefined) },
  { key: 'blockedByTicketIds' },
  { key: 'relatedTicketIds' },
  { key: 'acceptanceCriteria', trim: (value) => trimStringArray(value as string[]) },
  { key: 'codeRefs', trim: (value) => trimCodeRefs(value as CodeRef[]) },
  { key: 'createdBy' },
]

const UPDATE_EPIC_TRIM_RULES: TrimUpdateFieldRule<UpdateEpicInput>[] = [
  { key: 'title', trim: (value) => (value as string).trim() },
  { key: 'description', trim: (value) => trimOptional(value as string | undefined) },
  { key: 'goal', trim: (value) => trimOptional(value as string | undefined) },
  { key: 'status' },
  { key: 'priority' },
  { key: 'area', trim: (value) => trimOptional(value as string | undefined) },
  { key: 'badgeColor', trim: (value) => (value as string).trim() },
]

export function trimCreateTicketInput(input: CreateTicketInput): CreateTicketInput {
  return {
    ...input,
    title: input.title.trim(),
    description: trimOptional(input.description),
    area: trimOptional(input.area),
    epicId: trimNullable(input.epicId),
    blockedByTicketIds: input.blockedByTicketIds,
    relatedTicketIds: input.relatedTicketIds,
    acceptanceCriteria: trimStringArray(input.acceptanceCriteria),
    codeRefs: trimCodeRefs(input.codeRefs),
  }
}

export function trimUpdateTicketInput(input: UpdateTicketInput): UpdateTicketInput {
  return buildTrimmedUpdateInput(input, UPDATE_TICKET_TRIM_RULES)
}

export function trimCreateEpicInput(input: CreateEpicInput): CreateEpicInput {
  return {
    ...input,
    title: input.title.trim(),
    description: trimOptional(input.description),
    goal: trimOptional(input.goal),
    area: trimOptional(input.area),
    ...(input.badgeColor !== undefined && { badgeColor: input.badgeColor.trim() }),
  }
}

export function trimUpdateEpicInput(input: UpdateEpicInput): UpdateEpicInput {
  return buildTrimmedUpdateInput(input, UPDATE_EPIC_TRIM_RULES)
}
