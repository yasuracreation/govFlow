import templates from '../data/mockTemplates.json';
import { Template } from '../mappers/template.mapper';

export class TemplateService {
  private templates: Template[] = templates as Template[];

  getAll(): Template[] {
    return this.templates;
  }

  getById(id: string): Template | undefined {
    return this.templates.find(t => t.id === id);
  }

  create(data: Partial<Template>): Template {
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: data.name || '',
      description: data.description || '',
      content: data.content || '',
      variables: data.variables || [],
      fileType: data.fileType || 'document',
      version: data.version || '1.0',
      isActive: data.isActive !== undefined ? data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.templates.push(newTemplate);
    return newTemplate;
  }

  update(id: string, data: Partial<Template>): Template | null {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return null;
    
    this.templates[index] = {
      ...this.templates[index],
      ...data,
      id, // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    return this.templates[index];
  }

  delete(id: string): boolean {
    const index = this.templates.findIndex(t => t.id === id);
    if (index === -1) return false;
    
    this.templates.splice(index, 1);
    return true;
  }
} 