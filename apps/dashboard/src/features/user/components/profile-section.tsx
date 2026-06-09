import { useState } from 'react'
import type { z } from 'zod'
import { Form } from '@rpg/ui/form'
import { SubmitButton } from '@rpg/ui'
import { getAssetUrl, type UpdateProfileInput } from '@rpg/contracts'

import { useSession } from '@/features/auth'
import { uploadFile } from '@/lib/api-client'
import { toFormError } from '@/lib/to-form-error'
import { useUpdateProfile } from '../hooks/use-update-profile'
import { accountFormSchema, accountFields, type AccountFormValues } from '../lib/account-fields'

const CURRENT_AVATAR_LABEL = 'Current avatar'

export function ProfileSection() {
  const { data: session } = useSession()
  const { mutateAsync, isPending, error, isSuccess } = useUpdateProfile()
  const [submitError, setSubmitError] = useState<unknown>(null)
  const [clearedAvatarKey, setClearedAvatarKey] = useState<string | null>(null)

  async function onSubmit(values: AccountFormValues) {
    setSubmitError(null)
    try {
      const input: UpdateProfileInput = {
        displayName: values.displayName,
        email: values.email,
      }
      if (values.avatar?.[0]) {
        input.avatarKey = await uploadFile(values.avatar[0], 'Could not upload avatar.')
      } else if (clearedAvatarKey !== null) {
        input.avatarKey = ''
      }
      await mutateAsync(input)
    } catch (err) {
      setSubmitError(err)
    }
  }

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
        fileFieldProps={{
          avatar: {
            existingImageUrl:
              session?.avatarKey && session.avatarKey !== clearedAvatarKey
                ? getAssetUrl(session.avatarKey)
                : undefined,
            existingImageLabel: CURRENT_AVATAR_LABEL,
            onClearExisting: () => setClearedAvatarKey(session?.avatarKey ?? null),
          },
        }}
        defaultValues={
          session
            ? ({ displayName: session.displayName, email: session.email } as Partial<
                z.infer<typeof accountFormSchema>
              >)
            : undefined
        }
        onSubmit={onSubmit}
        formError={toFormError(submitError ?? error, 'Could not save profile.')}
        footer={(form) => (
          <div className="flex items-center justify-end gap-3 pt-2">
            {isSuccess ? <p className="text-sm text-muted-foreground">Profile saved.</p> : null}
            <SubmitButton disabled={isPending || form.formState.isSubmitting}>
              {isPending ? 'Saving…' : 'Save profile'}
            </SubmitButton>
          </div>
        )}
      />
    </section>
  )
}
