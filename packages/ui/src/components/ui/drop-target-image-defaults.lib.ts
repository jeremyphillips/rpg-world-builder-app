import { DEFAULT_UPLOAD_MAX_BYTES, STANDARD_IMAGE_UPLOAD_ACCEPT } from '@rpg/contracts'

/** Shared image accept list for drop targets — same surface as Manage images. */
export const IMAGE_DROP_TARGET_ACCEPT = [...STANDARD_IMAGE_UPLOAD_ACCEPT]

export type ImageDropTargetDefaults = {
  accept: string[]
  density: 'comfortable'
  maxSize?: number
}

type ResolveImageDropTargetDefaultsOptions = {
  /** When omitted and `includeMaxSize` is true, uses {@link DEFAULT_UPLOAD_MAX_BYTES}. */
  maxUploadBytes?: number
  /** When false, omits `maxSize` until a session byte ceiling is known. */
  includeMaxSize?: boolean
}

/** Props shared by image drop targets (modal workspace, form file fields, overlays). */
export function resolveImageDropTargetDefaults(
  options: ResolveImageDropTargetDefaultsOptions = {},
): ImageDropTargetDefaults {
  const includeMaxSize = options.includeMaxSize ?? true
  const maxUploadBytes = options.maxUploadBytes ?? DEFAULT_UPLOAD_MAX_BYTES
  return {
    accept: IMAGE_DROP_TARGET_ACCEPT,
    density: 'comfortable',
    ...(includeMaxSize ? { maxSize: maxUploadBytes } : {}),
  }
}
