import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  FileText,
  Calendar,
  BarChart3,
  Settings,
  Plus,
  Menu,
  X,
  Library,
  PenLine,
  Home,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useStore } from '@/store';

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { resources, notes, reviewSchedules } = useStore();

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  const navItems: NavItem[] = [
    {
      path: '/',
      label: '首页',
      icon: <Home size={20} />,
    },
    {
      path: '/resources',
      label: '资料库',
      icon: <Library size={20} />,
    },
    {
      path: '/notes',
      label: '笔记',
      icon: <FileText size={20} />,
    },
    {
      path: '/review',
      label: '复习日历',
      icon: <Calendar size={20} />,
    },
    {
      path: '/statistics',
      label: '统计',
      icon: <BarChart3 size={20} />,
    },
    {
      path: '/settings',
      label: '设置',
      icon: <Settings size={20} />,
    },
  ];

  const todayReviewCount = reviewSchedules.filter(
    (s) =>
      new Date(s.dueDate).toDateString() === new Date().toDateString() &&
      !s.completed
  ).length;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex">
      <aside
        className={cn(
          'fixed lg:sticky top-0 left-0 z-40 h-screen bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-64' : 'w-20',
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-100 dark:border-gray-700">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                知
              </div>
              <div>
                <h1 className="font-bold text-gray-900 dark:text-gray-100">学习知识库</h1>
                <p className="text-xs text-gray-500 dark:text-gray-400">Knowledge Base</p>
              </div>
            </div>
          )}
          {!sidebarOpen && (
            <div className="w-full flex justify-center">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold text-lg">
                知
              </div>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:block p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            {sidebarOpen ? <Menu size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive =
              item.path === '/'
                ? location.pathname === '/'
                : location.pathname.startsWith(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all group relative',
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-gray-200',
                  !sidebarOpen && 'justify-center'
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-500 dark:bg-blue-400 rounded-r-full" />
                )}
                <span className={cn(isActive && 'text-blue-600 dark:text-blue-400')}>{item.icon}</span>
                {sidebarOpen && (
                  <>
                    <span className="flex-1 text-left">{item.label}</span>
                    {item.path === '/review' && todayReviewCount > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                        {todayReviewCount}
                      </span>
                    )}
                  </>
                )}
                {!sidebarOpen && (
                  <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 dark:bg-gray-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                    {item.path === '/review' && todayReviewCount > 0 && ` (${todayReviewCount})`}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>

        {sidebarOpen && (
          <div className="p-4 border-t border-gray-100 dark:border-gray-700">
            <div className="bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-4 text-white">
              <p className="text-sm font-medium mb-1">快速开始</p>
              <p className="text-xs opacity-90 mb-3">
                共 {resources.length} 份资料，{notes.length} 条笔记
              </p>
              <div className="flex gap-2">
                <NavLink
                  to="/resource/new"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <Plus size={16} />
                  资料
                </NavLink>
                <NavLink
                  to="/notes/new"
                  className="flex-1 flex items-center justify-center gap-1 px-3 py-2 bg-white/20 hover:bg-white/30 rounded-lg text-sm font-medium transition-colors"
                >
                  <PenLine size={16} />
                  笔记
                </NavLink>
              </div>
            </div>
          </div>
        )}
      </aside>

      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-h-screen">
        <header className="sticky top-0 z-20 bg-white/80 dark:bg-gray-800/80 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>

            <div className="flex-1" />

            <div className="flex items-center gap-3">
              <NavLink
                to="/resource/new"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
              >
                <Plus size={18} />
                添加资料
              </NavLink>
              <NavLink
                to="/notes/new"
                className="hidden sm:flex items-center gap-2 px-4 py-2 border border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors"
              >
                <PenLine size={18} />
                写笔记
              </NavLink>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-8 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
