'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import {
  CROSS_APP_PATHS,
  getErrorMessage,
  registerInputSchema,
  validateAuthContinuationPath,
  type RegisterInput,
} from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, Text, formCardContentClass } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { ROUTES } from '@/lib/routes'
import { login, register } from '../api/auth-client'
import { signupFields } from '../lib/auth-form-fields'

export interface SignupFormProps {
  /** Called after a successful signup. Defaults to a same-origin redirect to the dashboard. */
  onSuccess?: () => void
  /** When set, the email field is pre-filled and locked. */
  lockedEmail?: string
}

export function SignupForm({ onSuccess, lockedEmail }: SignupFormProps) {
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const returnTo = validateAuthContinuationPath(searchParams.get('returnTo'))
  const emailFromQuery = searchParams.get('email') ?? undefined
  const resolvedLockedEmail = lockedEmail ?? emailFromQuery

  const fields = useMemo(() => {
    if (!resolvedLockedEmail) return signupFields

    return signupFields.map((field) => {
      if ('name' in field && field.name === 'email') {
        return { ...field, disabled: true }
      }
      return field
    })
  }, [resolvedLockedEmail])

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null)
    const payload = resolvedLockedEmail ? { ...values, email: resolvedLockedEmail } : values

    try {
      await register(payload)
      await login({ email: payload.email, password: payload.password })
      const redirect =
        onSuccess ?? (() => window.location.assign(returnTo ?? CROSS_APP_PATHS.dashboard))
      redirect()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to create your account. Please try again.'))
    }
  }

  const loginHref = returnTo
    ? `${ROUTES.login}?returnTo=${encodeURIComponent(returnTo)}${
        resolvedLockedEmail ? `&email=${encodeURIComponent(resolvedLockedEmail)}` : ''
      }`
    : ROUTES.login

  return (
    <FormCard
      title="Create your account"
      description="Start building your worlds in minutes."
      className="w-full max-w-sm"
    >
      <Form<RegisterInput>
        schema={registerInputSchema}
        fields={fields}
        defaultValues={
          resolvedLockedEmail
            ? { displayName: '', email: resolvedLockedEmail, password: '' }
            : undefined
        }
        onSubmit={onSubmit}
        formError={formError}
        contentClassName={formCardContentClass}
        footer={(form) => (
          <CardFooter className="flex-col items-stretch gap-3">
            <SubmitButton pending={form.formState.isSubmitting} pendingLabel="Creating account…">
              Create account
            </SubmitButton>
            <Text variant="small" className="text-center">
              Already have an account?{' '}
              <Link
                href={loginHref}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Log in
              </Link>
            </Text>
          </CardFooter>
        )}
      />
    </FormCard>
  )
}
