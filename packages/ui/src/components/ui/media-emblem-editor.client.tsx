'use client'

import { useId, useRef } from 'react'
import {
  CONTENT_MEDIA_EMBLEM_SCALE_MIN,
  canonicalizeEmblemPresentation,
  defaultEmblemPresentation,
  isDefaultEmblemPresentation,
  isEmblemCentered,
  resolveEmblemCanvasSize,
  resolveEmblemLayoutMetrics,
  type ContainPresentation,
  type SourceDimensions,
} from '@rpg/contracts'
import { Button } from './button.client'
import { resolveOffsetFromDragDelta } from './media-emblem-editor.lib'
import { mediaEmblemStyles as styles } from './media-emblem-editor.variants'

export type MediaEmblemEditorProps = {
  src: string
  source: SourceDimensions
  layout: ContainPresentation
  instructions: string
  onChange: (layout: ContainPresentation) => void
}

/** Controlled emblem contain editor with artwork size and optional position. */
export function MediaEmblemEditor({
  src,
  source,
  layout,
  instructions,
  onChange,
}: MediaEmblemEditorProps) {
  const id = useId()
  const drag = useRef<{ x: number; y: number; offset: { x: number; y: number } } | null>(null)
  const canvasSize = resolveEmblemCanvasSize()
  const metrics = resolveEmblemLayoutMetrics({ source, canvasSize, layout })
  const canonicalLayout = canonicalizeEmblemPresentation(source, layout)

  const emitLayout = (next: ContainPresentation) => {
    onChange(canonicalizeEmblemPresentation(source, next))
  }

  return (
    <div className={styles.root()}>
      <div
        className={styles.viewport()}
        role="group"
        aria-label="Emblem layout"
        aria-describedby={`${id}-instructions`}
        tabIndex={0}
        onPointerDown={(event) => {
          if (event.button !== 0) return
          event.currentTarget.setPointerCapture(event.pointerId)
          drag.current = {
            x: event.clientX,
            y: event.clientY,
            offset: layout.offset ?? { x: 0, y: 0 },
          }
        }}
        onPointerUp={() => {
          drag.current = null
        }}
        onPointerCancel={() => {
          drag.current = null
        }}
        onPointerMove={(event) => {
          const start = drag.current
          if (!start) return
          const rect = event.currentTarget.getBoundingClientRect()
          if (!rect.width) return
          const offset = resolveOffsetFromDragDelta({
            startOffset: start.offset,
            deltaX: event.clientX - start.x,
            deltaY: event.clientY - start.y,
            maxTranslationX: metrics.maxTranslationX,
            maxTranslationY: metrics.maxTranslationY,
            viewportSize: rect.width,
          })
          emitLayout({ ...layout, offset })
        }}
      >
        <div className={styles.checkerboard()} aria-hidden="true" />
        <img
          src={src}
          alt=""
          draggable={false}
          className={styles.image()}
          style={{
            left: `${(metrics.left / canvasSize) * 100}%`,
            top: `${(metrics.top / canvasSize) * 100}%`,
            width: `${(metrics.renderedWidth / canvasSize) * 100}%`,
            height: `${(metrics.renderedHeight / canvasSize) * 100}%`,
          }}
        />
      </div>
      <p id={`${id}-instructions`} className="sr-only">
        {instructions}
      </p>
      <div className={styles.controls()}>
        <label htmlFor={`${id}-size`}>Artwork size</label>
        <input
          id={`${id}-size`}
          className={styles.slider()}
          type="range"
          min={CONTENT_MEDIA_EMBLEM_SCALE_MIN}
          max={1}
          step={0.01}
          value={layout.scale}
          onChange={(event) => emitLayout({ ...layout, scale: Number(event.target.value) })}
        />
        <output htmlFor={`${id}-size`}>{Math.round(layout.scale * 100)}%</output>
      </div>
      <div className={styles.actions()}>
        <Button
          type="button"
          variant="outline"
          disabled={isEmblemCentered(canonicalLayout)}
          onClick={() => emitLayout({ mode: 'contain', scale: layout.scale })}
        >
          Center
        </Button>
        <span aria-hidden="true" className={styles.actionSeparator()}>
          ·
        </span>
        <Button
          type="button"
          variant="outline"
          disabled={isDefaultEmblemPresentation(canonicalLayout)}
          onClick={() => onChange(defaultEmblemPresentation())}
        >
          Reset
        </Button>
      </div>
    </div>
  )
}
