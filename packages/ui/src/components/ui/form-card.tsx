import type { FormEventHandler, ReactNode } from 'react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card'

interface FormCardProps {
  title: string
  description: string
  onSubmit: FormEventHandler<HTMLFormElement>
  /** Form-level error message rendered as an alert above the fields. */
  formError?: string | null
  children: ReactNode
  footer: ReactNode
  className?: string
}

/**
 * Generic card-shaped form shell: header (title + description), a `<form>` with a
 * form-level error alert above its fields, and a footer slot for actions.
 */
export function FormCard({
  title,
  description,
  onSubmit,
  formError,
  children,
  footer,
  className,
}: FormCardProps) {
  return (
    <Card className={className}>
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
