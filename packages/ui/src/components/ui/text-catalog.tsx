import { Heading } from './heading'
import { Text } from './text'
import { textVariants } from './text.variants'
import {
  TEXT_VARIANT_CATALOG,
  TEXT_VARIANT_CATEGORY_LABEL,
  TEXT_VARIANT_CATEGORY_ORDER,
  type TextVariantCategory,
} from './text.styles'
import { TEXT_VARIANTS } from './text.variants'

function variantsForCategory(category: TextVariantCategory) {
  return TEXT_VARIANTS.filter((variant) => TEXT_VARIANT_CATALOG[variant].category === category)
}

export function TextVariantCatalog() {
  return (
    <div className="space-y-10">
      {TEXT_VARIANT_CATEGORY_ORDER.map((category) => (
        <section key={category} className="space-y-4">
          <Heading variant="subsection" as="h2">
            {TEXT_VARIANT_CATEGORY_LABEL[category]}
          </Heading>
          <div className="overflow-x-auto rounded-md border border-border">
            <table className="w-full min-w-[40rem] text-left text-style-body">
              <thead className="border-b border-border bg-muted">
                <tr>
                  <th className="px-3 py-2 text-style-label">Sample</th>
                  <th className="px-3 py-2 text-style-label">Variant</th>
                  <th className="px-3 py-2 text-style-label">Utility</th>
                  <th className="px-3 py-2 text-style-label">Use case</th>
                </tr>
              </thead>
              <tbody>
                {variantsForCategory(category).map((variant) => {
                  const row = TEXT_VARIANT_CATALOG[variant]
                  const utility = textVariants({ variant })
                  return (
                    <tr key={variant} className="border-b border-border last:border-0">
                      <td className="px-3 py-3 align-top">
                        <Text variant={variant}>Sample {variant}</Text>
                      </td>
                      <td className="px-3 py-3 align-top font-mono text-style-caption">
                        {variant}
                      </td>
                      <td className="px-3 py-3 align-top font-mono text-style-caption">
                        {utility}
                      </td>
                      <td className="px-3 py-3 align-top text-style-supporting">{row.useCase}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </section>
      ))}
    </div>
  )
}
