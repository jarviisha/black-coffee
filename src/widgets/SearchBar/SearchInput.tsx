import { useTranslation } from "react-i18next"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/Button"
import Icon from "@/components/ui/Icon"

interface SearchInputProps {
  inputRef: React.RefObject<HTMLInputElement | null>
  query: string
  focused: boolean
  onChange: (value: string) => void
  onFocus: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  onClear: () => void
}

export function SearchInput({
  inputRef,
  query,
  focused,
  onChange,
  onFocus,
  onKeyDown,
  onClear,
}: SearchInputProps) {
  const { t } = useTranslation()

  return (
    <div
      className={cn(
        "group flex h-10 items-center gap-2 rounded border px-3 transition-all duration-200 motion-reduce:transition-none",
        focused ? "bg-bg border-border-hi shadow-sm" : "border-border-hi",
      )}
    >
      <Icon
        name="search"
        size={20}
        aria-hidden="true"
        className="shrink-0 transition-colors duration-200 motion-reduce:transition-none"
      />

      <input
        ref={inputRef}
        id="sidebar-search"
        type="text"
        value={query}
        onChange={(e) => {
          onChange(e.target.value)
        }}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        placeholder={t("discover.searchPlaceholder")}
        autoComplete="off"
        spellCheck={false}
        className="text-text placeholder:text-text-muted min-w-0 flex-1 bg-transparent text-sm outline-none"
      />

      {query && (
        <Button
          variant="ghost"
          aria-label={t("common.clear")}
          onClick={onClear}
          className="text-text-sub hover:text-text-muted h-5 w-5 shrink-0 rounded-full transition-colors duration-150 motion-reduce:transition-none"
        >
          <Icon name="x" size={14} aria-hidden="true" />
        </Button>
      )}
    </div>
  )
}
