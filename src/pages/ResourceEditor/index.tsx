import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import { TagInput, Tag } from '@/components/Tag';
import { useStore } from '@/store';
import { tagSystem } from '@/modules/tagSystem';
import type { Resource } from '@/types';

const ResourceEditor: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { resources, tags, addResource, updateResource, addTag } = useStore();

  const isEditing = id && id !== 'new';
  const existing = isEditing ? resources.find((r) => r.id === id) : null;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    tags: [] as string[],
  });

  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (existing) {
      setFormData({
        title: existing.title,
        content: existing.content,
        category: existing.category,
        tags: existing.tags,
      });
    }
  }, [existing]);

  const categories = tagSystem.getAllCategories(resources);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title.trim()) {
      alert('请输入资料标题');
      return;
    }

    const resourceData: Partial<Resource> = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      category: formData.category || '未分类',
      tags: formData.tags,
      progress: existing?.progress || 0,
      status: existing?.status || 'not_started',
    };

    if (isEditing && existing) {
      updateResource(existing.id, resourceData);
      navigate(`/resource/${existing.id}`);
    } else {
      const newId = addResource(resourceData as Omit<Resource, 'id' | 'createdAt' | 'updatedAt'>);
      navigate(`/resource/${newId}`);
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

  const renderMarkdownPreview = (content: string) => {
    const lines = content.split('\n');
    return lines.map((line, index) => {
      if (line.startsWith('# ')) {
        return <h1 key={index} className="text-2xl font-bold mb-4">{line.slice(2)}</h1>;
      }
      if (line.startsWith('## ')) {
        return <h2 key={index} className="text-xl font-bold mb-3">{line.slice(3)}</h2>;
      }
      if (line.startsWith('### ')) {
        return <h3 key={index} className="text-lg font-bold mb-2">{line.slice(4)}</h3>;
      }
      if (line.startsWith('- ')) {
        return <li key={index} className="ml-4">{line.slice(2)}</li>;
      }
      return <p key={index} className="mb-2">{line}</p>;
    });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          <ArrowLeft size={20} />
          <span>取消</span>
        </button>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              showPreview
                ? 'bg-blue-100 text-blue-700'
                : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-600'
            }`}
          >
            <Eye size={18} />
            预览
          </button>
          <button
            type="submit"
            form="resource-form"
            className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg text-sm font-medium transition-colors"
          >
            <Save size={18} />
            保存
          </button>
        </div>
      </div>

      <form id="resource-form" onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-6">
            {isEditing ? '编辑资料' : '添加资料'}
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
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                placeholder="输入资料标题"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">分类</label>
              <div className="flex gap-2">
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                >
                  <option value="">选择分类</option>
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="或新建分类"
                  onBlur={(e) => {
                    if (e.target.value.trim()) {
                      setFormData({ ...formData, category: e.target.value.trim() });
                    }
                  }}
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
                />
              </div>
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
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">内容</label>

          {showPreview ? (
            <div className="min-h-[400px] p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg prose prose-slate max-w-none">
              {formData.content ? (
                renderMarkdownPreview(formData.content)
              ) : (
                <p className="text-gray-400">暂无内容</p>
              )}
            </div>
          ) : (
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full h-[400px] px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors resize-none font-mono text-sm"
              placeholder="支持 Markdown 格式..."
            />
          )}

          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
            <span className="font-medium">Markdown 语法：</span>
            <code># 标题</code>
            <code>**粗体**</code>
            <code>*斜体*</code>
            <code>- 列表项</code>
            <code>[链接](url)</code>
          </div>
        </div>
      </form>
    </div>
  );
};

export default ResourceEditor;
