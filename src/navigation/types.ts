// src/navigation/types.ts

export type EditorStackParamList = {
  EditorHome: undefined;
  OpenFile: { filePath: string; language?: string };
};

export type RootTabParamList = {
  Files: undefined;
  Editor: EditorStackParamList;
  Terminal: undefined;
  Search: undefined;
  Packages: undefined;
};