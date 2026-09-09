import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useProgress } from './stores/progress';
import { AppLayout } from './components/layout/AppLayout';
import { Dashboard } from './components/pages/Dashboard';
import { LabView } from './components/pages/LabView';
import { LandingPage } from './components/pages/LandingPage';
import { ContactPage } from './components/pages/ContactPage';

function App() {
  const theme = useProgress((s) => s.theme);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  return (
    <HelmetProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/app" element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="lab/:labId" element={<LabView />} />
        </Route>
      </Routes>
    </HelmetProvider>
  );
}

export default App;
