export interface Equipment {
  id: number;
  asset: string;
  parentAsset: string;
  description: string;
  model: string;
  serialNumber: string;
  manufacturer: string;
  location: string;
  currentCoverage: string;
  endUser: string;
  serviceProvider: string;
  status: string;
  researchUnit: string;
  contractStartDate: string;
  contractEndDate: string;
  contractCost: number;
  planner: string;
  site: string;
}

export const initialEquipmentState: Equipment = {
  id: 0,
  asset: "",
  parentAsset: "",
  description: "",
  model: "",
  serialNumber: "",
  manufacturer: "",
  location: "",
  currentCoverage: "",
  endUser: "",
  serviceProvider: "",
  status: "",
  researchUnit: "",
  contractStartDate: "",
  contractEndDate: "",
  contractCost: 0,
  planner: "",
  site: ""
};