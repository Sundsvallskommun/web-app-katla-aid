export interface WizardStep {
  id: string;
  titleKey: string;
}

export const ALL_WIZARD_STEPS: WizardStep[] = [
  { id: 'economic-aid', titleKey: 'errand-information:economic_aid_information.title' },
  { id: 'summary', titleKey: 'errand-information:wizard.summary' },
];

export function getActiveWizardSteps(): WizardStep[] {
  return ALL_WIZARD_STEPS;
}
