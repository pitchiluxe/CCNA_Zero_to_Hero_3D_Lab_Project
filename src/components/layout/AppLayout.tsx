import { Outlet } from 'react-router-dom';
import { Layout } from './Layout';
import { OnboardingModal } from '../OnboardingModal';
import { useProgress } from '../../stores/progress';

export function AppLayout() {
  const onboarding = useProgress((s) => s.onboarding);
  const setOnboarding = useProgress((s) => s.setOnboarding);

  return (
    <>
      <Layout>
        <Outlet />
      </Layout>
      {onboarding && <OnboardingModal onClose={() => setOnboarding(false)} />}
    </>
  );
}
