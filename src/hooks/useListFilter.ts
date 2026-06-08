import { useState, useMemo, useCallback } from 'react';
import { searchEngine } from '@/modules/searchEngine';
import { tagSystem } from '@/modules/tagSystem';
import type { Tag, Resource, Note, SearchResult } from '@/types';

type SearchType = 'all' | 'resource' | 'note';
type SearchableItem = Resource | Note;

interface SortOption<T> {
  value: string;
  label: string;
  sortFn: (a: T, b: T) => number;
}

interface UseListFilterOptions<T extends SearchableItem> {
  items: T[];
  tags: Tag[];
  resources?: Resource[];
  notes?: Note[];
  defaultSearchType?: SearchType;
  sortOptions: SortOption<T>[];
  defaultSortBy?: string;
  searchFilterFn?: (result: SearchResult<T>) => boolean;
  searchResources?: Resource[];
  searchNotes?: Note[];
}

interface UseListFilterResult<T extends SearchableItem> {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  searchType: SearchType;
  setSearchType: (type: SearchType) => void;
  searchHistory: string[];
  selectedTagIds: string[];
  setSelectedTagIds: (ids: string[]) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOptions: SortOption<T>[];
  filteredItems: T[];
  tagCloud: Array<{ tag: Tag; count: number }>;
  handleSearch: (query: string) => void;
  handleTagClick: (tag: Tag) => void;
  clearTagFilters: () => void;
  hasActiveFilters: boolean;
}

export function useListFilter<T extends SearchableItem>(
  options: UseListFilterOptions<T>
): UseListFilterResult<T> {
  const {
    items,
    tags,
    resources = [],
    notes = [],
    defaultSearchType = 'all',
    sortOptions,
    defaultSortBy,
    searchFilterFn,
    searchResources = resources,
    searchNotes = notes,
  } = options;

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<SearchType>(defaultSearchType);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<string>(defaultSortBy || sortOptions[0]?.value || '');

  const tagCloud = useMemo(
    () => tagSystem.getTagCloud(tags, resources, notes),
    [tags, resources, notes]
  );

  const filteredItems = useMemo(() => {
    let results = [...items] as T[];

    if (searchQuery) {
      const searchResults = searchEngine.search<T>(
        searchQuery,
        searchResources,
        searchNotes,
        tags,
        searchType
      );

      const filteredResults = searchFilterFn
        ? searchResults.filter(searchFilterFn)
        : searchResults;

      results = filteredResults.map((r) => r.item);
    }

    if (selectedTagIds.length > 0) {
      results = tagSystem.filterByMultipleTags(results, selectedTagIds, 'AND');
    }

    const sortOption = sortOptions.find((opt) => opt.value === sortBy);
    if (sortOption) {
      results.sort(sortOption.sortFn);
    }

    return results;
  }, [
    items,
    tags,
    searchQuery,
    searchType,
    selectedTagIds,
    sortBy,
    sortOptions,
    searchFilterFn,
    searchResources,
    searchNotes,
  ]);

  const handleSearch = useCallback((query: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 20);
    });
  }, []);

  const handleTagClick = useCallback((tag: Tag) => {
    setSelectedTagIds((prev) =>
      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
    );
  }, []);

  const clearTagFilters = useCallback(() => {
    setSelectedTagIds([]);
  }, []);

  const hasActiveFilters = useMemo(
    () => searchQuery !== '' || selectedTagIds.length > 0,
    [searchQuery, selectedTagIds]
  );

  return {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchHistory,
    selectedTagIds,
    setSelectedTagIds,
    sortBy,
    setSortBy,
    sortOptions,
    filteredItems,
    tagCloud,
    handleSearch,
    handleTagClick,
    clearTagFilters,
    hasActiveFilters,
  };
}

export function createDateSortFn<T extends SearchableItem>(
  dateField: keyof T
): (a: T, b: T) => number {
  return (a: T, b: T) => {
    const dateA = a[dateField] as string | undefined;
    const dateB = b[dateField] as string | undefined;
    if (!dateA || !dateB) return 0;
    return new Date(dateB).getTime() - new Date(dateA).getTime();
  };
}

export function createNameSortFn<T extends SearchableItem>(): (a: T, b: T) => number {
  return (a: T, b: T) => a.title.localeCompare(b.title);
}

export function createProgressSortFn<T extends Resource>(): (a: T, b: T) => number {
  return (a: T, b: T) => (b.progress || 0) - (a.progress || 0);
}

export const resourceSortOptions = [
  {
    value: 'recent',
    label: '最近学习',
    sortFn: (a: Resource, b: Resource) =>
      new Date(b.lastStudiedAt || b.updatedAt).getTime() -
      new Date(a.lastStudiedAt || a.updatedAt).getTime(),
  },
  {
    value: 'progress',
    label: '学习进度',
    sortFn: (a: Resource, b: Resource) => b.progress - a.progress,
  },
  {
    value: 'name',
    label: '名称排序',
    sortFn: (a: Resource, b: Resource) => a.title.localeCompare(b.title),
  },
];

export const noteSortOptions = [
  {
    value: 'updated',
    label: '最近更新',
    sortFn: (a: Note, b: Note) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime(),
  },
  {
    value: 'created',
    label: '创建时间',
    sortFn: (a: Note, b: Note) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  },
  {
    value: 'name',
    label: '名称排序',
    sortFn: (a: Note, b: Note) => a.title.localeCompare(b.title),
  },
];
