'use client';

import { EconomicAidInformation } from '@components/errand-sections/economic-aid-information.component';
import { OtherParties } from '@components/errand-sections/other-parties.component';
import { Reporter } from '@components/errand-sections/reporter.component';
import { appConfig } from 'src/config/appconfig';

export const RegisterErrand: React.FC = () => {
  return (
    <div className="flex flex-col gap-32">
      <h2 className="text-h2-md text-dark-primary">1. Grundinformation</h2>
      <Reporter />
      {appConfig.features.otherPartiesDisclosure && <OtherParties />}
      <h2 className="text-h2-md text-dark-primary">2. Ärendeuppgifter</h2>
      <EconomicAidInformation />
    </div>
  );
};
