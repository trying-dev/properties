import type {
  Architecture,
  Economy,
  Equipment,
  Maintenance,
  Service as ServicePrisma,
  Insurance,
  Legal as LegalPrisma,
  Tenant as TenantPrisma,
  Setting,
  Transaction,
  ServicePayment,
  IncidentService,
  Contract as ContractPrisma,
  FiscalDetail,
  LegalHistory,
  Owner as OwnerPrisma,
  PolicyAndWarranty,
  RegulationAndNorm,
  TitleDocument,
  Usage,
  Unit as UnitPrisma,
  SubTenant as SubTenantPrisma,
  User,
  Property,
} from "@prisma/client";

export type Service = ServicePrisma & {
  servicePayment: ServicePayment[];
  incident: IncidentService[];
};

export type EconomyWithTransactions = Economy & {
  transactions: Transaction[];
};

export type ArchitectureWithMaintenance = Architecture & {
  maintenances: Maintenance[];
  subelements: Architecture[];
};

export type EquipmentWithMaintenance = Equipment & {
  maintenances: Maintenance[];
};

export type Unit = UnitPrisma & {
  contracts: Contract[];
};

export type Contract = ContractPrisma & {
  tenants: Tenant[];
  subTenants: SubTenant[];
};

export type Owner = OwnerPrisma & {
  user: User;
};

export type Tenant = TenantPrisma & {
  user: User;
};

export type SubTenant = SubTenantPrisma & {
  user: User;
};

export type Legal = LegalPrisma & {
  fiscalDetails: FiscalDetail[];
  legalHistories: LegalHistory[];
  owners: Owner[];
  policiesAndWarranties: PolicyAndWarranty[];
  regulationsAndNorms: RegulationAndNorm[];
  titleDocuments: TitleDocument[];
  usages: Usage[];
};

export type PropertyWithRelations = Property & {
  legal?: Legal;
  insurances: Insurance[];
  services: Service[];
  economy?: EconomyWithTransactions;
  equipments: EquipmentWithMaintenance[];
  architectures: ArchitectureWithMaintenance[];
  notifications: Notification[];
  Setting: Setting[];
  units: Unit[];
};

export const initialState = {
  property: {} as PropertyWithRelations,
};

export type InitialState = typeof initialState;
export type State = InitialState;
