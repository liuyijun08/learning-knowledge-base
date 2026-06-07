import type { Tag, Resource, Note } from '@/types';
import { generateId } from '@/utils/markdown';

const PRESET_COLORS = [
  '#3b82f6',
  '#ec4899',
  '#8b5cf6',
  '#10b981',
  '#f59e0b',
  '#ef4444',
  '#6b7280',
  '#06b6d4',
  '#84cc16',
  '#f97316',
];

class TagSystem {
  private colorIndex = 0;

  createTag(name: string, color?: string): Tag {
    return {
      id: generateId(),
      name: name.trim(),
      color: color || this.getNextColor(),
    };
  }

  private getNextColor(): string {
    const color = PRESET_COLORS[this.colorIndex % PRESET_COLORS.length];
    this.colorIndex++;
    return color;
  }

  getTagById(tags: Tag[], id: string): Tag | undefined {
    return tags.find(tag => tag.id === id);
  }

  getTagByName(tags: Tag[], name: string): Tag | undefined {
    return tags.find(tag => tag.name.toLowerCase() === name.toLowerCase());
  }

  getOrCreateTag(tags: Tag[], name: string): { tag: Tag; isNew: boolean } {
    const existing = this.getTagByName(tags, name);
    if (existing) {
      return { tag: existing, isNew: false };
    }
    const newTag = this.createTag(name);
    return { tag: newTag, isNew: true };
  }

  filterByTag<T extends { tags: string[] }>(items: T[], tagId: string): T[] {
    return items.filter(item => item.tags.includes(tagId));
  }

  filterByMultipleTags<T extends { tags: string[] }>(
    items: T[],
    tagIds: string[],
    operator: 'AND' | 'OR' = 'AND'
  ): T[] {
    if (tagIds.length === 0) return items;

    return items.filter(item => {
      if (operator === 'AND') {
        return tagIds.every(tagId => item.tags.includes(tagId));
      } else {
        return tagIds.some(tagId => item.tags.includes(tagId));
      }
    });
  }

  getTagUsageCount(resources: Resource[], notes: Note[], tagId: string): number {
    const resourceCount = resources.filter(r => r.tags.includes(tagId)).length;
    const noteCount = notes.filter(n => n.tags.includes(tagId)).length;
    return resourceCount + noteCount;
  }

  getTagCloud(
    tags: Tag[],
    resources: Resource[],
    notes: Note[]
  ): Array<{ tag: Tag; count: number }> {
    return tags.map(tag => ({
      tag,
      count: this.getTagUsageCount(resources, notes, tag.id),
    })).sort((a, b) => b.count - a.count);
  }

  getResourceTags(resource: Resource, allTags: Tag[]): Tag[] {
    return resource.tags
      .map(tagId => allTags.find(t => t.id === tagId))
      .filter((t): t is Tag => !!t);
  }

  getNoteTags(note: Note, allTags: Tag[]): Tag[] {
    return note.tags
      .map(tagId => allTags.find(t => t.id === tagId))
      .filter((t): t is Tag => !!t);
  }

  getPopularTags(
    tags: Tag[],
    resources: Resource[],
    notes: Note[],
    limit: number = 10
  ): Array<{ tag: Tag; count: number }> {
    return this.getTagCloud(tags, resources, notes).slice(0, limit);
  }

  mergeTags(
    tags: Tag[],
    fromTagId: string,
    toTagId: string,
    resources: Resource[],
    notes: Note[]
  ): {
    tags: Tag[];
    resources: Resource[];
    notes: Note[];
  } {
    const newResources = resources.map(resource => ({
      ...resource,
      tags: resource.tags.map(tagId => tagId === fromTagId ? toTagId : tagId),
    }));

    const newNotes = notes.map(note => ({
      ...note,
      tags: note.tags.map(tagId => tagId === fromTagId ? toTagId : tagId),
    }));

    const newTags = tags.filter(tag => tag.id !== fromTagId);

    return { tags: newTags, resources: newResources, notes: newNotes };
  }

  deleteTag(
    tags: Tag[],
    tagId: string,
    resources: Resource[],
    notes: Note[]
  ): {
    tags: Tag[];
    resources: Resource[];
    notes: Note[];
  } {
    const newResources = resources.map(resource => ({
      ...resource,
      tags: resource.tags.filter(id => id !== tagId),
    }));

    const newNotes = notes.map(note => ({
      ...note,
      tags: note.tags.filter(id => id !== tagId),
    }));

    const newTags = tags.filter(tag => tag.id !== tagId);

    return { tags: newTags, resources: newResources, notes: newNotes };
  }

  getAllCategories(resources: Resource[]): string[] {
    return [...new Set(resources.map(r => r.category))].filter(Boolean);
  }

  getResourcesByCategory(resources: Resource[], category: string): Resource[] {
    return resources.filter(r => r.category === category);
  }

  generateColor(tags: Tag[]): string {
    const usedColors = new Set(tags.map(t => t.color));
    const availableColors = PRESET_COLORS.filter(c => !usedColors.has(c));
    return availableColors.length > 0 ? availableColors[0] : this.getNextColor();
  }
}

export const tagSystem = new TagSystem();
