import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { ResourceCard } from '@/components/Card';
import { TagCloud } from '@/components/Tag';
import { useStore } from '@/store';
import { tagSystem } from '@/modules/tagSystem';
import { useListFilter, resourceSortOptions } from '@/hooks/useListFilter';
import type { Resource } from '@/types';
import { Filter, ArrowUpDown, Grid3X3, List } from 'lucide-react';

const ResourceList: React.FC = () => {
  const navigate = useNavigate();
  const { resources, tags, learningRecords } = useStore();

  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => tagSystem.getAllCategories(resources), [resources]);

  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchHistory,
    selectedTagIds,
    sortBy,
    setSortBy,
    filteredItems: filteredResources,
    tagCloud,
    handleSearch,
    handleTagClick,
    clearTagFilters,
    hasActiveFilters,
  } = useListFilter<Resource>({
    items: resources,
    tags,
    resources,
    notes: [],
    defaultSearchType: 'resource',
    sortOptions: resourceSortOptions,
    defaultSortBy: 'recent',
    searchFilterFn: (r) => 'progress' in r.item,
    searchResources: resources,
    searchNotes: [],
  });

  const finalFilteredResources = useMemo(() => {
    return selectedCategory
      ? filteredResources.filter((r) => r.category === selectedCategory)
      : filteredResources;
  }, [filteredResources, selectedCategory]);

  const getStudyTime = (resourceId: string): number => {
    return learningRecords
      .filter((r) => r.resourceId === resourceId)
      .reduce((sum, r) => sum + r.duration, 0);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">学习资料</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            共 {resources.length} 份资料，已完成 {resources.filter((r) => r.status === 'completed').length} 份
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
            className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
          >
            {viewMode === 'grid' ? <List size={20} /> : <Grid3X3 size={20} />}
          </button>
        </div>
      </div>

      <SearchBar
        value={searchQuery}
        onChange={setSearchQuery}
        onSearch={handleSearch}
        searchType={searchType}
        onTypeChange={setSearchType}
        history={searchHistory}
        onHistorySelect={setSearchQuery}
      />

      <div className="flex flex-col lg:flex-row gap-6">
        <aside className="lg:w-64 flex-shrink-0 space-y-6">
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Filter size={16} className="text-gray-500 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">筛选</h3>
            </div>

            {categories.length > 0 && (
              <div className="mb-4">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">分类</p>
                <div className="space-y-1">
                  <button
                    onClick={() => setSelectedCategory('')}
                    className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                      !selectedCategory
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                        : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    全部分类
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category === selectedCategory ? '' : category)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                        category === selectedCategory
                          ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                          : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                      }`}
                    >
                      {category}
                      <span className="ml-2 text-xs text-gray-400">
                        {resources.filter((r) => r.category === category).length}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">标签</p>
              <TagCloud
                tags={tagCloud}
                onTagClick={handleTagClick}
                selectedTagIds={selectedTagIds}
              />
            </div>

            {selectedTagIds.length > 0 && (
              <button
                onClick={clearTagFilters}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                清除标签筛选
              </button>
            )}
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
            <div className="flex items-center gap-2 mb-3">
              <ArrowUpDown size={16} className="text-gray-500 dark:text-gray-400" />
              <h3 className="font-semibold text-gray-900 dark:text-gray-100">排序</h3>
            </div>

            <div className="space-y-1">
              {resourceSortOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    sortBy === option.value
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600'
                      : 'text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </aside>

        <main className="flex-1 min-w-0">
          {finalFilteredResources.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {hasActiveFilters || selectedCategory
                  ? '没有找到匹配的资料'
                  : '还没有任何学习资料'}
              </p>
              <button
                onClick={() => navigate('/resource/new')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                添加第一份资料
              </button>
            </div>
          ) : (
            <div
              className={`grid gap-4 ${
                viewMode === 'grid'
                  ? 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3'
                  : 'grid-cols-1'
              }`}
            >
              {finalFilteredResources.map((resource) => (
                <ResourceCard
                  key={resource.id}
                  resource={resource}
                  tags={tags}
                  totalStudyTime={getStudyTime(resource.id)}
                  onClick={() => navigate(`/resource/${resource.id}`)}
                  onDelete={() => {
                    if (confirm('确定要删除这份资料吗？')) {
                      useStore.getState().deleteResource(resource.id);
                    }
                  }}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default ResourceList;
