import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'

import {
  createCampaignInputSchema,
  getErrorMessage,
  type CreateCampaignInput,
} from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, TextField } from '@rpg/ui'

import { useCreateCampaign } from '../hooks/use-create-campaign'
import { useSelectCampaign } from '../hooks/use-select-campaign'

export function CreateCampaignForm() {
  const mutation = useCreateCampaign()
  const selectCampaign = useSelectCampaign()
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CreateCampaignInput>({ resolver: zodResolver(createCampaignInputSchema) })

  const onSubmit = handleSubmit((values) =>
    mutation.mutate(values, {
      // The new campaign becomes the selection: persist it and navigate to its landing.
      onSuccess: (campaign) => selectCampaign(campaign.id),
    }),
  )

  return (
    <FormCard
      title="Create campaign"
      description="Start a new world for your party."
      onSubmit={onSubmit}
      formError={
        mutation.isError ? getErrorMessage(mutation.error, 'Could not create campaign.') : null
      }
      className="max-w-sm"
      footer={
        <CardFooter className="justify-end">
          <SubmitButton pending={mutation.isPending} pendingLabel="Creating…">
            Create
          </SubmitButton>
        </CardFooter>
      }
    >
      <TextField
        id="campaign-name"
        label="Name"
        placeholder="The Sunless Citadel"
        error={errors.name?.message}
        {...register('name')}
      />
    </FormCard>
  )
}
