import type { Resource, Note, Tag, SearchResult } from '@/types';
import { extractTextFromMarkdown } from '@/utils/markdown';

type SearchableItem = Resource | Note;

interface IndexEntry {
  id: string;
  type: 'resource' | 'note';
  title: string;
  content: string;
  tags: string[];
  rawItem: SearchableItem;
}

class SearchEngine {
  private index: Map<string, IndexEntry> = new Map();
  private invertedIndex: Map<string, Set<string>> = new Map();
  private searchHistory: string[] = [];

  buildIndex(resources: Resource[], notes: Note[], tags: Tag[]): void {
    this.index.clear();
    this.invertedIndex.clear();

    resources.forEach(resource => {
      const entry: IndexEntry = {
        id: resource.id,
        type: 'resource',
        title: resource.title,
        content: extractTextFromMarkdown(resource.content),
        tags: resource.tags,
        rawItem: resource,
      };
      this.addToIndex(entry);
    });

    notes.forEach(note => {
      const entry: IndexEntry = {
        id: note.id,
        type: 'note',
        title: note.title,
        content: extractTextFromMarkdown(note.content),
        tags: note.tags,
        rawItem: note,
      };
      this.addToIndex(entry);
    });
  }

  private addToIndex(entry: IndexEntry): void {
    this.index.set(entry.id, entry);

    const allText = `${entry.title} ${entry.content}`.toLowerCase();
    const tokens = this.tokenize(allText);

    tokens.forEach(token => {
      if (!this.invertedIndex.has(token)) {
        this.invertedIndex.set(token, new Set());
      }
      this.invertedIndex.get(token)!.add(entry.id);
    });
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\u4e00-\u9fa5\s]/g, ' ')
      .split(/\s+/)
      .filter(token => token.length > 0);
  }

  private calculateScore(entry: IndexEntry, query: string, queryTokens: string[]): number {
    let score = 0;
    const queryLower = query.toLowerCase();

    if (entry.title.toLowerCase().includes(queryLower)) {
      score += 50;
    }

    const titleTokens = this.tokenize(entry.title.toLowerCase());
    queryTokens.forEach(token => {
      if (titleTokens.includes(token)) {
        score += 30;
      }
    });

    const contentTokens = this.tokenize(entry.content.toLowerCase());
    queryTokens.forEach(token => {
      const count = contentTokens.filter(t => t === token).length;
      score += count * 5;
    });

    if (entry.tags.some(tagId => {
      const tagName = tagId.toLowerCase();
      return tagName.includes(queryLower) || queryTokens.some(t => tagName.includes(t));
    })) {
      score += 20;
    }

    return score;
  }

  private fuzzyMatch(text: string, query: string): boolean {
    const textLower = text.toLowerCase();
    const queryLower = query.toLowerCase();

    if (textLower.includes(queryLower)) return true;

    let queryIndex = 0;
    for (let i = 0; i < textLower.length && queryIndex < queryLower.length; i++) {
      if (textLower[i] === queryLower[queryIndex]) {
        queryIndex++;
      }
    }

    return queryIndex === queryLower.length;
  }

  search<T extends SearchableItem>(
    query: string,
    resources: Resource[],
    notes: Note[],
    tags: Tag[],
    type: 'resource' | 'note' | 'all' = 'all'
  ): SearchResult<T>[] {
    if (!query.trim()) {
      const allItems: SearchableItem[] = [];
      if (type === 'all' || type === 'resource') {
        allItems.push(...resources);
      }
      if (type === 'all' || type === 'note') {
        allItems.push(...notes);
      }
      return allItems.map(item => ({
        item: item as T,
        score: 0,
        matches: [],
      }));
    }

    this.buildIndex(resources, notes, tags);

    const queryTokens = this.tokenize(query.toLowerCase());
    const matchedIds = new Set<string>();

    queryTokens.forEach(token => {
      this.invertedIndex.forEach((entryIds, indexToken) => {
        if (this.fuzzyMatch(indexToken, token)) {
          entryIds.forEach(id => matchedIds.add(id));
        }
      });
    });

    const results: SearchResult<T>[] = [];

    matchedIds.forEach(id => {
      const entry = this.index.get(id);
      if (!entry) return;

      if (type !== 'all' && entry.type !== type) return;

      const score = this.calculateScore(entry, query, queryTokens);
      if (score > 0) {
        const matches = this.findMatches(entry, queryTokens);
        results.push({
          item: entry.rawItem as T,
          score,
          matches,
        });
      }
    });

    if (matchedIds.size === 0) {
      this.index.forEach((entry) => {
        if (type !== 'all' && entry.type !== type) return;

        const titleMatch = this.fuzzyMatch(entry.title, query);
        const contentMatch = this.fuzzyMatch(entry.content, query);
        const tagMatch = entry.tags.some(tagId => {
          const tag = tags.find(t => t.id === tagId);
          return tag && this.fuzzyMatch(tag.name, query);
        });

        if (titleMatch || contentMatch || tagMatch) {
          const score = this.calculateScore(entry, query, queryTokens);
          const matches = this.findMatches(entry, queryTokens);
          results.push({
            item: entry.rawItem as T,
            score: score || 10,
            matches,
          });
        }
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }

  private findMatches(entry: IndexEntry, queryTokens: string[]): string[] {
    const matches: string[] = [];
    const text = `${entry.title} ${entry.content}`.toLowerCase();

    queryTokens.forEach(token => {
      if (text.includes(token)) {
        matches.push(token);
      }
    });

    return [...new Set(matches)];
  }

  addToHistory(query: string): void {
    if (!query.trim()) return;
    this.searchHistory = this.searchHistory.filter(q => q !== query);
    this.searchHistory.unshift(query);
    if (this.searchHistory.length > 20) {
      this.searchHistory = this.searchHistory.slice(0, 20);
    }
  }

  getHistory(): string[] {
    return this.searchHistory;
  }

  clearHistory(): void {
    this.searchHistory = [];
  }
}

export const searchEngine = new SearchEngine();

export function highlightSearchResult<T>(
  results: SearchResult<T>[],
  keyword: string
): SearchResult<T>[] {
  return results;
}
