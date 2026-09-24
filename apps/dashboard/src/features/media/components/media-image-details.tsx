import { useId, useMemo, useState } from 'react'
import {
  Button,
  CheckboxField,
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
  DialogPanelScrollRegion,
  FilenamePreview,
  type ScrollBoundaryState,
} from '@rpg/ui'
import { Form, type FormItem, type FormValueSync } from '@rpg/ui/form'
import { ChevronDown } from 'lucide-react'
import {
  MEDIA_ROLE_ENTRIES,
  asCropPresentation,
  contentImageSchema,
  formatFieldMessage,
  resolveMediaRoleEligibility,
  type ContentMedia,
  type ContentMediaPolicy,
  type MediaAsset,
  type MediaRole,
} from '@rpg/contracts'
import { mediaManagerStyles as styles } from './media-manager.variants'

const altSchema = contentImageSchema.pick({ alt: true })
const altFields: FormItem[] = [
  {
    name: 'alt',
    type: 'text',
    label: 'Image description',
    hint: 'Describe this image for accessibility.',
    chrome: { variant: 'none' },
  },
]

export type MediaImageDetailsProps = {
  image: ContentMedia['images'][number]
  asset: MediaAsset
  media: ContentMedia
  policy: ContentMediaPolicy
  onAlt: (alt: string) => void
  onRole: (role: MediaRole, assigned: boolean) => void
  onRemove: () => void
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
}

export function MediaImageDetails({
  image,
  asset,
  media,
  policy,
  onAlt,
  onRole,
  onRemove,
  onScrollBoundaryChange,
}: MediaImageDetailsProps) {
  const id = useId()
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const syncs = useMemo<FormValueSync[]>(
    () => [
      {
        dependsOn: ['alt'],
        apply: (values) => {
          onAlt(String(values.alt ?? ''))
          return undefined
        },
      },
    ],
    [onAlt],
  )
  const source = { width: asset.orientedWidth, height: asset.orientedHeight }

  return (
    <aside className={styles.detailsColumn()} aria-label="Image details">
      <DialogPanelScrollRegion
        inset="innerLeading"
        regionClassName={styles.columnScroll()}
        viewportClassName={styles.columnScrollViewport()}
        showTopBoundaryShadow={false}
        showBottomBoundaryShadow={false}
        onBoundaryStateChange={onScrollBoundaryChange}
      >
        <div className={styles.details()}>
          <h3 className={styles.subheading()}>Image details</h3>
          <div className={styles.detailsPanel()}>
            <section className={styles.detailsSection()} aria-labelledby={`${id}-roles-heading`}>
              <h4 id={`${id}-roles-heading`} className={styles.subheading()}>
                Assign roles
              </h4>
              <div className={styles.roles()} role="group" aria-labelledby={`${id}-roles-heading`}>
                {policy.allowedRoles.map((role) => {
                  const assignment = media.roles[role]
                  const cropPresentation = asCropPresentation(
                    assignment?.imageId === image.id ? assignment.presentation : undefined,
                  )
                  const eligibility = resolveMediaRoleEligibility(role, source, cropPresentation)
                  const hint = !eligibility.eligible
                    ? formatFieldMessage(eligibility.message)
                    : (eligibility.hint ?? MEDIA_ROLE_ENTRIES[role].description)

                  return (
                    <CheckboxField
                      key={role}
                      id={`${id}-${role}`}
                      label={MEDIA_ROLE_ENTRIES[role].label}
                      hint={hint}
                      checked={media.roles[role]?.imageId === image.id}
                      disabled={!eligibility.eligible}
                      onCheckedChange={(checked) => onRole(role, checked === true)}
                    />
                  )
                })}
              </div>
            </section>
            <section className={styles.detailsSection()} aria-labelledby={`${id}-file-heading`}>
              <h4 id={`${id}-file-heading`} className={styles.subheading()}>
                File
              </h4>
              <dl className={styles.metadata()} aria-labelledby={`${id}-file-heading`}>
                <dt className={styles.metadataLabel()}>File name</dt>
                <dd className={styles.metadataValue()}>
                  <FilenamePreview filename={asset.filename} density="metadata" />
                </dd>
                <dt className={styles.metadataLabel()}>Dimensions</dt>
                <dd className={styles.metadataValue()}>
                  {asset.orientedWidth} × {asset.orientedHeight}
                </dd>
                <dt className={styles.metadataLabel()}>File size</dt>
                <dd className={styles.metadataValue()}>
                  {new Intl.NumberFormat(undefined, { maximumFractionDigits: 1 }).format(
                    asset.byteSize / 1024,
                  )}{' '}
                  KB
                </dd>
              </dl>
              {asset.animated ? (
                <p className={styles.muted()}>Animated source; still preview.</p>
              ) : null}
            </section>
            <section className={styles.detailsSection()}>
              <Collapsible open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
                <CollapsibleTrigger asChild>
                  <Button
                    type="button"
                    variant="text"
                    size="sm"
                    className="h-auto w-full justify-between px-0 py-0 text-sm font-semibold"
                    aria-expanded={accessibilityOpen}
                  >
                    Accessibility & details
                    <ChevronDown
                      className={`size-4 shrink-0 transition-transform ${accessibilityOpen ? 'rotate-180' : ''}`}
                      aria-hidden="true"
                    />
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="pt-3">
                  <Form
                    key={image.id}
                    schema={altSchema}
                    fields={altFields}
                    defaultValues={{ alt: image.alt ?? '' }}
                    onSubmit={(values) => onAlt(values.alt ?? '')}
                    valueSyncs={syncs}
                    footer={null}
                  />
                </CollapsibleContent>
              </Collapsible>
            </section>
          </div>
          <Button type="button" variant="outline" onClick={onRemove}>
            Remove image
          </Button>
        </div>
      </DialogPanelScrollRegion>
    </aside>
  )
}
