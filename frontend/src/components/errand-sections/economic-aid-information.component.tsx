'use client';

import { ErrandDisclosure } from '@components/disclosure/errand-information-disclosure.component';
import { useFormSchema } from '@components/json/hooks/use-form-schema';
import SchemaForm from '@components/json/schema/schema-form.component';
import { useFormValidation } from '@contexts/form-validation-context';
import { ErrandFormDTO } from '@interfaces/errand-form';
import { Briefcase, Home, Landmark, MessageSquare, Receipt, User as UserIcon, Wallet } from 'lucide-react';
import { ReactElement, useCallback, useMemo } from 'react';
import { useFormContext } from 'react-hook-form';

interface SchemaSection {
  schemaName: string;
  icon: ReactElement;
  initialOpen?: boolean;
}

const SECTIONS: SchemaSection[] = [
  { schemaName: 'uppgifter-sokande', icon: <UserIcon />, initialOpen: true },
  { schemaName: 'boende', icon: <Home /> },
  { schemaName: 'sysselsattning', icon: <Briefcase /> },
  { schemaName: 'inkomster', icon: <Wallet /> },
  { schemaName: 'ovriga-utgifter', icon: <Receipt /> },
  { schemaName: 'situation-bakgrund', icon: <MessageSquare /> },
  { schemaName: 'bankkonto', icon: <Landmark /> },
];

interface SchemaSectionFieldProps {
  schemaName: string;
  index: number;
  icon: ReactElement;
  initialOpen?: boolean;
  compact?: boolean;
}

function SchemaSectionField({ schemaName, index, icon, initialOpen, compact }: SchemaSectionFieldProps) {
  const { watch, setValue } = useFormContext<ErrandFormDTO>();
  const { showValidation } = useFormValidation();
  const { schema, uiSchema, loading, error } = useFormSchema(schemaName);
  const status = watch('status');
  const isDraft = status === 'DRAFT';

  const rawData = watch(`errandFormData.${index}.data`) ?? '{}';
  const formData = typeof rawData === 'string' ? JSON.parse(rawData) : rawData;

  const handleChange = useCallback(
    (data: Record<string, unknown>) => {
      setValue(`errandFormData.${index}`, { schemaName, data: JSON.stringify(data) });
    },
    [setValue, index, schemaName]
  );

  // Disclosure header already shows the title; tell RJSF to suppress its own
  const uiSchemaWithoutTitle = useMemo(() => ({ ...(uiSchema ?? {}), 'ui:title': '' }), [uiSchema]);

  const header = (schema?.title as string | undefined) ?? schemaName;

  if (loading) {
    return (
      <ErrandDisclosure header={header} icon={icon} initialOpen={false}>
        <div className="text-gray-500">Laddar formulär…</div>
      </ErrandDisclosure>
    );
  }

  if (error || !schema) {
    return (
      <ErrandDisclosure header={header} icon={icon} initialOpen>
        <div className="text-error">Fel: {error ?? 'Kunde inte ladda schema'}</div>
      </ErrandDisclosure>
    );
  }

  return (
    <ErrandDisclosure header={header} icon={icon} initialOpen={initialOpen ?? false}>
      <SchemaForm
        schema={schema}
        uiSchema={uiSchemaWithoutTitle}
        formData={formData}
        onChange={handleChange}
        hideSubmitButton
        showValidation={showValidation}
        disabled={!isDraft}
        compact={compact}
      />
    </ErrandDisclosure>
  );
}

interface EconomicAidInformationProps {
  compact?: boolean;
}

export const EconomicAidInformation: React.FC<EconomicAidInformationProps> = ({ compact }) => {
  return (
    <div className="flex flex-col gap-16">
      {SECTIONS.map((section, index) => (
        <SchemaSectionField
          key={section.schemaName}
          schemaName={section.schemaName}
          index={index}
          icon={section.icon}
          initialOpen={section.initialOpen}
          compact={compact}
        />
      ))}
    </div>
  );
};
