import React, { useState, useRef } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Palette,
  Database,
  Download,
  Upload,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Info,
  Moon,
  Sun,
  Monitor,
} from 'lucide-react';
import { useStore } from '@/store';
import { useTheme } from '@/hooks/useTheme';
import { backupManager } from '@/modules/backup';
import type { Settings as SettingsType } from '@/types';

const Settings: React.FC = () => {
  const { settings, updateSettings, importData, clearData, downloadBackup } = useStore();
  const { theme, setTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'general' | 'data'>('general');
  const [exportStatus, setExportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      downloadBackup();
      setExportStatus('success');
      setTimeout(() => setExportStatus('idle'), 3000);
    } catch (error) {
      setExportStatus('error');
      setTimeout(() => setExportStatus('idle'), 3000);
    }
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const content = await backupManager.readBackupFile(file);
      const success = importData(content);
      if (success) {
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } else {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    } catch (error) {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
    }

    e.target.value = '';
  };

  const handleClearData = () => {
    if (
      confirm('确定要清除所有数据吗？此操作不可恢复，请确保已备份数据。') &&
      confirm('再次确认：你真的要删除所有学习资料、笔记、记录吗？')
    ) {
      clearData();
    }
  };

  const tabs = [
    { id: 'general', label: '通用设置', icon: <SettingsIcon size={18} /> },
    { id: 'data', label: '数据管理', icon: <Database size={18} /> },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">设置</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">自定义你的学习体验</p>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex items-center gap-2 px-6 py-4 text-sm font-medium transition-colors border-b-2 ${
                activeTab === tab.id
                  ? 'text-blue-600 dark:text-blue-400 border-blue-500 dark:border-blue-400 bg-blue-50/50 dark:bg-blue-900/20'
                  : 'text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <User size={20} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">个人信息</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      用户名
                    </label>
                    <input
                      type="text"
                      value={settings.username}
                      onChange={(e) => updateSettings({ username: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="输入你的名字"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      邮箱（可选）
                    </label>
                    <input
                      type="email"
                      value={settings.email}
                      onChange={(e) => updateSettings({ email: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                      placeholder="用于数据同步（未来功能）"
                    />
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Palette size={20} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">外观设置</h3>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    主题模式
                  </label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { value: 'light' as const, label: '浅色', icon: <Sun size={20} /> },
                      { value: 'dark' as const, label: '深色', icon: <Moon size={20} /> },
                      { value: 'system' as const, label: '跟随系统', icon: <Monitor size={20} /> },
                    ].map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-xl border-2 transition-all ${
                          theme === t.value
                            ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30'
                            : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'
                        }`}
                      >
                        <span className={theme === t.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}>
                          {t.icon}
                        </span>
                        <span className={`text-sm font-medium ${
                          theme === t.value ? 'text-blue-600 dark:text-blue-400' : 'text-gray-700 dark:text-gray-300'
                        }`}>
                          {t.label}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    主色调
                  </label>
                  <div className="flex flex-wrap gap-3">
                    {[
                      { value: '#1e3a5f', label: '深蓝' },
                      { value: '#0891b2', label: '青色' },
                      { value: '#059669', label: '绿色' },
                      { value: '#d97706', label: '橙色' },
                      { value: '#dc2626', label: '红色' },
                      { value: '#7c3aed', label: '紫色' },
                    ].map((color) => (
                      <button
                        key={color.value}
                        onClick={() => updateSettings({ primaryColor: color.value })}
                        className={`w-10 h-10 rounded-full ring-offset-2 dark:ring-offset-gray-800 transition-all ${
                          settings.primaryColor === color.value
                            ? 'ring-2 ring-gray-900 dark:ring-gray-100 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <SettingsIcon size={20} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">学习设置</h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">每日学习目标</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">设置每日学习时长目标（分钟）</p>
                    </div>
                    <input
                      type="number"
                      min="15"
                      max="480"
                      step="15"
                      value={settings.dailyGoal}
                      onChange={(e) => updateSettings({ dailyGoal: Number(e.target.value) })}
                      className="w-24 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-center bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">自动开始复习</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">打开应用时自动显示待复习内容</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoStartReview: !settings.autoStartReview })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.autoStartReview ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.autoStartReview ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-gray-100">自动保存</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">编辑时自动保存到本地存储</p>
                    </div>
                    <button
                      onClick={() => updateSettings({ autoSave: !settings.autoSave })}
                      className={`relative w-12 h-6 rounded-full transition-colors ${
                        settings.autoSave ? 'bg-blue-500 dark:bg-blue-600' : 'bg-gray-300 dark:bg-gray-600'
                      }`}
                    >
                      <span
                        className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          settings.autoSave ? 'translate-x-7' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="space-y-8">
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Info size={20} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">数据概览</h3>
                </div>

                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                  <div className="flex items-start gap-3">
                    <Info size={20} className="text-blue-500 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-blue-800 dark:text-blue-300">
                      <p className="font-medium mb-1">关于数据存储</p>
                      <p>
                        所有数据仅保存在你的浏览器本地（localStorage）中，不会上传到任何服务器。
                        定期备份数据可以防止数据丢失。
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Download size={20} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">导出数据</h3>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    导出所有学习资料、笔记、学习记录和设置为 JSON 备份文件。
                    建议定期导出以备份你的数据。
                  </p>

                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleExport}
                      className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      <Download size={18} />
                      导出备份文件
                    </button>

                    {exportStatus === 'success' && (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 size={16} />
                        导出成功
                      </span>
                    )}
                    {exportStatus === 'error' && (
                      <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle size={16} />
                        导出失败
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Upload size={20} className="text-gray-500 dark:text-gray-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">导入数据</h3>
                </div>

                <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                    从之前导出的 JSON 备份文件恢复数据。注意：导入将合并现有数据，不会覆盖。
                  </p>

                  <div className="flex items-center gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".json"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <button
                      onClick={handleImportClick}
                      className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
                    >
                      <Upload size={18} />
                      选择备份文件
                    </button>

                    {importStatus === 'success' && (
                      <span className="flex items-center gap-1 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle2 size={16} />
                        导入成功
                      </span>
                    )}
                    {importStatus === 'error' && (
                      <span className="flex items-center gap-1 text-sm text-red-600 dark:text-red-400">
                        <AlertTriangle size={16} />
                        导入失败，请检查文件格式
                      </span>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Trash2 size={20} className="text-red-500 dark:text-red-400" />
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">危险操作</h3>
                </div>

                <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <div className="flex items-start gap-3 mb-4">
                    <AlertTriangle size={20} className="text-red-500 dark:text-red-400 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-red-800 dark:text-red-300">
                      <p className="font-medium mb-1">清除所有数据</p>
                      <p>
                        此操作将永久删除所有学习资料、笔记、学习记录和设置，且无法恢复。
                        请在执行前确保已导出备份。
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleClearData}
                    className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    <Trash2 size={18} />
                    清除所有数据
                  </button>
                </div>
              </div>

              <div className="text-xs text-gray-400 dark:text-gray-500 pt-4 border-t border-gray-200 dark:border-gray-700">
                <p>版本 1.0.0 | 数据版本 {backupManager.getVersion()}</p>
                <p className="mt-1">
                  本应用为纯前端应用，所有数据保存在浏览器本地。
                  清除浏览器数据或更换浏览器将导致数据丢失，请定期备份。
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;
