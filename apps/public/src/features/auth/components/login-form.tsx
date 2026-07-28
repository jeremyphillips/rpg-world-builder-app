'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

import {
  CROSS_APP_PATHS,
  getErrorMessage,
  loginInputSchema,
  validateAuthContinuationPath,
  type LoginInput,
} from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, Text, formCardContentClass } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { ROUTES } from '@/lib/routes'
import { login } from '../api/auth-client'
import { loginFields } from '../lib/auth-form-fields'

export interface LoginFormProps {
  /** Called after a successful login. Defaults to a same-origin redirect to the dashboard. */
  onSuccess?: () => void
  /** Optional pre-filled email (editable). */
  defaultEmail?: string
}

const fields = loginFields

export function LoginForm({ onSuccess, defaultEmail }: LoginFormProps) {
  const searchParams = useSearchParams()
  const [formError, setFormError] = useState<string | null>(null)
  const returnTo = validateAuthContinuationPath(searchParams.get('returnTo'))
  const emailFromQuery = searchParams.get('email') ?? undefined
  const initialEmail = defaultEmail ?? emailFromQuery

  const onSubmit = async (values: LoginInput) => {
    setFormError(null)
    try {
      await login(values)
      const redirect =
        onSuccess ?? (() => window.location.assign(returnTo ?? CROSS_APP_PATHS.dashboard))
      redirect()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to log in. Please try again.'))
    }
  }

  const signupHref = returnTo
    ? `${ROUTES.signup}?returnTo=${encodeURIComponent(returnTo)}${
        initialEmail ? `&email=${encodeURIComponent(initialEmail)}` : ''
      }`
    : ROUTES.signup

  return (
    <FormCard
      title="Log in"
      description="Welcome back. Enter your details to continue."
      className="w-full max-w-sm"
    >
      <Form<LoginInput>
        schema={loginInputSchema}
        fields={fields}
        defaultValues={initialEmail ? { email: initialEmail, password: '' } : undefined}
        onSubmit={onSubmit}
        formError={formError}
        contentClassName={formCardContentClass}
        footer={(form) => (
          <CardFooter className="flex-col items-stretch gap-3">
            <SubmitButton pending={form.formState.isSubmitting} pendingLabel="Logging in…">
              Log in
            </SubmitButton>
            <Text variant="small" className="text-center">
              No account?{' '}
              <Link
                href={signupHref}
                className="font-medium text-foreground underline-offset-4 hover:underline"
              >
                Sign up
              </Link>
            </Text>
          </CardFooter>
        )}
      />
    </FormCard>
  )
}
