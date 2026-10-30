import { Heading } from '../components/ui/heading'
import { CatalogTable, type CatalogColumn } from './semantic-classes/catalog-table'

type PrimitiveRow = {
  key: string
  className: string
  px: number
  lineHeight: string
}

type AliasRow = {
  key: string
  token: string
  className: string
  pointsAt: string
}

type SpecialtyRow = {
  key: string
  token: string
  className: string
  pointsAt: string
}

const PRIMITIVES: PrimitiveRow[] = [
  { key: 'text-fine-xs', className: 'text-fine-xs', px: 10, lineHeight: '14px' },
  { key: 'text-fine-sm', className: 'text-fine-sm', px: 11, lineHeight: '14px' },
  { key: 'text-fine-md', className: 'text-fine-md', px: 13, lineHeight: '—' },
  { key: 'text-xs', className: 'text-xs', px: 12, lineHeight: '16px' },
  { key: 'text-sm', className: 'text-sm', px: 14, lineHeight: '20px' },
  { key: 'text-md', className: 'text-md', px: 15, lineHeight: '22px' },
  { key: 'text-base', className: 'text-base', px: 16, lineHeight: '24px' },
  { key: 'text-lg', className: 'text-lg', px: 18, lineHeight: '28px' },
  { key: 'text-xl', className: 'text-xl', px: 20, lineHeight: '28px' },
  { key: 'text-2xl', className: 'text-2xl', px: 24, lineHeight: '32px' },
  { key: 'text-3xl', className: 'text-3xl', px: 28, lineHeight: '34px' },
  { key: 'text-4xl', className: 'text-4xl', px: 34, lineHeight: '39px' },
]

const HEADING_ALIASES: AliasRow[] = [
  {
    key: 'display',
    token: '--text-heading-display',
    className: 'heading-style-display',
    pointsAt: 'literal 42px',
  },
  {
    key: 'page',
    token: '--text-heading-page',
    className: 'heading-style-page',
    pointsAt: 'text-4xl',
  },
  {
    key: 'section',
    token: '--text-heading-section',
    className: 'heading-style-section',
    pointsAt: 'text-3xl',
  },
  {
    key: 'subsection',
    token: '--text-heading-subsection',
    className: 'heading-style-subsection',
    pointsAt: 'text-lg',
  },
  {
    key: 'group',
    token: '--text-heading-group',
    className: 'heading-style-group',
    pointsAt: 'text-base',
  },
  {
    key: 'label',
    token: '--text-heading-label',
    className: 'heading-style-label',
    pointsAt: 'text-base',
  },
  {
    key: 'card',
    token: '--text-heading-card',
    className: 'heading-style-card',
    pointsAt: 'text-lg (line-height is leading-none)',
  },
  {
    key: 'dialog-title',
    token: '--text-heading-dialog-title',
    className: 'heading-style-dialog-title',
    pointsAt: 'text-lg, text-xl at md',
  },
  {
    key: 'confirm-dialog-title',
    token: '--text-heading-confirm-dialog-title',
    className: 'heading-style-confirm-dialog-title',
    pointsAt: 'text-lg',
  },
  {
    key: 'sheet-section',
    token: '--text-heading-sheet-section',
    className: 'heading-style-sheet-section',
    pointsAt: 'text-xl',
  },
  {
    key: 'hero-title',
    token: '—',
    className: 'heading-style-hero-title',
    pointsAt: 'text-lg, text-xl at md, text-4xl at lg',
  },
  {
    key: 'nav',
    token: '--text-base',
    className: 'heading-style-nav',
    pointsAt: 'text-base',
  },
  {
    key: 'brand',
    token: '--text-base',
    className: 'heading-style-brand',
    pointsAt: 'text-base',
  },
  {
    key: 'alert',
    token: '--text-base',
    className: 'heading-style-alert',
    pointsAt: 'text-base (line-height is leading-none)',
  },
]

const SPECIALTY: SpecialtyRow[] = [
  {
    key: 'score-sm',
    token: '--text-score-sm',
    className: 'text-style-score text-style-score--sm',
    pointsAt: 'text-3xl',
  },
  {
    key: 'score-md',
    token: '--text-score-md',
    className: 'text-style-score text-style-score--md',
    pointsAt: 'text-4xl',
  },
  {
    key: 'score-lg',
    token: '--text-score-lg',
    className: 'text-style-score text-style-score--lg',
    pointsAt: '--text-heading-display',
  },
]

const PRIMITIVE_COLUMNS: CatalogColumn<PrimitiveRow>[] = [
  {
    header: 'Sample',
    cell: (row) => <span className={row.className}>Ag</span>,
  },
  {
    header: 'Class',
    cell: (row) => <span className="font-mono text-xs">{row.className}</span>,
  },
  { header: 'px', cell: (row) => row.px },
  { header: 'Line-height', cell: (row) => row.lineHeight },
]

const ALIAS_COLUMNS: CatalogColumn<AliasRow>[] = [
  {
    header: 'Sample',
    cell: (row) => <span className={row.className}>Ag</span>,
  },
  {
    header: 'Token',
    cell: (row) => <span className="font-mono text-xs">{row.token}</span>,
  },
  {
    header: 'Class',
    cell: (row) => <span className="font-mono text-xs">{row.className}</span>,
  },
  { header: 'Points at', cell: (row) => row.pointsAt },
]

const SPECIALTY_COLUMNS: CatalogColumn<SpecialtyRow>[] = [
  {
    header: 'Sample',
    cell: (row) => <span className={row.className}>Ag</span>,
  },
  {
    header: 'Token',
    cell: (row) => <span className="font-mono text-xs">{row.token}</span>,
  },
  {
    header: 'Class',
    cell: (row) => <span className="font-mono text-xs">{row.className}</span>,
  },
  { header: 'Points at', cell: (row) => row.pointsAt },
]

export function TypographyScaleCatalog() {
  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <Heading variant="section" as="h2">
          Primitives
        </Heading>
        <CatalogTable columns={PRIMITIVE_COLUMNS} rows={PRIMITIVES} />
      </section>
      <section className="space-y-4">
        <Heading variant="section" as="h2">
          Heading aliases
        </Heading>
        <CatalogTable columns={ALIAS_COLUMNS} rows={HEADING_ALIASES} />
      </section>
      <section className="space-y-4">
        <Heading variant="section" as="h2">
          Specialty aliases
        </Heading>
        <CatalogTable columns={SPECIALTY_COLUMNS} rows={SPECIALTY} />
      </section>
    </div>
  )
}
