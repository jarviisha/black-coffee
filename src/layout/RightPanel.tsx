import { SearchBar } from "@/widgets/SearchBar"
import { TrendingTags } from "@/widgets/TrendingTags"

export function RightPanel() {
  return (
    <aside className="border-border sticky top-0 flex h-screen w-92 shrink-0 flex-col gap-6 self-start overflow-y-auto border-l px-6 py-4">
      <SearchBar />
      <TrendingTags />
    </aside>
  )
}
