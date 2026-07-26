'use client'

import { Heading, Text, WizardFooter, useWizard } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import {
  inviteMembersFields,
  inviteMembersSchema,
  type InviteMembersValues,
} from '../../lib/invite-members-form-fields'

export function InviteMembersStep({
  onFinish,
}: {
  onFinish: (values: Record<string, unknown>) => void | Promise<void>
}) {
  const { accumulatedValues } = useWizard()

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Heading variant="section" as="h2">
          Invite members
        </Heading>
        <Text variant="muted">
          Add players now, or invite them later from the campaign overview.
        </Text>
      </div>

      <Form<InviteMembersValues>
        schema={inviteMembersSchema}
        fields={inviteMembersFields}
        mode="onChange"
        defaultValues={{
          inviteEmails: [{ email: '' }],
          ...(accumulatedValues as Partial<InviteMembersValues>),
        }}
        onSubmit={(values) => onFinish({ ...accumulatedValues, ...values })}
        footer={(form) => (
          <WizardFooter
            isValid={form.formState.isValid}
            isSubmitting={form.formState.isSubmitting}
            submitLabel="Create campaign"
          />
        )}
      />
    </div>
  )
}
