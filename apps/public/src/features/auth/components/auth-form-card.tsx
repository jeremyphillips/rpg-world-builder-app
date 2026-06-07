'use client'

import type { ComponentProps } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle, Input } from '@rpg/ui'

import { FormField } from './form-field'

interface AuthFormCardProps {
  title: string
  description: string
  onSubmit: React.FormEventHandler<HTMLFormElement>
  formError: string | null
  children: React.ReactNode
  footer: React.ReactNode
}

export function AuthFormCard({
  title,
  description,
  onSubmit,
  formError,
  children,
  footer,
}: AuthFormCardProps) {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <form onSubmit={onSubmit} noValidate>
        <CardContent className="space-y-4">
          {formError ? (
            <p role="alert" className="text-sm text-destructive">
              {formError}
            </p>
          ) : null}
          {children}
        </CardContent>
        {footer}
      </form>
    </Card>
  )
}

interface AuthEmailFieldProps extends Omit<
  ComponentProps<typeof Input>,
  'id' | 'type' | 'autoComplete'
> {
  error?: string
}

export function AuthEmailField({ error, ...inputProps }: AuthEmailFieldProps) {
  return (
    <FormField id="email" label="Email" error={error}>
      <Input id="email" type="email" autoComplete="email" {...inputProps} />
    </FormField>
  )
}
