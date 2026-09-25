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
  resolveEffectiveImageRoles,
  resolveMediaRoleEligibility,
  roleAssignmentMatchesSelection,
  type AvailableContentImage,
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
  selectedAvailable: AvailableContentImage
  availableImages: AvailableContentImage[]
  media: ContentMedia
  policy: ContentMediaPolicy
  assignedRoles: MediaRole[]
  asset?: MediaAsset
  onAlt: (alt: string) => void
  onRole: (role: MediaRole, assigned: boolean) => void
  onRemove?: () => void
  canRemove: boolean
  onScrollBoundaryChange?: (state: ScrollBoundaryState) => void
}

// fallow-ignore-next-line complexity
export function MediaImageDetails({
  selectedAvailable,
  availableImages,
  media,
  policy,
  assignedRoles,
  asset,
  onAlt,
  onRole,
  onRemove,
  canRemove,
  onScrollBoundaryChange,
}: MediaImageDetailsProps) {
  const id = useId()
  const [accessibilityOpen, setAccessibilityOpen] = useState(false)
  const uploadImage = selectedAvailable.kind === 'upload' ? selectedAvailable.attachment : undefined
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
  const source =
    selectedAvailable.kind === 'system'
      ? selectedAvailable.sourceDimensions
      : asset
        ? { width: asset.orientedWidth, height: asset.orientedHeight }
        : undefined
  const effectiveRoles = resolveEffectiveImageRoles(
    media,
    selectedAvailable.id,
    policy.allowedRoles,
    availableImages,
  )

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
                {/* fallow-ignore-next-line complexity */}
                {policy.allowedRoles.map((role) => {
                  const assignment = media.roles[role]
                  const checked = assignedRoles.includes(role)
                  const derivedOnly = effectiveRoles.derivedRoles.includes(role)
                  const cropPresentation = asCropPresentation(
                    assignment && roleAssignmentMatchesSelection(assignment, selectedAvailable.id)
                      ? assignment.presentation
                      : undefined,
                  )
                  const eligibility = source
                    ? resolveMediaRoleEligibility(role, source, cropPresentation)
                    : { eligible: false, message: 'Image details are still loading.' }
                  const hint = !eligibility.eligible
                    ? formatFieldMessage(eligibility.message)
                    : derivedOnly
                      ? 'System artwork stays visible until you assign another image.'
                      : ((eligibility.eligible && 'hint' in eligibility
                          ? eligibility.hint
                          : undefined) ?? MEDIA_ROLE_ENTRIES[role].description)

                  return (
                    <CheckboxField
                      key={role}
                      id={`${id}-${role}`}
                      label={MEDIA_ROLE_ENTRIES[role].label}
                      hint={hint}
                      checked={checked}
                      disabled={!eligibility.eligible || derivedOnly}
                      onCheckedChange={(nextChecked) => onRole(role, nextChecked === true)}
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
                {selectedAvailable.kind === 'system' ? (
                  <>
                    <dt className={styles.metadataLabel()}>Source</dt>
                    <dd className={styles.metadataValue()}>System artwork</dd>
                    <dt className={styles.metadataLabel()}>Dimensions</dt>
                    <dd className={styles.metadataValue()}>
                      {selectedAvailable.sourceDimensions.width} ×{' '}
                      {selectedAvailable.sourceDimensions.height}
                    </dd>
                  </>
                ) : asset ? (
                  <>
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
                  </>
                ) : null}
              </dl>
              {asset?.animated ? (
                <p className={styles.muted()}>Animated source; still preview.</p>
              ) : null}
            </section>
            {uploadImage ? (
              <section className={styles.detailsSection()}>
                <Collapsible open={accessibilityOpen} onOpenChange={setAccessibilityOpen}>
                  <CollapsibleTrigger asChild>
                    <Button
                      type="button"
                      variant="text"
                      size="sm"
                      className={styles.detailsDisclosureTrigger()}
                      aria-expanded={accessibilityOpen}
                    >
                      Accessibility & details
                      <ChevronDown
                        className={styles.detailsDisclosureChevron({ open: accessibilityOpen })}
                        aria-hidden="true"
                      />
                    </Button>
                  </CollapsibleTrigger>
                  <CollapsibleContent className={styles.detailsDisclosureContent()}>
                    <Form
                      key={uploadImage.id}
                      schema={altSchema}
                      fields={altFields}
                      defaultValues={{ alt: uploadImage.alt ?? '' }}
                      onSubmit={(values) => onAlt(values.alt ?? '')}
                      valueSyncs={syncs}
                      footer={null}
                    />
                  </CollapsibleContent>
                </Collapsible>
              </section>
            ) : null}
          </div>
          {canRemove && onRemove ? (
            <Button type="button" variant="outline" onClick={onRemove}>
              Remove image
            </Button>
          ) : null}
        </div>
      </DialogPanelScrollRegion>
    </aside>
  )
}
