'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { registerInputSchema, type RegisterInput } from '@rpg/contracts'
import { Button, CardFooter, Input } from '@rpg/ui'

import { ApiError, DASHBOARD_PATH, login, register } from '../api/auth-client'
import { AuthEmailField, AuthFormCard } from './auth-form-card'
import { FormField } from './form-field'

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
      setFormError(
        err instanceof ApiError ? err.message : 'Unable to create your account. Please try again.',
      )
    }
  })

  return (
    <AuthFormCard
      title="Create your account"
      description="Start building your worlds in minutes."
      onSubmit={onSubmit}
      formError={formError}
      footer={
        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating account…' : 'Create account'}
          </Button>
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
      <FormField id="displayName" label="Display name" error={errors.displayName?.message}>
        <Input
          id="displayName"
          autoComplete="nickname"
          aria-invalid={Boolean(errors.displayName)}
          {...field('displayName')}
        />
      </FormField>
      <AuthEmailField
        error={errors.email?.message}
        aria-invalid={Boolean(errors.email)}
        {...field('email')}
      />
      <FormField
        id="password"
        label="Password"
        error={errors.password?.message}
        hint="At least 8 characters."
      >
        <Input
          id="password"
          type="password"
          autoComplete="new-password"
          aria-invalid={Boolean(errors.password)}
          {...field('password')}
        />
      </FormField>
    </AuthFormCard>
  )
}
