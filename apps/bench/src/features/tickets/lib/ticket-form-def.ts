import { z } from 'zod'

import {
  codeRefSchema,
  createTicketInputSchema,
  ticketAreaSchema,
  ticketPrioritySchema,
  ticketSizeSchema,
  ticketStatusSchema,
  ticketTypeSchema,
  TICKET_AREA_SUGGESTIONS,
  TICKET_CREATED_BY,
  TICKET_CREATED_BY_LABELS,
  TICKET_PRIORITIES,
  TICKET_PRIORITY_LABELS,
  TICKET_SIZES,
  TICKET_SIZE_LABELS,
  TICKET_STATUSES,
  TICKET_STATUS_LABELS,
  TICKET_TYPES,
  TICKET_TYPE_LABELS,
  type Ticket,
  type UpdateTicketInput,
} from '@rpg/contracts/dev-bench'
import { normalizeRichTextHtml } from '@rpg/ui'
import { toOptions, type FieldOption, type FormItem, type TabbedFormTab } from '@rpg/ui/form'

const acceptanceCriterionSchema = z.object({
  text: z.string().min(1),
})

export const ticketDetailFormSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  type: ticketTypeSchema,
  status: ticketStatusSchema,
  priority: ticketPrioritySchema,
  size: ticketSizeSchema,
  area: ticketAreaSchema.optional().or(z.literal('')),
  epicId: z.string(),
  blockedByTicketIds: z.array(z.string()),
  relatedTicketIds: z.array(z.string()),
  codeRefs: z.array(codeRefSchema),
  acceptanceCriteria: z.array(acceptanceCriterionSchema),
})

export type TicketDetailFormValues = z.infer<typeof ticketDetailFormSchema>

export const quickCreateFormSchema = createTicketInputSchema.pick({
  title: true,
  type: true,
  priority: true,
  size: true,
  description: true,
})

export type QuickCreateFormValues = z.infer<typeof quickCreateFormSchema>

const typeOptions = toOptions(TICKET_TYPES, TICKET_TYPE_LABELS)
const statusOptions = toOptions(TICKET_STATUSES, TICKET_STATUS_LABELS)
const priorityOptions = toOptions(TICKET_PRIORITIES, TICKET_PRIORITY_LABELS)
const sizeOptions = toOptions(TICKET_SIZES, TICKET_SIZE_LABELS)
const createdByOptions = toOptions(TICKET_CREATED_BY, TICKET_CREATED_BY_LABELS)
const areaOptions: FieldOption[] = TICKET_AREA_SUGGESTIONS.map((area) => ({
  value: area,
  label: area,
}))

export function mapTicketToDetailFormValues(ticket: Ticket): TicketDetailFormValues {
  return {
    title: ticket.title,
    description: ticket.description ?? '',
    type: ticket.type,
    status: ticket.status,
    priority: ticket.priority,
    size: ticket.size,
    area: ticket.area ?? '',
    epicId: epicIdToFormValue(ticket.epicId),
    blockedByTicketIds: [...ticket.blockedByTicketIds],
    relatedTicketIds: [...ticket.relatedTicketIds],
    codeRefs: ticket.codeRefs.map((ref) => ({ ...ref })),
    acceptanceCriteria: ticket.acceptanceCriteria.map((text) => ({ text })),
  }
}

export function buildUpdateTicketInput(values: TicketDetailFormValues): UpdateTicketInput {
  return {
    title: values.title.trim(),
    description: normalizeRichTextHtml(values.description) || undefined,
    type: values.type,
    status: values.status,
    priority: values.priority,
    size: values.size,
    area: values.area?.trim() || undefined,
    epicId: epicIdToApiValue(values.epicId),
    blockedByTicketIds: values.blockedByTicketIds,
    relatedTicketIds: values.relatedTicketIds,
    codeRefs: values.codeRefs,
    acceptanceCriteria: values.acceptanceCriteria
      .map((item: { text: string }) => item.text.trim())
      .filter(Boolean),
  }
}

export function buildQuickCreateInput(values: QuickCreateFormValues) {
  return createTicketInputSchema.parse({
    ...values,
    title: values.title.trim(),
    description: normalizeRichTextHtml(values.description) || undefined,
    status: 'backlog',
    createdBy: 'user',
  })
}

export const quickCreateFields: FormItem[] = [
  { type: 'text', name: 'title', label: 'Title', required: true },
  {
    kind: 'row',
    fields: [
      {
        type: 'select',
        name: 'type',
        label: 'Type',
        options: typeOptions,
        required: true,
        width: '1/2',
      },
      {
        type: 'select',
        name: 'priority',
        label: 'Priority',
        options: priorityOptions,
        required: true,
        width: '1/2',
      },
    ],
  },
  {
    kind: 'row',
    fields: [
      {
        type: 'select',
        name: 'size',
        label: 'Size',
        options: sizeOptions,
        required: true,
        width: '1/2',
      },
    ],
  },
  {
    type: 'richtext',
    name: 'description',
    label: 'Description',
    hint: 'Optional',
    codeBlocks: true,
  },
]

export function buildTicketDetailTabs(options: {
  epicOptions: FieldOption[]
  ticketLinkOptions: FieldOption[]
}): TabbedFormTab[] {
  const epicSelectOptions: FieldOption[] = [
    { value: '__none__', label: 'No epic' },
    ...options.epicOptions,
  ]

  return [
    {
      id: 'overview',
      label: 'Overview',
      fields: [
        { type: 'text', name: 'title', label: 'Title', required: true },
        { type: 'richtext', name: 'description', label: 'Description', codeBlocks: true },
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'type',
              label: 'Type',
              options: typeOptions,
              required: true,
              width: '1/2',
            },
            {
              type: 'select',
              name: 'status',
              label: 'Status',
              options: statusOptions,
              required: true,
              width: '1/2',
            },
          ],
        },
        {
          kind: 'row',
          fields: [
            {
              type: 'select',
              name: 'priority',
              label: 'Priority',
              options: priorityOptions,
              required: true,
              width: '1/3',
            },
            {
              type: 'select',
              name: 'size',
              label: 'Size',
              options: sizeOptions,
              required: true,
              width: '1/3',
            },
            {
              type: 'combobox',
              name: 'area',
              label: 'Area',
              multiple: false,
              options: areaOptions,
              placeholder: 'Choose area…',
              width: '1/3',
            },
          ],
        },
        {
          type: 'select',
          name: 'epicId',
          label: 'Epic',
          options: epicSelectOptions,
        },
      ],
    },
    {
      id: 'links',
      label: 'Links',
      fields: [
        {
          type: 'combobox',
          name: 'blockedByTicketIds',
          label: 'Blocked by',
          multiple: true,
          options: options.ticketLinkOptions,
          placeholder: 'Search tickets…',
        },
        {
          type: 'combobox',
          name: 'relatedTicketIds',
          label: 'Related tickets',
          multiple: true,
          options: options.ticketLinkOptions,
          placeholder: 'Search tickets…',
        },
      ],
    },
    {
      id: 'code',
      label: 'Code',
      fields: [
        {
          kind: 'array',
          name: 'codeRefs',
          legend: 'Code references',
          addLabel: 'Add code reference',
          itemTitle: (values, index) =>
            typeof values['path'] === 'string' && values['path']
              ? String(values['path'])
              : `Ref ${index + 1}`,
          fields: [
            { type: 'text', name: 'path', label: 'Path', required: true },
            { type: 'text', name: 'symbol', label: 'Symbol' },
            {
              kind: 'row',
              fields: [
                { type: 'number', name: 'lineStart', label: 'Line start', width: '1/2' },
                { type: 'number', name: 'lineEnd', label: 'Line end', width: '1/2' },
              ],
            },
            { type: 'text', name: 'note', label: 'Note' },
          ],
        },
      ],
    },
    {
      id: 'done-when',
      label: 'Done when',
      fields: [
        {
          kind: 'array',
          name: 'acceptanceCriteria',
          legend: 'Acceptance criteria',
          addLabel: 'Add criterion',
          itemTitle: (values, index) =>
            typeof values['text'] === 'string' && values['text']
              ? String(values['text'])
              : `Criterion ${index + 1}`,
          fields: [{ type: 'text', name: 'text', label: 'Criterion', required: true }],
        },
      ],
    },
  ]
}

/** Maps form epic sentinel to API nullable epicId. */
export function epicIdToApiValue(epicId: string): string | null {
  return epicId === '__none__' ? null : epicId
}

/** Maps API ticket epicId to form select value. */
export function epicIdToFormValue(epicId: string | null | undefined): string {
  return epicId ?? '__none__'
}

export { createdByOptions }
