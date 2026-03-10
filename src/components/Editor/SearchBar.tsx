interface SearchBarProps {
  search: string;
  categoryFilter: string;
  categoryNames: string[];
  modifiedOnly: boolean;
  onSearchChange: (value: string) => void;
  onCategoryFilterChange: (value: string) => void;
  onModifiedOnlyChange: (value: boolean) => void;
}

export function SearchBar({
  search,
  categoryFilter,
  categoryNames,
  modifiedOnly,
  onSearchChange,
  onCategoryFilterChange,
  onModifiedOnlyChange
}: SearchBarProps) {
  return (
    <section className="search-bar" aria-label="Define filters">
      <div>
        <label htmlFor="search-input">Search</label>
        <input
          id="search-input"
          type="search"
          placeholder="Search key or comment"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div>
        <label htmlFor="category-filter">Category</label>
        <select id="category-filter" value={categoryFilter} onChange={(event) => onCategoryFilterChange(event.target.value)}>
          <option value="all">All Categories</option>
          {categoryNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="checkbox-wrap">
        <input
          id="modified-only"
          type="checkbox"
          checked={modifiedOnly}
          onChange={(event) => onModifiedOnlyChange(event.target.checked)}
        />
        <label htmlFor="modified-only">Modified only</label>
      </div>
    </section>
  );
}
