import { useState, useRef, useEffect, useCallback, useMemo } from "react"
import { useNavigate } from "react-router"
import { useSearch } from "@/api/hooks/useSearch"
import { readRecent, pushRecent, wipeRecent } from "@/lib/searchRecent"

export function useSearchBar() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [query, setQuery] = useState("")
  const [debouncedQuery, setDebouncedQuery] = useState("")
  const [focused, setFocused] = useState(false)
  const [recent, setRecent] = useState<string[]>([])
  const [activeIndex, setActiveIndex] = useState(-1)

  // Debounce 300ms before hitting the API
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), 300)
    return () => clearTimeout(timer)
  }, [query])

  const isSearching = debouncedQuery.length >= 2

  const { data, isLoading } = useSearch({ q: debouncedQuery }, { query: { enabled: isSearching } })

  const hasUsers = (data?.users?.length ?? 0) > 0
  const hasHashtags = (data?.hashtags?.length ?? 0) > 0
  const hasAny = hasUsers || hasHashtags
  const userCount = data?.users?.length ?? 0

  const showRecent = focused && query.trim() === "" && recent.length > 0
  const showSearch = focused && isSearching
  const showDropdown = showRecent || showSearch

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) setFocused(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [])

  // Global `/` shortcut to focus
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        e.key === "/" &&
        target.tagName !== "INPUT" &&
        target.tagName !== "TEXTAREA" &&
        !target.isContentEditable
      ) {
        e.preventDefault()
        inputRef.current?.focus()
      }
    }
    document.addEventListener("keydown", handler)
    return () => document.removeEventListener("keydown", handler)
  }, [])

  const handleUserClick = useCallback(
    (username: string) => {
      pushRecent(`@${username}`)
      setFocused(false)
      void navigate(`/@${username}`)
    },
    [navigate],
  )

  const handleHashtagClick = useCallback((tag: string) => {
    setQuery(`#${tag}`)
    inputRef.current?.focus()
  }, [])

  const handleRecentClick = useCallback((q: string) => {
    setQuery(q)
    setFocused(true)
    inputRef.current?.focus()
  }, [])

  // Flat list of actions for keyboard navigation
  const dropdownItems = useMemo(() => {
    if (showRecent) {
      return recent.map((q) => ({ action: () => handleRecentClick(q) }))
    }
    if (showSearch && !isLoading) {
      return [
        ...(data?.users?.map((user) => ({
          action: () => user.username && handleUserClick(user.username),
        })) ?? []),
        ...(data?.hashtags?.map((tag) => ({
          action: () => handleHashtagClick(tag),
        })) ?? []),
      ]
    }
    return []
  }, [
    showRecent,
    showSearch,
    isLoading,
    recent,
    data,
    handleRecentClick,
    handleUserClick,
    handleHashtagClick,
  ])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "ArrowDown") {
      e.preventDefault()
      setActiveIndex((i) => Math.min(i + 1, dropdownItems.length - 1))
    } else if (e.key === "ArrowUp") {
      e.preventDefault()
      setActiveIndex((i) => Math.max(i - 1, -1))
    } else if (e.key === "Escape") {
      if (query) {
        setQuery("")
      } else {
        inputRef.current?.blur()
        setFocused(false)
      }
    } else if (e.key === "Enter") {
      if (activeIndex >= 0) {
        dropdownItems[activeIndex]?.action()
      } else if (query.trim()) {
        pushRecent(query.trim())
        setFocused(false)
      }
    }
  }

  const handleFocus = () => {
    setRecent(readRecent())
    setFocused(true)
    setActiveIndex(-1)
  }

  const handleClear = useCallback(() => {
    setQuery("")
    inputRef.current?.focus()
  }, [])

  const handleClearRecent = () => {
    wipeRecent()
    setRecent([])
  }

  return {
    inputRef,
    containerRef,
    query,
    setQuery,
    focused,
    recent,
    activeIndex,
    debouncedQuery,
    isLoading,
    data,
    hasUsers,
    hasHashtags,
    hasAny,
    userCount,
    showRecent,
    showSearch,
    showDropdown,
    handleFocus,
    handleClear,
    handleClearRecent,
    handleKeyDown,
    handleUserClick,
    handleHashtagClick,
    handleRecentClick,
  }
}
