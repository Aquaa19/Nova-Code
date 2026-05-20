// src/features/files/services/ProjectService.ts

import { FileService, PROJECTS_ROOT } from '../../../services/FileService';
import { TemplateService } from '../../../services/TemplateService';
import { TEMPLATES, ProjectTemplateType } from '../../../templates';

export interface Project {
  name: string;
  path: string;
  language: string;
  lastOpened: number;
}

class ProjectServiceClass {
  async createProject(name: string, template: ProjectTemplateType): Promise<Project> {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const projectPath = `${PROJECTS_ROOT}/${safeName}`;

    const exists = await FileService.exists(projectPath);
    if (exists) throw new Error(`Project "${name}" already exists`);

    // 1. Scaffold files via TemplateService
    await TemplateService.generateProject(template, projectPath, safeName);

    // 2. Return Project metadata (state sync is handled by consumer)
    return {
      name: safeName,
      path: projectPath,
      language: TEMPLATES[template].language,
      lastOpened: Date.now(),
    };
  }
}

export const ProjectService = new ProjectServiceClass();