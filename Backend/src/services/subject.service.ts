import subjects from '../data/mockSubjects.json';

let subjectData = [...subjects];

export const subjectService = {
  getAll: () => subjectData,
  getById: (id: number) => subjectData.find(s => s.id === id),
  create: (subject: any) => {
    const newSubject = { ...subject, id: Date.now() };
    subjectData.push(newSubject);
    return newSubject;
  },
  update: (id: number, updates: any) => {
    const idx = subjectData.findIndex(s => s.id === id);
    if (idx === -1) return null;
    subjectData[idx] = { ...subjectData[idx], ...updates };
    return subjectData[idx];
  },
  delete: (id: number) => {
    const idx = subjectData.findIndex(s => s.id === id);
    if (idx === -1) return false;
    subjectData.splice(idx, 1);
    return true;
  },
}; 