'use client';

import { EconomicAidInformation } from '@components/errand-sections/economic-aid-information.component';
import { jsonParametersToErrandFormData } from '@components/json/utils/schema-utils';
import { ErrandFormDTO } from '@interfaces/errand-form';
import { getErrandUsingErrandNumber } from '@services/errand-service/errand-service';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';
import { useFormContext } from 'react-hook-form';

export const CreatedErrand: React.FC = () => {
  const context = useFormContext<ErrandFormDTO>();
  const pathName = usePathname();

  useEffect(() => {
    getErrandUsingErrandNumber(pathName?.split('/')[2]).then((res) => {
      const errandFormData = jsonParametersToErrandFormData(res.jsonParameters);
      context.reset({ ...res, errandFormData });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-32">
      <EconomicAidInformation />
    </div>
  );
};
