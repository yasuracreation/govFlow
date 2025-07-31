import serviceRequests from '../data/mockServiceRequests.json';

let serviceRequestData = [...serviceRequests];

export const serviceRequestService = {
  getAll: () => serviceRequestData,
  getById: (id: number) => serviceRequestData.find(sr => sr.id === id),
  create: (sr: any) => {
    const newSR = { ...sr, id: Date.now(), createdAt: new Date().toISOString() };
    serviceRequestData.push(newSR);
    return newSR;
  },
  update: (id: number, updates: any) => {
    const idx = serviceRequestData.findIndex(sr => sr.id === id);
    if (idx === -1) return null;
    serviceRequestData[idx] = { ...serviceRequestData[idx], ...updates };
    return serviceRequestData[idx];
  },
  delete: (id: number) => {
    const idx = serviceRequestData.findIndex(sr => sr.id === id);
    if (idx === -1) return false;
    serviceRequestData.splice(idx, 1);
    return true;
  },
}; 