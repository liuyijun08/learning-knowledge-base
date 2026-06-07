import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { ResourceCard } from '@/components/Card';
import { TagCloud } from '@/components/Tag';
import { useStore } from '@/store';
import { searchEngine } from '@/modules/searchEngine';
import { tagSystem } from '@/modules/tagSystem';
import type { Tag as TagType } from '@/types';
import { Filter, ArrowUpDown, Grid3X3, List } from 'lucide-react';

const ResourceList: React.FC = () => {
  const navigate = useNavigate();
  const { resources, tags, learningRecords, addResource } = useStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [searchType, setSearchType] = useState<'all' | 'resource' | 'note'>('resource');
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [sortBy, setSortBy] = useState<'recent' | 'progress' | 'name'>('recent');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const categories = useMemo(() => tagSystem.getAllCategories(resources), [resources]);

  const tagCloud = useMemo(
    () => tagSystem.getTagCloud(tags, resources, []),
    [tags, resources]
  );

  const filteredResources = useMemo(() => {
    let results = resources as (typeof resources[number])[];

    if (searchQuery) {
      results = searchEngine
        .search(searchQuery, results, [], tags, searchType)
        .filter((r) => 'progress' in r.item)
        .map((r) => r.item as typeof resources[number]);
    }

    if (selectedTagIds.length > 0) {
      results = tagSystem.filterByMultipleTags(results, selectedTagIds, 'AND');
    }

    if (selectedCategory) {
      results = results.filter((r) => r.category === selectedCategory);
    }

    return results.sort((a, b) => {
      switch (sortBy) {
        case 'recent':
          return (
            new Date(b.lastStudiedAt || b.updatedAt).getTime() -
            new Date(a.lastStudiedAt || a.updatedAt).getTime()
          );
        case 'progress':
          return b.progress - a.progress;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
  }, [resources, tags, searchQuery, searchType, selectedTagIds, selectedCategory, sortBy]);

  const getStudyTime = (resourceId: string): number => {
    return learningRecords
      .filter((r) => r.resourceId === resourceId)
      .reduce((sum, r) => sum + r.duration, 0);
  };

  const handleSearch = (query: string) => {
    setSearchHistory((prev) => {
      const filtered = prev.filter((q) => q !== query);
      return [query, ...filtered].slice(0, 20);
    });
  };

  const handleTagClick = (tag: TagType) => {
    setSelectedTagIds((prev) =>
      prev.includes(tag.id) ? prev.filter((id) => id !== tag.id) : [...prev, tag.id]
    );
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
                onClick={() => setSelectedTagIds([])}
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
              {[
                { value: 'recent', label: '最近学习' },
                { value: 'progress', label: '学习进度' },
                { value: 'name', label: '名称排序' },
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSortBy(option.value as typeof sortBy)}
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
          {filteredResources.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {searchQuery || selectedTagIds.length > 0 || selectedCategory
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
              {filteredResources.map((resource) => (
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
