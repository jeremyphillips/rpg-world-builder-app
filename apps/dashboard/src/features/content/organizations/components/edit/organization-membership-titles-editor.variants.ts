import { cva } from 'class-variance-authority'

export const organizationMembershipTitlesEditorListVariants = cva('flex flex-col gap-3')

export const organizationMembershipTitlesEditorRowVariants = cva(
  'grid gap-3 rounded-md border border-border bg-card p-3 sm:grid-cols-[minmax(0,1fr)_auto_auto] sm:items-end',
)
