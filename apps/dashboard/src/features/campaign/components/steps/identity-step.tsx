import { WizardFooter, useWizard } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { identitySchema, identityFields, type IdentityValues } from '../../lib/campaign-fields'

export function IdentityStep() {
  const { completeStep } = useWizard()

  return (
    <Form<IdentityValues>
      schema={identitySchema}
      fields={identityFields}
      mode="onChange"
      onSubmit={(values) => completeStep(values as Record<string, unknown>)}
      footer={(form) => (
        <WizardFooter isValid={form.formState.isValid} isSubmitting={form.formState.isSubmitting} />
      )}
    />
  )
}
