import sections from '../data/mockSections.json';

let sectionData = [...sections];

export const sectionService = {
  getAll: () => sectionData,
  getById: (id: number) => sectionData.find(s => s.id === id),
  create: (section: any) => {
    const newSection = { ...section, id: Date.now() };
    sectionData.push(newSection);
    return newSection;
  },
  update: (id: number, updates: any) => {
    const idx = sectionData.findIndex(s => s.id === id);
    if (idx === -1) return null;
    sectionData[idx] = { ...sectionData[idx], ...updates };
    return sectionData[idx];
  },
  delete: (id: number) => {
    const idx = sectionData.findIndex(s => s.id === id);
    if (idx === -1) return false;
    sectionData.splice(idx, 1);
    return true;
  },
}; 