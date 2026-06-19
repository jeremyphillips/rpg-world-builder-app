import { Text } from '@rpg/ui'

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-2 px-6 py-8 sm:flex-row">
        <Text variant="small" as="p">
          &copy; {new Date().getFullYear()} RPG World Builder
        </Text>
        <Text variant="small" as="p">
          Built for game masters.
        </Text>
      </div>
    </footer>
  )
}
