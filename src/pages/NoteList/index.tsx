import React from 'react';
import { useNavigate } from 'react-router-dom';
import { SearchBar } from '@/components/SearchBar';
import { NoteCard } from '@/components/Card';
import { TagCloud } from '@/components/Tag';
import { useStore } from '@/store';
import { useListFilter, noteSortOptions } from '@/hooks/useListFilter';
import type { Note } from '@/types';
import { FileText, Plus, Filter, ArrowUpDown } from 'lucide-react';

const NoteList: React.FC = () => {
  const navigate = useNavigate();
  const { notes, resources, tags } = useStore();

  const {
    searchQuery,
    setSearchQuery,
    searchType,
    setSearchType,
    searchHistory,
    selectedTagIds,
    sortBy,
    setSortBy,
    filteredItems: filteredNotes,
    tagCloud,
    handleSearch,
    handleTagClick,
    clearTagFilters,
    hasActiveFilters,
  } = useListFilter<Note>({
    items: notes,
    tags,
    resources,
    notes,
    defaultSearchType: 'note',
    sortOptions: noteSortOptions,
    defaultSortBy: 'updated',
    searchFilterFn: (r) => 'content' in r.item && !('progress' in r.item),
    searchResources: [],
    searchNotes: notes,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">学习笔记</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            共 {notes.length} 条笔记
          </p>
        </div>

        <button
          onClick={() => navigate('/notes/new')}
          className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
        >
          <Plus size={18} />
          新建笔记
        </button>
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
              {noteSortOptions.map((option) => (
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
          {filteredNotes.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-12 text-center">
              <FileText size={48} className="mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 dark:text-gray-400 mb-4">
                {hasActiveFilters
                  ? '没有找到匹配的笔记'
                  : '还没有任何笔记'}
              </p>
              <button
                onClick={() => navigate('/notes/new')}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
              >
                写第一条笔记
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredNotes.map((note) => (
                <NoteCard
                  key={note.id}
                  note={note}
                  tags={tags}
                  resources={resources}
                  onClick={() => navigate(`/notes/${note.id}/edit`)}
                  onDelete={() => {
                    if (confirm('确定要删除这条笔记吗？')) {
                      useStore.getState().deleteNote(note.id);
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

export default NoteList;
