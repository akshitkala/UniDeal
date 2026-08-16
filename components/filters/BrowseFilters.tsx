"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { FormEvent, useState } from "react";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";

type CategoryOption = {
  id: number;
  name: string;
};

type BrowseFiltersProps = {
  categories: CategoryOption[];
};

export function BrowseFilters({ categories }: BrowseFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Read URL state on load
  const currentSearch = searchParams.get("search") || "";
  const currentCategory = searchParams.get("category") || "";
  const currentCondition = searchParams.get("condition") || "";
  const currentSort = searchParams.get("sort") || "newest";

  // Local state for search input to prevent server query spam on keystroke
  const [searchVal, setSearchVal] = useState(currentSearch);
  const [prevSearch, setPrevSearch] = useState(currentSearch);

  // Keep local search input in sync if URL changes (e.g. user clears filter)
  if (currentSearch !== prevSearch) {
    setPrevSearch(currentSearch);
    setSearchVal(currentSearch);
  }

  function updateParams(newParams: Record<string, string>) {
    const params = new URLSearchParams(searchParams.toString());
    
    Object.entries(newParams).forEach(([key, value]) => {
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
    });

    router.push(`${pathname}?${params.toString()}`);
  }

  function handleSearchSubmit(e: FormEvent) {
    e.preventDefault();
    updateParams({ search: searchVal });
  }

  return (
    <div className="rounded-lg border border-border bg-surface p-4 shadow-sm space-y-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <Input
          type="text"
          value={searchVal}
          onChange={(e) => setSearchVal(e.target.value)}
          placeholder="Search books, electronics, notes..."
          className="flex-1"
        />
        <Button type="submit">Search</Button>
        {currentSearch ? (
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setSearchVal("");
              updateParams({ search: "" });
            }}
          >
            Clear
          </Button>
        ) : null}
      </form>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Select
          value={currentCategory}
          onChange={(e) => updateParams({ category: e.target.value })}
        >
          <option value="">All Categories</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </Select>

        <Select
          value={currentCondition}
          onChange={(e) => updateParams({ condition: e.target.value })}
        >
          <option value="">All Conditions</option>
          <option value="New">New</option>
          <option value="Like New">Like New</option>
          <option value="Good">Good</option>
          <option value="Used">Used</option>
          <option value="Damaged">Damaged</option>
        </Select>

        <Select
          value={currentSort}
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          <option value="newest">Sort by: Newest</option>
          <option value="price_asc">Sort by: Price Low to High</option>
          <option value="price_desc">Sort by: Price High to Low</option>
        </Select>
      </div>
    </div>
  );
}
