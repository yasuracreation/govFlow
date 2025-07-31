import offices from '../data/mockOffices.json';
import { Office } from '../mappers/office.mapper';

export class OfficeService {
  private offices: Office[] = offices as Office[];

  getAll(): Office[] {
    return this.offices;
  }

  getById(id: string): Office | undefined {
    return this.offices.find(o => o.id === id);
  }

  create(data: Office): Office {
    this.offices.push(data);
    return data;
  }

  update(id: string, data: Partial<Office>): Office | undefined {
    const office = this.getById(id);
    if (!office) return undefined;
    Object.assign(office, data);
    return office;
  }

  delete(id: string): boolean {
    const idx = this.offices.findIndex(o => o.id === id);
    if (idx === -1) return false;
    this.offices.splice(idx, 1);
    return true;
  }
} 