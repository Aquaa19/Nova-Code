// src/constants/runCommands.ts

export type RunConfig = {
  command: string;
  args: string[];
  workingDir: 'project' | 'file';
  requiresSave: boolean;
};

export const RUN_CONFIGS: Record<string, RunConfig> = {
  python:     { command: 'python3', args: ['{filename}'], workingDir: 'project', requiresSave: true },
  javascript: { command: 'node',    args: ['{filename}'], workingDir: 'project', requiresSave: true },
  java:       { command: 'bash',    args: ['-c', 'javac {filename} && java {classname}'], workingDir: 'project', requiresSave: true },
  c:          { command: 'bash',    args: ['-c', 'gcc {filename} -o out && ./out'], workingDir: 'project', requiresSave: true },
  cpp:        { command: 'bash',    args: ['-c', 'g++ {filename} -o out && ./out'], workingDir: 'project', requiresSave: true },
  html:       { command: 'preview', args: [],             workingDir: 'project', requiresSave: true },
};