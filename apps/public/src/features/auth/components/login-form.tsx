'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import Link from 'next/link'

import { loginInputSchema, type LoginInput } from '@rpg/contracts'
import { Button, CardFooter, Input } from '@rpg/ui'

import { ApiError, DASHBOARD_PATH, login } from '../api/auth-client'
import { AuthEmailField, AuthFormCard } from './auth-form-card'
import { FormField } from './form-field'

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
      setFormError(err instanceof ApiError ? err.message : 'Unable to log in. Please try again.')
    }
  })

  return (
    <AuthFormCard
      title="Log in"
      description="Welcome back. Enter your details to continue."
      onSubmit={onSubmit}
      formError={formError}
      footer={
        <CardFooter className="flex-col items-stretch gap-3">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Logging in…' : 'Log in'}
          </Button>
          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link
              href="/signup"
              className="font-medium text-foreground underline-offset-4 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </CardFooter>
      }
    >
      <AuthEmailField
        error={errors.email?.message}
        aria-invalid={Boolean(errors.email)}
        {...field('email')}
      />
      <FormField id="password" label="Password" error={errors.password?.message}>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          aria-invalid={Boolean(errors.password)}
          {...field('password')}
        />
      </FormField>
    </AuthFormCard>
  )
}
