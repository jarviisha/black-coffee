const STORAGE_KEY = "search:recent"
const MAX_RECENT = 5

export function readRecent(): string[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "[]") as string[]
  } catch {
    return []
  }
}

export function pushRecent(query: string) {
  const next = [query, ...readRecent().filter((q) => q !== query)].slice(0, MAX_RECENT)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next))
}

export function wipeRecent() {
  localStorage.removeItem(STORAGE_KEY)
}
