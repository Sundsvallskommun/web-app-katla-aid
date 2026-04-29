import { useMemo } from 'react';
import { getActiveWizardSteps, WizardStep } from '@components/wizard/wizard-steps';

export function useActiveWizardSteps(): WizardStep[] {
  return useMemo(() => getActiveWizardSteps(), []);
}
