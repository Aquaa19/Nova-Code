# Nova Code — Master Production Roadmap
> **Stack:** React Native CLI · Android-first · Liquid Glass UI · Piston API · isomorphic-git · Supabase  
> **Starting point:** Static UI already built. Goal: make it real.  
> **Phases:** 9 · **Subphases:** 28 · **Estimated duration:** ~16–20 weeks solo  
> **Philosophy:** UI already exists. Wire it up. Test it. Ship it.

---

## ⚡ TL;DR — Development Priority Order

```
Foundation → FileSystem → Editor Bridge → Open/Save → Terminal+Piston
→ Search → Git → Cloud → Packages → Polish → Release
```

**Do not start Phase N+1 until Phase N's Definition of Done is fully met.**

---

## 📐 Editor Architecture Decision (Read Before Phase 3)

> This is the single most important technical decision in the project. Read carefully.

### Monaco vs CodeMirror 6 — Mobile Evaluation

| Criterion | Monaco Editor | CodeMirror 6 |
|---|---|---|
| Bundle size (minified) | ~5–8 MB | ~200–500 KB |
| Android WebView RAM | 180–280 MB | 40–80 MB |
| Cold start time (WebView) | 2–4 seconds | 300–700 ms |
| Mobile keyboard compatibility | Poor (designed for desktop) | Good (designed to be extensible) |
| Touch/pinch-zoom support | Requires hacks | Native-friendly |
| Syntax highlighting quality | Excellent | Excellent (via Lezer) |
| Language server support | Built-in LSP | Via plugins |
| Offline bundleable | Yes (large) | Yes (small) |
| Community/docs | Excellent | Very good |
| Long-file performance (10k+ lines) | Better | Good |

### ✅ Recommendation: Start with CodeMirror 6

**Use CodeMirror 6 in Phase 3. Here is why:**

1. On a mid-range Android device (3–4 GB RAM), Monaco frequently triggers the OS memory killer when other apps are open. CodeMirror 6 uses 4–6× less RAM.
2. CodeMirror 6 cold-start is nearly invisible. Monaco's 2–4 second blank WebView is a terrible first impression.
3. Your WebView bridge architecture is identical for both — migrating later is a UI swap, not an architectural rewrite.
4. CodeMirror 6 is modular: start with basic highlighting, add vim keybindings, autocomplete, LSP support incrementally.
5. For a mobile IDE, fast/responsive beats feature-rich. Your users are on phones.

**When to consider migrating to Monaco (v2 decision):**

- If you add a local language server (LSP) and need full IntelliSense
- If your user base shifts toward tablet/desktop-class devices
- If you implement a paid tier and can afford the memory budget

**Migration path is safe:** the RN ↔ WebView bridge message protocol stays identical. Swap the HTML asset, keep the TypeScript bridge types.

---

## 🗂️ Current State Audit

### What Already Exists (Do NOT recreate these)

```
src/
├── components/          ✅ Full UI component library built
│   ├── badges/          ✅ RegistryBadge, StatusBadge
│   ├── buttons/         ✅ ActionCircleButton, FAB, GlassButton, IconButton
│   ├── cards/           ✅ CodeSnippetCard, GlassCard
│   ├── inputs/          ✅ CommandInput, SearchInput
│   ├── layout/          ✅ AmbientBackground, SafeAreaWrapper, ScreenContainer
│   ├── modals/          ✅ ActionSheetModal, ConfirmationModal
│   ├── navigation/      ✅ AppHeader, BottomTabBar
│   ├── panels/          ✅ GlassPanel
│   ├── progress/        ✅ ProgressBar
│   └── typography/      ✅ AppText, CodeText, SectionLabel
│
├── features/
│   ├── editor/components/   ✅ CodeEditorView, CodeLine, FileTabBar, SyntaxToken
│   ├── files/components/    ✅ FileTreeItem, FileTree, ProjectHeaderCard, SplitPaneLayout
│   ├── packages/components/ ✅ InstallProgressCard, PackageCard, PackageList, PackageTabs
│   ├── search/components/   ✅ FilterChipBar, HighlightedMatchText, SearchResultCard, SearchResultsGroup
│   └── terminal/components/ ✅ KeyboardAccessoryBar, TerminalOutputRow, TerminalPrompt, TerminalView
│
├── screens/             ✅ All 5 screens exist (static)
│   ├── CodeEditorScreen.tsx
│   ├── FileExplorerScreen.tsx
│   ├── GlobalSearchScreen.tsx
│   ├── PackageManagerScreen.tsx
│   └── TerminalScreen.tsx
│
└── theme/               ✅ Full design token system
    ├── colors.ts, glass.ts, radius.ts, shadows.ts, spacing.ts, typography.ts
```

### What Does NOT Yet Exist (Must Be Built)

```
src/
├── navigation/          ❌ No navigator wired up
├── store/               ❌ No Zustand stores
├── services/            ❌ No service layer
└── hooks/               ❌ No shared hooks

android/app/src/main/assets/
└── editor/              ❌ No CodeMirror 6 HTML bundle
```

---

## 📦 Master Dependency Table

| Library | Purpose | Phase | Install Command |
|---|---|---|---|
| `@react-navigation/native` | Navigation core | 1 | `npm i @react-navigation/native` |
| `@react-navigation/bottom-tabs` | Tab navigator | 1 | `npm i @react-navigation/bottom-tabs` |
| `@react-navigation/stack` | Stack navigator | 1 | `npm i @react-navigation/stack` |
| `react-native-screens` | Native screen optimisation | 1 | `npm i react-native-screens` |
| `react-native-safe-area-context` | Safe area insets | 1 | `npm i react-native-safe-area-context` |
| `@react-native-gesture-handler` | Gesture foundation | 1 | `npm i react-native-gesture-handler` |
| `zustand` | Global state | 1 | `npm i zustand` |
| `react-native-mmkv` | Fast synchronous storage | 1 | `npm i react-native-mmkv` |
| `react-native-fs` | Filesystem CRUD | 2 | `npm i react-native-fs` |
| `react-native-document-picker` | Open files from device | 2 | `npm i react-native-document-picker` |
| `react-native-webview` | CodeMirror 6 host | 3 | `npm i react-native-webview` |
| `fuse.js` | Fuzzy search | 5 | `npm i fuse.js` |
| `isomorphic-git` | Git operations | 6 | `npm i isomorphic-git` |
| `@supabase/supabase-js` | Cloud sync + auth | 7 | `npm i @supabase/supabase-js` |
| `@react-native-community/netinfo` | Network state | 7 | `npm i @react-native-community/netinfo` |
| `react-native-reanimated` | 60fps animations | 8 | `npm i react-native-reanimated` |
| `@sentry/react-native` | Crash reporting | 9 | `npm i @sentry/react-native` |

> ⚠️ **Install only what you need for the current phase.** Do not install all libraries upfront.

---

---

# PHASE 0 — Project Stabilisation & Navigation Wiring
> **Status of what exists:** Screens exist statically. Nothing navigates between them.  
> **Objective:** Wire up navigation. Establish TypeScript route types. App must open and tab-switch cleanly.  
> **Complexity:** 🟢 Low · **Risk:** 🟢 Low · **Estimated time:** 3–5 days

---

## Phase 0.1 — Install Navigation Foundation

### Why This Phase Exists
Your screens exist but App.tsx likely renders one screen directly. Navigation is the skeleton everything else hangs on. This must be stable before any other wiring starts.

### Libraries to Install

```bash
npm i @react-navigation/native @react-navigation/bottom-tabs @react-navigation/stack
npm i react-native-screens react-native-safe-area-context
npm i react-native-gesture-handler
cd android && ./gradlew clean && cd ..
```

### Files to Create

```
src/
└── navigation/
    ├── RootNavigator.tsx      ← bottom tab navigator (5 tabs)
    ├── EditorStack.tsx        ← stack inside Editor tab (file → editor → search)
    ├── types.ts               ← TypeScript route param types
    └── index.ts               ← re-export
```

### `navigation/types.ts`

```typescript
export type RootTabParamList = {
  Files: undefined;
  Editor: EditorStackParamList;
  Terminal: undefined;
  Search: undefined;
  Packages: undefined;
};

export type EditorStackParamList = {
  EditorHome: undefined;
  OpenFile: { filePath: string; language?: string };
};
```

### `navigation/RootNavigator.tsx` (skeleton)

```tsx
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import FileExplorerScreen from '../screens/FileExplorerScreen';
import CodeEditorScreen from '../screens/CodeEditorScreen';
import TerminalScreen from '../screens/TerminalScreen';
import GlobalSearchScreen from '../screens/GlobalSearchScreen';
import PackageManagerScreen from '../screens/PackageManagerScreen';
import { BottomTabBar } from '../components/navigation/BottomTabBar'; // reuse your existing component

const Tab = createBottomTabNavigator();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator tabBar={props => <BottomTabBar {...props} />}>
        <Tab.Screen name="Files" component={FileExplorerScreen} />
        <Tab.Screen name="Editor" component={CodeEditorScreen} />
        <Tab.Screen name="Terminal" component={TerminalScreen} />
        <Tab.Screen name="Search" component={GlobalSearchScreen} />
        <Tab.Screen name="Packages" component={PackageManagerScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}
```

### Update `App.tsx`

```tsx
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { RootNavigator } from './src/navigation';

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <RootNavigator />
    </GestureHandlerRootView>
  );
}
```

### Files/Folders to Create

```
src/navigation/
├── RootNavigator.tsx
├── EditorStack.tsx
├── types.ts
└── index.ts
```

### ✅ Definition of Done — Phase 0.1
- [x] App launches without crash
- [x] All 5 tabs are tappable and navigate correctly
- [x] TypeScript has no route-type errors
- [x] Android back button returns to previous screen
- [x] Your existing `BottomTabBar.tsx` is connected to the navigator (not duplicated)

### ❌ Do NOT Yet
- Wire any real data to screens
- Add Zustand stores
- Install RNFS

### ⚠️ Common Pitfalls
- Forgetting `GestureHandlerRootView` wrapper → gestures silently fail
- Not running `./gradlew clean` after installing native modules → build errors
- Mounting `NavigationContainer` more than once → crash

---

## Phase 0.2 — Global State Foundation (Zustand + MMKV)

### Why This Phase Exists
Before wiring real features, you need the state containers they will write into. Build these empty and typed now — screens will fill them in later phases.

### Libraries to Install

```bash
npm i zustand
npm i react-native-mmkv
cd android && ./gradlew clean && cd ..
```

### Files to Create

```
src/
└── store/
    ├── useEditorStore.ts
    ├── useProjectStore.ts
    ├── useTerminalStore.ts
    ├── useSettingsStore.ts
    └── index.ts

src/
└── storage/
    ├── mmkv.ts            ← MMKV instance singleton
    └── index.ts
```

### `storage/mmkv.ts`

```typescript
import { MMKV } from 'react-native-mmkv';
export const storage = new MMKV({ id: 'nova-code-storage' });
```

### `store/useEditorStore.ts`

```typescript
import { create } from 'zustand';

export interface OpenFile {
  path: string;
  language: string;
  unsaved: boolean;
  cursorLine: number;
  cursorCol: number;
}

interface EditorStore {
  openFiles: OpenFile[];
  activeIndex: number;
  openFile: (file: OpenFile) => void;
  closeFile: (path: string) => void;
  setActiveIndex: (index: number) => void;
  markUnsaved: (path: string) => void;
  markSaved: (path: string) => void;
}

export const useEditorStore = create<EditorStore>(set => ({
  openFiles: [],
  activeIndex: 0,
  openFile: file => set(s => ({
    openFiles: s.openFiles.find(f => f.path === file.path)
      ? s.openFiles
      : [...s.openFiles, file],
    activeIndex: s.openFiles.findIndex(f => f.path === file.path) === -1
      ? s.openFiles.length
      : s.openFiles.findIndex(f => f.path === file.path),
  })),
  closeFile: path => set(s => {
    const next = s.openFiles.filter(f => f.path !== path);
    return { openFiles: next, activeIndex: Math.max(0, s.activeIndex - 1) };
  }),
  setActiveIndex: activeIndex => set({ activeIndex }),
  markUnsaved: path => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, unsaved: true } : f),
  })),
  markSaved: path => set(s => ({
    openFiles: s.openFiles.map(f => f.path === path ? { ...f, unsaved: false } : f),
  })),
}));
```

### `store/useProjectStore.ts`

```typescript
import { create } from 'zustand';
import { storage } from '../storage/mmkv';

interface Project {
  name: string;
  path: string;
  language: string;
  lastOpened: number; // timestamp
}

interface ProjectStore {
  currentProject: Project | null;
  recentProjects: Project[];
  setCurrentProject: (project: Project) => void;
  addRecentProject: (project: Project) => void;
  fileTreeCache: Record<string, string[]>; // path → children paths
  setFileTreeCache: (path: string, children: string[]) => void;
}

export const useProjectStore = create<ProjectStore>(set => ({
  currentProject: null,
  recentProjects: JSON.parse(storage.getString('recentProjects') ?? '[]'),
  setCurrentProject: project => set({ currentProject: project }),
  addRecentProject: project => set(s => {
    const updated = [project, ...s.recentProjects.filter(p => p.path !== project.path)].slice(0, 10);
    storage.set('recentProjects', JSON.stringify(updated));
    return { recentProjects: updated };
  }),
  fileTreeCache: {},
  setFileTreeCache: (path, children) => set(s => ({
    fileTreeCache: { ...s.fileTreeCache, [path]: children },
  })),
}));
```

### `store/useTerminalStore.ts`

```typescript
import { create } from 'zustand';

export type TerminalOutputType = 'stdout' | 'stderr' | 'system' | 'input';

export interface TerminalLine {
  id: string;
  type: TerminalOutputType;
  text: string;
  timestamp: number;
}

interface TerminalStore {
  lines: TerminalLine[];
  isExecuting: boolean;
  selectedRuntime: { language: string; version: string } | null;
  addLine: (line: Omit<TerminalLine, 'id' | 'timestamp'>) => void;
  clearLines: () => void;
  setExecuting: (v: boolean) => void;
  setRuntime: (rt: { language: string; version: string }) => void;
}

export const useTerminalStore = create<TerminalStore>(set => ({
  lines: [],
  isExecuting: false,
  selectedRuntime: null,
  addLine: line => set(s => ({
    lines: [...s.lines, { ...line, id: Math.random().toString(36), timestamp: Date.now() }],
  })),
  clearLines: () => set({ lines: [] }),
  setExecuting: isExecuting => set({ isExecuting }),
  setRuntime: selectedRuntime => set({ selectedRuntime }),
}));
```

### `store/useSettingsStore.ts`

```typescript
import { create } from 'zustand';
import { storage } from '../storage/mmkv';

interface Settings {
  theme: 'dark' | 'light';
  fontSize: number;
  tabWidth: number;
  pistonApiUrl: string;
  autosaveIntervalMs: number;
  wordWrap: boolean;
  minimap: boolean;
}

interface SettingsStore extends Settings {
  update: (partial: Partial<Settings>) => void;
}

const defaults: Settings = {
  theme: 'dark',
  fontSize: 14,
  tabWidth: 2,
  pistonApiUrl: 'https://emkc.org/api/v2/piston',
  autosaveIntervalMs: 30000,
  wordWrap: true,
  minimap: false,
};

const persisted: Partial<Settings> = JSON.parse(storage.getString('settings') ?? '{}');

export const useSettingsStore = create<SettingsStore>(set => ({
  ...defaults,
  ...persisted,
  update: partial => set(s => {
    const next = { ...s, ...partial };
    storage.set('settings', JSON.stringify(next));
    return next;
  }),
}));
```

### ✅ Definition of Done — Phase 0.2
- [x] All 4 stores import and compile without TypeScript errors
- [x] MMKV persists settings across app kills (verify by changing a setting, killing app, reopening)
- [x] `recentProjects` survives app restart
- [x] No circular imports between store files

### ❌ Do NOT Yet
- Connect stores to real RNFS operations
- Add Piston API calls
- Add Git state

### ⚠️ Common Pitfalls
- MMKV cannot be used before the JS engine initialises — never call it at module level outside a function/store initializer
- Do not store file *content* in Zustand — store only metadata (path, language, unsaved flag)

---

### 📁 Project Tree After Phase 0

```
src/
├── components/         ✅ (unchanged)
├── features/           ✅ (unchanged)
├── screens/            ✅ (unchanged, still static)
├── theme/              ✅ (unchanged)
├── navigation/         🆕 RootNavigator, EditorStack, types
├── store/              🆕 4 Zustand stores
└── storage/            🆕 MMKV singleton
```

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: navigation wiring, zustand stores, mmkv storage layer"
```

---

---

# PHASE 1 — Filesystem Service & Android Permissions
> **Status of what exists:** File explorer screen is static. Shows hardcoded files.  
> **Objective:** Build the `FileService` abstraction. Request real permissions. App can read/write the device.  
> **Complexity:** 🟡 Medium · **Risk:** 🟡 Medium (permissions vary by Android version) · **Estimated time:** 4–6 days

---

## Phase 1.1 — Install RNFS and Build FileService

### Libraries to Install

```bash
npm i react-native-fs
npm i react-native-document-picker
cd android && ./gradlew clean && cd ..
```

### Files to Create

```
src/
└── services/
    ├── FileService.ts         ← RNFS abstraction
    ├── PermissionService.ts   ← Android permission handling
    └── index.ts
```

### `services/FileService.ts`

```typescript
import RNFS from 'react-native-fs';

// Nova Code projects live here — never hardcode this elsewhere
export const PROJECTS_ROOT = `${RNFS.ExternalDirectoryPath}/NovaCode/projects`;

export interface FileNode {
  name: string;
  path: string;
  isDirectory: boolean;
  size: number;
  mtime: Date;
  extension: string;
}

class FileServiceClass {
  // Initialise projects directory on app start
  async init(): Promise<void> {
    const exists = await RNFS.exists(PROJECTS_ROOT);
    if (!exists) {
      await RNFS.mkdir(PROJECTS_ROOT);
    }
  }

  async readDir(path: string): Promise<FileNode[]> {
    const items = await RNFS.readDir(path);
    return items.map(item => ({
      name: item.name,
      path: item.path,
      isDirectory: item.isDirectory(),
      size: item.size,
      mtime: item.mtime,
      extension: item.name.includes('.') ? item.name.split('.').pop() ?? '' : '',
    })).sort((a, b) => {
      // Directories first, then alphabetical
      if (a.isDirectory && !b.isDirectory) return -1;
      if (!a.isDirectory && b.isDirectory) return 1;
      return a.name.localeCompare(b.name);
    });
  }

  async readFile(path: string): Promise<string> {
    return RNFS.readFile(path, 'utf8');
  }

  async writeFile(path: string, content: string): Promise<void> {
    return RNFS.writeFile(path, content, 'utf8');
  }

  async createFile(path: string): Promise<void> {
    return RNFS.writeFile(path, '', 'utf8');
  }

  async createDir(path: string): Promise<void> {
    return RNFS.mkdir(path);
  }

  async deleteFile(path: string): Promise<void> {
    return RNFS.unlink(path);
  }

  async rename(from: string, to: string): Promise<void> {
    return RNFS.moveFile(from, to);
  }

  async exists(path: string): Promise<boolean> {
    return RNFS.exists(path);
  }

  async copyFile(from: string, to: string): Promise<void> {
    return RNFS.copyFile(from, to);
  }

  async stat(path: string): Promise<RNFS.StatResult> {
    return RNFS.stat(path);
  }

  // Detect language from file extension
  getLanguage(filename: string): string {
    const ext = filename.split('.').pop()?.toLowerCase() ?? '';
    const map: Record<string, string> = {
      js: 'javascript', jsx: 'javascript',
      ts: 'typescript', tsx: 'typescript',
      py: 'python', java: 'java',
      cpp: 'cpp', c: 'c', cs: 'csharp',
      html: 'html', css: 'css',
      json: 'json', md: 'markdown',
      sh: 'shell', yaml: 'yaml', yml: 'yaml',
      rs: 'rust', go: 'go', rb: 'ruby',
      php: 'php', swift: 'swift', kt: 'kotlin',
    };
    return map[ext] ?? 'plaintext';
  }
}

export const FileService = new FileServiceClass();
```

### `services/PermissionService.ts`

```typescript
import { PermissionsAndroid, Platform, Alert } from 'react-native';

class PermissionServiceClass {
  async requestStoragePermissions(): Promise<boolean> {
    if (Platform.OS !== 'android') return true;

    const apiLevel = Platform.Version as number;

    if (apiLevel >= 33) {
      // Android 13+ — app-specific directories don't need permission
      // ExternalDirectoryPath is app-scoped, no permission needed
      return true;
    }

    if (apiLevel >= 30) {
      // Android 11–12 — need MANAGE_EXTERNAL_STORAGE for full access
      // For app-scoped storage, no permission needed
      // Only request if you truly need device-wide access
      return true;
    }

    // Android 10 and below
    const granted = await PermissionsAndroid.requestMultiple([
      PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
      PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
    ]);

    const allGranted = Object.values(granted).every(
      status => status === PermissionsAndroid.RESULTS.GRANTED
    );

    if (!allGranted) {
      Alert.alert(
        'Storage Permission Required',
        'Nova Code needs storage access to manage your project files.',
        [{ text: 'OK' }]
      );
    }

    return allGranted;
  }
}

export const PermissionService = new PermissionServiceClass();
```

### Update `AndroidManifest.xml`

Add inside `<manifest>`:
```xml
<uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
<uses-permission android:name="android.permission.WRITE_EXTERNAL_STORAGE"
    android:maxSdkVersion="32" />
```

### Wire init into App.tsx

```tsx
import { useEffect } from 'react';
import { FileService } from './src/services/FileService';
import { PermissionService } from './src/services/PermissionService';

// Inside App component:
useEffect(() => {
  async function init() {
    await PermissionService.requestStoragePermissions();
    await FileService.init();
  }
  init();
}, []);
```

### ✅ Definition of Done — Phase 1.1
- [x] `FileService.init()` creates the projects directory on first launch
- [x] `FileService.readDir(PROJECTS_ROOT)` returns real files/folders from device
- [x] `FileService.writeFile` and `readFile` round-trip correctly (write then read back)
- [x] Permissions granted on Android 10, 11, 12, 13 (test on at least one real device)
- [x] No crash when the directory already exists on second launch

### ❌ Do NOT Yet
- Connect RNFS to the FileTree UI (that's Phase 1.2)
- Build project creation UI
- Add file watchers

### ⚠️ Common Pitfalls
- `ExternalDirectoryPath` is NOT the SD card — it's `/Android/data/com.novacode/files/` which is app-scoped and doesn't need dangerous permissions on Android 11+
- Never store file content in MMKV — MMKV has a 4 MB per-key soft limit and is not designed for file content
- `readDir` can throw if directory doesn't exist — always check `exists()` first

---

## Phase 1.2 — Wire FileExplorerScreen to Real Filesystem

> **"FileExplorerScreen already exists as a static screen. Now make it real."**

### Files to Modify (not create)

```
src/features/files/components/FileTree.tsx        ← make dynamic
src/features/files/components/FileTreeItem.tsx    ← add real expand/collapse
src/screens/FileExplorerScreen.tsx                ← wire to FileService
```

### Create New Files

```
src/features/files/
├── hooks/
│   └── useFileTree.ts     ← async directory reading hook
├── components/
│   └── NewProjectModal.tsx ← create new project flow
└── utils/
    └── fileIcons.ts       ← extension → icon/color map
```

### `features/files/hooks/useFileTree.ts`

```typescript
import { useState, useCallback } from 'react';
import { FileService, FileNode } from '../../../services/FileService';

export function useFileTree(rootPath: string) {
  const [expandedPaths, setExpandedPaths] = useState<Set<string>>(new Set());
  const [nodeChildren, setNodeChildren] = useState<Record<string, FileNode[]>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadChildren = useCallback(async (path: string) => {
    if (nodeChildren[path]) return; // Already loaded
    setLoading(true);
    try {
      const children = await FileService.readDir(path);
      setNodeChildren(prev => ({ ...prev, [path]: children }));
    } catch (e) {
      setError(`Failed to read: ${path}`);
    } finally {
      setLoading(false);
    }
  }, [nodeChildren]);

  const toggleExpand = useCallback(async (path: string) => {
    const next = new Set(expandedPaths);
    if (next.has(path)) {
      next.delete(path);
    } else {
      next.add(path);
      await loadChildren(path);
    }
    setExpandedPaths(next);
  }, [expandedPaths, loadChildren]);

  return { expandedPaths, nodeChildren, loading, error, toggleExpand, loadChildren };
}
```

### Updated `features/files/utils/fileIcons.ts`

```typescript
export const FILE_ICONS: Record<string, { icon: string; color: string }> = {
  js:   { icon: '⬡', color: '#F7DF1E' },
  ts:   { icon: '⬡', color: '#3178C6' },
  tsx:  { icon: '⬡', color: '#61DAFB' },
  jsx:  { icon: '⬡', color: '#61DAFB' },
  py:   { icon: '⬡', color: '#3572A5' },
  java: { icon: '⬡', color: '#B07219' },
  cpp:  { icon: '⬡', color: '#F34B7D' },
  c:    { icon: '⬡', color: '#555555' },
  html: { icon: '⬡', color: '#E34C26' },
  css:  { icon: '⬡', color: '#563D7C' },
  json: { icon: '⬡', color: '#CBCB41' },
  md:   { icon: '⬡', color: '#083FA1' },
  sh:   { icon: '⬡', color: '#89E051' },
  rs:   { icon: '⬡', color: '#DEA584' },
  go:   { icon: '⬡', color: '#00ADD8' },
  dir:  { icon: '📁', color: '#E8C84A' },
};

export function getFileIcon(extension: string, isDirectory: boolean) {
  if (isDirectory) return FILE_ICONS.dir;
  return FILE_ICONS[extension] ?? { icon: '⬡', color: '#888888' };
}
```

### Updated `FileTree.tsx` (key changes)

```tsx
// Replace static list with dynamic recursive render
import { useFileTree } from '../hooks/useFileTree';
import { FileNode } from '../../../services/FileService';

interface Props {
  rootPath: string;
  onFilePress: (node: FileNode) => void;
}

export function FileTree({ rootPath, onFilePress }: Props) {
  const { expandedPaths, nodeChildren, toggleExpand } = useFileTree(rootPath);
  
  // Load root on mount
  useEffect(() => {
    toggleExpand(rootPath);
  }, [rootPath]);

  const renderNode = (node: FileNode, depth: number) => (
    <FileTreeItem
      key={node.path}
      node={node}
      depth={depth}
      isExpanded={expandedPaths.has(node.path)}
      onPress={() => {
        if (node.isDirectory) {
          toggleExpand(node.path);
        } else {
          onFilePress(node);
        }
      }}
    />
    {node.isDirectory && expandedPaths.has(node.path) &&
      (nodeChildren[node.path] ?? []).map(child => renderNode(child, depth + 1))}
  );

  return (
    <ScrollView>
      {(nodeChildren[rootPath] ?? []).map(node => renderNode(node, 0))}
    </ScrollView>
  );
}
```

### Updated `FileExplorerScreen.tsx` (key changes)

```tsx
// Wire FileTree to real data
import { FileService, PROJECTS_ROOT } from '../services/FileService';
import { useProjectStore } from '../store/useProjectStore';

export function FileExplorerScreen({ navigation }) {
  const { currentProject, setCurrentProject } = useProjectStore();
  
  const handleFilePress = (node) => {
    // Navigate to editor and open this file
    navigation.navigate('Editor', {
      screen: 'OpenFile',
      params: { filePath: node.path, language: FileService.getLanguage(node.name) }
    });
  };

  const rootPath = currentProject?.path ?? PROJECTS_ROOT;
  
  return (
    <ScreenContainer>
      <ProjectHeaderCard project={currentProject} />
      <FileTree rootPath={rootPath} onFilePress={handleFilePress} />
      {/* Your existing FAB for new file/folder */}
    </ScreenContainer>
  );
}
```

### Context Menu (Long Press) — Use your existing `ActionSheetModal`

Wire long-press on `FileTreeItem` to open `ActionSheetModal` with actions:
- Rename → `FileService.rename()`
- Delete → `FileService.deleteFile()` + confirmation via `ConfirmationModal`
- New File Here → `FileService.createFile()`
- New Folder Here → `FileService.createDir()`
- Copy Path → `Clipboard.setString(node.path)`

### ✅ Definition of Done — Phase 1.2
- [x] File explorer shows real files from device
- [x] Folders expand/collapse lazily (do not read entire tree upfront)
- [x] Tapping a file triggers `onFilePress` callback
- [x] Long-press shows action sheet with Rename/Delete/New File
- [x] Rename and Delete work correctly and update the tree
- [x] Extension → icon colour mapping is visible
- [x] Empty directory shows "No files" state
- [x] Error state shown when directory is unreadable

### ❌ Do NOT Yet
- Open files in editor (Phase 3 handles this)
- Add Git badges (Phase 6)
- Add drag-to-reorder

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: FileService abstraction, real RNFS file explorer, permissions"
```

---

### 📁 Project Tree After Phase 1

```
src/
├── components/          ✅
├── features/
│   ├── files/
│   │   ├── components/  ✅ (modified: FileTree, FileTreeItem now dynamic)
│   │   ├── hooks/       🆕 useFileTree.ts
│   │   └── utils/       🆕 fileIcons.ts
│   └── ... (other features unchanged)
├── navigation/          ✅
├── screens/             ✅ (FileExplorerScreen now wired)
├── services/            🆕 FileService, PermissionService
├── store/               ✅
└── storage/             ✅
```

---

---

# PHASE 2 — Project Management
> **Objective:** Create, open, and switch between projects. App manages project lifecycle.  
> **Complexity:** 🟡 Medium · **Risk:** 🟢 Low · **Estimated time:** 3–4 days

---

## Phase 2.1 — Project Creation & Template System

### Files to Create

```
src/features/files/
├── services/
│   └── ProjectService.ts     ← project lifecycle
├── templates/
│   ├── blank.ts
│   ├── reactNative.ts
│   ├── python.ts
│   └── node.ts
└── components/
    └── NewProjectModal.tsx    ← already planned
```

### `features/files/services/ProjectService.ts`

```typescript
import { FileService, PROJECTS_ROOT } from '../../../services/FileService';
import { storage } from '../../../storage/mmkv';

export type ProjectTemplate = 'blank' | 'react-native' | 'python' | 'node';

export interface ProjectMeta {
  name: string;
  path: string;
  template: ProjectTemplate;
  language: string;
  createdAt: number;
  lastOpenedAt: number;
}

const TEMPLATES: Record<ProjectTemplate, Array<{ path: string; content: string }>> = {
  blank: [],
  python: [
    { path: 'main.py', content: 'def main():\n    print("Hello, World!")\n\nif __name__ == "__main__":\n    main()\n' },
    { path: 'README.md', content: '# My Python Project\n' },
  ],
  node: [
    { path: 'index.js', content: 'console.log("Hello, World!");\n' },
    { path: 'package.json', content: '{\n  "name": "my-project",\n  "version": "1.0.0"\n}\n' },
  ],
  'react-native': [
    { path: 'App.tsx', content: 'import React from "react";\nimport { Text, View } from "react-native";\n\nexport default function App() {\n  return (\n    <View>\n      <Text>Hello, Nova Code!</Text>\n    </View>\n  );\n}\n' },
  ],
};

class ProjectServiceClass {
  async createProject(name: string, template: ProjectTemplate): Promise<ProjectMeta> {
    const safeName = name.replace(/[^a-zA-Z0-9_-]/g, '_');
    const projectPath = `${PROJECTS_ROOT}/${safeName}`;

    const exists = await FileService.exists(projectPath);
    if (exists) throw new Error(`Project "${name}" already exists`);

    await FileService.createDir(projectPath);

    for (const file of TEMPLATES[template]) {
      await FileService.writeFile(`${projectPath}/${file.path}`, file.content);
    }

    const meta: ProjectMeta = {
      name,
      path: projectPath,
      template,
      language: this.templateLanguage(template),
      createdAt: Date.now(),
      lastOpenedAt: Date.now(),
    };

    this.saveProjectMeta(meta);
    return meta;
  }

  private templateLanguage(t: ProjectTemplate): string {
    const map: Record<ProjectTemplate, string> = {
      blank: 'plaintext', python: 'python',
      node: 'javascript', 'react-native': 'typescript',
    };
    return map[t];
  }

  private saveProjectMeta(meta: ProjectMeta) {
    const existing: ProjectMeta[] = JSON.parse(storage.getString('projects') ?? '[]');
    const updated = [meta, ...existing.filter(p => p.path !== meta.path)];
    storage.set('projects', JSON.stringify(updated));
  }

  getAllProjects(): ProjectMeta[] {
    return JSON.parse(storage.getString('projects') ?? '[]');
  }
}

export const ProjectService = new ProjectServiceClass();
```

### ✅ Definition of Done — Phase 2.1
- [x] "New Project" modal shows template options and creates real directory
- [x] Template files appear in file explorer immediately after creation
- [x] Recent projects list persists across app restarts
- [x] Opening an existing project switches `currentProject` in store and reloads file tree
- [x] Duplicate project name shows error message (not a crash)

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: project management, templates, ProjectService"
```

---

---

# PHASE 3 — Code Editor Integration (CodeMirror 6 via WebView)
> **Status of what exists:** `CodeEditorView.tsx`, `CodeLine.tsx`, `SyntaxToken.tsx` are static. They render fake code.  
> **Objective:** Replace static editor with real CodeMirror 6 via WebView. Two-way bridge.  
> **Complexity:** 🔴 High · **Risk:** 🟡 Medium · **Estimated time:** 7–10 days  
> ⚠️ This is the most technically complex phase. Take it one subphase at a time.

---

## Phase 3.1 — Build the CodeMirror 6 HTML Bundle

### Why This Approach
CodeMirror 6 is loaded as a local HTML file inside a WebView. This gives us:
- Full offline capability
- No CDN latency
- Control over the bundle
- Ability to theme it with our Liquid Glass design tokens

### Directory to Create

```
android/app/src/main/assets/
└── editor/
    ├── index.html         ← CodeMirror 6 bundle entry
    └── editor.bundle.js   ← rolled-up CM6 bundle (you build this separately)
```

### Build CodeMirror 6 Bundle (separate mini-project)

Create a temporary folder outside the main project:

```bash
mkdir cm6-build && cd cm6-build
npm init -y
npm i @codemirror/view @codemirror/state @codemirror/commands
npm i @codemirror/lang-javascript @codemirror/lang-python @codemirror/lang-html
npm i @codemirror/lang-css @codemirror/lang-json @codemirror/lang-markdown
npm i @codemirror/theme-one-dark @codemirror/language
npm i @lezer/highlight
npm i --save-dev rollup @rollup/plugin-node-resolve @rollup/plugin-commonjs
```

`cm6-build/src/editor.js`:
```javascript
import { EditorView, keymap, lineNumbers } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { javascript } from '@codemirror/lang-javascript';
import { python } from '@codemirror/lang-python';
import { html } from '@codemirror/lang-html';
import { css } from '@codemirror/lang-css';
import { json } from '@codemirror/lang-json';
import { markdown } from '@codemirror/lang-markdown';
import { oneDark } from '@codemirror/theme-one-dark';

const LANGUAGES = { javascript, typescript: javascript, python, html, css, json, markdown };

let view = null;

function getLanguageExtension(lang) {
  return LANGUAGES[lang] ? [LANGUAGES[lang]()] : [];
}

function initEditor(content, language, fontSize) {
  const parent = document.getElementById('editor');
  
  view = new EditorView({
    state: EditorState.create({
      doc: content,
      extensions: [
        lineNumbers(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        ...getLanguageExtension(language),
        oneDark,
        EditorView.theme({
          '&': { fontSize: `${fontSize}px`, height: '100vh' },
          '.cm-scroller': { overflow: 'auto', fontFamily: 'monospace' },
        }),
        EditorView.updateListener.of(update => {
          if (update.docChanged) {
            window.ReactNativeWebView.postMessage(JSON.stringify({
              type: 'CONTENT_CHANGED',
              payload: { content: update.state.doc.toString() }
            }));
          }
        }),
      ]
    }),
    parent,
  });
}

// Receive messages from React Native
window.addEventListener('message', (event) => {
  const msg = JSON.parse(event.data);
  switch (msg.type) {
    case 'INIT':
      initEditor(msg.payload.content, msg.payload.language, msg.payload.fontSize);
      break;
    case 'SET_CONTENT':
      if (view) view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: msg.payload.content } });
      break;
    case 'GET_CONTENT':
      window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'CONTENT', payload: view?.state.doc.toString() ?? '' }));
      break;
    case 'SET_FONT_SIZE':
      // Re-dispatch font size update
      break;
    case 'FIND':
      // Implement search highlighting
      break;
  }
});
```

`android/app/src/main/assets/editor/index.html`:
```html
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #1a1a2e; overflow: hidden; }
    #editor { height: 100vh; width: 100vw; }
  </style>
</head>
<body>
  <div id="editor"></div>
  <script src="editor.bundle.js"></script>
</body>
</html>
```

Build and copy:
```bash
# In cm6-build/
npx rollup src/editor.js --file ../android/app/src/main/assets/editor/editor.bundle.js --format iife
```

---

## Phase 3.2 — WebView Bridge Architecture

### The Bridge Pattern

```
┌─────────────────────────────────────────────────────┐
│                  React Native Layer                  │
│                                                      │
│   useEditorStore  ←→  EditorBridge.ts               │
│                           │                          │
│                     WebView ref                      │
│                     .injectJavaScript()              │
│                     .onMessage()                     │
└──────────────────────┬──────────────────────────────┘
                       │  WebView boundary
┌──────────────────────▼──────────────────────────────┐
│               CodeMirror 6 (HTML/JS)                 │
│                                                      │
│   window.addEventListener('message')                 │
│   window.ReactNativeWebView.postMessage()            │
└─────────────────────────────────────────────────────┘
```

### Files to Create

```
src/features/editor/
├── services/
│   └── EditorBridge.ts        ← message type definitions + helpers
├── hooks/
│   └── useEditorBridge.ts     ← bridge logic hook
└── components/
    └── WebViewEditor.tsx      ← new component (replaces static CodeEditorView)
```

### `features/editor/services/EditorBridge.ts`

```typescript
// All messages RN → WebView
export type RNToEditorMessage =
  | { type: 'INIT'; payload: { content: string; language: string; fontSize: number } }
  | { type: 'SET_CONTENT'; payload: { content: string } }
  | { type: 'GET_CONTENT' }
  | { type: 'SET_FONT_SIZE'; payload: { fontSize: number } }
  | { type: 'FIND'; payload: { query: string } }
  | { type: 'SET_LANGUAGE'; payload: { language: string } };

// All messages WebView → RN
export type EditorToRNMessage =
  | { type: 'CONTENT_CHANGED'; payload: { content: string } }
  | { type: 'CONTENT'; payload: string }
  | { type: 'CURSOR_CHANGED'; payload: { line: number; col: number } }
  | { type: 'READY' };

export function serializeMessage(msg: RNToEditorMessage): string {
  return JSON.stringify(msg);
}

export function parseMessage(raw: string): EditorToRNMessage | null {
  try {
    return JSON.parse(raw) as EditorToRNMessage;
  } catch {
    return null;
  }
}
```

### `features/editor/components/WebViewEditor.tsx`

```tsx
import React, { useRef, useCallback, forwardRef, useImperativeHandle } from 'react';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { Platform } from 'react-native';
import { serializeMessage, parseMessage, EditorToRNMessage } from '../services/EditorBridge';

export interface WebViewEditorHandle {
  getContent: () => Promise<string>;
  setContent: (content: string) => void;
  setFontSize: (size: number) => void;
}

interface Props {
  initialContent: string;
  language: string;
  fontSize: number;
  onContentChange?: (content: string) => void;
  onReady?: () => void;
}

const EDITOR_URI = Platform.select({
  android: 'file:///android_asset/editor/index.html',
  default: 'file:///android_asset/editor/index.html',
});

export const WebViewEditor = forwardRef<WebViewEditorHandle, Props>(({
  initialContent, language, fontSize, onContentChange, onReady
}, ref) => {
  const webviewRef = useRef<WebView>(null);
  const pendingGetContent = useRef<((content: string) => void) | null>(null);

  const postMessage = useCallback((msg: object) => {
    webviewRef.current?.injectJavaScript(
      `window.dispatchEvent(new MessageEvent('message', { data: ${JSON.stringify(JSON.stringify(msg))} })); true;`
    );
  }, []);

  useImperativeHandle(ref, () => ({
    getContent: () => new Promise(resolve => {
      pendingGetContent.current = resolve;
      postMessage({ type: 'GET_CONTENT' });
    }),
    setContent: content => postMessage({ type: 'SET_CONTENT', payload: { content } }),
    setFontSize: size => postMessage({ type: 'SET_FONT_SIZE', payload: { fontSize: size } }),
  }));

  const handleMessage = useCallback((event: WebViewMessageEvent) => {
    const msg = parseMessage(event.nativeEvent.data);
    if (!msg) return;

    switch (msg.type) {
      case 'READY':
        postMessage({ type: 'INIT', payload: { content: initialContent, language, fontSize } });
        onReady?.();
        break;
      case 'CONTENT_CHANGED':
        onContentChange?.(msg.payload.content);
        break;
      case 'CONTENT':
        pendingGetContent.current?.(msg.payload);
        pendingGetContent.current = null;
        break;
    }
  }, [initialContent, language, fontSize, onContentChange, onReady, postMessage]);

  return (
    <WebView
      ref={webviewRef}
      source={{ uri: EDITOR_URI }}
      onMessage={handleMessage}
      javaScriptEnabled
      domStorageEnabled
      originWhitelist={['*']}
      allowFileAccess
      allowFileAccessFromFileURLs
      allowUniversalAccessFromFileURLs
      style={{ flex: 1, backgroundColor: '#1a1a2e' }}
      scrollEnabled={false}
    />
  );
});
```

### ✅ Definition of Done — Phase 3.2
- [x] WebView loads the local HTML file without errors
- [x] `INIT` message successfully loads content into CodeMirror
- [x] Typing in the editor sends `CONTENT_CHANGED` back to RN
- [x] `getContent()` promise resolves with current editor content
- [x] Language highlighting changes when a different file extension is opened
- [x] No white flash on editor mount

### ❌ Do NOT Yet
- Implement autosave (Phase 3.3)
- Add multi-tab management (Phase 3.3)
- Add find/replace
- Integrate with Piston (Phase 4)

### ⚠️ Common Pitfalls
- `allowFileAccess` and `allowFileAccessFromFileURLs` are **required** on Android for local asset loading
- `injectJavaScript` must end with `; true;` or the WebView throws
- Do not use `injectedJavaScript` prop for the INIT — the page may not be ready yet. Wait for the `READY` message
- Large files (>500 KB) can cause WebView memory pressure — add a file size warning for files >200 KB

---

## Phase 3.3 — Open, Save, Autosave, Multi-Tab

### Why This Phase Exists
The bridge exists. Now wire it end-to-end: open a real file → display in editor → save back to disk.

### Files to Modify

```
src/screens/CodeEditorScreen.tsx   ← major update
src/features/editor/components/FileTabBar.tsx ← wire to useEditorStore
```

### Files to Create

```
src/features/editor/hooks/
├── useFileOpen.ts       ← handles open flow
└── useAutosave.ts       ← debounced autosave
```

### `features/editor/hooks/useFileOpen.ts`

```typescript
import { useCallback } from 'react';
import { FileService } from '../../../services/FileService';
import { useEditorStore } from '../../../store/useEditorStore';

export function useFileOpen() {
  const { openFile, openFiles } = useEditorStore();

  const openFileAtPath = useCallback(async (path: string) => {
    // Don't re-read if already open
    if (openFiles.find(f => f.path === path)) {
      const idx = openFiles.findIndex(f => f.path === path);
      useEditorStore.getState().setActiveIndex(idx);
      return;
    }

    const language = FileService.getLanguage(path.split('/').pop() ?? '');
    
    // Pre-check file size — warn for very large files
    const stat = await FileService.stat(path);
    if (stat.size > 500_000) {
      // Show warning modal — file is >500KB
      // Still open but warn about performance
    }

    openFile({ path, language, unsaved: false, cursorLine: 0, cursorCol: 0 });
  }, [openFile, openFiles]);

  return { openFileAtPath };
}
```

### `features/editor/hooks/useAutosave.ts`

```typescript
import { useEffect, useRef } from 'react';
import { FileService } from '../../../services/FileService';
import { useEditorStore } from '../../../store/useEditorStore';
import { useSettingsStore } from '../../../store/useSettingsStore';

export function useAutosave(
  getContent: (() => Promise<string>) | null,
  currentPath: string | null,
) {
  const { markSaved, markUnsaved } = useEditorStore();
  const { autosaveIntervalMs } = useSettingsStore();
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!getContent || !currentPath) return;

    timer.current = setInterval(async () => {
      const content = await getContent();
      await FileService.writeFile(currentPath, content);
      markSaved(currentPath);
    }, autosaveIntervalMs);

    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [getContent, currentPath, autosaveIntervalMs, markSaved]);
}
```

### Updated `CodeEditorScreen.tsx` (key flow)

```tsx
// Wire everything together
export function CodeEditorScreen({ route }) {
  const editorRef = useRef<WebViewEditorHandle>(null);
  const { openFiles, activeIndex, markUnsaved } = useEditorStore();
  const { openFileAtPath } = useFileOpen();
  const activeFile = openFiles[activeIndex];
  const [editorContent, setEditorContent] = useState('');

  // Open file from navigation params
  useEffect(() => {
    if (route.params?.filePath) {
      openFileAtPath(route.params.filePath);
    }
  }, [route.params?.filePath]);

  // Load content when active file changes
  useEffect(() => {
    if (!activeFile) return;
    FileService.readFile(activeFile.path).then(content => {
      setEditorContent(content);
      editorRef.current?.setContent(content);
    });
  }, [activeFile?.path]);

  // Manual save
  const handleSave = async () => {
    if (!activeFile) return;
    const content = await editorRef.current?.getContent();
    if (content !== undefined) {
      await FileService.writeFile(activeFile.path, content);
      useEditorStore.getState().markSaved(activeFile.path);
    }
  };

  useAutosave(
    editorRef.current ? () => editorRef.current!.getContent() : null,
    activeFile?.path ?? null,
  );

  return (
    <ScreenContainer>
      <FileTabBar
        tabs={openFiles}
        activeIndex={activeIndex}
        onTabPress={i => useEditorStore.getState().setActiveIndex(i)}
        onTabClose={path => useEditorStore.getState().closeFile(path)}
      />
      {activeFile ? (
        <WebViewEditor
          ref={editorRef}
          initialContent={editorContent}
          language={activeFile.language}
          fontSize={useSettingsStore.getState().fontSize}
          onContentChange={() => markUnsaved(activeFile.path)}
        />
      ) : (
        <EmptyEditorPlaceholder />
      )}
    </ScreenContainer>
  );
}
```

### ✅ Definition of Done — Phase 3.3
- [x] Tapping a file in FileExplorer opens it in the editor
- [x] File content loads into CodeMirror correctly
- [x] Syntax highlighting works for JS/TS/Python/JSON/HTML/CSS
- [x] `●` dot appears on tab when file is edited (unsaved)
- [x] Manual save (Ctrl+S or save button) writes to disk
- [x] Autosave fires every 30 seconds and clears the unsaved indicator
- [x] Multiple files can be open in tabs simultaneously
- [x] Closing a tab removes it; switching tabs restores correct content
- [x] 5 MB file shows a performance warning before opening

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: CodeMirror 6 WebView editor, open/save/autosave, multi-tab"
```

---

### 📁 Project Tree After Phase 3

```
android/app/src/main/assets/
└── editor/                     🆕 CodeMirror 6 HTML bundle

src/
├── features/
│   ├── editor/
│   │   ├── components/
│   │   │   └── WebViewEditor.tsx  🆕 (replaces static CodeEditorView)
│   │   ├── hooks/                 🆕 useFileOpen, useAutosave
│   │   └── services/              🆕 EditorBridge.ts
│   └── files/
│       ├── hooks/                 ✅
│       └── services/              ✅
└── screens/
    └── CodeEditorScreen.tsx       ✅ (now functional)
```

---

---

# PHASE 4 — Terminal & Code Execution (Piston API)
> **Status of what exists:** `TerminalView`, `TerminalOutputRow`, `TerminalPrompt`, `KeyboardAccessoryBar` are static.  
> **Objective:** Wire terminal to Piston API. Execute real code. Show real output.  
> **Complexity:** 🟡 Medium · **Risk:** 🟢 Low · **Estimated time:** 5–7 days

---

## Phase 4.1 — Piston Service Layer

### Files to Create

```
src/services/
└── PistonService.ts

src/features/terminal/
└── hooks/
    ├── usePistonRuntimes.ts
    └── useCodeExecution.ts
```

### `services/PistonService.ts`

```typescript
import { storage } from '../storage/mmkv';

const PISTON_BASE = 'https://emkc.org/api/v2/piston';

export interface PistonRuntime {
  language: string;
  version: string;
  aliases: string[];
}

export interface PistonFile {
  name: string;
  content: string;
}

export interface PistonExecuteRequest {
  language: string;
  version: string;
  files: PistonFile[];
  stdin?: string;
  args?: string[];
}

export interface PistonExecuteResult {
  stdout: string;
  stderr: string;
  code: number | null;
  signal: string | null;
  output: string;
}

class PistonServiceClass {
  private baseUrl: string;

  constructor() {
    this.baseUrl = storage.getString('pistonApiUrl') ?? PISTON_BASE;
  }

  setBaseUrl(url: string) {
    this.baseUrl = url;
    storage.set('pistonApiUrl', url);
  }

  async getRuntimes(): Promise<PistonRuntime[]> {
    // Use cached if available and fresh (< 1 hour old)
    const cached = storage.getString('pistonRuntimes');
    const cacheTime = storage.getNumber('pistonRuntimesCacheTime') ?? 0;
    if (cached && Date.now() - cacheTime < 3_600_000) {
      return JSON.parse(cached);
    }

    const response = await fetch(`${this.baseUrl}/runtimes`);
    if (!response.ok) throw new Error('Failed to fetch runtimes');
    
    const runtimes: PistonRuntime[] = await response.json();
    storage.set('pistonRuntimes', JSON.stringify(runtimes));
    storage.set('pistonRuntimesCacheTime', Date.now());
    return runtimes;
  }

  async execute(req: PistonExecuteRequest): Promise<PistonExecuteResult> {
    const response = await fetch(`${this.baseUrl}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(req),
    });

    if (response.status === 429) {
      throw new Error('RATE_LIMITED');
    }
    if (!response.ok) {
      throw new Error(`Piston API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      stdout: data.run?.stdout ?? '',
      stderr: data.run?.stderr ?? '',
      code: data.run?.code ?? null,
      signal: data.run?.signal ?? null,
      output: data.run?.output ?? '',
    };
  }
}

export const PistonService = new PistonServiceClass();
```

### `features/terminal/hooks/useCodeExecution.ts`

```typescript
import { useCallback } from 'react';
import { PistonService } from '../../../services/PistonService';
import { FileService } from '../../../services/FileService';
import { useTerminalStore } from '../../../store/useTerminalStore';
import { useEditorStore } from '../../../store/useEditorStore';
import { useProjectStore } from '../../../store/useProjectStore';

export function useCodeExecution() {
  const { addLine, setExecuting, selectedRuntime } = useTerminalStore();
  const { openFiles, activeIndex } = useEditorStore();
  const { currentProject } = useProjectStore();

  const executeCurrentFile = useCallback(async () => {
    const activeFile = openFiles[activeIndex];
    if (!activeFile) {
      addLine({ type: 'system', text: '⚠ No file open in editor' });
      return;
    }
    if (!selectedRuntime) {
      addLine({ type: 'system', text: '⚠ No runtime selected. Pick one from the runtime selector.' });
      return;
    }

    setExecuting(true);
    addLine({ type: 'system', text: `▶ Running ${activeFile.path.split('/').pop()} with ${selectedRuntime.language} ${selectedRuntime.version}...` });

    try {
      // Read active file
      const content = await FileService.readFile(activeFile.path);
      const fileName = activeFile.path.split('/').pop() ?? 'main';

      const result = await PistonService.execute({
        language: selectedRuntime.language,
        version: selectedRuntime.version,
        files: [{ name: fileName, content }],
      });

      if (result.stdout) {
        result.stdout.split('\n').forEach(line => addLine({ type: 'stdout', text: line }));
      }
      if (result.stderr) {
        result.stderr.split('\n').forEach(line => addLine({ type: 'stderr', text: line }));
      }

      const exitColor = result.code === 0 ? '✓' : '✗';
      addLine({ type: 'system', text: `${exitColor} Exit code: ${result.code ?? 'signal: ' + result.signal}` });
    } catch (e: any) {
      if (e.message === 'RATE_LIMITED') {
        addLine({ type: 'stderr', text: '⚠ Piston public API rate limit hit. Try again in a moment, or set a self-hosted Piston URL in settings.' });
      } else {
        addLine({ type: 'stderr', text: `Error: ${e.message}` });
      }
    } finally {
      setExecuting(false);
    }
  }, [openFiles, activeIndex, selectedRuntime, addLine, setExecuting]);

  return { executeCurrentFile };
}
```

---

## Phase 4.2 — Wire TerminalScreen UI

### Files to Modify (not create)

```
src/screens/TerminalScreen.tsx                        ← major update
src/features/terminal/components/TerminalView.tsx     ← wire to store
src/features/terminal/components/TerminalOutputRow.tsx ← apply type colours
```

### Updated `TerminalScreen.tsx` (key wiring)

```tsx
export function TerminalScreen() {
  const { lines, isExecuting, selectedRuntime, setRuntime } = useTerminalStore();
  const { executeCurrentFile } = useCodeExecution();
  const [runtimePickerVisible, setRuntimePickerVisible] = useState(false);
  const { data: runtimes } = usePistonRuntimes();

  return (
    <ScreenContainer>
      <AppHeader
        title={selectedRuntime ? `${selectedRuntime.language} ${selectedRuntime.version}` : 'Select Runtime'}
        right={
          <IconButton icon="chevron-down" onPress={() => setRuntimePickerVisible(true)} />
        }
      />
      
      {/* Use your existing TerminalView — now wired to store */}
      <TerminalView lines={lines} isExecuting={isExecuting} />

      {/* Use your existing KeyboardAccessoryBar */}
      <KeyboardAccessoryBar
        onRunPress={executeCurrentFile}
        onClearPress={() => useTerminalStore.getState().clearLines()}
        isExecuting={isExecuting}
      />

      {/* Runtime picker bottom sheet */}
      <RuntimePickerModal
        visible={runtimePickerVisible}
        runtimes={runtimes ?? []}
        onSelect={rt => { setRuntime(rt); setRuntimePickerVisible(false); }}
        onClose={() => setRuntimePickerVisible(false)}
      />
    </ScreenContainer>
  );
}
```

### `TerminalOutputRow.tsx` colour mapping

```tsx
const TYPE_COLORS = {
  stdout: '#E8E8E8',
  stderr: '#FF6B6B',
  system: '#888888',
  input:  '#6BCB77',
};
```

### ✅ Definition of Done — Phase 4
- [x] Runtime list loads from Piston API and shows in picker
- [x] Selected runtime persists in store
- [x] "Run" button executes the currently open file
- [x] `stdout` appears in white, `stderr` in red, system messages in gray
- [x] Exit code badge shows with correct colour
- [x] Rate limit error shows a helpful message (not a crash)
- [x] Clear button clears terminal lines
- [x] Execution is cancelled cleanly when user navigates away

### ❌ Do NOT Yet
- Add stdin input handling (v2)
- Add multi-file project execution bundling
- Add self-hosted Piston URL in settings (add the field but don't build settings screen yet)

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: Piston API integration, terminal execution, runtime selector"
```

---

---

# PHASE 5 — Global Search
> **Status of what exists:** `SearchInput`, `FilterChipBar`, `SearchResultCard`, `HighlightedMatchText`, `SearchResultsGroup` exist statically.  
> **Objective:** Wire search to real filesystem. Filename + content search.  
> **Complexity:** 🟡 Medium · **Risk:** 🟢 Low · **Estimated time:** 4–5 days

---

## Phase 5.1 — Filename Fuzzy Search

### Libraries to Install

```bash
npm i fuse.js
```

### Files to Create

```
src/features/search/
├── services/
│   └── SearchService.ts
└── hooks/
    └── useSearch.ts
```

### `features/search/services/SearchService.ts`

```typescript
import Fuse from 'fuse.js';
import RNFS from 'react-native-fs';
import { FileService } from '../../../services/FileService';

export interface SearchMatch {
  filePath: string;
  fileName: string;
  lineNumber?: number;
  lineContent?: string;
  matchStart?: number;
  matchEnd?: number;
  type: 'filename' | 'content';
}

class SearchServiceClass {
  private fileIndex: string[] = [];
  private fuse: Fuse<string> | null = null;

  // Index all file paths in a project — call on project open
  async indexProject(projectPath: string): Promise<void> {
    const paths: string[] = [];
    await this.collectPaths(projectPath, paths);
    this.fileIndex = paths;
    this.fuse = new Fuse(paths, {
      threshold: 0.4,
      keys: [],
      includeScore: true,
    });
  }

  private async collectPaths(dir: string, out: string[]): Promise<void> {
    const items = await FileService.readDir(dir);
    for (const item of items) {
      if (item.isDirectory) {
        if (!item.name.startsWith('.') && item.name !== 'node_modules') {
          await this.collectPaths(item.path, out);
        }
      } else {
        out.push(item.path);
      }
    }
  }

  searchFilenames(query: string): SearchMatch[] {
    if (!this.fuse || !query.trim()) return [];
    return this.fuse.search(query).slice(0, 30).map(r => ({
      filePath: r.item,
      fileName: r.item.split('/').pop() ?? '',
      type: 'filename',
    }));
  }

  // Content search — batched to avoid blocking UI
  async searchContent(
    query: string,
    projectPath: string,
    onMatch: (match: SearchMatch) => void,
    onComplete: () => void,
  ): Promise<void> {
    const paths = [...this.fileIndex];
    const regex = new RegExp(query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
    
    const BATCH_SIZE = 10;
    let i = 0;

    const processBatch = async () => {
      const batch = paths.slice(i, i + BATCH_SIZE);
      i += BATCH_SIZE;

      for (const filePath of batch) {
        try {
          const content = await RNFS.readFile(filePath, 'utf8');
          const lines = content.split('\n');
          lines.forEach((line, lineIndex) => {
            const match = regex.exec(line);
            if (match) {
              onMatch({
                filePath,
                fileName: filePath.split('/').pop() ?? '',
                lineNumber: lineIndex + 1,
                lineContent: line.trim(),
                matchStart: match.index,
                matchEnd: match.index + match[0].length,
                type: 'content',
              });
            }
            regex.lastIndex = 0;
          });
        } catch {
          // Skip unreadable files (binary, etc.)
        }
      }

      if (i < paths.length) {
        setTimeout(processBatch, 0); // yield to UI thread between batches
      } else {
        onComplete();
      }
    };

    await processBatch();
  }
}

export const SearchService = new SearchServiceClass();
```

### Updated `GlobalSearchScreen.tsx` (key wiring)

```tsx
// Wire existing components to SearchService
export function GlobalSearchScreen({ navigation }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchMatch[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const { currentProject } = useProjectStore();

  useEffect(() => {
    if (currentProject) SearchService.indexProject(currentProject.path);
  }, [currentProject?.path]);

  const handleSearch = useCallback(debounce(async (q: string) => {
    if (!q.trim()) { setResults([]); return; }
    setIsSearching(true);

    // Filename results are instant
    const fileMatches = SearchService.searchFilenames(q);
    setResults(fileMatches);

    // Content results are async
    await SearchService.searchContent(
      q,
      currentProject?.path ?? '',
      match => setResults(prev => [...prev, match]),
      () => setIsSearching(false),
    );
  }, 300), [currentProject]);

  const handleResultPress = (match: SearchMatch) => {
    navigation.navigate('Editor', {
      screen: 'OpenFile',
      params: { filePath: match.filePath },
    });
  };

  return (
    <ScreenContainer>
      {/* Your existing SearchInput component */}
      <SearchInput value={query} onChangeText={text => { setQuery(text); handleSearch(text); }} />
      
      {/* Your existing FilterChipBar */}
      <FilterChipBar ... />

      {/* Your existing SearchResultsGroup */}
      <FlatList
        data={results}
        renderItem={({ item }) => (
          <SearchResultCard result={item} onPress={() => handleResultPress(item)} />
        )}
      />
    </ScreenContainer>
  );
}
```

### ✅ Definition of Done — Phase 5
- [ ] Filename search returns results as you type (< 100ms)
- [ ] Content search runs in batches without freezing the UI
- [ ] `HighlightedMatchText` highlights the matched portion
- [ ] Tapping a result opens the file in editor
- [ ] Filter chips narrow results by extension
- [ ] Empty state shown when no results found
- [ ] Search index rebuilds when files are added/renamed/deleted

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: global search - filename fuzzy + content batched search"
```

---

---

# PHASE 6 — Git Integration (isomorphic-git)
> **Prerequisite:** Phase 1 (FileService) must be stable. Phase 3 (editor) must be functional.  
> **Objective:** Add Git init, commit, push, pull, clone to projects.  
> **Complexity:** 🔴 High · **Risk:** 🔴 High (fs adapter shim is tricky) · **Estimated time:** 8–12 days  
> ⚠️ This is the highest-risk phase. Build a minimal fs shim first. Test it before building any UI.

---

## Phase 6.1 — isomorphic-git Setup (RNFS Adapter)

### Why This Is Hard
isomorphic-git needs a custom `fs` adapter that maps its Node.js-style `fs` calls to RNFS. The shim is the hardest part — get it right before writing any Git UI.

### Libraries to Install

```bash
npm i isomorphic-git
```

### Files to Create

```
src/services/git/
├── RNFSAdapter.ts       ← fs shim for isomorphic-git
├── GitService.ts        ← git operations
└── index.ts
```

### `services/git/RNFSAdapter.ts`

```typescript
import RNFS from 'react-native-fs';

// isomorphic-git expects a node-style fs object
// This shim translates its calls to RNFS
export const RNFSAdapter = {
  promises: {
    async readFile(path: string, options?: { encoding?: string }) {
      const encoding = options?.encoding ?? 'utf8';
      if (encoding === 'utf8') return RNFS.readFile(path, 'utf8');
      // Binary read
      const base64 = await RNFS.readFile(path, 'base64');
      return Buffer.from(base64, 'base64');
    },

    async writeFile(path: string, data: string | Buffer, options?: any) {
      if (typeof data === 'string') {
        await RNFS.writeFile(path, data, 'utf8');
      } else {
        await RNFS.writeFile(path, data.toString('base64'), 'base64');
      }
    },

    async unlink(path: string) {
      await RNFS.unlink(path);
    },

    async readdir(path: string) {
      const items = await RNFS.readDir(path);
      return items.map(i => i.name);
    },

    async mkdir(path: string) {
      await RNFS.mkdir(path);
    },

    async rmdir(path: string) {
      await RNFS.unlink(path);
    },

    async stat(path: string) {
      const s = await RNFS.stat(path);
      return {
        isFile: () => !s.isDirectory(),
        isDirectory: () => s.isDirectory(),
        isSymbolicLink: () => false,
        size: s.size,
        mtimeMs: s.mtime ? new Date(s.mtime).getTime() : Date.now(),
        mode: 0o666,
        ino: 0,
        uid: 0,
        gid: 0,
      };
    },

    async lstat(path: string) {
      return this.stat(path);
    },

    async symlink() {
      throw new Error('symlink not supported');
    },

    async readlink() {
      throw new Error('readlink not supported');
    },

    async chmod() {
      // No-op — RNFS doesn't support chmod
    },
  },
};
```

### `services/git/GitService.ts`

```typescript
import git from 'isomorphic-git';
import http from 'isomorphic-git/http/web';
import { RNFSAdapter } from './RNFSAdapter';
import { storage } from '../../storage/mmkv';

const fs = RNFSAdapter;

export interface GitAuthor {
  name: string;
  email: string;
}

class GitServiceClass {
  private getAuthor(): GitAuthor {
    return {
      name: storage.getString('gitAuthorName') ?? 'Nova Code User',
      email: storage.getString('gitAuthorEmail') ?? 'user@novacode.app',
    };
  }

  private getToken(): string | undefined {
    return storage.getString('gitPAT') ?? undefined;
  }

  private getHttpHeaders() {
    const token = this.getToken();
    if (!token) return {};
    return { Authorization: `token ${token}` };
  }

  async init(dir: string): Promise<void> {
    await git.init({ fs, dir });
  }

  async clone(url: string, dir: string, onProgress?: (p: any) => void): Promise<void> {
    await git.clone({
      fs, http, dir, url,
      headers: this.getHttpHeaders(),
      onProgress,
      depth: 1,
    });
  }

  async add(dir: string, filepath: string): Promise<void> {
    await git.add({ fs, dir, filepath });
  }

  async addAll(dir: string): Promise<void> {
    const status = await this.status(dir);
    for (const [file, , worktree] of status) {
      if (worktree !== 1) await git.add({ fs, dir, filepath: file });
    }
  }

  async commit(dir: string, message: string): Promise<string> {
    const author = this.getAuthor();
    return git.commit({ fs, dir, message, author });
  }

  async push(dir: string): Promise<void> {
    await git.push({ fs, http, dir, headers: this.getHttpHeaders() });
  }

  async pull(dir: string): Promise<void> {
    const author = this.getAuthor();
    await git.pull({ fs, http, dir, author, headers: this.getHttpHeaders() });
  }

  async status(dir: string) {
    return git.statusMatrix({ fs, dir });
  }

  async log(dir: string, depth = 20) {
    return git.log({ fs, dir, depth });
  }

  async currentBranch(dir: string): Promise<string | void> {
    return git.currentBranch({ fs, dir });
  }

  async listBranches(dir: string) {
    return git.listBranches({ fs, dir });
  }

  async isRepo(dir: string): Promise<boolean> {
    try {
      await git.resolveRef({ fs, dir, ref: 'HEAD' });
      return true;
    } catch {
      return false;
    }
  }
}

export const GitService = new GitServiceClass();
```

### Git Status Badges in FileTree

After Phase 6.1 is verified working, add status badges to `FileTreeItem`:

```
File status in isomorphic-git statusMatrix:
[filepath, HEAD, index, workdir]
[_, 0, 0, 1] = new untracked file      → gray "U"
[_, 0, 2, 2] = new staged file         → green "A"
[_, 1, 1, 1] = unmodified              → no badge
[_, 1, 2, 2] = modified + staged       → green "M"
[_, 1, 1, 2] = modified, not staged    → orange "M"
[_, 1, 0, 1] = deleted, not staged     → red "D"
[_, 1, 0, 0] = deleted + staged        → red "D"
```

### ✅ Definition of Done — Phase 6
- [ ] `RNFSAdapter` unit-testable: write a file, read it back via the adapter
- [ ] `git.init()` creates `.git` directory inside a project
- [ ] `git.add()` + `git.commit()` creates a real commit (verify with `git.log()`)
- [ ] File status badges appear correctly in file tree
- [ ] Clone a small public GitHub repo into PROJECTS_ROOT
- [ ] Push to GitHub with a valid PAT (test with your own repo)
- [ ] Commit screen shows staged files checklist

### ❌ Do NOT Yet
- Add diff view
- Add branch switching
- Add merge/rebase

### ⚠️ Common Pitfalls
- `readFile` in the adapter must handle both `string` and `Buffer` return — isomorphic-git calls it both ways
- The `.git` directory has many small files — RNFS can handle this but it is slower than native git
- `chmod` must be a no-op (not throw) — isomorphic-git calls it but RNFS doesn't support it
- Always test the adapter shim in isolation before using it with isomorphic-git

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: isomorphic-git integration, RNFS adapter shim, git status badges"
```

---

---

# PHASE 7 — Cloud Sync (Supabase Storage)
> **Prerequisite:** Phase 1 stable, Phase 6 (Git) operational.  
> **Objective:** Project backup to Supabase. Auth. Conflict resolution.  
> **Complexity:** 🟡 Medium · **Risk:** 🟡 Medium · **Estimated time:** 6–8 days  
> ⚠️ Do NOT start this before the local editor workflow is production-stable.

---

## Phase 7.1 — Supabase Setup

### Libraries to Install

```bash
npm i @supabase/supabase-js
npm i @react-native-community/netinfo
```

### Environment Config

Create `src/config/supabase.ts`:
```typescript
// Store these in a .env file, never commit keys
export const SUPABASE_URL = process.env.SUPABASE_URL ?? '';
export const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY ?? '';
```

Create `src/services/SupabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/supabase';
import { storage } from '../storage/mmkv';

// Supabase needs AsyncStorage-compatible adapter — use MMKV wrapper
const mmkvStorageAdapter = {
  getItem: (key: string) => storage.getString(key) ?? null,
  setItem: (key: string, value: string) => storage.set(key, value),
  removeItem: (key: string) => storage.delete(key),
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: mmkvStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
```

### `services/SyncService.ts`

```typescript
import { supabase } from './SupabaseClient';
import { FileService } from './FileService';
import { storage } from '../storage/mmkv';
import NetInfo from '@react-native-community/netinfo';
import RNFS from 'react-native-fs';

const BUCKET = 'nova-projects';

class SyncServiceClass {
  private getUserId(): string | null {
    const session = storage.getString('supabase-auth-session');
    if (!session) return null;
    return JSON.parse(session)?.user?.id ?? null;
  }

  private remotePath(userId: string, projectName: string, relativePath: string): string {
    return `${userId}/${projectName}/${relativePath}`;
  }

  async uploadFile(localPath: string, projectName: string, relativePath: string): Promise<void> {
    const userId = this.getUserId();
    if (!userId) throw new Error('Not authenticated');

    const state = await NetInfo.fetch();
    if (!state.isConnected) {
      // Queue for later
      const queue: string[] = JSON.parse(storage.getString('syncQueue') ?? '[]');
      queue.push(JSON.stringify({ localPath, projectName, relativePath }));
      storage.set('syncQueue', JSON.stringify(queue));
      return;
    }

    const content = await FileService.readFile(localPath);
    const { error } = await supabase.storage
      .from(BUCKET)
      .upload(this.remotePath(userId, projectName, relativePath), content, {
        upsert: true,
        contentType: 'text/plain',
      });

    if (error) throw error;
  }

  async flushQueue(): Promise<void> {
    const queue: string[] = JSON.parse(storage.getString('syncQueue') ?? '[]');
    if (!queue.length) return;

    const remaining: string[] = [];
    for (const item of queue) {
      const { localPath, projectName, relativePath } = JSON.parse(item);
      try {
        await this.uploadFile(localPath, projectName, relativePath);
      } catch {
        remaining.push(item);
      }
    }
    storage.set('syncQueue', JSON.stringify(remaining));
  }
}

export const SyncService = new SyncServiceClass();
```

### ✅ Definition of Done — Phase 7
- [ ] Supabase auth works (GitHub OAuth or email/password)
- [ ] Session persists in MMKV across app restarts
- [ ] File saves trigger upload to Supabase bucket
- [ ] Offline writes are queued and flushed on reconnect
- [ ] Cloud status icon in editor tab bar (synced / pending / offline)
- [ ] Project can be restored from cloud to a new device

### ❌ Do NOT Yet
- Build conflict resolution UI (mark as v2)
- Add real-time collaboration
- Add storage usage analytics

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: Supabase cloud sync, offline queue, auth"
```

---

---

# PHASE 8 — Package Manager Screen
> **Status of what exists:** `PackageCard`, `PackageList`, `PackageTabs`, `InstallProgressCard` exist statically.  
> **Objective:** Wire to npm registry API and Piston runtimes. Read/write package.json.  
> **Complexity:** 🟢 Low · **Risk:** 🟢 Low · **Estimated time:** 3–4 days

---

## Phase 8.1 — npm Registry + Piston Runtimes

### Files to Create

```
src/features/packages/
├── services/
│   └── PackageRegistryService.ts
└── hooks/
    ├── usePackageSearch.ts
    └── usePistonRuntimes.ts
```

### `features/packages/services/PackageRegistryService.ts`

```typescript
import { storage } from '../../../storage/mmkv';

const NPM_SEARCH = 'https://registry.npmjs.org/-/v1/search';
const NPM_PACKAGE = 'https://registry.npmjs.org';

export interface NpmPackage {
  name: string;
  version: string;
  description: string;
  keywords: string[];
  publisher: string;
  weeklyDownloads?: number;
  hasTypes: boolean;
  license: string;
}

class PackageRegistryServiceClass {
  async search(query: string): Promise<NpmPackage[]> {
    const cacheKey = `npmSearch:${query}`;
    const cached = storage.getString(cacheKey);
    if (cached) return JSON.parse(cached);

    const res = await fetch(`${NPM_SEARCH}?text=${encodeURIComponent(query)}&size=20`);
    if (!res.ok) throw new Error('npm search failed');

    const data = await res.json();
    const results: NpmPackage[] = data.objects.map((obj: any) => ({
      name: obj.package.name,
      version: obj.package.version,
      description: obj.package.description ?? '',
      keywords: obj.package.keywords ?? [],
      publisher: obj.package.publisher?.username ?? '',
      hasTypes: obj.package.types !== undefined || obj.package.name.startsWith('@types/'),
      license: obj.package.license ?? 'Unknown',
    }));

    // Cache for 5 minutes
    storage.set(cacheKey, JSON.stringify(results));
    setTimeout(() => storage.delete(cacheKey), 300_000);

    return results;
  }

  generateImportSnippet(packageName: string, language: string): string {
    switch (language) {
      case 'javascript':
      case 'typescript':
        return `import ${packageName.replace(/[^a-zA-Z]/g, '')} from '${packageName}';`;
      case 'python':
        return `import ${packageName.replace(/-/g, '_')}`;
      default:
        return packageName;
    }
  }
}

export const PackageRegistryService = new PackageRegistryServiceClass();
```

### Updated `PackageManagerScreen.tsx`

Wire your existing `SearchInput` → `PackageRegistryService.search()` → `PackageList` → `PackageCard`.

Add a "Runtimes" tab that fetches `PistonService.getRuntimes()` and renders them with your existing `PackageTabs` component.

### ✅ Definition of Done — Phase 8
- [ ] Typing in search returns real npm packages within 300ms (debounced)
- [ ] `PackageCard` shows real name, version, description, TypeScript badge
- [ ] "Copy import" copies the correct snippet to clipboard
- [ ] Runtimes tab shows all Piston-available languages
- [ ] Tapping a runtime sets it as the selected runtime in `useTerminalStore`

### 🔖 Commit Checkpoint
```
git add .
git commit -m "feat: npm registry search, package cards, runtime browser"
```

---

---

# PHASE 9 — Polish, Performance & Release
> **Objective:** Tighten the app. Fix memory leaks. Build signed AAB. Submit to Play Store.  
> **Complexity:** 🟡 Medium · **Risk:** 🟡 Medium · **Estimated time:** 7–10 days

---

## Phase 9.1 — Performance

### Hermes Engine
Verify in `android/app/build.gradle`:
```groovy
hermesEnabled = true  // Should already be true in new RN projects
```

### WebView Memory Management
The CodeMirror WebView is the biggest memory consumer. Never unmount it once mounted — use CSS `display: none` to hide it instead:

```tsx
// In CodeEditorScreen — keep WebView alive in background
<WebViewEditor
  style={{ flex: 1, display: isEditorTabActive ? 'flex' : 'none' }}
  ...
/>
```

### React.memo on Heavy List Items

```tsx
export const FileTreeItem = React.memo(({ node, depth, onPress }) => { ... });
export const TerminalOutputRow = React.memo(({ line }) => { ... });
export const PackageCard = React.memo(({ pkg, onPress }) => { ... });
```

### FlatList Optimizations
```tsx
<FlatList
  removeClippedSubviews={true}
  maxToRenderPerBatch={15}
  windowSize={5}
  getItemLayout={...}  // Add if row height is fixed
/>
```

---

## Phase 9.2 — Stability

### Error Boundaries

```tsx
// Wrap every major screen section
<ErrorBoundary fallback={<GlassCard><AppText>Editor crashed. Tap to reload.</AppText></GlassCard>}>
  <WebViewEditor ... />
</ErrorBoundary>
```

### Sentry Integration

```bash
npm i @sentry/react-native
npx @sentry/wizard -i reactNative
```

```typescript
// In index.js
import * as Sentry from '@sentry/react-native';
Sentry.init({ dsn: 'YOUR_DSN', tracesSampleRate: 0.2 });
```

---

## Phase 9.3 — Release Build

```bash
# Generate release keystore (do this ONCE — store safely outside repo)
keytool -genkey -v \
  -keystore ~/nova-release.keystore \
  -alias nova-key \
  -keyalg RSA -keysize 2048 -validity 10000

# Add to ~/.gradle/gradle.properties:
NOVA_STORE_FILE=/home/you/nova-release.keystore
NOVA_KEY_ALIAS=nova-key
NOVA_STORE_PASSWORD=yourpassword
NOVA_KEY_PASSWORD=yourpassword
```

`android/app/build.gradle`:
```groovy
signingConfigs {
  release {
    storeFile file(NOVA_STORE_FILE)
    storePassword NOVA_STORE_PASSWORD
    keyAlias NOVA_KEY_ALIAS
    keyPassword NOVA_KEY_PASSWORD
  }
}
buildTypes {
  release {
    signingConfig signingConfigs.release
    minifyEnabled true
    proguardFiles getDefaultProguardFile('proguard-android-optimize.txt'), 'proguard-rules.pro'
  }
}
```

```bash
# Build release AAB
cd android && ./gradlew bundleRelease
# Output: android/app/build/outputs/bundle/release/app-release.aab
```

### Play Store Checklist
- [ ] Privacy policy URL (required — you access storage + cloud)
- [ ] Screenshots: File Explorer, Editor, Terminal output, Git panel
- [ ] Content rating questionnaire (it's a developer tool — straightforward)
- [ ] Short description (≤80 chars)
- [ ] App signing via Play App Signing (recommended)

---

---

# 🗺️ Architecture Reference

## Folder Structure — Final State

```
Nova-Code/
├── android/
│   └── app/src/main/assets/
│       └── editor/               ← CodeMirror 6 bundle
├── src/
│   ├── components/               ✅ Existing UI library (unchanged)
│   ├── config/
│   │   └── supabase.ts
│   ├── features/
│   │   ├── editor/
│   │   │   ├── components/
│   │   │   │   ├── WebViewEditor.tsx     ← NEW: real editor
│   │   │   │   └── FileTabBar.tsx        ← MODIFIED: wired to store
│   │   │   ├── hooks/
│   │   │   │   ├── useFileOpen.ts
│   │   │   │   └── useAutosave.ts
│   │   │   └── services/
│   │   │       └── EditorBridge.ts
│   │   ├── files/
│   │   │   ├── components/
│   │   │   │   ├── FileTree.tsx          ← MODIFIED: dynamic
│   │   │   │   └── FileTreeItem.tsx      ← MODIFIED: git badges
│   │   │   ├── hooks/
│   │   │   │   └── useFileTree.ts
│   │   │   ├── services/
│   │   │   │   └── ProjectService.ts
│   │   │   └── utils/
│   │   │       └── fileIcons.ts
│   │   ├── packages/
│   │   │   ├── services/
│   │   │   │   └── PackageRegistryService.ts
│   │   │   └── hooks/
│   │   │       └── usePackageSearch.ts
│   │   ├── search/
│   │   │   └── services/
│   │   │       └── SearchService.ts
│   │   └── terminal/
│   │       └── hooks/
│   │           ├── usePistonRuntimes.ts
│   │           └── useCodeExecution.ts
│   ├── navigation/
│   │   ├── RootNavigator.tsx
│   │   ├── EditorStack.tsx
│   │   └── types.ts
│   ├── screens/                  ← All MODIFIED (wired up)
│   ├── services/
│   │   ├── FileService.ts
│   │   ├── PermissionService.ts
│   │   ├── PistonService.ts
│   │   ├── SyncService.ts
│   │   ├── SupabaseClient.ts
│   │   └── git/
│   │       ├── RNFSAdapter.ts
│   │       └── GitService.ts
│   ├── storage/
│   │   └── mmkv.ts
│   ├── store/
│   │   ├── useEditorStore.ts
│   │   ├── useProjectStore.ts
│   │   ├── useTerminalStore.ts
│   │   └── useSettingsStore.ts
│   └── theme/                    ✅ Unchanged
```

---

## Data Flow Diagram

```
User taps file in FileExplorer
         │
         ▼
FileExplorerScreen.handleFilePress(node)
         │
         ▼
navigation.navigate('Editor', { filePath, language })
         │
         ▼
CodeEditorScreen receives route.params.filePath
         │
         ├─▶ useFileOpen.openFileAtPath(filePath)
         │       └─▶ FileService.readFile(path)
         │               └─▶ RNFS.readFile()
         │
         ├─▶ useEditorStore.openFile({ path, language, unsaved: false })
         │
         └─▶ WebViewEditor receives initialContent
                 └─▶ postMessage INIT to CodeMirror 6
                         └─▶ CM6 renders content with syntax highlighting

User types in editor
         │
         ▼
CM6 fires CONTENT_CHANGED via postMessage
         │
         ▼
WebViewEditor.onMessage → onContentChange callback
         │
         ▼
useEditorStore.markUnsaved(path) → tab shows "●"

Autosave timer fires (every 30s)
         │
         ▼
useAutosave → WebViewEditor.getContent() (async bridge call)
         │
         ▼
FileService.writeFile(path, content) → RNFS.writeFile()
         │
         ▼
useEditorStore.markSaved(path) → tab clears "●"
```

---

## State Ownership Rules

```
┌──────────────────────────────────────────────────────┐
│  What goes WHERE                                     │
├──────────────────┬───────────────────────────────────┤
│ Zustand Store    │ UI state: open tabs, active index │
│                  │ Terminal lines, selected runtime  │
│                  │ Git status per file               │
│                  │ Search results                    │
├──────────────────┼───────────────────────────────────┤
│ MMKV             │ Settings (theme, font size, etc.) │
│                  │ Recent projects list              │
│                  │ Piston API URL override           │
│                  │ Git PAT token                     │
│                  │ Supabase session                  │
│                  │ Offline sync queue                │
│                  │ npm search cache (5 min TTL)      │
├──────────────────┼───────────────────────────────────┤
│ RNFS (disk)      │ All file content (NEVER in store) │
│                  │ Project directories               │
│                  │ .git directory                    │
│                  │ Editor bundle (assets)            │
├──────────────────┼───────────────────────────────────┤
│ Supabase         │ Cloud backup of file content      │
│                  │ Auth sessions                     │
│                  │ User account                      │
└──────────────────┴───────────────────────────────────┘
```

---

## RN ↔ WebView Bridge Architecture

```
React Native (TypeScript)          CodeMirror 6 (HTML/JS)
─────────────────────────          ──────────────────────
EditorBridge.ts                    editor.js
  - Type definitions               - Message listener
  - Serialize/parse helpers        - window.ReactNativeWebView
                                     .postMessage()
WebViewEditor.tsx
  - injectJavaScript()  ─────────▶  window.dispatchEvent()
  - onMessage()         ◀─────────  postMessage()
  - ref.getContent()    ─────────▶  GET_CONTENT message
                        ◀─────────  CONTENT response (Promise)

Message types (RN → CM6):
  INIT       { content, language, fontSize }
  SET_CONTENT { content }
  GET_CONTENT {}
  SET_FONT_SIZE { fontSize }
  FIND       { query }
  SET_LANGUAGE { language }

Message types (CM6 → RN):
  READY            {}
  CONTENT_CHANGED  { content }
  CONTENT          string
  CURSOR_CHANGED   { line, col }
```

---

## Service Layer Architecture

```
Screens / Hooks (consumer layer)
         │
         ▼
┌────────────────────────────────────────────────────┐
│              Service Layer                          │
│  FileService    PistonService   GitService          │
│  PermissionSvc  SyncService     PackageRegistrySvc  │
│  SearchService  SupabaseClient                      │
└────────────────────────────────────────────────────┘
         │                   │
         ▼                   ▼
  RNFS (device)        External APIs
  MMKV (prefs)         - Piston API
                       - npm registry
                       - Supabase Storage
                       - GitHub/GitLab (via isomorphic-git)
```

---

---

# 🔄 Recommended Development Workflow

## How to Work Phase-by-Phase

1. **Never start a new phase before the current one passes its Definition of Done.** This isn't optional — it's how you avoid integration hell.
2. **After every subphase, commit.** Small commits are easier to revert than large ones.
3. **Test on a real Android device at least once per phase.** The emulator hides memory and performance issues.
4. **When you hit a blocker**, create a stub/mock for the blocked dependency and keep building. Example: if RNFS gives you trouble, mock `FileService.readDir()` to return hardcoded data and continue wiring the UI. Fix the real implementation after.

## How Often to Refactor

- **Do not refactor during implementation.** Refactor between phases.
- After Phase 3 (editor) — review the bridge message types. Add error handling if missing.
- After Phase 6 (git) — review the RNFSAdapter. It will have edge cases you discovered.
- After Phase 8 (packages) — do a service layer audit. Extract any repeated patterns.

## When to Optimise

- **Never before Phase 9.** Premature optimisation will waste 30% of your time.
- **Profile before you guess.** Use Flipper + React DevTools to find actual bottlenecks. The bottleneck is almost always not where you think it is.
- **The only exceptions:** If something is visibly janky to a user (file explorer scroll, terminal scroll), fix it immediately. Don't wait.

## How to Avoid Technical Debt

1. Keep the service layer thin — one responsibility per service.
2. Never put business logic in screens — screens only call hooks and services.
3. Never put file I/O in Zustand stores — stores hold UI state, not data.
4. If you add a `TODO` comment, file a note in your project log. Don't let TODOs be invisible.
5. Every 2 phases, spend half a day fixing TODOs instead of building new features.

## How to Validate Architecture Before Continuing

Before moving to the next phase, answer these questions:
- [ ] Can I navigate to every screen and back without crashing?
- [ ] Does the store reset correctly when I kill and reopen the app?
- [ ] Does MMKV persist what it should and nothing extra?
- [ ] Is the FileService the only place that touches RNFS?
- [ ] Are TypeScript types fully propagated (no `any` in critical paths)?

---

---

# ⚠️ Reality Check

## Most Technically Difficult Parts

| Component | Difficulty | Why |
|---|---|---|
| isomorphic-git RNFS adapter | 🔴 Very Hard | Custom fs shim with subtle binary/text edge cases |
| CodeMirror 6 WebView bridge | 🟡 Hard | Async message passing, promise resolution across bridge |
| Android permission handling | 🟡 Medium-Hard | Varies across Android 10/11/12/13 |
| Autosave + unsaved state | 🟡 Medium | Race conditions between save and user edits |
| Search batching (no UI freeze) | 🟡 Medium | Requires careful `setTimeout(0)` yielding |
| Supabase offline queue | 🟡 Medium | Needs network state tracking + MMKV queue management |

## Highest-Risk Integrations

1. **isomorphic-git on Android** — The fs adapter shim is the most likely place to find bugs. Test it in total isolation before wiring any Git UI.
2. **CodeMirror 6 WebView on low-RAM devices** — A 2 GB RAM Android device will struggle if you also have the file tree loaded. Test on a mid-range device.
3. **Supabase + MMKV auth session** — Supabase's session management assumes AsyncStorage. The MMKV adapter works but watch for refresh token issues.

## Recommended Simplifications

| Feature | Simplification |
|---|---|
| Git diff view | Skip in v1 — show changed file list only |
| Multi-file Piston execution | Start with single-file only |
| Conflict resolution UI | Skip in v1 — "last write wins" is fine for a solo developer |
| Drag-to-reorder in file tree | Skip entirely — low value, high complexity |
| Minimap in CodeMirror | Skip — mobile screen too small, wastes horizontal space |

## What Can Wait Until v2

- Language server protocol (LSP) / IntelliSense / autocomplete
- Monaco migration (reconsider after v1 ships and you see real user RAM profiles)
- Real-time collaboration (Supabase Realtime)
- Terminal stdin input (interactive programs)
- Git branch switching UI
- Git diff view
- Extension/plugin system
- iOS support

## What Should Absolutely NOT Be Built Too Early

| Feature | Correct Phase | Wrong Phase |
|---|---|---|
| Supabase cloud sync | After local editor is stable (Phase 7) | Before RNFS works (Phase 1) |
| isomorphic-git | After filesystem abstraction is solid (Phase 6) | Before editor pipeline (Phase 3) |
| Advanced search indexing (SQLite FTS5) | v2 only | Anywhere in v1 |
| Monaco Editor | v2 evaluation | Before CodeMirror 6 is proven |
| Settings screen | After all features exist to configure | At the start |
| Sentry crash reporting | Release phase (Phase 9) | Any earlier phase |

---

## MVP Milestone Map

```
┌─────────────────────────────────────────────────────────────┐
│  MVP 1 — "It works as an IDE"                               │
│  Phase 0 + 1 + 2 + 3 done                                  │
│  → Navigate, browse real files, open files, edit, save      │
│  → Demo-able to friends. Commit to GitHub. ✅               │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MVP 2 — "It can execute code"                              │
│  + Phase 4 done                                             │
│  → Open Python file, press Run, see output in terminal      │
│  → Feature-complete enough for a beta tester. ✅            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  MVP 3 — "It's a real developer tool"                       │
│  + Phase 5 + 6 done                                         │
│  → Search across projects, commit to GitHub from the app    │
│  → Ready for public beta / Play Store early access. ✅      │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  v1.0 Release                                               │
│  All 9 phases done                                          │
│  → Full cloud sync, package browser, polished UI            │
│  → Play Store production release. ✅                        │
└─────────────────────────────────────────────────────────────┘
```

---

*Nova Code Master Roadmap — Generated for a solo student developer building a production Android IDE*  
*Version: 1.0 | Stack: React Native CLI + CodeMirror 6 + Piston API + isomorphic-git + Supabase*
