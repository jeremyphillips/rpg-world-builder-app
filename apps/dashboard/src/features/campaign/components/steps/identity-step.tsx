import { z } from 'zod'
import { WizardFooter, useWizard } from '@rpg/ui'
import { Form, type FormItem } from '@rpg/ui/form'

const identityStepSchema = z.object({
  name: z.string().min(1, 'Campaign name is required').max(100),
  description: z.string().max(500).optional(),
  banner: z.array(z.custom<File>((v: unknown) => v instanceof File)).optional(),
})

type IdentityStepValues = z.infer<typeof identityStepSchema>

const fields: FormItem[] = [
  {
    type: 'text',
    name: 'name',
    label: 'Campaign name',
    placeholder: 'The Sunless Citadel',
    required: true,
  },
  {
    type: 'textarea',
    name: 'description',
    label: 'Description',
    placeholder: 'A short summary of the campaign setting and tone.',
    rows: 3,
  },
  {
    type: 'file',
    name: 'banner',
    label: 'Campaign image',
    hint: 'JPEG, PNG, or WebP. Used as the campaign banner.',
    accept: ['image/jpeg', 'image/png', 'image/webp'],
  },
]

export function IdentityStep() {
  const { completeStep } = useWizard()

  return (
    <Form<IdentityStepValues>
      schema={identityStepSchema}
      fields={fields}
      mode="onChange"
      onSubmit={(values) => completeStep(values as Record<string, unknown>)}
      footer={(form) => (
        <WizardFooter isValid={form.formState.isValid} isSubmitting={form.formState.isSubmitting} />
      )}
    />
  )
}
