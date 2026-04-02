import { useSearchBar } from "./useSearchBar"
import { SearchInput } from "./SearchInput"
import { SearchDropdown } from "./SearchDropdown"

export function SearchBar() {
  const {
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
    hasAny,
    hasUsers,
    hasHashtags,
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
  } = useSearchBar()

  return (
    <div ref={containerRef} className="relative">
      <SearchInput
        inputRef={inputRef}
        query={query}
        focused={focused}
        onChange={(value) => setQuery(value)}
        onFocus={handleFocus}
        onKeyDown={handleKeyDown}
        onClear={handleClear}
      />

      {showDropdown && (
        <SearchDropdown
          showRecent={showRecent}
          showSearch={showSearch}
          isLoading={isLoading}
          hasAny={hasAny}
          hasUsers={hasUsers}
          hasHashtags={hasHashtags}
          recent={recent}
          activeIndex={activeIndex}
          userCount={userCount}
          debouncedQuery={debouncedQuery}
          data={data}
          onClearRecent={handleClearRecent}
          onRecentClick={handleRecentClick}
          onUserClick={handleUserClick}
          onHashtagClick={handleHashtagClick}
        />
      )}
    </div>
  )
}
