import { Heading } from '../components/ui/heading'
import { CatalogTable, type CatalogColumn } from './semantic-classes/catalog-table'
import { HEADING_CHROME_SPECS, HEADING_DOC_LADDER_SPECS } from '../components/ui/heading.styles'
import type { HeadingStyleSpec } from '../components/ui/heading.styles'
import { Eyebrow } from '../components/ui/eyebrow'
import { EYEBROW_STYLE_SPECS } from '../components/ui/eyebrow.styles'
import type { EyebrowStyleSpec } from '../components/ui/eyebrow.styles'

function headingSampleAs(level: HeadingStyleSpec['level']): 'h1' | 'h2' | 'h3' | 'h4' | 'p' {
  if (level === 'h1' || level === 'h2' || level === 'h3' || level === 'h4' || level === 'p') {
    return level
  }
  return 'p'
}

const HEADING_COLUMNS: CatalogColumn<HeadingStyleSpec & { key: string }>[] = [
  {
    header: 'Sample',
    cell: (spec) => (
      <Heading variant={spec.variant} as={headingSampleAs(spec.level)}>
        Sample {spec.variant}
      </Heading>
    ),
  },
  { header: 'Variant', cell: (spec) => <span className="font-mono text-xs">{spec.variant}</span> },
  { header: 'Utility', cell: (spec) => <span className="font-mono text-xs">{spec.utility}</span> },
  { header: 'Level', cell: (spec) => spec.level },
  { header: 'px', cell: (spec) => spec.px },
  { header: 'Weight', cell: (spec) => spec.weight },
  { header: 'Use case', cell: (spec) => spec.useCase },
]

const EYEBROW_COLUMNS: CatalogColumn<EyebrowStyleSpec & { key: string }>[] = [
  {
    header: 'Sample',
    cell: (spec) => <Eyebrow size={spec.size}>Campaign</Eyebrow>,
  },
  { header: 'Size', cell: (spec) => <span className="font-mono text-xs">{spec.size}</span> },
  { header: 'Utility', cell: (spec) => <span className="font-mono text-xs">{spec.utility}</span> },
  { header: 'px', cell: (spec) => spec.px },
  { header: 'Weight', cell: (spec) => spec.weight },
  { header: 'Use case', cell: (spec) => spec.useCase },
]

function withKey<T extends { utility: string }>(specs: T[]): Array<T & { key: string }> {
  return specs.map((spec) => ({ ...spec, key: spec.utility }))
}

export function TypographyCompositeCatalog() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Heading variant="section" as="h2">
          Document ladder
        </Heading>
        <CatalogTable columns={HEADING_COLUMNS} rows={withKey(HEADING_DOC_LADDER_SPECS)} />
      </section>
      <section className="space-y-4">
        <Heading variant="section" as="h2">
          Chrome presets
        </Heading>
        <CatalogTable columns={HEADING_COLUMNS} rows={withKey(HEADING_CHROME_SPECS)} />
      </section>
      <section className="space-y-4">
        <Heading variant="section" as="h2">
          Eyebrow
        </Heading>
        <CatalogTable columns={EYEBROW_COLUMNS} rows={withKey(EYEBROW_STYLE_SPECS)} />
      </section>
    </div>
  )
}
