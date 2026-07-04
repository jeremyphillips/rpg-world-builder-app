'use client'

import { useState } from 'react'
import Link from 'next/link'

import { CROSS_APP_PATHS, getErrorMessage, loginInputSchema, type LoginInput } from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, Text, formCardContentClass } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { ROUTES } from '@/lib/routes'
import { login } from '../api/auth-client'
import { loginFields } from '../lib/auth-form-fields'

export interface LoginFormProps {
  /** Called after a successful login. Defaults to a same-origin redirect to the dashboard. */
  onSuccess?: () => void
}

const fields = loginFields

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = async (values: LoginInput) => {
    setFormError(null)
    try {
      await login(values)
      ;(onSuccess ?? (() => window.location.assign(CROSS_APP_PATHS.dashboard)))()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to log in. Please try again.'))
    }
  }

  return (
    <FormCard
      title="Log in"
      description="Welcome back. Enter your details to continue."
      className="w-full max-w-sm"
    >
      <Form<LoginInput>
        schema={loginInputSchema}
        fields={fields}
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
                href={ROUTES.signup}
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
