'use client';

import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';
import type { ListingCondition } from '@/types/domain';

interface CategoryItem {
  id: number;
  name: string;
  slug: string;
}

interface ListingFiltersProps {
  categories: CategoryItem[];
  selectedCategory: string | null;
  onSelectCategory: (slug: string | null) => void;
  selectedCondition: ListingCondition | null;
  onSelectCondition: (condition: ListingCondition | null) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedSort: string;
  onSortChange: (sort: string) => void;
  onClearAll: () => void;
}

const conditions: ListingCondition[] = ['New', 'Like New', 'Good', 'Used', 'Damaged'];

export default function ListingFilters({
  categories,
  selectedCategory,
  onSelectCategory,
  selectedCondition,
  onSelectCondition,
  searchQuery,
  onSearchChange,
  selectedSort,
  onSortChange,
  onClearAll,
}: ListingFiltersProps) {
  const [mobileFilterOpen, setMobileFilterOpen] = React.useState(false);

  const hasActiveFilters = Boolean(
    selectedCategory || selectedCondition || searchQuery.trim() || selectedSort !== 'newest'
  );

  return (
    <div className="space-y-4 mb-6">
      {/* Top Bar: Search Input, Filter Trigger (Mobile), Sort Dropdown */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-neutral-muted">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search textbooks, calculators, monitors, gym gear..."
            className="w-full pl-10 pr-9 py-2.5 rounded-md border border-border text-sm text-neutral-text placeholder:text-neutral-muted bg-white transition-colors focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-neutral-muted hover:text-neutral-text"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sort & Filter Controls */}
        <div className="flex items-center gap-2">
          {/* Mobile Filter Toggle Button */}
          <button
            type="button"
            onClick={() => setMobileFilterOpen((prev) => !prev)}
            className="sm:hidden flex-1 py-2.5 px-3.5 bg-white border border-border rounded-md text-sm font-medium text-neutral-text flex items-center justify-center gap-2 hover:bg-surface min-h-[44px]"
          >
            <SlidersHorizontal className="w-4 h-4 text-neutral-muted" />
            <span>Filters</span>
            {(selectedCategory || selectedCondition) && (
              <span className="w-2 h-2 rounded-full bg-primary" />
            )}
          </button>

          {/* Sort Dropdown */}
          <div className="min-w-[170px]">
            <select
              value={selectedSort}
              onChange={(e) => onSortChange(e.target.value)}
              className="w-full py-2.5 px-3 bg-white border border-border rounded-md text-sm font-medium text-neutral-text focus:outline-none focus:ring-2 focus:ring-primary min-h-[44px]"
              aria-label="Sort listings"
            >
              <option value="newest">Newest First</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </div>

      {/* Category Pills (Desktop & Expanded Mobile) */}
      <div className={`space-y-3 ${mobileFilterOpen ? 'block' : 'hidden sm:block'}`}>
        {/* Categories */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => onSelectCategory(null)}
            className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] border ${
              selectedCategory === null
                ? 'bg-primary text-white border-primary'
                : 'bg-white text-neutral-muted border-border hover:border-neutral-text hover:text-neutral-text'
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => onSelectCategory(selectedCategory === cat.slug ? null : cat.slug)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors min-h-[32px] border ${
                selectedCategory === cat.slug
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-neutral-muted border-border hover:border-neutral-text hover:text-neutral-text'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Condition Filter & Clear */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
          <div className="flex items-center gap-1.5 overflow-x-auto">
            <span className="text-xs font-semibold text-neutral-muted uppercase tracking-wider mr-1">
              Condition:
            </span>
            {conditions.map((cond) => (
              <button
                key={cond}
                type="button"
                onClick={() => onSelectCondition(selectedCondition === cond ? null : cond)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors border min-h-[28px] ${
                  selectedCondition === cond
                    ? 'bg-neutral-text text-white border-neutral-text'
                    : 'bg-white text-neutral-muted border-border hover:bg-surface'
                }`}
              >
                {cond}
              </button>
            ))}
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onClearAll}
              className="text-xs text-primary hover:underline font-medium py-1 px-2"
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
