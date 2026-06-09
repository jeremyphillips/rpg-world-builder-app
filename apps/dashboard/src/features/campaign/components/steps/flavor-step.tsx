import { WizardFooter, useWizard } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { flavorSchema, flavorFields, type FlavorValues } from '../../lib/campaign-fields'

export function FlavorStep() {
  const { completeStep } = useWizard()

  return (
    <Form<FlavorValues>
      schema={flavorSchema}
      fields={flavorFields}
      mode="onChange"
      onSubmit={(values) => completeStep(values as Record<string, unknown>)}
      footer={(form) => (
        <WizardFooter isValid={form.formState.isValid} isSubmitting={form.formState.isSubmitting} />
      )}
    />
  )
}
