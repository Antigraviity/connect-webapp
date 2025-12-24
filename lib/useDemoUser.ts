/**
 * React Hook for Demo User functionality
 * Makes it easy to check demo user status in components
 */

import { useMemo } from 'react';
import { useAuth } from './useAuth';
import { 
  isDemoUser, 
  shouldShowExistingData, 
  shouldShowTeamSection,
  getDemoUserConfig 
} from './demo-user-utils';

export const useDemoUser = () => {
  const { user } = useAuth();

  const isDemo = useMemo(() => isDemoUser(user), [user]);
  const canSeeExistingData = useMemo(() => shouldShowExistingData(user), [user]);
  const canSeeTeam = useMemo(() => shouldShowTeamSection(user), [user]);
  const config = useMemo(() => getDemoUserConfig(), []);

  return {
    user,
    isDemo,
    canSeeExistingData,
    canSeeTeam,
    config,
    // Quick check functions
    shouldHideTeam: !canSeeTeam,
    shouldFilterImages: isDemo,
  };
};
