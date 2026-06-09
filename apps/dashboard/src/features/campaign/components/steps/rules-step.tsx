import { WizardFooter, useWizard } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import type { CreateCampaignInput } from '@rpg/contracts'
import { rulesSchema, rulesFields, type RulesValues } from '../../lib/campaign-fields'

export function RulesStep() {
  const { completeStep } = useWizard()

  const onSubmit = (values: RulesValues) => {
    const settings: CreateCampaignInput['settings'] = {
      characterCreation: {
        startingLevel: values.startingLevel,
        importedCharacters: { policy: values.importedCharactersPolicy },
      },
    }
    completeStep({ settings })
  }

  return (
    <Form<RulesValues>
      schema={rulesSchema}
      fields={rulesFields}
      mode="onChange"
      onSubmit={onSubmit}
      footer={(form) => (
        <WizardFooter isValid={form.formState.isValid} isSubmitting={form.formState.isSubmitting} />
      )}
    />
  )
}
