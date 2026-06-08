import {
  createCampaignInputSchema,
  getErrorMessage,
  type CreateCampaignInput,
} from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, formCardContentClass } from '@rpg/ui'
import { Form, type FormItem } from '@rpg/ui/form'

import { useCreateCampaign } from '../hooks/use-create-campaign'
import { useSelectCampaign } from '../hooks/use-select-campaign'

const fields: FormItem[] = [
  { type: 'text', name: 'name', label: 'Name', placeholder: 'The Sunless Citadel' },
]

export function CreateCampaignForm() {
  const mutation = useCreateCampaign()
  const selectCampaign = useSelectCampaign()

  const onSubmit = (values: CreateCampaignInput) =>
    mutation.mutate(values, {
      // The new campaign becomes the selection: persist it and navigate to its landing.
      onSuccess: (campaign) => selectCampaign(campaign.id),
    })

  return (
    <FormCard
      title="Create campaign"
      description="Start a new world for your party."
      className="max-w-sm"
    >
      <Form<CreateCampaignInput>
        schema={createCampaignInputSchema}
        fields={fields}
        onSubmit={onSubmit}
        formError={
          mutation.isError ? getErrorMessage(mutation.error, 'Could not create campaign.') : null
        }
        contentClassName={formCardContentClass}
        footer={
          <CardFooter className="justify-end">
            <SubmitButton pending={mutation.isPending} pendingLabel="Creating…">
              Create
            </SubmitButton>
          </CardFooter>
        }
      />
    </FormCard>
  )
}
