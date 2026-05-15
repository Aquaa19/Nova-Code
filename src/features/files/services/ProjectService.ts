// src/features/files/services/ProjectService.ts

import { FileService, PROJECTS_ROOT } from '../../../services/FileService';
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

    // 1. Create root directory
    await FileService.createDir(projectPath);

    // 2. Scaffold template files
    const templateFiles = TEMPLATES[template];
    for (const file of templateFiles) {
      await FileService.writeFile(`${projectPath}/${file.path}`, file.content);
    }

    // 3. Return Project metadata (state sync is handled by consumer)
    return {
      name: safeName,
      path: projectPath,
      language: this.templateLanguage(template),
      lastOpened: Date.now(),
    };
  }

  private templateLanguage(t: ProjectTemplateType): string {
    const map: Record<ProjectTemplateType, string> = {
      'blank': 'plaintext', 
      'python': 'python',
      'node': 'javascript', 
      'react-native': 'typescript',
    };
    return map[t];
  }
}

export const ProjectService = new ProjectServiceClass();