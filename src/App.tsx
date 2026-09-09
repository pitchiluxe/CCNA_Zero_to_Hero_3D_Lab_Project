import { Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { HelmetProvider } from 'react-helmet-async';
import { useProgress } from './stores/progress';
import { Layout } from './components/layout/Layout';
import { Dashboard } from './components/pages/Dashboard';
import { LabView } from './components/pages/LabView';
import { LandingPage } from './components/pages/LandingPage';
import { ContactPage } from './components/pages/ContactPage';
import { OnboardingModal } from './components/OnboardingModal';

function App() {
  const theme = useProgress((s) => s.theme);
  const onboarding = useProgress((s) => s.onboarding);
  const setOnboarding = useProgress((s) => s.setOnboarding);

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
        <Route
          path="/app/*"
          element={
            <Layout>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/lab/:labId" element={<LabView />} />
              </Routes>
              {onboarding && <OnboardingModal onClose={() => setOnboarding(false)} />}
            </Layout>
          }
        />
      </Routes>
    </HelmetProvider>
  );
}

export default App;
