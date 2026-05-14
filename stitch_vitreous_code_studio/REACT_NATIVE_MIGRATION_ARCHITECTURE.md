# 1. Project Overview
- The project is a dark, glassmorphism-based mobile developer workspace called **Nova Code**. It provides core IDE-style workflows: code editing, file browsing, global search, package management, and terminal execution.
- Major app modules/features:
  - Code editor with syntax highlighting, file tabs, active-line highlighting, and run FAB
  - File explorer with project tree, file preview/editor panel, and project actions
  - Global search with query input, filter chips, grouped results, and code snippets
  - Package manager with search, install progress, package cards, update/delete actions
  - Terminal with command history, live prompt, keyboard accessory actions
  - Shared liquid-glass visual system, app header, bottom navigation, ambient background

# 2. Identified Screens

| Screen Name | Purpose | Source Files |
|--------------|----------|---------------|
| CodeEditorScreen | Primary code editing surface with tabs, syntax-colored code lines, active line, and run FAB | `code_editor/code_editor.html` |
| FileExplorerScreen | Browse project folders/files, show project metadata, create files/folders, and preview selected file | `file_explorer_immersive_glass/file_explorer.html` |
| GlobalSearchScreen | Search files, symbols, and snippets with filters and grouped result sections | `global_search/global_search.html` |
| PackageManagerScreen | Search packages, view install progress, manage installed packages, and perform updates/deletes | `package_manager/package_manager.html` |
| TerminalScreen | Terminal output view with prompt, command history, scrollable console, and quick keyboard accessory bar | `terminal/terminal.html` |

# 3. Reusable Components

## Buttons
- **IconButton**
  - Purpose: Header menu/search buttons, collapse button, delete/upgrade icons, close buttons.
  - Reusability level: Global primitive.
  - Suggested props: `icon`, `variant`, `size`, `active`, `disabled`, `onPress`, `accessibilityLabel`.
  - Memoized: Yes, if icon-only and stateless.

- **GlassButton**
  - Purpose: Secondary/primary glass actions such as New Folder, New File, filter chips, quick terminal keys.
  - Reusability level: Global shared component.
  - Suggested props: `label`, `icon`, `variant: 'primary' | 'secondary' | 'ghost' | 'danger'`, `size`, `onPress`.
  - Memoized: Yes.

- **FloatingActionButton**
  - Purpose: Code editor run button.
  - Reusability level: Global component.
  - Suggested props: `icon`, `position`, `color`, `onPress`, `loading`.
  - Memoized: Yes.

- **ActionCircleButton**
  - Purpose: Package delete/upgrade buttons and compact file-tab close button.
  - Reusability level: Shared component.
  - Suggested props: `icon`, `tone: 'neutral' | 'primary' | 'danger' | 'success'`, `onPress`.
  - Memoized: Yes.

## Cards
- **GlassCard**
  - Purpose: Base translucent card used by project header, package items, search top match, install progress.
  - Reusability level: Global foundation component.
  - Suggested props: `children`, `variant`, `active`, `borderTone`, `padding`, `style`.
  - Memoized: No by default; depends on children.

- **ProjectHeaderCard**
  - Purpose: Displays project name, path, and project actions.
  - Reusability level: Feature-specific, file explorer.
  - Suggested props: `projectName`, `projectPath`, `actions`.
  - Memoized: Yes.

- **PackageCard**
  - Purpose: Package item with name, registry badge, description, version/license metadata, and action.
  - Reusability level: Feature-specific, package manager.
  - Suggested props: `package`, `status`, `onDelete`, `onUpgrade`.
  - Memoized: Yes for FlatList rows.

- **SearchResultCard**
  - Purpose: File/symbol/snippet search result item.
  - Reusability level: Feature-specific, search.
  - Suggested props: `title`, `path`, `icon`, `matchRanges`, `onPress`.
  - Memoized: Yes for list rows.

- **CodeSnippetCard**
  - Purpose: Top-match card with file header and code preview.
  - Reusability level: Shared between search/editor features.
  - Suggested props: `fileName`, `path`, `type`, `code`, `highlights`.
  - Memoized: Yes.

## Panels
- **GlassPanel**
  - Purpose: Shared translucent panel with blur, border, inner glow, and large shadow.
  - Reusability level: Global foundation component.
  - Suggested props: `children`, `blurIntensity`, `elevation`, `radius`, `border`.
  - Memoized: No by default.

- **AmbientBackground**
  - Purpose: Reusable mesh-gradient/glow background layer.
  - Reusability level: Global layout component.
  - Suggested props: `variant: 'editor' | 'search' | 'terminal' | 'default'`.
  - Memoized: Yes.

- **EditorPanel**
  - Purpose: Code editor surface, file preview area, syntax-colored lines.
  - Reusability level: Feature-specific but shared by code editor and file explorer preview.
  - Suggested props: `codeLines`, `language`, `activeLine`, `showLineNumbers`.
  - Memoized: Yes for static code previews.

- **TerminalPanel**
  - Purpose: Terminal output container.
  - Reusability level: Feature-specific.
  - Suggested props: `entries`, `prompt`, `isActive`.
  - Memoized: Partial, especially output rows.

## Inputs
- **SearchInput**
  - Purpose: Global search and package search fields.
  - Reusability level: Global component.
  - Suggested props: `value`, `placeholder`, `autoFocus`, `leftIcon`, `showClear`, `onChangeText`, `onClear`.
  - Memoized: No, controlled input changes frequently.

- **CommandInput**
  - Purpose: Terminal prompt input.
  - Reusability level: Feature-specific terminal component.
  - Suggested props: `prompt`, `value`, `onChangeText`, `onSubmit`.
  - Memoized: No.

## Navigation
- **AppHeader**
  - Purpose: Fixed top app bar with menu, title, and search.
  - Reusability level: Global component.
  - Suggested props: `title`, `leftIcon`, `rightIcon`, `onMenuPress`, `onSearchPress`, `variant`.
  - Memoized: Yes.

- **BottomTabBar**
  - Purpose: Mobile navigation for Code, Files, Packages, Terminal.
  - Reusability level: Global navigation component, likely custom React Navigation tab bar.
  - Suggested props: supplied by React Navigation, plus `items`.
  - Memoized: Yes.

- **FileTabBar**
  - Purpose: Open-file tabs in code editor and file preview.
  - Reusability level: Shared editor component.
  - Suggested props: `tabs`, `activeTabId`, `onTabPress`, `onCloseTab`.
  - Memoized: Yes.

- **FilterChipBar**
  - Purpose: Horizontal filters in global search and package manager tabs.
  - Reusability level: Global/shared component.
  - Suggested props: `items`, `activeKey`, `onChange`.
  - Memoized: Yes.

## Modals
- **ConfirmationModal**
  - Purpose: Confirm delete package/file or destructive actions.
  - Reusability level: Global component.
  - Suggested props: `visible`, `title`, `message`, `confirmLabel`, `tone`, `onConfirm`, `onCancel`.
  - Memoized: No.

- **ActionSheetModal**
  - Purpose: Mobile contextual actions for files/packages/tabs.
  - Reusability level: Global component.
  - Suggested props: `visible`, `actions`, `onDismiss`.
  - Memoized: No.

- **SearchOverlayModal**
  - Purpose: Header search action could open global search overlay or navigate to search screen.
  - Reusability level: Shared navigation/search feature.
  - Suggested props: `visible`, `initialQuery`, `onSubmit`, `onDismiss`.
  - Memoized: No.

## Layout
- **ScreenContainer**
  - Purpose: Standard background, safe area, header offset, bottom tab offset.
  - Reusability level: Global layout primitive.
  - Suggested props: `children`, `scrollable`, `withHeader`, `withBottomTabs`, `backgroundVariant`.
  - Memoized: No.

- **SafeAreaWrapper**
  - Purpose: Handles Android status/navigation bar and safe area padding.
  - Reusability level: Global layout primitive.
  - Suggested props: `edges`, `children`, `style`.
  - Memoized: No.

- **ScrollSection**
  - Purpose: Repeated vertical sections such as search groups and package list.
  - Reusability level: Shared layout.
  - Suggested props: `title`, `icon`, `children`, `contentContainerStyle`.
  - Memoized: No.

- **SplitPaneLayout**
  - Purpose: File explorer tablet/large-screen tree + preview layout.
  - Reusability level: Feature layout.
  - Suggested props: `left`, `right`, `leftWidth`, `showRightOnMobile`.
  - Memoized: No.

## Typography
- **AppText**
  - Purpose: Typed text primitive mapped to theme typography.
  - Reusability level: Global primitive.
  - Suggested props: `variant`, `color`, `numberOfLines`, `children`.
  - Memoized: Yes for static labels.

- **CodeText**
  - Purpose: Monospace code, terminal, file paths, snippets.
  - Reusability level: Global primitive.
  - Suggested props: `children`, `tone`, `highlighted`, `style`.
  - Memoized: Yes.

- **SectionLabel**
  - Purpose: Uppercase section headings like Top Match, Files, Project Explorer.
  - Reusability level: Shared component.
  - Suggested props: `label`, `icon`, `tone`.
  - Memoized: Yes.

## Lists
- **FileTreeItem**
  - Purpose: Folder/file tree row with nesting, expand/collapse, active state.
  - Reusability level: Feature-specific, file explorer.
  - Suggested props: `node`, `depth`, `expanded`, `selected`, `onToggle`, `onPress`.
  - Memoized: Yes, important.

- **CodeLine**
  - Purpose: Code editor line with line number, syntax segments, active state.
  - Reusability level: Shared editor component.
  - Suggested props: `lineNumber`, `tokens`, `active`, `indent`.
  - Memoized: Yes, important.

- **TerminalOutputRow**
  - Purpose: Terminal command/output blocks.
  - Reusability level: Feature-specific.
  - Suggested props: `entry`, `index`.
  - Memoized: Yes.

## Badges
- **RegistryBadge**
  - Purpose: Maven/pip labels.
  - Reusability level: Shared package component.
  - Suggested props: `type: 'maven' | 'pip' | string`.
  - Memoized: Yes.

- **StatusBadge**
  - Purpose: Symbol badge, update badge, version labels.
  - Reusability level: Global/shared component.
  - Suggested props: `label`, `tone`.
  - Memoized: Yes.

## Progress
- **InstallProgressCard**
  - Purpose: Active package installation status with spinner and progress bar.
  - Reusability level: Feature-specific.
  - Suggested props: `command`, `status`, `progress`.
  - Memoized: Yes.

- **ProgressBar**
  - Purpose: Reusable animated horizontal progress.
  - Reusability level: Global primitive.
  - Suggested props: `value`, `tone`, `animated`.
  - Memoized: Yes.

# 4. Design System Extraction

## Color palette
Primary extracted palette:
- `background`: `#11131c`
- `surface`: `#11131c`
- `surfaceDim`: `#11131c`
- `surfaceContainerLowest`: `#0c0e17`
- `surfaceContainerLow`: `#191b24`
- `surfaceContainer`: `#1d1f29`
- `surfaceContainerHigh`: `#282933`
- `surfaceContainerHighest`: `#32343e`
- `surfaceBright`: `#373943`
- `onBackground`: `#e1e1ef`
- `onSurface`: `#e1e1ef`
- `onSurfaceVariant`: `#b9cacb`
- `outline`: `#849495`
- `outlineVariant`: `#3b494b`
- `primary`: `#dbfcff`
- `primaryFixed`: `#7df4ff`
- `primaryFixedDim`: `#00dbe9`
- `primaryContainer`: `#00f0ff`
- `secondary`: `#ecb2ff`
- `secondaryContainer`: `#cf5cff`
- `secondaryFixed`: `#f8d8ff`
- `secondaryFixedDim`: `#ecb2ff`
- `tertiary`: `#daffe4`
- `tertiaryFixed`: `#52ffac`
- `tertiaryFixedDim`: `#00e290`
- `error`: `#ffb4ab`
- `errorContainer`: `#93000a`

## Typography system
- `displayLg`: Geist, 32, lineHeight 40, weight 700
- `headlineMd`: Geist, 24, lineHeight 32, weight 600
- `bodyMd`: Geist, 16, lineHeight 24, weight 400
- `codeSm`: JetBrains Mono, 14, lineHeight 20, weight 450/500
- `labelXs`: Geist, 12, lineHeight 16, weight 500, letter spacing near 0.05em

For React Native, load fonts with `react-native-asset` or native Android font registration. Replace CSS `em` letter spacing with numeric RN `letterSpacing`.

## Border radius system
- `xs`: 4
- `sm`: 8
- `md`: 12
- `lg`: 16
- `xl`: 24
- `full`: 9999

Note: HTML files use both `0.75rem` and design doc uses larger panel radii. Normalize in RN to avoid drift.

## Shadow system
- Header underglow: cyan-tinted large shadow
- Bottom nav shadow: dark upward shadow
- FAB glow: strong cyan glow
- Card shadow: large black translucent shadow plus subtle cyan glow
- Active file glow: cyan outer glow and inner glow

Android shadow support is limited. Use `elevation` for physical shadow and `react-native-shadow-2` only if the exact glow becomes essential. Otherwise simulate neon glow with semi-transparent absolute layers.

## Glassmorphism styles
Core glass primitives:
- Surface opacity: 20%-80%
- Border: white at 5%-20% or primary at 20%-40%
- Inner top glow: 1px white at 10%-20%
- Blur: web uses `backdrop-blur-xl`, `2xl`, `3xl`, `blur-[40px]`

React Native implementation:
- Use translucent backgrounds and borders everywhere.
- Use `@react-native-community/blur` only where real blur is required.
- For Android, blur behind views can be expensive and inconsistent; prioritize tinted translucent panels.

## Gradient usage
- Ambient radial mesh backgrounds
- Active code-line left-to-right gradient
- Search input focus underline gradient
- Progress bar sheen
- Terminal background radial gradients

Use `react-native-linear-gradient` for linear gradients. Radial gradients require approximation with absolute blurred circles or SVG gradients.

## Icon usage
Current source uses Google Material Symbols. In RN:
- Prefer `react-native-vector-icons/MaterialSymbolsOutlined` if supported in the chosen icon package.
- Otherwise use `MaterialCommunityIcons` or `MaterialIcons`.
- Centralize icon names through `constants/icons.ts` to avoid web-specific naming leakage.

## Animation patterns
- Press scale: active `scale(0.90-0.95)`
- Hover color changes on web
- Focus glow and underline expansion
- Spinner for package install
- Blinking terminal cursor
- Progress bar fill
- Tab/chip active transitions

Use Reanimated for press states, focus glow transitions, cursor blinking, progress fill, and bottom sheet/drawer animation.

## Spacing scale
Recommended RN scale:
- `0`: 0
- `1`: 4
- `2`: 8
- `3`: 12
- `4`: 16
- `5`: 20
- `6`: 24
- `8`: 32
- `10`: 40
- `12`: 48
- `16`: 64
- `gutter`: 16
- `screenMargin`: 20
- `headerHeight`: 64
- `bottomTabHeight`: 80
- `minTouchTarget`: 44

## Generated theme files

`theme/colors.ts`
```ts
export const colors = {
  background: '#11131c',
  surface: '#11131c',
  surfaceDim: '#11131c',
  surfaceBright: '#373943',
  surfaceContainerLowest: '#0c0e17',
  surfaceContainerLow: '#191b24',
  surfaceContainer: '#1d1f29',
  surfaceContainerHigh: '#282933',
  surfaceContainerHighest: '#32343e',
  onBackground: '#e1e1ef',
  onSurface: '#e1e1ef',
  onSurfaceVariant: '#b9cacb',
  outline: '#849495',
  outlineVariant: '#3b494b',
  primary: '#dbfcff',
  primaryFixed: '#7df4ff',
  primaryFixedDim: '#00dbe9',
  primaryContainer: '#00f0ff',
  secondary: '#ecb2ff',
  secondaryContainer: '#cf5cff',
  secondaryFixed: '#f8d8ff',
  secondaryFixedDim: '#ecb2ff',
  tertiary: '#daffe4',
  tertiaryFixed: '#52ffac',
  tertiaryFixedDim: '#00e290',
  error: '#ffb4ab',
  errorContainer: '#93000a',
  white: '#ffffff',
  black: '#000000',
} as const;
```

`theme/spacing.ts`
```ts
export const spacing = {
  unit: 4,
  gutter: 16,
  screenMargin: 20,
  safeBottomFallback: 16,
  minTouchTarget: 44,
  headerHeight: 64,
  bottomTabHeight: 80,
  keyboardAccessoryHeight: 52,
  s1: 4,
  s2: 8,
  s3: 12,
  s4: 16,
  s5: 20,
  s6: 24,
  s8: 32,
  s10: 40,
  s12: 48,
  s16: 64,
} as const;
```

`theme/typography.ts`
```ts
export const typography = {
  displayLg: {
    fontFamily: 'Geist',
    fontSize: 32,
    lineHeight: 40,
    fontWeight: '700',
    letterSpacing: -0.64,
  },
  headlineMd: {
    fontFamily: 'Geist',
    fontSize: 24,
    lineHeight: 32,
    fontWeight: '600',
    letterSpacing: -0.24,
  },
  bodyMd: {
    fontFamily: 'Geist',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    letterSpacing: 0,
  },
  codeSm: {
    fontFamily: 'JetBrainsMono',
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    letterSpacing: 0,
  },
  labelXs: {
    fontFamily: 'Geist',
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
    letterSpacing: 0.6,
  },
} as const;
```

`theme/shadows.ts`
```ts
import {colors} from './colors';

export const shadows = {
  headerGlow: {
    shadowColor: colors.primaryFixedDim,
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 8,
  },
  card: {
    shadowColor: colors.black,
    shadowOpacity: 0.35,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 12},
    elevation: 6,
  },
  fabGlow: {
    shadowColor: colors.primaryFixed,
    shadowOpacity: 0.6,
    shadowRadius: 24,
    shadowOffset: {width: 0, height: 0},
    elevation: 12,
  },
  bottomNav: {
    shadowColor: colors.black,
    shadowOpacity: 0.5,
    shadowRadius: 20,
    shadowOffset: {width: 0, height: -8},
    elevation: 12,
  },
} as const;
```

# 5. Suggested React Native CLI Folder Structure

```txt
src/
├── assets/
│   ├── fonts/
│   │   ├── Geist-Regular.ttf
│   │   ├── Geist-Medium.ttf
│   │   ├── Geist-SemiBold.ttf
│   │   ├── Geist-Bold.ttf
│   │   └── JetBrainsMono-Medium.ttf
│   ├── images/
│   └── icons/
├── animations/
│   ├── pressScale.ts
│   ├── blinkCursor.ts
│   ├── progressFill.ts
│   └── transitions.ts
├── components/
│   ├── buttons/
│   │   ├── ActionCircleButton.tsx
│   │   ├── FloatingActionButton.tsx
│   │   ├── GlassButton.tsx
│   │   ├── IconButton.tsx
│   │   └── index.ts
│   ├── cards/
│   │   ├── GlassCard.tsx
│   │   ├── CodeSnippetCard.tsx
│   │   └── index.ts
│   ├── inputs/
│   │   ├── SearchInput.tsx
│   │   ├── CommandInput.tsx
│   │   └── index.ts
│   ├── layout/
│   │   ├── AmbientBackground.tsx
│   │   ├── SafeAreaWrapper.tsx
│   │   ├── ScreenContainer.tsx
│   │   ├── ScrollSection.tsx
│   │   └── index.ts
│   ├── modals/
│   │   ├── ActionSheetModal.tsx
│   │   ├── ConfirmationModal.tsx
│   │   └── index.ts
│   ├── navigation/
│   │   ├── AppHeader.tsx
│   │   ├── BottomTabBar.tsx
│   │   └── index.ts
│   ├── panels/
│   │   ├── GlassPanel.tsx
│   │   └── index.ts
│   ├── progress/
│   │   ├── ProgressBar.tsx
│   │   └── index.ts
│   ├── typography/
│   │   ├── AppText.tsx
│   │   ├── CodeText.tsx
│   │   ├── SectionLabel.tsx
│   │   └── index.ts
│   └── badges/
│       ├── RegistryBadge.tsx
│       ├── StatusBadge.tsx
│       └── index.ts
├── constants/
│   ├── icons.ts
│   ├── navigation.ts
│   └── mockData.ts
├── features/
│   ├── editor/
│   │   ├── components/
│   │   │   ├── CodeEditorView.tsx
│   │   │   ├── CodeLine.tsx
│   │   │   ├── FileTabBar.tsx
│   │   │   └── SyntaxToken.tsx
│   │   ├── hooks/
│   │   │   └── useEditorTabs.ts
│   │   ├── services/
│   │   │   └── syntaxHighlighter.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── files/
│   │   ├── components/
│   │   │   ├── FileTree.tsx
│   │   │   ├── FileTreeItem.tsx
│   │   │   ├── ProjectHeaderCard.tsx
│   │   │   └── SplitPaneLayout.tsx
│   │   ├── hooks/
│   │   │   └── useFileTree.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── search/
│   │   ├── components/
│   │   │   ├── FilterChipBar.tsx
│   │   │   ├── SearchResultCard.tsx
│   │   │   ├── SearchResultsGroup.tsx
│   │   │   └── HighlightedMatchText.tsx
│   │   ├── hooks/
│   │   │   └── useGlobalSearch.ts
│   │   ├── types.ts
│   │   └── index.ts
│   ├── packages/
│   │   ├── components/
│   │   │   ├── InstallProgressCard.tsx
│   │   │   ├── PackageCard.tsx
│   │   │   ├── PackageList.tsx
│   │   │   └── PackageTabs.tsx
│   │   ├── hooks/
│   │   │   └── usePackages.ts
│   │   ├── types.ts
│   │   └── index.ts
│   └── terminal/
│       ├── components/
│       │   ├── KeyboardAccessoryBar.tsx
│       │   ├── TerminalOutputRow.tsx
│       │   ├── TerminalPrompt.tsx
│       │   └── TerminalView.tsx
│       ├── hooks/
│       │   └── useTerminalSession.ts
│       ├── types.ts
│       └── index.ts
├── hooks/
│   ├── useAppTheme.ts
│   ├── useKeyboardInsets.ts
│   ├── usePressAnimation.ts
│   └── useResponsiveLayout.ts
├── layouts/
│   ├── AppShell.tsx
│   ├── MainTabLayout.tsx
│   └── OverlayLayout.tsx
├── navigation/
│   ├── AppNavigator.tsx
│   ├── RootNavigator.tsx
│   ├── TabNavigator.tsx
│   ├── navigationRef.ts
│   └── types.ts
├── screens/
│   ├── CodeEditorScreen.tsx
│   ├── FileExplorerScreen.tsx
│   ├── GlobalSearchScreen.tsx
│   ├── PackageManagerScreen.tsx
│   └── TerminalScreen.tsx
├── services/
│   ├── api/
│   ├── storage/
│   │   └── appStorage.ts
│   └── native/
│       ├── fileSystemService.ts
│       ├── packageService.ts
│       └── terminalService.ts
├── store/
│   ├── editorStore.ts
│   ├── fileStore.ts
│   ├── packageStore.ts
│   ├── searchStore.ts
│   └── terminalStore.ts
├── theme/
│   ├── colors.ts
│   ├── glass.ts
│   ├── index.ts
│   ├── radius.ts
│   ├── shadows.ts
│   ├── spacing.ts
│   └── typography.ts
├── types/
│   ├── common.ts
│   ├── icon.ts
│   └── theme.ts
└── utils/
    ├── formatPath.ts
    ├── highlightMatches.ts
    ├── platform.ts
    └── testIds.ts
```

# 6. Component Dependency Map

- `CodeEditorScreen`
  - Uses `ScreenContainer`, `AmbientBackground`, `AppHeader`, `FileTabBar`, `CodeEditorView`, `CodeLine`, `FloatingActionButton`, `BottomTabBar`.
  - `CodeEditorView` depends on `CodeLine`, `CodeText`, `SyntaxToken`.
  - Atomic components: `CodeText`, `IconButton`, `SyntaxToken`.

- `FileExplorerScreen`
  - Uses `ScreenContainer`, `AmbientBackground`, `AppHeader`, `ProjectHeaderCard`, `GlassButton`, `SplitPaneLayout`, `FileTree`, `FileTreeItem`, `CodeEditorView`, `BottomTabBar`.
  - `FileTree` depends on recursive `FileTreeItem`.
  - `ProjectHeaderCard` depends on `GlassCard`, `AppText`, `CodeText`, `GlassButton`.
  - Atomic components: `FileTreeItem`, `RegistryBadge`, `IconButton`.

- `GlobalSearchScreen`
  - Uses `ScreenContainer`, `AmbientBackground`, `AppHeader`, `SearchInput`, `FilterChipBar`, `SearchResultsGroup`, `SearchResultCard`, `CodeSnippetCard`, `BottomTabBar`.
  - `SearchResultCard` depends on `HighlightedMatchText`, `StatusBadge`, `IconButton`.
  - Atomic components: `HighlightedMatchText`, `StatusBadge`.

- `PackageManagerScreen`
  - Uses `ScreenContainer`, `AmbientBackground`, `AppHeader`, `SearchInput`, `InstallProgressCard`, `ProgressBar`, `PackageTabs`, `PackageList`, `PackageCard`, `BottomTabBar`.
  - `PackageCard` depends on `RegistryBadge`, `ActionCircleButton`, `AppText`.
  - Atomic components: `ProgressBar`, `RegistryBadge`, `ActionCircleButton`.

- `TerminalScreen`
  - Uses `ScreenContainer`, `AppHeader`, `TerminalView`, `TerminalOutputRow`, `TerminalPrompt`, `KeyboardAccessoryBar`, `BottomTabBar`.
  - `KeyboardAccessoryBar` depends on `GlassButton` or compact `KeyButton`.
  - Atomic components: `TerminalOutputRow`, `CodeText`.

Components that should remain atomic:
- `AppText`
- `CodeText`
- `IconButton`
- `GlassButton`
- `ProgressBar`
- `StatusBadge`
- `RegistryBadge`
- `SyntaxToken`
- `HighlightedMatchText`

# 7. Migration Strategy

1. Create the TypeScript React Native CLI Android project.
2. Register fonts and configure Android assets for Geist and JetBrains Mono.
3. Build the theme system first: `colors`, `spacing`, `typography`, `radius`, `shadows`, `glass`.
4. Create global layout primitives: `SafeAreaWrapper`, `ScreenContainer`, `AmbientBackground`, `GlassPanel`.
5. Create atomic components: `AppText`, `CodeText`, `IconButton`, `GlassButton`, `StatusBadge`, `RegistryBadge`, `ProgressBar`.
6. Set up React Navigation with a bottom tab navigator and custom `BottomTabBar`.
7. Implement shared `AppHeader`.
8. Migrate `CodeEditorScreen` first because it defines the core app identity: tabs, code canvas, active line, FAB.
9. Migrate `FileExplorerScreen` next, reusing `CodeEditorView` for preview and extracting `FileTree`.
10. Migrate `GlobalSearchScreen`, reusing `SearchInput`, `FilterChipBar`, `CodeSnippetCard`, and search result cards.
11. Migrate `PackageManagerScreen`, reusing search, chips, cards, badges, progress components.
12. Migrate `TerminalScreen`, including output rows, blinking cursor, and keyboard accessory bar.
13. Add Zustand stores after static UI parity is achieved:
    - `editorStore`
    - `fileStore`
    - `searchStore`
    - `packageStore`
    - `terminalStore`
14. Replace mock data with services/native modules as real Android functionality is introduced.
15. Optimize lists with `FlatList`, memoized rows, stable callbacks, and virtualization.
16. Add Android-specific polish: status bar color, navigation bar color, keyboard avoidance, back behavior.

Risky areas:
- Real code editor performance and text selection
- Terminal process execution on Android
- File system permissions and scoped storage
- Glass blur performance on Android
- Syntax highlighting at scale
- Recursive file tree rendering
- Keyboard accessory behavior with Android IME

Web-only APIs/features to replace:
- HTML tags: `header`, `main`, `nav`, `section`, `button`, `input`, `pre`, `code`, `a`, `span`, `div`
- CSS classes and Tailwind CDN
- `position: fixed`
- `backdrop-filter`
- CSS hover states
- CSS pseudo-elements like blinking cursor `::after`
- `env(safe-area-inset-bottom)`
- CSS keyframes
- CSS `grid`
- CSS `filter: blur`
- CSS radial gradients
- Web scrollbars and hidden scrollbar selectors

HTML/CSS features RN cannot directly support:
- `backdrop-blur-*`
- `drop-shadow-*`
- `box-shadow` string syntax
- `radial-gradient`
- `focus-within`
- `hover:*`
- `selection:*`
- `line-clamp` CSS utility
- `white-space: pre` exactly as web
- `pre/code` native rendering behavior
- `md:*` media query classes

# 8. React Native Compatibility Warnings

- Unsupported CSS:
  - `backdrop-blur-xl`, `backdrop-blur-2xl`, `backdrop-blur-3xl`
  - `blur-[100px]`, `filter: blur(80px)`
  - `radial-gradient`
  - `box-shadow` arbitrary Tailwind values
  - `inset` shorthand
  - `fixed`
  - `hover:*`
  - `focus:*`, `focus-within:*`
  - `selection:*`
  - `line-clamp-*`
  - `whitespace-pre`
  - CSS custom scrollbar selectors
  - `@keyframes blink`

- DOM-specific APIs:
  - `<input autofocus>`
  - `<button>`, `<a href="#">`
  - `<pre><code>`
  - `aria-label` maps to RN `accessibilityLabel`
  - Web document layout semantics are not available

- Browser-only logic:
  - Tailwind CDN runtime config
  - Google Fonts `<link>`
  - Material Symbols font loaded through web CSS
  - CSS media classes like `md:hidden`, `md:flex`

- Hover effects:
  - Must become press, focus, active, or selected states.
  - Android has no hover interaction for regular touch UX.

- CSS Grid usage:
  - File explorer uses `grid grid-cols-12`.
  - Replace with Flexbox, responsive layout hooks, or conditional tablet split panes.

- Direct HTML tags replacement:
  - `div` -> `View`
  - `span`, `h1`, `h2`, `p`, `code` -> `Text` / `AppText` / `CodeText`
  - `button`, `a` -> `Pressable`
  - `input` -> `TextInput`
  - `main`, `section`, `nav`, `header` -> `View`
  - `pre` -> horizontal `ScrollView` plus `CodeText`

- SVG compatibility concerns:
  - Material Symbols web font is not directly portable.
  - Prefer vector icon package or SVG icon components via `react-native-svg`.
  - If using custom SVG gradients for ambient backgrounds, test Android performance.

- Blur/glassmorphism notes:
  - Android blur behind translucent views is expensive and can be inconsistent.
  - Use layered translucent panels, borders, inner highlight strips, and subtle elevation as the default.
  - Reserve real blur for high-value overlays only.

# 9. Recommended Libraries

- **@react-navigation/native**
  - Why it is needed: App has multiple primary screens with bottom tab navigation and possible overlay navigation.
  - Required by: Code, Files, Packages, Terminal, Search navigation.

- **@react-navigation/bottom-tabs**
  - Why it is needed: Existing UI has a persistent bottom nav with four core modules.
  - Required by: `BottomTabBar`.

- **react-native-screens**
  - Why it is needed: Improves native navigation performance.
  - Required by: React Navigation.

- **react-native-safe-area-context**
  - Why it is needed: Replaces CSS `env(safe-area-inset-bottom)` and handles Android system bars.
  - Required by: `SafeAreaWrapper`, `BottomTabBar`, `ScreenContainer`.

- **react-native-gesture-handler**
  - Why it is needed: Required by navigation and useful for future drawers/action sheets.
  - Required by: navigation, modals, future file drawer/bottom sheets.

- **react-native-reanimated**
  - Why it is needed: Press scale, progress fill, blinking cursor, focus glow, tab transitions.
  - Required by: FAB, buttons, terminal cursor, package progress, bottom nav active state.

- **react-native-linear-gradient**
  - Why it is needed: Active code line gradient, progress sheen, search focus underline, ambient approximations.
  - Required by: Code editor, search input, progress bar, background.

- **react-native-vector-icons**
  - Why it is needed: Replaces Material Symbols web font icons.
  - Required by: Header, bottom tabs, file tree, package cards, terminal accessory buttons.

- **zustand**
  - Why it is needed: Lightweight modular state for editor tabs, file tree selection, packages, terminal session, search state.
  - Required by: Long-term scalable app state.

- **@react-native-community/blur**
  - Why it is needed: Optional real blur for premium glass panels.
  - Required by: Glass panels, overlays, bottom nav if visual fidelity is more important than performance.
  - Note: Use selectively on Android.

- **react-native-svg**
  - Why it is needed: Optional for custom ambient gradient shapes or if icons are SVG assets.
  - Required by: Advanced background effects, custom icons.

# 10. Final Architecture Summary

- Recommended architecture style: **Feature-based modular architecture with shared design-system primitives**.
- Scalability score: **8.5/10** if the migration separates global primitives from feature-specific components and keeps native services isolated.
- Maintainability notes:
  - Centralize all colors, typography, spacing, glass surfaces, icon names, and navigation route names.
  - Keep `screens/` thin and compose from `features/*/components`.
  - Avoid hardcoding Tailwind-like styles inside screen files.
- Performance notes:
  - Use `FlatList` for file trees, package lists, search results, and terminal output.
  - Memoize row components aggressively.
  - Avoid real blur on every card; simulate most glass with opacity, borders, and shadows.
  - Virtualize code lines if the editor becomes real and large.
- Reusability assessment:
  - Very high reuse potential around `AppHeader`, `BottomTabBar`, `GlassPanel`, `GlassCard`, `SearchInput`, `FilterChipBar`, `CodeEditorView`, badges, buttons, and typography primitives.
  - The project should migrate cleanly if the visual system is implemented first and each screen is rebuilt from shared primitives rather than translated line-by-line.
