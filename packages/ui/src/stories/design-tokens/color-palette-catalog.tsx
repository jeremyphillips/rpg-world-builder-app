'use client'

import { Fragment, useEffect, useState, type ReactNode } from 'react'

import { cn } from '../../lib/utils'
import { Heading } from '../../components/ui/heading'
import { Text } from '../../components/ui/text'
import {
  establishSurfaceCurrent,
  type SurfaceCurrentPlane,
} from '../../components/ui/surface-current.lib'
import { useTheme } from '../../providers/theme-provider.client'
import {
  COLOR_TOKEN_GROUPS,
  ON_SURFACE_TOKENS,
  PALETTE_ELEVATION_LADDER_TOKENS,
  PALETTE_PRIMITIVE_TOKEN_GROUPS,
  SURFACE_BACKGROUNDS,
  type ColorToken,
  type ColorTokenGroup,
  type SurfaceBackground,
} from './color-palette.lib'
import {
  colorPaletteGroupHeaderClasses,
  colorPaletteGroupSectionClasses,
  colorPaletteHeaderClasses,
  colorPaletteMonoLabelClasses,
  colorPaletteOnSurfaceCellClasses,
  colorPaletteOnSurfaceGridClasses,
  colorPaletteOnSurfacePageClasses,
  colorPaletteOnSurfaceVisualClasses,
  colorPalettePageClasses,
  colorPaletteSurfacePanelClasses,
  colorPaletteSurfaceSectionClasses,
  colorPaletteSwatchCaptionClasses,
  colorPaletteSwatchFigureClasses,
  colorPaletteSwatchGridClasses,
  colorPaletteSwatchVisualClasses,
} from './color-palette.variants'

function useResolvedCssColor(cssVar: ColorToken['cssVar'], usage: ColorToken['usage']): string {
  const { theme } = useTheme()
  const [resolved, setResolved] = useState('')

  useEffect(() => {
    const probe = document.createElement('div')
    probe.style.display = 'none'

    if (usage === 'text') {
      probe.style.color = `var(${cssVar})`
    } else if (usage === 'border') {
      probe.style.borderTop = `1px solid var(${cssVar})`
    } else {
      probe.style.backgroundColor = `var(${cssVar})`
    }

    document.body.appendChild(probe)
    const styles = getComputedStyle(probe)
    const value =
      usage === 'text'
        ? styles.color
        : usage === 'border'
          ? styles.borderTopColor
          : styles.backgroundColor

    document.body.removeChild(probe)
    setResolved(value)
  }, [cssVar, usage, theme])

  return resolved
}

function ColorSwatch({ token }: { token: ColorToken }) {
  const resolved = useResolvedCssColor(token.cssVar, token.usage)

  const visual =
    token.usage === 'text' ? (
      <div
        className={cn(
          colorPaletteSwatchVisualClasses,
          'flex items-center justify-center rounded-lg border border-border px-4',
          token.textDemoSurfaceVar ? undefined : 'bg-background',
        )}
        style={
          token.textDemoSurfaceVar
            ? { backgroundColor: `var(${token.textDemoSurfaceVar})` }
            : undefined
        }
      >
        <span
          className={cn('text-base font-medium', token.tailwind)}
          style={{ color: `var(${token.cssVar})` }}
        >
          Aa
        </span>
      </div>
    ) : token.usage === 'border' ? (
      <div
        className={cn(
          colorPaletteSwatchVisualClasses,
          'rounded-lg border-4 bg-background',
          token.tailwind,
        )}
        style={{ borderColor: `var(${token.cssVar})` }}
      />
    ) : (
      <div
        className={cn(
          colorPaletteSwatchVisualClasses,
          'flex items-end rounded-lg border border-border p-3',
          token.tailwind,
        )}
        style={{ backgroundColor: `var(${token.cssVar})` }}
      >
        {token.foregroundTailwind ? (
          <span className={cn('text-sm font-medium', token.foregroundTailwind)}>Aa</span>
        ) : null}
      </div>
    )

  return (
    <figure className={colorPaletteSwatchFigureClasses}>
      {visual}
      <figcaption className={colorPaletteSwatchCaptionClasses}>
        <Text variant="body" className="text-base font-medium">
          {token.name}
        </Text>
        <p className="font-mono text-sm leading-relaxed text-foreground">{token.cssVar}</p>
        <p className={colorPaletteMonoLabelClasses}>{token.tailwind}</p>
        {resolved ? <p className={colorPaletteMonoLabelClasses}>{resolved}</p> : null}
      </figcaption>
    </figure>
  )
}

function ElevationLadderSection() {
  return (
    <section className={colorPaletteGroupSectionClasses} aria-labelledby="palette-elevation-ladder">
      <div className={colorPaletteGroupHeaderClasses}>
        <Heading variant="section" as="h2" id="palette-elevation-ladder">
          Palette · Elevation ladder
        </Heading>
        <Text variant="muted">
          Canvas → subtle → raised; sunken recessed below base. Same role names in light and dark.
        </Text>
      </div>
      <div className="flex max-w-md flex-col gap-1 rounded-xl border border-border p-4">
        {PALETTE_ELEVATION_LADDER_TOKENS.map((token) => (
          <div
            key={token.cssVar}
            className="flex items-center justify-between gap-4 rounded-lg border border-border-subtle px-4 py-3"
            style={{ backgroundColor: `var(${token.cssVar})` }}
          >
            <span className="font-mono text-sm text-foreground">{token.name}</span>
            <span className="font-mono text-xs text-muted-foreground">{token.cssVar}</span>
          </div>
        ))}
      </div>
    </section>
  )
}

function TokenGroupSection({ group }: { group: ColorTokenGroup }) {
  return (
    <section className={colorPaletteGroupSectionClasses} aria-labelledby={`palette-${group.id}`}>
      <div className={colorPaletteGroupHeaderClasses}>
        <Heading variant="section" as="h2" id={`palette-${group.id}`}>
          {group.label}
        </Heading>
        {group.description ? <Text variant="muted">{group.description}</Text> : null}
      </div>
      <div className={colorPaletteSwatchGridClasses}>
        {group.tokens.map((token) => (
          <ColorSwatch key={token.cssVar} token={token} />
        ))}
      </div>
    </section>
  )
}

export function ColorPaletteCatalog() {
  return (
    <div className={colorPalettePageClasses}>
      <header className={colorPaletteHeaderClasses}>
        <Heading variant="page" as="h1">
          Color palette
        </Heading>
        <Text variant="muted" className="text-base leading-relaxed">
          Layer 2 semantic roles and Layer 1 palette primitives from{' '}
          <code className="font-mono text-sm">packages/ui/src/styles/tokens/</code>. Toggle the
          Storybook theme toolbar to compare light and dark. Each swatch shows the CSS variable,
          Tailwind utility, and computed value.
        </Text>
      </header>
      {PALETTE_PRIMITIVE_TOKEN_GROUPS.map((group) =>
        group.id === 'palette-elevation' ? (
          <Fragment key={group.id}>
            <ElevationLadderSection />
            <TokenGroupSection group={group} />
          </Fragment>
        ) : (
          <TokenGroupSection key={group.id} group={group} />
        ),
      )}
      {COLOR_TOKEN_GROUPS.map((group) => (
        <TokenGroupSection key={group.id} group={group} />
      ))}
    </div>
  )
}

function SurfacePanel({ surface, children }: { surface: SurfaceBackground; children: ReactNode }) {
  const establishPlane = SURFACE_ESTABLISH_PLANE[surface.id]

  return (
    <section
      className={colorPaletteSurfaceSectionClasses}
      aria-labelledby={`surface-${surface.id}`}
    >
      <div className={colorPaletteGroupHeaderClasses}>
        <Heading variant="subsection" as="h3" id={`surface-${surface.id}`}>
          On {surface.label}
        </Heading>
        <p className="font-mono text-sm text-muted-foreground">{surface.cssVar}</p>
      </div>
      <div
        className={cn(
          colorPaletteSurfacePanelClasses,
          surface.tailwind,
          establishPlane ? establishSurfaceCurrent(establishPlane) : undefined,
        )}
        style={{ backgroundColor: `var(${surface.cssVar})` }}
      >
        {children}
      </div>
    </section>
  )
}

const SURFACE_ESTABLISH_PLANE: Partial<Record<string, SurfaceCurrentPlane>> = {
  background: 'background',
  sunken: 'sunken',
  card: 'card',
  'surface-muted': 'surface-muted',
  sidebar: 'sidebar',
}

function OnSurfaceSwatch({ token }: { token: ColorToken }) {
  if (token.usage === 'border') {
    return (
      <div className={colorPaletteOnSurfaceCellClasses}>
        <div
          className={cn(
            colorPaletteOnSurfaceVisualClasses,
            'border-4 bg-transparent',
            token.tailwind,
          )}
          style={{ borderColor: `var(${token.cssVar})` }}
        />
        <p className={colorPaletteMonoLabelClasses}>{token.cssVar}</p>
      </div>
    )
  }

  if (token.usage === 'text') {
    return (
      <div className={colorPaletteOnSurfaceCellClasses}>
        <div
          className={cn(
            colorPaletteOnSurfaceVisualClasses,
            'flex items-center rounded-lg border border-border-subtle px-3',
            token.textDemoSurfaceVar ? undefined : 'bg-surface-subtle',
          )}
          style={
            token.textDemoSurfaceVar
              ? { backgroundColor: `var(${token.textDemoSurfaceVar})` }
              : undefined
          }
        >
          <p
            className={cn('truncate text-sm font-medium', token.tailwind)}
            style={{ color: `var(${token.cssVar})` }}
          >
            {token.name}
          </p>
        </div>
        <p className={colorPaletteMonoLabelClasses}>{token.cssVar}</p>
      </div>
    )
  }

  return (
    <div className={colorPaletteOnSurfaceCellClasses}>
      <div
        className={cn(
          colorPaletteOnSurfaceVisualClasses,
          'border border-border-subtle',
          token.tailwind,
        )}
        style={{ backgroundColor: `var(${token.cssVar})` }}
      />
      <p className={colorPaletteMonoLabelClasses}>{token.cssVar}</p>
    </div>
  )
}

export function ColorOnSurfacesCatalog() {
  return (
    <div className={colorPaletteOnSurfacePageClasses}>
      <header className={colorPaletteHeaderClasses}>
        <Heading variant="page" as="h1">
          Colors on surfaces
        </Heading>
        <Text variant="muted" className="text-base leading-relaxed">
          Common fills, borders, and text hues shown on each page plane. Use this to judge contrast
          when layering badges, washes, and semantic callouts.
        </Text>
      </header>
      {SURFACE_BACKGROUNDS.map((surface) => (
        <SurfacePanel key={surface.id} surface={surface}>
          <div className={colorPaletteOnSurfaceGridClasses}>
            {ON_SURFACE_TOKENS.map((token) => (
              <OnSurfaceSwatch key={`${surface.id}-${token.cssVar}`} token={token} />
            ))}
          </div>
        </SurfacePanel>
      ))}
    </div>
  )
}
