import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Eye,
  Link,
  Unlink,
  Bold,
  Italic,
  List,
  Heading1,
  Heading2,
  Heading3,
} from 'lucide-react';
import { TagInput, Tag } from '@/components/Tag';
import { useStore } from '@/store';
import { tagSystem } from '@/modules/tagSystem';
import { renderMarkdown } from '@/utils/markdown';
import type { Note } from '@/types';

const NoteEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { notes, tags, resources, addNote, updateNote, addTag, deleteNote } = useStore();

  const isEditing = id && id !== 'new';
  const existing = isEditing ? notes.find((n) => n.id === id) : null;
  const preselectedResourceId = searchParams.get('resourceId');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    tags: [] as string[],
    resourceIds: [] as string[],
  });

  const [showPreview, setShowPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (existing) {
      setFormData({
        title: existing.title,
        content: existing.content,
        tags: existing.tags,
        resourceIds: existing.resourceIds,
      });
    } else if (preselectedResourceId) {
      setFormData((prev) => ({
        ...prev,
        resourceIds: [preselectedResourceId],
      }));
    }
  }, [existing, preselectedResourceId]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('请输入笔记标题');
      return;
    }

    const noteData: Partial<Note> = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      tags: formData.tags,
      resourceIds: formData.resourceIds,
    };

    if (isEditing && existing) {
      updateNote(existing.id, noteData);
      navigate(`/notes`);
    } else {
      const newId = addNote(noteData as Omit<Note, 'id' | 'createdAt' | 'updatedAt'>);
      navigate(`/notes`);
    }
  };

  const handleAddTag = (tagName: string) => {
    const existingTag = tags.find((t) => t.name === tagName);
    if (existingTag) {
      if (!formData.tags.includes(existingTag.id)) {
        setFormData({ ...formData, tags: [...formData.tags, existingTag.id] });
      }
    } else {
      const newTagId = addTag({ name: tagName, color: tagSystem.generateColor(tags) });
      setFormData({ ...formData, tags: [...formData.tags, newTagId] });
    }
  };

  const handleRemoveTag = (tagId: string) => {
    setFormData({ ...formData, tags: formData.tags.filter((id) => id !== tagId) });
  };

  const toggleResourceLink = (resourceId: string) => {
    setFormData((prev) => ({
      ...prev,
      resourceIds: prev.resourceIds.includes(resourceId)
        ? prev.resourceIds.filter((id) => id !== resourceId)
        : [...prev.resourceIds, resourceId],
    }));
  };

  const insertMarkdown = (prefix: string, suffix: string = prefix) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = formData.content.substring(start, end);
    const newContent =
      formData.content.substring(0, start) +
      prefix +
      selectedText +
      suffix +
      formData.content.substring(end);

    setFormData({ ...formData, content: newContent });

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        end + prefix.length
      );
    }, 0);
  };

  const handleDelete = () => {
    if (confirm('确定要删除这条笔记吗？')) {
      if (existing) {
        deleteNote(existing.id);
        navigate('/notes');
      }
    }
  };

  const linkedResources = resources.filter((r) =>
    formData.resourceIds.includes(r.id)
  );
  const availableResources = resources.filter(
    (r) => !formData.resourceIds.includes(r.id)
  );

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>取消</span>
        </button>

        <div className="flex items-center gap-2">
          {isEditing && existing && (
            <button
              onClick={handleDelete}
              className="px-4 py-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-medium transition-colors"
            >
              删除
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Eye size={18} />
            预览
          </button>
          <button
            type="submit"
            form="note-form"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={18} />
            保存
          </button>
        </div>
      </div>

      <form id="note-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {isEditing ? '编辑笔记' : '新建笔记'}
          </h1>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                标题 <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors dark:bg-gray-700 dark:text-gray-100"
                placeholder="输入笔记标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">标签</label>
              <TagInput
                tags={tags}
                selectedTagIds={formData.tags}
                onAddTag={handleAddTag}
                onRemoveTag={handleRemoveTag}
              />
              <div className="flex flex-wrap gap-1.5 mt-2">
                {formData.tags.map((tagId) => {
                  const tag = tags.find((t) => t.id === tagId);
                  return tag ? (
                    <Tag
                      key={tagId}
                      tag={tag}
                      size="sm"
                      onRemove={() => handleRemoveTag(tagId)}
                    />
                  ) : null;
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">关联资料</label>
              <div className="space-y-3">
                {linkedResources.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">已关联</p>
                    <div className="flex flex-wrap gap-2">
                      {linkedResources.map((resource) => (
                        <span
                          key={resource.id}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 rounded-full text-sm"
                        >
                          {resource.title}
                          <button
                            type="button"
                            onClick={() => toggleResourceLink(resource.id)}
                            className="hover:text-red-600 transition-colors"
                          >
                            <Unlink size={14} />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {availableResources.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5">可关联</p>
                    <div className="flex flex-wrap gap-2">
                      {availableResources.slice(0, 6).map((resource) => (
                        <button
                          key={resource.id}
                          type="button"
                          onClick={() => toggleResourceLink(resource.id)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 rounded-full text-sm transition-colors"
                        >
                          <Link size={14} />
                          {resource.title}
                        </button>
                      ))}
                      {availableResources.length > 6 && (
                        <span className="px-3 py-1.5 text-gray-400 text-sm">
                          还有 {availableResources.length - 6} 份资料
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="flex items-center gap-1 px-3 py-2 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50">
            <button
              type="button"
              onClick={() => insertMarkdown('**')}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="粗体"
            >
              <Bold size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('*')}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="斜体"
            >
              <Italic size={16} />
            </button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              type="button"
              onClick={() => insertMarkdown('# ')}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="标题1"
            >
              <Heading1 size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('## ')}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="标题2"
            >
              <Heading2 size={16} />
            </button>
            <button
              type="button"
              onClick={() => insertMarkdown('### ')}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="标题3"
            >
              <Heading3 size={16} />
            </button>
            <div className="w-px h-5 bg-gray-300 dark:bg-gray-600 mx-1" />
            <button
              type="button"
              onClick={() => insertMarkdown('- ')}
              className="p-1.5 text-gray-600 hover:bg-gray-200 rounded transition-colors"
              title="无序列表"
            >
              <List size={16} />
            </button>
          </div>

          {showPreview ? (
            <div className="min-h-[500px] p-6 prose prose-slate max-w-none">
              {formData.content ? (
                <div dangerouslySetInnerHTML={{ __html: renderMarkdown(formData.content) }} />
              ) : (
                <p className="text-gray-400">暂无内容</p>
              )}
            </div>
          ) : (
            <textarea
              ref={textareaRef}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full h-[500px] px-6 py-4 border-0 focus:ring-0 resize-none font-mono text-sm leading-relaxed dark:bg-gray-700 dark:text-gray-100"
              placeholder="开始记录你的笔记...

支持 Markdown 语法：
# 标题
**粗体** *斜体*
- 列表项
```代码块```"
            />
          )}
        </div>
      </form>
    </div>
  );
};

export default NoteEditor;
