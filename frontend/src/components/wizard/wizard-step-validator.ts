import { validateErrandFormData } from '@components/json/utils/schema-utils';
import { ErrandFormDTO } from '@interfaces/errand-form';
import type { TFunction } from 'i18next';
import { WizardStep } from './wizard-steps';

export async function validateStep(
  step: WizardStep,
  formValues: ErrandFormDTO,
  t?: TFunction
): Promise<string[]> {
  switch (step.id) {
    case 'economic-aid': {
      return validateErrandFormData(formValues.errandFormData, t);
    }

    case 'reporter':
    case 'summary':
    default:
      return [];
  }
}
