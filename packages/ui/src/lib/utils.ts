import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'

/**
 * Custom `text-*` font-size utilities from `@theme` in `styles/globals.css`.
 * Register here so `cn()` does not treat them as `text-{color}` and drop them.
 */
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ['table-body', 'table-stat', 'badge-sm'],
    },
  },
})

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind classes.
 * The single composition helper used by every component in this package.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
