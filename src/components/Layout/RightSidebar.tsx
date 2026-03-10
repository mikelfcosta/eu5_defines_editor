interface RightSidebarCategory {
  name: string;
  defineCount: number;
  modifiedCount: number;
}

interface RightSidebarProps {
  categories: RightSidebarCategory[];
}

export function RightSidebar({ categories }: RightSidebarProps) {
  return (
    <aside className="right-sidebar" aria-label="Category anchors">
      <h2>Categories</h2>
      <nav>
        {categories.map((category) => (
          <a key={category.name} href={`#category-${category.name}`}>
            {category.name} ({category.defineCount} / {category.modifiedCount} modified)
          </a>
        ))}
      </nav>
    </aside>
  );
}
