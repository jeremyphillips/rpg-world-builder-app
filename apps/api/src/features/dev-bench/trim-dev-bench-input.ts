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
  return {
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: trimOptional(input.description) }),
    ...(input.type !== undefined && { type: input.type }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.size !== undefined && { size: input.size }),
    ...(input.area !== undefined && { area: trimOptional(input.area) }),
    ...(input.epicId !== undefined && { epicId: trimNullable(input.epicId) }),
    ...(input.blockedByTicketIds !== undefined && {
      blockedByTicketIds: input.blockedByTicketIds,
    }),
    ...(input.relatedTicketIds !== undefined && { relatedTicketIds: input.relatedTicketIds }),
    ...(input.acceptanceCriteria !== undefined && {
      acceptanceCriteria: trimStringArray(input.acceptanceCriteria),
    }),
    ...(input.codeRefs !== undefined && { codeRefs: trimCodeRefs(input.codeRefs) }),
    ...(input.createdBy !== undefined && { createdBy: input.createdBy }),
  }
}

export function trimCreateEpicInput(input: CreateEpicInput): CreateEpicInput {
  return {
    ...input,
    title: input.title.trim(),
    description: trimOptional(input.description),
    goal: trimOptional(input.goal),
    area: trimOptional(input.area),
  }
}

export function trimUpdateEpicInput(input: UpdateEpicInput): UpdateEpicInput {
  return {
    ...(input.title !== undefined && { title: input.title.trim() }),
    ...(input.description !== undefined && { description: trimOptional(input.description) }),
    ...(input.goal !== undefined && { goal: trimOptional(input.goal) }),
    ...(input.status !== undefined && { status: input.status }),
    ...(input.priority !== undefined && { priority: input.priority }),
    ...(input.area !== undefined && { area: trimOptional(input.area) }),
  }
}
