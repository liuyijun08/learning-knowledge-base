import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from '@/components/Layout';
import Home from '@/pages/Home';
import ResourceList from '@/pages/ResourceList';
import ResourceDetail from '@/pages/ResourceDetail';
import ResourceEditor from '@/pages/ResourceEditor';
import NoteList from '@/pages/NoteList';
import NoteEditor from '@/pages/NoteEditor';
import ReviewCalendar from '@/pages/ReviewCalendar';
import Statistics from '@/pages/Statistics';
import Settings from '@/pages/Settings';
import { useTheme } from '@/hooks/useTheme';

function ThemeInitializer({ children }: { children: React.ReactNode }) {
  useTheme();
  return <>{children}</>;
}

export default function App() {
  return (
    <Router>
      <ThemeInitializer>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<ResourceList />} />
            <Route path="/resource/new" element={<ResourceEditor />} />
            <Route path="/resource/:id" element={<ResourceDetail />} />
            <Route path="/resource/:id/edit" element={<ResourceEditor />} />
            <Route path="/notes" element={<NoteList />} />
            <Route path="/notes/new" element={<NoteEditor />} />
            <Route path="/notes/:id/edit" element={<NoteEditor />} />
            <Route path="/review" element={<ReviewCalendar />} />
            <Route path="/statistics" element={<Statistics />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
      </ThemeInitializer>
    </Router>
  );
}
