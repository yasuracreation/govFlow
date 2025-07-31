import workflowDefinitions from '../data/mockWorkflowDefinitions.json';

let workflowDefinitionData = [...workflowDefinitions];

export const workflowDefinitionService = {
  getAll: () => workflowDefinitionData,
  getById: (id: number) => workflowDefinitionData.find(wd => wd.id === id),
  create: (wd: any) => {
    const newWD = { ...wd, id: Date.now() };
    workflowDefinitionData.push(newWD);
    return newWD;
  },
  update: (id: number, updates: any) => {
    const idx = workflowDefinitionData.findIndex(wd => wd.id === id);
    if (idx === -1) return null;
    workflowDefinitionData[idx] = { ...workflowDefinitionData[idx], ...updates };
    return workflowDefinitionData[idx];
  },
  delete: (id: number) => {
    const idx = workflowDefinitionData.findIndex(wd => wd.id === id);
    if (idx === -1) return false;
    workflowDefinitionData.splice(idx, 1);
    return true;
  },
}; 