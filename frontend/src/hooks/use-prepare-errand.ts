import { errandFormDataToJsonParameters } from '@components/json/utils/schema-utils';
import { ErrandFormDTO } from '@interfaces/errand-form';

export function usePrepareErrand() {
  const prepareErrandForApi = (values: ErrandFormDTO, status: string) => {
    const { errandFormData, ...errandWithoutFormData } = values;

    return {
      ...errandWithoutFormData,
      status,
      jsonParameters: errandFormDataToJsonParameters(errandFormData),
    };
  };

  return { prepareErrandForApi };
}
