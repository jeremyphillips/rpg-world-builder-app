import type { z } from 'zod'
import { Heading, Text } from '@rpg/ui'
import { Form, FormSaveFooter } from '@rpg/ui/form'
import type { UpdateProfileInput } from '@rpg/contracts'

import { useSession } from '@/features/auth'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { FormUnsavedChangesGuard } from '@/lib/form-unsaved-changes-guard'
import { useExistingImageField } from '@/lib/use-existing-image-field'
import { useUpdateProfile } from '../hooks/use-update-profile'
import { accountFormSchema, accountFields, type AccountFormValues } from '../lib/account-fields'

export function ProfileSection() {
  const { data: session } = useSession()
  const user = session?.user
  const { mutateAsync, isPending, isSuccess } = useUpdateProfile()

  const avatarField = useExistingImageField({
    fieldName: 'avatar',
    currentKey: user?.avatarKey,
    label: 'Current avatar',
    uploadErrorMessage: 'Could not upload avatar.',
  })

  const { onSubmit, formError } = useSubmitHandler<AccountFormValues>(async (values, form) => {
    const input: UpdateProfileInput = {
      displayName: values.displayName,
      email: values.email,
    }
    const avatarKey = await avatarField.resolveImageKey(values.avatar)
    if (avatarKey !== undefined) input.avatarKey = avatarKey
    await mutateAsync(input)
    form.reset({
      displayName: values.displayName,
      email: values.email,
      avatar: [],
    })
  }, 'Could not save profile.')

  return (
    <section aria-labelledby="profile-heading" className="space-y-4">
      <div className="space-y-1">
        <Heading variant="section" as="h3" id="profile-heading" className="text-lg">
          Profile
        </Heading>
        <Text variant="small">Your public display name, email address, and avatar.</Text>
      </div>
      {/* key forces a remount once the session loads so RHF initialises with the correct defaults */}
      <Form<AccountFormValues>
        key={user?.id ?? 'loading'}
        schema={accountFormSchema}
        fields={accountFields}
        fileFieldProps={avatarField.fileFieldProps}
        defaultValues={
          user
            ? ({ displayName: user.displayName, email: user.email } as Partial<
                z.infer<typeof accountFormSchema>
              >)
            : undefined
        }
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <>
            <FormUnsavedChangesGuard />
            <FormSaveFooter
              pending={isPending || form.formState.isSubmitting}
              isSuccess={isSuccess}
              submitLabel="Save profile"
              successMessage="Profile saved."
            />
          </>
        )}
      />
    </section>
  )
}
