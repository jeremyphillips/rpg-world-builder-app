import { z } from 'zod'
import { WizardFooter, useWizard } from '@rpg/ui'
import { Form, type FormItem } from '@rpg/ui/form'

import type { CreateCampaignInput } from '@rpg/contracts'

// Flat schema for the form; mapped to the nested contracts shape in onSubmit.
const rulesStepFormSchema = z.object({
  startingLevel: z.number().int().min(1).max(25),
  importedCharactersPolicy: z.enum(['approval_required', 'disabled']),
})

type RulesStepFormValues = z.infer<typeof rulesStepFormSchema>

const fields: FormItem[] = [
  {
    kind: 'group',
    legend: 'Basic',
    fields: [
      {
        type: 'number',
        name: 'startingLevel',
        label: 'Character starting level',
        min: 1,
        max: 25,
        defaultValue: 1,
        required: true,
        hint: 'The level at which new player characters begin (1–25).',
      },
      {
        type: 'radio',
        name: 'importedCharactersPolicy',
        label: 'Allow imported characters?',
        required: true,
        options: [
          { value: 'approval_required', label: 'Yes, with DM approval' },
          { value: 'disabled', label: 'No, players must roll new characters' },
        ],
      },
    ],
  },
  {
    kind: 'group',
    legend: 'Advanced',
    description: 'Additional rule configuration coming soon.',
    fields: [],
  },
]

export function RulesStep() {
  const { completeStep } = useWizard()

  const onSubmit = (values: RulesStepFormValues) => {
    const settings: CreateCampaignInput['settings'] = {
      characterCreation: {
        startingLevel: values.startingLevel,
        importedCharacters: { policy: values.importedCharactersPolicy },
      },
    }
    completeStep({ settings })
  }

  return (
    <Form<RulesStepFormValues>
      schema={rulesStepFormSchema}
      fields={fields}
      mode="onChange"
      onSubmit={onSubmit}
      footer={(form) => (
        <WizardFooter isValid={form.formState.isValid} isSubmitting={form.formState.isSubmitting} />
      )}
    />
  )
}
