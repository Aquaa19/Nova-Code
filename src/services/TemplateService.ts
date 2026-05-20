// src/services/TemplateService.ts
import { FileService } from './FileService';
import { ProjectTemplateType } from '../templates';

export const TemplateService = {
  async generateProject(template: ProjectTemplateType, targetDir: string, projectName: string): Promise<void> {
    await FileService.createDir(targetDir);
    
    switch (template) {
      case 'python':
        await FileService.writeFile(`${targetDir}/main.py`, `print("Hello, World!")\n`);
        await FileService.writeFile(`${targetDir}/requirements.txt`, `# Dependencies\n`);
        break;
      case 'node-blank':
        await FileService.writeFile(`${targetDir}/index.js`, `console.log("Hello Node.js!");\n`);
        await FileService.writeFile(`${targetDir}/package.json`, JSON.stringify({ name: projectName, version: "1.0.0", main: "index.js", scripts: { start: "node index.js" }}, null, 2));
        break;
      case 'node-express':
        await FileService.writeFile(`${targetDir}/index.js`, `const express = require('express');\nconst app = express();\n\napp.get('/', (req, res) => {\n  res.send('Hello Express!');\n});\n\napp.listen(3000, () => console.log('Server running on port 3000'));\n`);
        await FileService.writeFile(`${targetDir}/package.json`, JSON.stringify({ name: projectName, version: "1.0.0", main: "index.js", scripts: { start: "node index.js", dev: "node index.js" }, dependencies: { express: "^4.18.2" }}, null, 2));
        break;
      case 'html-blank':
        await FileService.writeFile(`${targetDir}/index.html`, `<!DOCTYPE html>\n<html>\n<head>\n  <link rel="stylesheet" href="style.css">\n</head>\n<body>\n  <h1>Hello Web!</h1>\n  <script src="script.js"></script>\n</body>\n</html>`);
        await FileService.writeFile(`${targetDir}/style.css`, `body { font-family: sans-serif; }`);
        await FileService.writeFile(`${targetDir}/script.js`, `console.log("Web loaded!");`);
        break;
      case 'html-bootstrap':
        await FileService.writeFile(`${targetDir}/index.html`, `<!DOCTYPE html>\n<html>\n<head>\n  <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">\n</head>\n<body>\n  <div class="container mt-5">\n    <h1 class="text-primary">Hello Bootstrap!</h1>\n  </div>\n</body>\n</html>`);
        break;
      case 'html-canvas':
        await FileService.writeFile(`${targetDir}/index.html`, `<!DOCTYPE html>\n<html>\n<body>\n  <canvas id="gameCanvas" width="400" height="400" style="border:1px solid black;"></canvas>\n  <script src="script.js"></script>\n</body>\n</html>`);
        await FileService.writeFile(`${targetDir}/script.js`, `const canvas = document.getElementById('gameCanvas');\nconst ctx = canvas.getContext('2d');\nlet x = 0;\nfunction loop() {\n  ctx.clearRect(0, 0, canvas.width, canvas.height);\n  ctx.fillRect(x, 50, 50, 50);\n  x = (x + 2) % canvas.width;\n  requestAnimationFrame(loop);\n}\nloop();`);
        break;
      case 'java':
        await FileService.writeFile(`${targetDir}/Main.java`, `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java!");\n    }\n}\n`);
        break;
      case 'c':
        await FileService.writeFile(`${targetDir}/main.c`, `#include <stdio.h>\n\nint main() {\n    printf("Hello C!\\n");\n    return 0;\n}\n`);
        break;
      case 'cpp':
        await FileService.writeFile(`${targetDir}/main.cpp`, `#include <iostream>\n\nint main() {\n    std::cout << "Hello C++!" << std::endl;\n    return 0;\n}\n`);
        break;
    }
  }
};
