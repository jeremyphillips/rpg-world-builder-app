import { cva } from 'class-variance-authority'

/**
 * Leading cluster: content and the group action stay visually associated via a
 * fixed gap instead of stretching to opposite panel edges.
 */
export const relationshipContentRowVariants = cva('flex flex-wrap items-center gap-x-6 gap-y-2')
