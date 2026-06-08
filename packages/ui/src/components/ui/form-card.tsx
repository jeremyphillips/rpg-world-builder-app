import type { ReactNode } from 'react'

import { Card, CardDescription, CardHeader, CardTitle } from './card'

/**
 * Padding for a form body rendered inside `FormCard` chrome — mirrors
 * `CardContent` (`p-6 pt-0`). Pass to `<Form contentClassName={...}>` so the
 * fields inset from the card edge while the header/footer keep their own
 * padding. (`<Form>` owns the `<form>`; `FormCard` is pure chrome.)
 */
export const formCardContentClass = 'p-6 pt-0'

interface FormCardProps {
  title: string
  description: string
  /** The form body — typically a `<Form>` (which owns the `<form>` element). */
  children: ReactNode
  className?: string
}

/**
 * Card-shaped chrome for a form: a header (title + description) above a body
 * slot. It deliberately does **not** render a `<form>` — render a `<Form>` (from
 * `@rpg/ui/form`) as its child so there is exactly one form element.
 */
export function FormCard({ title, description, children, className }: FormCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      {children}
    </Card>
  )
}
