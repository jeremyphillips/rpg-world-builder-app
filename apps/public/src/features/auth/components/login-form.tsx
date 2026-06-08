'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { getErrorMessage, loginInputSchema, type LoginInput } from '@rpg/contracts'
import { CardFooter, FormCard, SubmitButton, TextField } from '@rpg/ui'

import { ROUTES } from '@/lib/routes'
import { DASHBOARD_PATH, login } from '../api/auth-client'

export interface LoginFormProps {
  /** Called after a successful login. Defaults to a same-origin redirect to the dashboard. */
  onSuccess?: () => void
}

export function LoginForm({ onSuccess }: LoginFormProps) {
  const [formError, setFormError] = useState<string | null>(null)
  const {
    register: field,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({ resolver: zodResolver(loginInputSchema) })

  const onSubmit = handleSubmit(async (values) => {
    setFormError(null)
    try {
      await login(values)
      ;(onSuccess ?? (() => window.location.assign(DASHBOARD_PATH)))()
    } catch (err) {
      setFormError(getErrorMessage(err, 'Unable to log in. Please try again.'))
    }
  })

  return (
    <FormCard
      title="Log in"
      description="Welcome back. Enter your details to continue."
      onSubmit={onSubmit}
      formError={formError}
      className="w-full max-w-sm"
      footer={
        <CardFooter className="flex-col items-stretch gap-3">
          <SubmitButton pending={isSubmitting} pendingLabel="Logging in…">
            Log in
          </SubmitButton>
          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link
              href={ROUTES.signup}
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      }
    >
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
        autoComplete="current-password"
        error={errors.password?.message}
        {...field('password')}
      />
    </FormCard>
  )
}
