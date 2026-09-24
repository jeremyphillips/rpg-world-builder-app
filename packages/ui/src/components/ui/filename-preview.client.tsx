'use client'

import { cn } from '../../lib/utils'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './tooltip.client'
import {
  prepareFilenameForDisplay,
  resolveFilenamePreviewMaxLength,
  truncateFilename,
  type FilenamePreviewDensity,
} from './filename-preview.lib'
import {
  filenamePreviewFullVariants,
  filenamePreviewVariants,
  type FilenamePreviewDisplayVariantProps,
} from './filename-preview.variants'

export type FilenamePreviewProps = {
  filename: string
  /** When true, render the full filename with wrapping and no tooltip. */
  full?: boolean
  density?: FilenamePreviewDensity
  maxLength?: number
  display?: FilenamePreviewDisplayVariantProps['display']
  className?: string
}

/** Single-line filename preview with middle ellipsis and optional tooltip. */
export function FilenamePreview({
  filename,
  full = false,
  density = 'comfortable',
  maxLength,
  display = 'block',
  className,
}: FilenamePreviewProps) {
  const preparedFilename = prepareFilenameForDisplay(filename)

  if (full) {
    return <span className={cn(filenamePreviewFullVariants(), className)}>{preparedFilename}</span>
  }

  const resolvedMaxLength = resolveFilenamePreviewMaxLength(density, maxLength)
  const { display: preview, truncated } = truncateFilename(preparedFilename, resolvedMaxLength)
  const classes = cn(filenamePreviewVariants({ display }), className)
  const widthStyle = { maxWidth: `min(100%, ${resolvedMaxLength}ch)` }

  if (!truncated) {
    return (
      <span className={classes} style={widthStyle}>
        {preview}
      </span>
    )
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={classes} style={widthStyle} tabIndex={0}>
            {preview}
          </span>
        </TooltipTrigger>
        <TooltipContent>{preparedFilename}</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
