'use client';

import { EconomicAidInformation } from '@components/errand-sections/economic-aid-information.component';

export const RegisterErrand: React.FC = () => {
  return (
    <div className="flex flex-col gap-32">
      <EconomicAidInformation />
    </div>
  );
};
