import { IsArray, IsOptional, IsString } from 'class-validator';

export class StakeholderDTO {
  @IsString()
  @IsOptional()
  externalId?: string;
  @IsString()
  @IsOptional()
  personNumber?: string;
  @IsString()
  @IsOptional()
  externalIdType?: string;
  @IsString()
  @IsOptional()
  role?: string;
  @IsString()
  @IsOptional()
  city?: string;
  @IsString()
  @IsOptional()
  organizationName?: string;
  @IsString()
  @IsOptional()
  firstName?: string;
  @IsString()
  @IsOptional()
  lastName?: string;
  @IsString()
  @IsOptional()
  address?: string;
  @IsString()
  @IsOptional()
  careOf?: string;
  @IsString()
  @IsOptional()
  zipCode?: string;
  @IsString()
  @IsOptional()
  country?: string;
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  emails?: string[];
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  phoneNumbers?: string[];
  @IsString()
  @IsOptional()
  title?: string;
  @IsString()
  @IsOptional()
  department?: string;
}
