import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * Merge conditional class names and de-duplicate conflicting Tailwind classes.
 * The single composition helper used by every component in this package.
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
