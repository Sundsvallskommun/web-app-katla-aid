/* eslint-disable */
/* tslint:disable */
// @ts-nocheck
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface User {
  name: string;
  username: string;
  initials: string;
}

export interface UserApiResponse {
  data: User;
  message: string;
}

export interface OrgManagerDTO {
  personId?: string;
  givenname?: string;
  lastname?: string;
  emailAddress?: string;
}

export interface UserEmploymentDTO {
  orgId?: number;
  orgName?: string;
  topOrgId?: number;
  isMainEmployment?: boolean;
  manager?: OrgManagerDTO;
}

export interface FacilityInfoDTO {
  orgId?: number;
  orgName?: string;
  parentOrgId?: number;
  parentOrgName?: string;
  manager?: OrgManagerDTO;
  floor?: string;
  hasSubUnits?: boolean;
}

export interface OrgTreeNodeDTO {
  orgId?: number;
  orgName?: string;
  parentId?: number;
  level?: number;
  isLeafLevel?: boolean;
  organizations?: OrgTreeNodeDTO[];
}

export interface OrgLeafNodeDTO {
  orgId: number;
  orgName: string;
  parentId?: number;
}
