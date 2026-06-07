import type { Resource, Note, Tag, LearningRecord, ReviewSchedule, Settings } from '@/types';
import { generateId } from '@/utils/markdown';
import { dayjs, addDays } from '@/utils/date';

const now = dayjs().toISOString();

export const defaultTags: Tag[] = [
  { id: 'tag-1', name: '编程', color: '#3b82f6' },
  { id: 'tag-2', name: '前端', color: '#ec4899' },
  { id: 'tag-3', name: '算法', color: '#8b5cf6' },
  { id: 'tag-4', name: '数学', color: '#10b981' },
  { id: 'tag-5', name: '英语', color: '#f59e0b' },
  { id: 'tag-6', name: '重要', color: '#ef4444' },
  { id: 'tag-7', name: '待复习', color: '#6b7280' },
  { id: 'tag-8', name: '已掌握', color: '#06b6d4' },
];

export const defaultResources: Resource[] = [
  {
    id: 'res-1',
    title: 'React 18 新特性详解',
    content: `# React 18 新特性详解

## 并发特性

React 18 引入了并发渲染（Concurrent Rendering）机制，这是一个重大的架构升级。

### 主要特性

1. **Automatic Batching**
   - 自动批处理多个状态更新
   - 减少不必要的重新渲染

2. **Transitions**
   - 使用 \`useTransition\` 标记非紧急更新
   - 保持界面响应性

3. **Suspense 改进**
   - 支持服务端渲染
   - 更好的加载状态处理

## 代码示例

\`\`\`jsx
import { useTransition, useState } from 'react';

function App() {
  const [isPending, startTransition] = useTransition();
  const [count, setCount] = useState(0);

  function handleClick() {
    startTransition(() => {
      setCount(c => c + 1);
    });
  }

  return (
    <div>
      <button onClick={handleClick}>点击</button>
      {isPending && <span>加载中...</span>}
      <p>计数: {count}</p>
    </div>
  );
}
\`\`\`

## 性能优化

- 使用 \`useDeferredValue\` 延迟处理低优先级更新
- 配合 \`React.memo\` 优化子组件渲染
`,
    category: '前端开发',
    tags: ['tag-1', 'tag-2', 'tag-6'],
    progress: 75,
    status: 'learning',
    createdAt: dayjs().subtract(7, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
    lastStudiedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'res-2',
    title: 'TypeScript 高级类型技巧',
    content: `# TypeScript 高级类型技巧

## 条件类型

\`\`\`typescript
type IsString<T> = T extends string ? true : false;

type A = IsString<string>; // true
type B = IsString<number>; // false
\`\`\`

## 映射类型

\`\`\`typescript
type Readonly<T> = {
  readonly [P in keyof T]: T[P];
};

type Partial<T> = {
  [P in keyof T]?: T[P];
};
\`\`\`

## 模板字面量类型

\`\`\`typescript
type EventName<T extends string> = \`on\${Capitalize<T>}\`;

type ClickEvent = EventName<'click'>; // 'onClick'
\`\`\`

## 实用工具类型

- \`Awaited<T>\` - 解包 Promise 类型
- \`ReturnType<T>\` - 获取函数返回类型
- \`Parameters<T>\` - 获取函数参数类型
`,
    category: '前端开发',
    tags: ['tag-1', 'tag-2'],
    progress: 100,
    status: 'completed',
    createdAt: dayjs().subtract(14, 'day').toISOString(),
    updatedAt: dayjs().subtract(3, 'day').toISOString(),
    lastStudiedAt: dayjs().subtract(2, 'day').toISOString(),
  },
  {
    id: 'res-3',
    title: '算法导论 - 排序算法',
    content: `# 排序算法详解

## 快速排序

快速排序是一种分治算法，平均时间复杂度 O(n log n)。

### 算法步骤

1. 选择基准元素（pivot）
2. 分区：将小于基准的元素放左边，大于的放右边
3. 递归排序左右两部分

### 代码实现

\`\`\`typescript
function quickSort(arr: number[]): number[] {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}
\`\`\`

## 归并排序

归并排序保证 O(n log n) 的时间复杂度，是稳定排序。

## 算法对比

| 算法 | 平均时间 | 最坏时间 | 空间 | 稳定性 |
|------|----------|----------|------|--------|
| 冒泡 | O(n²) | O(n²) | O(1) | 稳定 |
| 快速 | O(n log n) | O(n²) | O(log n) | 不稳定 |
| 归并 | O(n log n) | O(n log n) | O(n) | 稳定 |
| 堆排序 | O(n log n) | O(n log n) | O(1) | 不稳定 |
`,
    category: '计算机科学',
    tags: ['tag-1', 'tag-3', 'tag-6'],
    progress: 40,
    status: 'learning',
    createdAt: dayjs().subtract(21, 'day').toISOString(),
    updatedAt: dayjs().subtract(5, 'day').toISOString(),
    lastStudiedAt: dayjs().toISOString(),
  },
  {
    id: 'res-4',
    title: '线性代数基础',
    content: `# 线性代数基础

## 矩阵运算

### 矩阵加法

两个同型矩阵对应元素相加。

### 矩阵乘法

设 A 是 m×n 矩阵，B 是 n×p 矩阵，则 C = AB 是 m×p 矩阵。

## 特征值与特征向量

对于 n 阶方阵 A，如果存在数 λ 和非零 n 维向量 x，使得：

Ax = λx

则称 λ 是 A 的特征值，x 是对应的特征向量。

## 应用

- 计算机图形学中的坐标变换
- 机器学习中的降维（PCA）
- 量子力学中的状态表示
`,
    category: '数学',
    tags: ['tag-4', 'tag-7'],
    progress: 10,
    status: 'not_started',
    createdAt: dayjs().subtract(30, 'day').toISOString(),
    updatedAt: dayjs().subtract(30, 'day').toISOString(),
  },
  {
    id: 'res-5',
    title: '英语词汇速记法',
    content: `# 英语词汇速记法

## 词根词缀法

### 常见前缀

- **pre-**: 前（preview, predict）
- **post-**: 后（postpone, postwar）
- **re-**: 再，重（review, repeat）
- **un-**: 不（unhappy, unknown）

### 常见词根

- **port**: 搬运（import, export, transport）
- **spect**: 看（inspect, respect, prospect）
- **duct**: 引导（conduct, produce, reduce）

## 联想记忆法

将单词与具体的图像或场景联系起来，形成深刻记忆。

## 间隔重复

使用间隔重复系统（SRS）安排复习时间，根据遗忘曲线优化记忆效果。
`,
    category: '语言学习',
    tags: ['tag-5', 'tag-7'],
    progress: 60,
    status: 'learning',
    createdAt: dayjs().subtract(10, 'day').toISOString(),
    updatedAt: dayjs().subtract(2, 'day').toISOString(),
    lastStudiedAt: dayjs().toISOString(),
  },
];

export const defaultNotes: Note[] = [
  {
    id: 'note-1',
    title: 'React 18 useTransition 笔记',
    content: `## useTransition 使用场景

当需要处理大量数据更新但又不想阻塞用户交互时使用。

### 最佳实践

1. 用于列表搜索、过滤等可能导致大量重渲染的操作
2. 配合 \`Suspense\` 使用效果更佳
3. 不要过度使用，大部分简单更新不需要

### 常见误区

❌ 错误：用于所有状态更新
✅ 正确：仅用于非紧急的、可能耗时的更新

\`\`\`jsx
// 好的用法
const [filter, setFilter] = useState('');
const [isPending, startTransition] = useTransition();

function handleFilterChange(e) {
  const value = e.target.value;
  setFilter(value); // 紧急更新：输入框实时响应
  startTransition(() => {
    setSearchQuery(value); // 非紧急更新：搜索结果可以延迟
  });
}
\`\`\`
`,
    resourceIds: ['res-1'],
    tags: ['tag-1', 'tag-2'],
    createdAt: dayjs().subtract(6, 'day').toISOString(),
    updatedAt: dayjs().subtract(1, 'day').toISOString(),
  },
  {
    id: 'note-2',
    title: 'TypeScript 类型体操笔记',
    content: `## 递归条件类型

实现 DeepReadonly：

\`\`\`typescript
type DeepReadonly<T> = {
  readonly [P in keyof T]: T[P] extends object
    ? T[P] extends Function
      ? T[P]
      : DeepReadonly<T[P]>
    : T[P];
};
\`\`\`

## 推断类型

使用 \`infer\` 关键字推断类型：

\`\`\`typescript
type ReturnType<T> = T extends (...args: any[]) => infer R ? R : any;
\`\`\`
`,
    resourceIds: ['res-2'],
    tags: ['tag-1', 'tag-2', 'tag-8'],
    createdAt: dayjs().subtract(12, 'day').toISOString(),
    updatedAt: dayjs().subtract(3, 'day').toISOString(),
  },
  {
    id: 'note-3',
    title: '排序算法时间复杂度记忆',
    content: `## 记忆口诀

冒选插基 O(n²)，快归堆桶 O(n log n)

- **冒**：冒泡排序
- **选**：选择排序  
- **插**：插入排序
- **基**：基数排序（特殊情况）
- **快**：快速排序
- **归**：归并排序
- **堆**：堆排序
- **桶**：桶排序

## 稳定排序

冒泡、插入、归并、基数排序是稳定的。
其他排序（快速、选择、堆）是不稳定的。

> 稳定排序：相等元素的相对顺序在排序后保持不变
`,
    resourceIds: ['res-3'],
    tags: ['tag-3', 'tag-8'],
    createdAt: dayjs().subtract(20, 'day').toISOString(),
    updatedAt: dayjs().subtract(5, 'day').toISOString(),
  },
  {
    id: 'note-4',
    title: '跨资料学习笔记',
    content: `## 函数式编程思想

在 React、TypeScript 和算法中都能看到函数式编程的影子：

### React
- 纯函数组件
- 不可变数据
- 高阶组件（HOC）

### TypeScript
- 函数类型
- 柯里化
- 组合子

### 算法
- 递归
- 分治思想
- 纯函数实现

> 学习时注意融会贯通，不同领域的知识往往有共通之处。
`,
    resourceIds: ['res-1', 'res-2', 'res-3'],
    tags: ['tag-1', 'tag-6'],
    createdAt: dayjs().subtract(8, 'day').toISOString(),
    updatedAt: dayjs().subtract(4, 'day').toISOString(),
  },
];

export const defaultLearningRecords: LearningRecord[] = [
  { id: generateId(), resourceId: 'res-1', duration: 45, date: dayjs().subtract(6, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-1', duration: 60, date: dayjs().subtract(5, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-2', duration: 30, date: dayjs().subtract(5, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-1', duration: 35, date: dayjs().subtract(4, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-3', duration: 50, date: dayjs().subtract(4, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-5', duration: 25, date: dayjs().subtract(3, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-1', duration: 40, date: dayjs().subtract(2, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-2', duration: 55, date: dayjs().subtract(2, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-3', duration: 30, date: dayjs().subtract(1, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-5', duration: 20, date: dayjs().subtract(1, 'day').toISOString() },
  { id: generateId(), resourceId: 'res-1', duration: 65, date: now },
  { id: generateId(), resourceId: 'res-3', duration: 40, date: now },
  { id: generateId(), resourceId: 'res-5', duration: 30, date: now },
];

export const defaultReviewSchedules: ReviewSchedule[] = [
  {
    id: 'review-1',
    resourceId: 'res-2',
    dueDate: addDays(now, -2),
    interval: 6,
    repetitions: 2,
    easeFactor: 2.5,
    completed: true,
  },
  {
    id: 'review-2',
    resourceId: 'res-3',
    dueDate: addDays(now, -1),
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    completed: true,
  },
  {
    id: 'review-3',
    resourceId: 'res-1',
    dueDate: now,
    interval: 1,
    repetitions: 1,
    easeFactor: 2.5,
    completed: false,
  },
  {
    id: 'review-4',
    resourceId: 'res-5',
    dueDate: now,
    interval: 1,
    repetitions: 1,
    easeFactor: 2.6,
    completed: false,
  },
  {
    id: 'review-5',
    resourceId: 'res-3',
    dueDate: addDays(now, 1),
    interval: 6,
    repetitions: 2,
    easeFactor: 2.4,
    completed: false,
  },
  {
    id: 'review-6',
    resourceId: 'res-2',
    dueDate: addDays(now, 3),
    interval: 15,
    repetitions: 3,
    easeFactor: 2.5,
    completed: false,
  },
  {
    id: 'review-7',
    resourceId: 'res-4',
    dueDate: addDays(now, 5),
    interval: 1,
    repetitions: 0,
    easeFactor: 2.5,
    completed: false,
  },
];

export const defaultSettings: Settings = {
  theme: 'light',
  username: '',
  email: '',
  primaryColor: '#1e3a5f',
  dailyGoal: 60,
  autoStartReview: true,
  autoSave: true,
  reviewParams: {
    initialInterval: 1,
    easeFactor: 2.5,
    minimumInterval: 1,
  },
};
