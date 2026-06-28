import { z } from 'zod'

import {
  createEpicInputSchema,
  EPIC_STATUSES,
  EPIC_STATUS_LABELS,
  TICKET_AREA_SUGGESTIONS,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
  ticketPrioritySchema,
  ticketAreaSchema,
  type Epic,
  type UpdateEpicInput,
} from '@rpg/contracts/dev-bench'
import { normalizeRichTextHtml } from '@rpg/ui'
import { toOptions, type FieldOption, type FormItem } from '@rpg/ui/form'

export const epicDetailFormSchema = z.object({
  title: z.string().min(1),
  goal: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(EPIC_STATUSES),
  priority: z.string(),
  area: z.string(),
})

export type EpicDetailFormValues = z.infer<typeof epicDetailFormSchema>

export const createEpicFormSchema = epicDetailFormSchema

export type CreateEpicFormValues = z.infer<typeof createEpicFormSchema>

const NONE_VALUE = '__none__'

const statusOptions = toOptions(EPIC_STATUSES, EPIC_STATUS_LABELS)
const priorityOptions = toOptions(TICKET_PRIORITIES, TICKET_PRIORITY_LABELS)
const areaOptions: FieldOption[] = TICKET_AREA_SUGGESTIONS.map((area) => ({
  value: area,
  label: area,
}))

export const createEpicFields: FormItem[] = [
  { type: 'text', name: 'title', label: 'Title', required: true },
  { type: 'text', name: 'goal', label: 'Goal' },
  { type: 'richtext', name: 'description', label: 'Description' },
  {
    kind: 'row',
    fields: [
      {
        type: 'select',
        name: 'status',
        label: 'Status',
        options: statusOptions,
        required: true,
        width: '1/2',
      },
      {
        type: 'select',
        name: 'priority',
        label: 'Priority',
        options: [{ value: NONE_VALUE, label: 'None' }, ...priorityOptions],
        width: '1/2',
      },
    ],
  },
  {
    type: 'select',
    name: 'area',
    label: 'Area',
    options: [{ value: NONE_VALUE, label: 'None' }, ...areaOptions],
  },
]

export const epicDetailFields: FormItem[] = createEpicFields

export const createEpicDefaultValues: CreateEpicFormValues = {
  title: '',
  goal: '',
  description: '',
  status: 'active',
  priority: NONE_VALUE,
  area: NONE_VALUE,
}

export function mapEpicToDetailFormValues(epic: Epic): EpicDetailFormValues {
  return {
    title: epic.title,
    goal: epic.goal ?? '',
    description: epic.description ?? '',
    status: epic.status,
    priority: epic.priority ?? NONE_VALUE,
    area: epic.area ?? NONE_VALUE,
  }
}

function optionalString(value: string | undefined): string | undefined {
  const trimmed = value?.trim()
  return trimmed ? trimmed : undefined
}

function optionalRichText(value: string | undefined): string | undefined {
  const normalized = normalizeRichTextHtml(value)
  return normalized || undefined
}

function optionalPriority(value: string | undefined): UpdateEpicInput['priority'] {
  if (!value || value === NONE_VALUE) return undefined
  const parsed = ticketPrioritySchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

function optionalArea(value: string | undefined): UpdateEpicInput['area'] {
  if (!value || value === NONE_VALUE) return undefined
  const parsed = ticketAreaSchema.safeParse(value)
  return parsed.success ? parsed.data : undefined
}

export function buildCreateEpicInput(values: CreateEpicFormValues) {
  return createEpicInputSchema.parse({
    title: values.title.trim(),
    goal: optionalString(values.goal),
    description: optionalRichText(values.description),
    status: values.status,
    priority: optionalPriority(values.priority),
    area: optionalArea(values.area),
  })
}

export function buildUpdateEpicInput(values: EpicDetailFormValues): UpdateEpicInput {
  return {
    title: values.title.trim(),
    goal: optionalString(values.goal),
    description: optionalRichText(values.description),
    status: values.status,
    priority: optionalPriority(values.priority),
    area: optionalArea(values.area),
  }
}
