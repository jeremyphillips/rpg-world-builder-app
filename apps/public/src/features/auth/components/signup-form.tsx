'use client'

import { useState } from 'react'
import Link from 'next/link'

import { getErrorMessage, registerInputSchema, type RegisterInput } from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, Text, formCardContentClass } from '@rpg/ui'
import { Form } from '@rpg/ui/form'

import { ROUTES } from '@/lib/routes'
import { DASHBOARD_PATH, login, register } from '../api/auth-client'
import { signupFields } from '../lib/auth-form-fields'

export interface SignupFormProps {
  /** Called after a successful signup. Defaults to a same-origin redirect to the dashboard. */
  onSuccess?: () => void
}

const fields = signupFields

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [formError, setFormError] = useState<string | null>(null)

  const onSubmit = async (values: RegisterInput) => {
    setFormError(null)
    try {
      await register(values)
      // Establish a session immediately so signup lands in the dashboard.
      await login({ email: values.email, password: values.password })
      ;(onSuccess ?? (() => window.location.assign(DASHBOARD_PATH)))()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to create your account. Please try again.'))
    }
  }

  return (
    <FormCard
      title="Create your account"
      description="Start building your worlds in minutes."
      className="w-full max-w-sm"
    >
      <Form<RegisterInput>
        schema={registerInputSchema}
        fields={fields}
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
                href={ROUTES.login}
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
