import { EconomicAidInformation } from '@components/errand-sections/economic-aid-information.component';
import { WizardSummary } from './wizard-summary.component';
import { useActiveWizardSteps } from 'src/hooks/use-active-wizard-steps';
import { useWizardStore } from 'src/stores/wizard-store';
import { useTranslation } from 'react-i18next';

export const WizardStepContent: React.FC = () => {
  const { t } = useTranslation();
  const currentStep = useWizardStore((s) => s.currentStep);
  const steps = useActiveWizardSteps();
  const step = steps[currentStep];

  const renderStepContent = () => {
    switch (step?.id) {
      case 'economic-aid':
        return <EconomicAidInformation compact />;
      case 'summary':
        return <WizardSummary />;
      default:
        return null;
    }
  };

  return (
    <div className="px-16 py-24">
      {step?.id !== 'summary' && <h2 className="text-h3-md mb-16">{t(step?.titleKey)}</h2>}
      {renderStepContent()}
    </div>
  );
};
