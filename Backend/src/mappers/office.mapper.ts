import { OfficeVM } from '../vms/office.vm';

export interface Office {
  id: string;
  name: string;
  address: string;
  isActive: boolean;
}

export function toOfficeVM(office: Office): OfficeVM {
  return {
    id: office.id,
    name: office.name,
    address: office.address,
    isActive: office.isActive,
  };
} 