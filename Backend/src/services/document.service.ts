import documents from '../data/mockDocuments.json';

let documentData = [...documents];

export const documentService = {
  getAll: () => documentData,
  getById: (id: number) => documentData.find(d => d.id === id),
  create: (doc: any) => {
    const newDoc = { ...doc, id: Date.now(), createdAt: new Date().toISOString() };
    documentData.push(newDoc);
    return newDoc;
  },
  update: (id: number, updates: any) => {
    const idx = documentData.findIndex(d => d.id === id);
    if (idx === -1) return null;
    documentData[idx] = { ...documentData[idx], ...updates };
    return documentData[idx];
  },
  delete: (id: number) => {
    const idx = documentData.findIndex(d => d.id === id);
    if (idx === -1) return false;
    documentData.splice(idx, 1);
    return true;
  },
}; 