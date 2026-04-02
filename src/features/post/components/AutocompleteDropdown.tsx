import { cn } from "@/lib/utils"
import { Avatar } from "@/components/ui/Avatar"
import Icon from "@/components/ui/Icon"
import type { SuggestionState, SuggestionItem } from "../hooks/useAutocomplete"

interface AutocompleteDropdownProps {
  suggestion: SuggestionState
  suggestions: SuggestionItem[]
  onSelect: (item: SuggestionItem) => void
}

export function AutocompleteDropdown({ suggestion, suggestions, onSelect }: AutocompleteDropdownProps) {
  if (suggestions.length === 0) return null

  return (
    <div
      role="listbox"
      style={{ top: suggestion.dropdownPos.top, left: suggestion.dropdownPos.left }}
      className="border-border bg-surface absolute z-20 min-w-40 max-w-56 overflow-hidden rounded border shadow-lg"
    >
      {suggestions.map((s, i) => (
        <button
          key={s.label}
          type="button"
          role="option"
          aria-selected={i === suggestion.activeIndex}
          onMouseDown={(e) => {
            e.preventDefault() // keep textarea focused
            onSelect(s)
          }}
          className={cn(
            "flex w-full items-center gap-2 px-3 py-2 text-sm transition-colors motion-reduce:transition-none",
            i === suggestion.activeIndex
              ? "bg-surface-hi text-text"
              : "text-text-muted hover:bg-surface-hi hover:text-text",
          )}
        >
          {suggestion.type === "mention" ? (
            <Avatar src={s.avatarUrl} name={s.sub ?? s.label} size="xs" className="shrink-0" />
          ) : (
            <Icon name="hash" size={13} className="text-text-sub shrink-0" aria-hidden="true" />
          )}
          <span className="font-medium">{s.label}</span>
          {s.sub && <span className="text-text-sub truncate text-xs">{s.sub}</span>}
        </button>
      ))}
    </div>
  )
}
