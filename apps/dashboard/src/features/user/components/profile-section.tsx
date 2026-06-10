import type { z } from 'zod'
import { Form, FormSaveFooter } from '@rpg/ui/form'
import type { UpdateProfileInput } from '@rpg/contracts'

import { useSession } from '@/features/auth'
import { useSubmitHandler } from '@/lib/use-submit-handler'
import { useExistingImageField } from '@/lib/use-existing-image-field'
import { useUpdateProfile } from '../hooks/use-update-profile'
import { accountFormSchema, accountFields, type AccountFormValues } from '../lib/account-fields'

export function ProfileSection() {
  const { data: session } = useSession()
  const { mutateAsync, isPending, isSuccess } = useUpdateProfile()

  const avatarField = useExistingImageField({
    fieldName: 'avatar',
    currentKey: session?.avatarKey,
    label: 'Current avatar',
    uploadErrorMessage: 'Could not upload avatar.',
  })

  const { onSubmit, formError } = useSubmitHandler<AccountFormValues>(async (values) => {
    const input: UpdateProfileInput = {
      displayName: values.displayName,
      email: values.email,
    }
    const avatarKey = await avatarField.resolveImageKey(values.avatar)
    if (avatarKey !== undefined) input.avatarKey = avatarKey
    await mutateAsync(input)
  }, 'Could not save profile.')

  return (
    <section aria-labelledby="profile-heading" className="space-y-4">
      <div className="space-y-1">
        <h3 id="profile-heading" className="text-lg font-semibold">
          Profile
        </h3>
        <p className="text-sm text-muted-foreground">
          Your public display name, email address, and avatar.
        </p>
      </div>
      {/* key forces a remount once the session loads so RHF initialises with the correct defaults */}
      <Form<AccountFormValues>
        key={session?.id ?? 'loading'}
        schema={accountFormSchema}
        fields={accountFields}
        fileFieldProps={avatarField.fileFieldProps}
        defaultValues={
          session
            ? ({ displayName: session.displayName, email: session.email } as Partial<
                z.infer<typeof accountFormSchema>
              >)
            : undefined
        }
        onSubmit={onSubmit}
        formError={formError}
        footer={(form) => (
          <FormSaveFooter
            pending={isPending || form.formState.isSubmitting}
            isSuccess={isSuccess}
            submitLabel="Save profile"
            successMessage="Profile saved."
          />
        )}
      />
    </section>
  )
}
