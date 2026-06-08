'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { getErrorMessage, registerInputSchema, type RegisterInput } from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, TextField } from '@rpg/ui'

import { DASHBOARD_PATH, login, register } from '../api/auth-client'

export interface SignupFormProps {
  /** Called after a successful signup. Defaults to a same-origin redirect to the dashboard. */
  onSuccess?: () => void
}

export function SignupForm({ onSuccess }: SignupFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({ resolver: zodResolver(registerInputSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await register(values)
      // Establish a session immediately so signup lands in the dashboard.
      await login({ email: values.email, password: values.password })
      ;(onSuccess ?? (() => window.location.assign(DASHBOARD_PATH)))()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to create your account. Please try again.'))
    }
  })

  return (
    <FormCard
      title="Create your account"
      description="Start building your worlds in minutes."
      onSubmit={onSubmit}
      formError={formError}
      className="w-full max-w-sm"
      footer={
        <CardFooter className="flex-col items-stretch gap-3">
          <SubmitButton pending={isSubmitting} pendingLabel="Creating account…">
            Create account
          </SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link
              href="/login"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Log in
            </Link>
          </p>
        </CardFooter>
      }
    >
      <TextField
        id="displayName"
        label="Display name"
        autoComplete="nickname"
        error={errors.displayName?.message}
        {...field('displayName')}
      />
      <TextField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        {...field('email')}
      />
      <TextField
        id="password"
        label="Password"
        type="password"
        autoComplete="new-password"
        hint="At least 8 characters."
        error={errors.password?.message}
        {...field('password')}
      />
    </FormCard>
  )
}
