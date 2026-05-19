# Nova Code — Project Completion Plan
### Android-First Student IDE · Full Production Roadmap

> **Projects in scope:** `NovaCode` (React Native app) · `cm6-build` (CodeMirror 6 bundle) · `nova-engine` (WebSocket PTY execution engine)
> **Current completion (verified):** ~55–60% usable student MVP · ~40% production-quality cloud IDE
> **Previous roadmap:** `NOVA_CODE_MASTER_ROADMAPCv2.md` — Phases 0–6 structurally complete. That roadmap is now retired. This is the single source of truth.
> **Target:** A complete, secure, student-friendly Android IDE for writing, running, and previewing code on a phone

---

## Table of Contents

1. [Target Product Vision](#target-product-vision)
2. [Completion Status Overview](#completion-status-overview)
3. [Phase 1 — Stabilize the MVP](#phase-1--stabilize-the-mvp)
4. [Phase 2 — Real Terminal and Execution Engine](#phase-2--real-terminal-and-execution-engine)
5. [Phase 3 — Browser Preview](#phase-3--browser-preview)
6. [Phase 4 — Language Support](#phase-4--language-support)
7. [Phase 5 — Package Manager](#phase-5--package-manager)
8. [Phase 6 — Git](#phase-6--git)
9. [Phase 7 — Authentication, Sync, and User Data](#phase-7--authentication-sync-and-user-data)
10. [Phase 8 — Production Backend and Deployment](#phase-8--production-backend-and-deployment)
11. [Phase 9 — Testing](#phase-9--testing)
12. [Phase 10 — UX Polish](#phase-10--ux-polish)
13. [Suggested Build Order](#suggested-build-order)
14. [MVP Definition](#mvp-definition)
15. [Production Readiness Checklist](#production-readiness-checklist)
16. [Main Risks](#main-risks)
17. [Recommended Next Milestone](#recommended-next-milestone)
18. [Appendix — Current Project State & Pre-Phase 1 Preparation](#appendix--current-project-state--pre-phase-1-preparation)

---

## Target Product Vision

Nova Code is an **Android-first IDE for students** — a single app where you can create, edit, run, preview, and manage code projects entirely from a phone, without needing a laptop.

### The Intended Student Experience

| Feature | Description |
|---------|-------------|
| 📁 **Project templates** | Create Python, JavaScript, HTML/CSS/JS, Java, C, C++ projects with one tap |
| 🗂️ **File management** | Browse, create, rename, move, delete files and folders |
| ✏️ **Code editor** | Syntax highlighting, search, autocomplete, indentation, mobile keyboard helpers |
| ▶️ **Run code** | Execute from the editor or terminal with real output |
| 🖥️ **Real terminal** | Connected to a secure backend via WebSocket PTY |
| 🌐 **Web preview** | Integrated browser preview for HTML/CSS/JS projects |
| 📦 **Packages** | Install and manage npm and pip packages |
| 🔀 **Git** | Basic local Git operations |
| ☁️ **Sync** | Settings and project metadata sync safely |
| 📱 **Low-end support** | Reliable on low and mid-range Android phones |

---

## Completion Status Overview

### By Feature Area

| Area | Status | Estimated Completion |
|------|--------|---------------------|
| Navigation & routing | ✅ Structurally complete | ~90% |
| State management (Zustand + MMKV) | ✅ Structurally complete | ~85% |
| File system & project management | Needs wiring + audit | ~65% |
| Editor (CM6 WebView bridge) | Bridge + assets exist | ~60% |
| Terminal UI | Components exist, Piston wired | ~50% |
| Code execution (Piston/engine) | `PistonService` exists | ~45% |
| Browser preview | Not started | ~0% |
| Language support (Python, JS) | Templates exist, need validation | ~45% |
| Language support (Java, C, C++) | Templates missing | ~5% |
| Package manager | Full UI scaffolded, no service | ~20% |
| Git integration | `GitService` + `RNFSAdapter` exist | ~40% |
| Auth and sync | Firebase in place, `AuthScreen` exists | ~45% |
| Backend (nova-engine) | Separate project, partial | ~35% |
| Testing | Minimal | ~10% |
| UX polish | Not started | ~10% |
| Production deployment | Not started | ~5% |

### Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Done or mostly working |
| 🔧 | Needs wiring or fixing |
| 🆕 | Not yet built |
| 🔴 | Blocking — must be done before others |
| 🟠 | High priority |
| 🔵 | Normal priority |
| 🟢 | Polish — do last |
| ⚠️ | Pitfall or risk |
| 🚫 | Explicitly deferred |
| `[EASY]` | Low risk, straightforward |
| `[MEDIUM]` | Needs care, test in isolation |
| `[HARD]` | Complex integration, high scrutiny |
| `[RISKY]` | Can break existing things if rushed |

---

## Phase 1 — Stabilize the MVP

> **Goal:** Make the existing app usable end-to-end for basic student workflows.
> **Priority:** 🔴 Everything else depends on these foundations being solid.

---

### 1.1 File and Project System `[MEDIUM]`

**Why this matters:** Unreliable file operations are the fastest way to lose a student's trust. Data loss is unacceptable. Every other feature depends on a stable file system layer.

#### Required Work

- [x] Verify project creation works for **all existing templates** — run each template end-to-end and confirm the generated files are valid and syntactically correct
- [x] Audit `FileService` for error swallowing — every RNFS call must have a `try/catch` that surfaces errors visibly to the user, not just to the console
- [x] **Unsaved changes guard** — when a user tries to close a file, switch files, or close the app with unsaved changes:
  - Show a confirmation dialog: "You have unsaved changes. Save, Discard, or Cancel?"
  - Implement `AppState` listener to trigger autosave on app background
- [x] **Recent projects** — persist the last 10 opened projects in MMKV; show them on the home screen
- [x] **Last-opened file restoration** — on project open, restore the last active file and cursor position (store in MMKV per project)
- [x] **Template validation** — each template must produce files that run without modification:
  - `Python` → `main.py` with `print("Hello, World!")`
  - `JavaScript/Node` → `index.js` with `console.log("Hello, World!")`
  - `HTML/CSS/JS` → `index.html` + `style.css` + `script.js` with a working static page
  - `Java` → `Main.java` with `public static void main`
  - `C` → `main.c` with `#include <stdio.h>` and `printf`
  - `C++` → `main.cpp` with `#include <iostream>` and `cout`
- [x] Add **file operation error states** — failed rename, delete, write must show a toast/modal, not silently fail
- [x] Validate that file paths do not contain illegal characters on Android (`/`, `\0`, etc.)

#### Acceptance Criteria

```
✓ User creates a project → adds files → edits files → saves → closes app →
  reopens → continues working, no data loss

✓ File operations fail visibly, with a human-readable message

✓ All 6 language templates create complete, runnable starter projects

✓ Unsaved changes are never silently discarded
```

---

### 1.2 Editor Integration `[HARD]`

**Why this matters:** The editor is the core of the product. Every interaction a student has will involve the editor. Fragile bridge communication, unreliable saving, or a jittery mobile keyboard experience will make the app unusable before they even run their first program.

#### Required Work

##### Bridge Communication
- [x] Audit the React Native ↔ CodeMirror WebView bridge for race conditions:
  - Messages sent before `EDITOR_READY` must be queued and replayed, not dropped
  - `GET_CONTENT` must use a requestId/promise pattern with a 5-second timeout
  - All bridge messages must be strictly typed — no `any` payloads
- [x] Add a bridge health check: if the WebView goes silent for >30 seconds, show a "Editor crashed — tap to reload" recovery UI
- [x] Lazy-mount the WebView: create it only when the editor tab is first visited; do not unmount/remount (remounting reloads CM6 and loses state)

##### File Switching
- [x] File switch must follow this exact sequence:
  1. Call `GET_CONTENT` to save current in-WebView state
  2. Write to disk
  3. Clear `isDirty` flag
  4. Call `SET_CONTENT` with new file content
  5. Call `SET_LANGUAGE` with detected language
  6. Scroll WebView to top
- [x] Show a loading overlay during the switch — never show the previous file's content while the new one loads

##### Dynamic Editor Settings
- [x] **Font size** — slider in settings → bridge message → CM6 `fontSizeConf.reconfigure()` — no app restart
- [x] **Theme** — dark/light/high-contrast → CM6 theme swap via bridge — no app restart
- [x] **Tab size** — 2 or 4 spaces → bridge message → CM6 `tabSize` compartment
- [x] **Word wrap** — toggle → `lineWrapping` extension toggle
- [x] **Line numbers** — toggle → `lineNumbers()` extension toggle
- [x] All settings changes must apply in <300ms without WebView reload

##### Editor Search and Replace
- [x] Integrate `@codemirror/search` into `cm6-build`
- [x] Open/close search panel via RN bridge message `TOGGLE_SEARCH`
- [x] Expose find-next, find-previous, replace, replace-all over the bridge
- [x] Show match count in the RN header overlay (e.g., "3 of 12")
- [x] Highlight all matches while search panel is open

##### Mobile Keyboard Helpers (`KeyboardAccessoryBar`)
The accessory bar above the keyboard is critical for mobile coding. Implement these keys:

```
Row 1 (punctuation): { } [ ] ( ) ; : , .
Row 2 (operators):   = + - * / % < > ! &
Row 3 (navigation):  ← → ↑ ↓ Tab  //comment  undo  redo
```

- [x] Tapping any key inserts it at the current cursor position via bridge
- [x] Tab key inserts `tabWidth` spaces (read from settings store)
- [x] Comment key detects language and inserts `//` or `#`
- [x] Undo/redo delegates to CM6's history via bridge

##### Large File Handling
- [x] Show a loading spinner when opening files >50KB
- [x] For files >500KB: show a warning "This file is large and may affect performance" — allow opening with confirmation
- [x] Do not load binary files (`.png`, `.jpg`, `.bin`, `.exe`, etc.) into the editor — show a "Binary file — cannot edit" placeholder
- [x] Detect binary files by checking for null bytes in the first 512 bytes

#### File Extension → CM6 Language Map

| Extension | CM6 Language Package | Language ID |
|-----------|---------------------|-------------|
| `.js` | `@codemirror/lang-javascript` | `javascript` |
| `.jsx` | `@codemirror/lang-javascript` | `jsx` |
| `.ts` | `@codemirror/lang-javascript` | `typescript` |
| `.tsx` | `@codemirror/lang-javascript` | `tsx` |
| `.py` | `@codemirror/lang-python` | `python` |
| `.java` | `@codemirror/lang-java` | `java` |
| `.cpp` `.cc` | `@codemirror/lang-cpp` | `cpp` |
| `.c` `.h` | `@codemirror/lang-cpp` | `c` |
| `.html` | `@codemirror/lang-html` | `html` |
| `.css` | `@codemirror/lang-css` | `css` |
| `.json` | `@codemirror/lang-json` | `json` |
| `.md` | `@codemirror/lang-markdown` | `markdown` |
| `.sh` | `@codemirror/lang-markdown` | `shell` |
| `.xml` | `@codemirror/lang-xml` | `xml` |
| `.sql` | `@codemirror/lang-sql` | `sql` |
| `.rs` | `@codemirror/lang-rust` | `rust` |

#### Acceptance Criteria

```
✓ Editor opens and saves files reliably — 100 file open/save cycles with no data loss

✓ Settings (font size, theme, tab size, word wrap) update without app restart

✓ Search works in the current file with match count

✓ Mobile keyboard accessory bar inserts characters at cursor position correctly

✓ Editor recovers gracefully from WebView crash

✓ File switching shows correct content every time — no stale content visible
```

---

### 1.3 Run Button Workflow `[MEDIUM]`

**Why this matters:** Running code is the payoff of everything else. If it is confusing, broken, or silent on failure, students will abandon the app.

#### Run Command Resolution

Each project/file must resolve to a specific run command. Define this mapping in `src/constants/runCommands.ts`:

```typescript
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
```

#### Required Work

- [x] Implement `RunService` that:
  1. Detects language from open file extension
  2. Resolves the `RunConfig`
  3. Saves the file before executing (always)
  4. Dispatches the command to the execution engine
  5. Opens/focuses the terminal/output panel
- [x] **Stop/restart controls** — show a ■ Stop button while a process is running; tap to send SIGTERM to the engine session
- [x] **Output panel** — an output-only view (not full terminal) for quick runs; the full terminal tab is for interactive use
- [x] **Error messages** — distinguish between:
  - "Runtime not available" (engine error) — show setup instructions
  - "Compilation error" (user code error) — show the error with line number highlighted in editor
  - "Runtime error / exception" (user code error) — show the traceback clearly
  - "Network error" (connection to engine failed) — show retry button
- [x] **Current-file vs project-level execution** — default is current file; add "Run Project" option in the header menu for project-level entry points

#### Acceptance Criteria

```
✓ Python, JavaScript run with one tap from the editor

✓ Output appears in under 3 seconds for simple programs

✓ Long-running programs (infinite loops) can be stopped

✓ Compilation and runtime errors show line numbers

✓ A missing runtime shows a clear message, not a silent failure
```

---

## Phase 2 — Real Terminal and Execution Engine

> **Goal:** Replace all mocked terminal behavior with a real terminal connected to `nova-engine`.
> **Priority:** 🔴 The product is not functional without this.

---

### 2.1 Terminal Screen `[HARD]`

**Why this matters:** A fake terminal destroys credibility. Students will immediately notice if commands do not behave like a real shell.

#### Architecture

```
NovaCode App                              nova-engine (backend)
────────────                              ────────────────────

TerminalScreen
  │
  ├── WebSocket connection ─────────────→ WS handler
  │     ws://engine-url/terminal            │
  │     ?token=JWT                          ├── PTY spawn (bash/sh)
  │                                         │     stdin ← WS messages
  └── TerminalWebView                       │     stdout → WS messages
        xterm.js (via WebView)              │     resize ← WS events
          │                                 └── Session manager
          ├── input → WS send
          └── WS data → xterm.js write
```

#### Required Work

##### React Native Side
- [ ] Replace the static `TerminalView` with an `xterm.js` instance running inside a `react-native-webview`
- [ ] Bundle `xterm.js` and `xterm-addon-fit` locally in `src/assets/terminal/terminal.html`
- [ ] Implement `TerminalBridge` (mirrors the editor bridge pattern):
  - `send(data: string)` → WS send → PTY stdin
  - `resize(cols: number, rows: number)` → WS resize event
  - `onData(handler)` → PTY stdout → xterm write
  - `onDisconnect(handler)` → show reconnect UI
- [ ] Add terminal session state to `useTerminalStore`:
  - `isConnected: boolean`
  - `sessionId: string | null`
  - `connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error'`
- [ ] **Reconnect behavior**: on disconnect, show a banner "Disconnected — Tap to reconnect"; attempt auto-reconnect up to 3 times with exponential backoff
- [ ] Handle `onMessage` from xterm.js WebView for terminal-to-RN events (title changes, bell, etc.)

##### Terminal Keyboard
- [ ] Extend `KeyboardAccessoryBar` for terminal mode:
  - `Ctrl+C` (interrupt), `Ctrl+D` (EOF), `Ctrl+Z` (suspend)
  - `Tab` (completion), `↑` (history up), `↓` (history down)
  - Arrow keys, Home, End, Page Up/Down

##### xterm.js HTML Asset (`src/assets/terminal/terminal.html`)
```html
<!-- Key config for mobile -->
<script>
  const term = new Terminal({
    cursorBlink: true,
    fontSize: 14,
    fontFamily: 'monospace',
    theme: {
      background: '#0d1117',
      foreground: '#c9d1d9',
      cursor: '#58a6ff',
    },
    // Critical for mobile:
    scrollback: 1000,
    convertEol: true,
  });
  const fitAddon = new FitAddon.FitAddon();
  term.loadAddon(fitAddon);
  term.open(document.getElementById('terminal'));
  fitAddon.fit();
  // ... bridge listeners
</script>
```

#### Acceptance Criteria

```
✓ User opens terminal, types 'ls', sees real directory output

✓ Terminal output streams live — no buffering delay

✓ Ctrl+C terminates a running process

✓ Terminal reconnects automatically or shows clear disconnected state

✓ Terminal is readable on a 5-inch screen
```

---

### 2.2 Engine Session Model `[MEDIUM]`

**Why this matters:** Without session isolation, one student's `rm -rf` can affect another's workspace.

#### Required Work

##### `nova-engine` Session API

```
POST   /sessions              → create session, returns { sessionId, wsUrl }
GET    /sessions/:id          → get session status
DELETE /sessions/:id          → terminate session
POST   /sessions/:id/upload   → upload project files to session working dir
POST   /sessions/:id/exec     → run a command (non-interactive, returns output)
WS     /sessions/:id/terminal → PTY WebSocket for interactive terminal
```

##### Session Lifecycle

```
Create session
    │
    ▼
Upload project files (POST /sessions/:id/upload)
    │
    ▼
Open WS terminal connection
    │
    ├── Commands execute in project working directory
    ├── Session auto-expires after 30 min idle
    └── DELETE /sessions/:id on logout or explicit close
```

- [ ] **Per-user sessions** — each authenticated user gets at most N concurrent sessions (configurable, default 2)
- [ ] **Project upload before run** — before running a command, sync the project's files from the device to the session's working directory
- [ ] **Working directory management** — sessions always start in `/workspace/{projectName}/`
- [ ] **Idle timeout** — sessions idle for >30 minutes are automatically terminated and resources freed
- [ ] **Session cleanup** — on user logout, explicitly terminate all their sessions
- [ ] **Max session duration** — hard cap at 2 hours even if active (prevent forgotten sessions)

#### Acceptance Criteria

```
✓ Each user's session is isolated — no shared filesystem between users

✓ Running one project does not affect another project's session

✓ Sessions do not persist indefinitely — idle timeout works

✓ Uploading a 50-file project before execution takes <5 seconds
```

---

### 2.3 Secure Execution `[HARD]` `[RISKY]`

> ⚠️ **This is the highest-risk section of the entire project. Student code must NEVER execute directly on the host machine in production. No exceptions.**

#### Execution Sandbox Options

| Approach | Isolation Level | Complexity | Recommended For |
|----------|----------------|-----------|-----------------|
| Direct host shell | None ❌ | Low | Development only |
| Docker per session | High ✅ | Medium | Production MVP |
| gVisor (runsc) | Very high ✅✅ | High | Production v2 |
| Firecracker microVM | Highest ✅✅✅ | Very high | Scale production |

**Recommended for production MVP: Docker per session with resource limits.**

#### Required Work

##### Container Configuration
```dockerfile
# Session container template
FROM ubuntu:22.04
RUN apt-get update && apt-get install -y \
    python3 python3-pip nodejs npm \
    openjdk-17-jdk gcc g++ \
    && rm -rf /var/lib/apt/lists/*

# Non-root user
RUN useradd -m -u 1000 student
USER student
WORKDIR /workspace

# No network by default (override per project if needed)
```

##### Resource Limits (Docker flags)
```bash
docker run \
  --memory=256m \               # 256 MB RAM limit
  --memory-swap=256m \          # No swap
  --cpus=0.5 \                  # 50% of one CPU
  --pids-limit=50 \             # Max 50 processes
  --network=none \              # No outbound network (override for npm/pip)
  --read-only \                 # Read-only root filesystem
  --tmpfs /workspace:size=100m \# Writable workspace, max 100 MB
  --tmpfs /tmp:size=50m \
  session-image
```

- [ ] Move from direct host shell to Docker container execution
- [ ] Apply all resource limits above to every container
- [ ] **File path validation** — validate all uploaded file paths: no `../`, no absolute paths, no symlinks, max path length 255 chars, no null bytes
- [ ] **Authentication** — WebSocket connections require a valid JWT Bearer token
- [ ] **Authorization** — verify the JWT `userId` matches the `sessionOwnerId` before accepting WS messages
- [ ] **Rate limiting**:
  - Session creation: max 5 sessions per user per hour
  - Command execution: max 30 commands per session per minute
  - File upload: max 10 MB per upload, max 100 files
- [ ] **Abuse monitoring** — log and alert on:
  - Sessions consuming >80% of CPU for >60 seconds
  - Sessions exceeding disk quota
  - Rapid session creation (>10/hour for one user)
- [ ] **Security event logging** — structured log entries for: auth failures, path traversal attempts, resource limit violations, unusual process spawning

#### Security Checklist (Required Before Any Real Users)

- [ ] Student code cannot read host filesystem
- [ ] Student code cannot access other students' session containers
- [ ] Student code cannot open outbound network connections (except during package install)
- [ ] Container cannot be escaped via known kernel exploits (keep host kernel patched)
- [ ] All secrets (JWT secret, DB credentials) are environment variables, not in code
- [ ] JWT tokens expire and are rotated

#### Acceptance Criteria

```
✓ Student code executes inside a Docker container, never on the host

✓ An infinite loop is killed by the container timeout

✓ A memory bomb (allocate all RAM) hits the memory limit and is killed

✓ A path traversal attempt ('../../../etc/passwd') is rejected with 400

✓ WebSocket without a valid token is rejected with 401

✓ One user cannot access another user's session
```

---

## Phase 3 — Browser Preview

> **Goal:** Make HTML/CSS/JS projects feel like a real mobile web IDE.
> **Priority:** 🟠 High — web projects are a major student use case.

---

### 3.1 Static Preview `[MEDIUM]`

#### Architecture

```
Project files (RNFS)
    │
    ├── Upload to nova-engine session
    │
    └── nova-engine serves files on a
        temp HTTP server (http://session-url:PORT/)
            │
            └── WebView in PreviewScreen
                  src="http://session-url:PORT/index.html"
```

#### Required Work

- [ ] Add a `PreviewScreen` (new screen — not currently in the project)
- [ ] Add "Preview" to the bottom tab bar (or as a floating button in the editor for HTML files)
- [ ] `nova-engine`: add a `GET /sessions/:id/preview` endpoint that spins up a local HTTP server for the session's `/workspace/` directory, returns a temporary URL
- [ ] **Auto-detect `index.html`** — when a web project is run, automatically open `PreviewScreen` pointing at the index
- [ ] **Refresh controls** — ↺ soft refresh (reload WebView URL), ⟳ hard refresh (re-upload files, restart preview server, reload)
- [ ] **Error display** — if the preview server fails to start or `index.html` is missing, show a clear error screen with troubleshooting hints
- [ ] **URL bar** — show the current preview URL; allow navigation to sub-pages

#### Acceptance Criteria

```
✓ Student creates HTML/CSS/JS project → taps Preview → sees rendered page in under 5 seconds

✓ CSS and JavaScript files load correctly relative to index.html

✓ Refresh button reloads the page

✓ Missing index.html shows a clear error, not a blank screen
```

---

### 3.2 Live Preview `[MEDIUM]`

**Why this matters:** Instant feedback is essential for learning web development. The gap between "save" and "see result" should feel invisible.

#### Required Work

- [ ] **File watcher** — watch for save events in the app; on each save of `.html`, `.css`, or `.js`, trigger a preview refresh
- [ ] **Live-reload injection** — inject a `<script>` into the served `index.html` that polls a `/livereload` endpoint; when a file changes, the endpoint version increments and the script reloads the page
- [ ] **Scroll preservation** — before reload, capture `window.scrollY` from the WebView; after reload, restore it via injected JS
- [ ] **Console forwarding** — override `console.log`, `console.warn`, `console.error` in the injected script to POST to a `/console` endpoint; display the output in a collapsible console panel below the preview

#### Console Panel Schema

```typescript
type ConsoleEntry = {
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: number;
  source?: string;    // filename:line if available
};
```

#### Acceptance Criteria

```
✓ Editing HTML and saving updates the preview in <2 seconds

✓ CSS change updates styling without a full page reload (if possible)

✓ JavaScript errors appear in the console panel with source location

✓ Scroll position is preserved across soft reloads
```

---

## Phase 4 — Language Support

> **Goal:** Support the main student languages properly — not just by file extension, but with correct execution, error display, and project structure.
> **Priority:** 🟠 Core to the product's value proposition.

---

### 4.1 Python `[MEDIUM]`

#### Required Work

- [ ] **Improved templates** — `main.py` starter + `requirements.txt` (empty)
- [ ] **stdin support** — when a program calls `input()`, the terminal must accept keyboard input; this is already handled by the PTY terminal in Phase 2, but the run button workflow must also support stdin (route output to the interactive terminal, not just the output panel)
- [ ] **pip integration** — implement through the package manager (Phase 5); for now, ensure `pip3 install <package>` works in the terminal
- [ ] **Traceback display** — detect Python tracebacks in stderr output; highlight the file name and line number; if the file is open in the editor, show a red squiggly on the error line (via bridge message `MARK_ERROR`)
- [ ] **Basic formatting** — if `autopep8` or `black` is available in the container, add a "Format" button in the editor header for `.py` files

#### `nova-engine` Python environment
```dockerfile
RUN pip3 install autopep8 black \
    numpy pandas matplotlib requests \
    && pip3 cache purge
```

#### Acceptance Criteria

```
✓ Student writes print("hello") → runs → sees "hello" in output

✓ Student writes input("Name: ") → runs → can type in terminal → program continues

✓ SyntaxError traceback shows filename and line number clearly

✓ pip3 install works in the terminal session
```

---

### 4.2 JavaScript and Node.js `[MEDIUM]`

#### Required Work

- [ ] **Node project templates**:
  - Blank Node: `index.js` + `package.json`
  - Express server: `index.js` + `package.json` with express dependency
  - Frontend: `index.html` + `style.css` + `script.js`
- [ ] **`package.json` scripts** — detect `start` and `dev` scripts; show them as run options in the editor header menu
- [ ] **npm install** — run `npm install` automatically when a project with a `package.json` is first opened in a session; show progress in the terminal
- [ ] **npm output display** — npm installs produce verbose output; filter it to show only errors and the final "added N packages" summary line by default, with a "Show full log" toggle
- [ ] **Error display** — Node.js errors include stack traces; detect them in stderr, highlight filenames and line numbers

#### Acceptance Criteria

```
✓ Student creates a Node project → adds express → runs index.js → sees output

✓ npm install runs automatically for projects with package.json

✓ Stack traces show filename and line number

✓ package.json scripts are accessible from the run menu
```

---

### 4.3 HTML, CSS, and JavaScript `[EASY]`

#### Required Work

- [ ] **Richer web templates**:
  - Blank HTML: minimal `index.html` + `style.css` + `script.js`
  - Bootstrap starter: includes Bootstrap CDN links
  - Canvas game starter: `index.html` with `<canvas>` and basic game loop in `script.js`
- [ ] **Auto-connect to browser preview** — running an HTML project opens `PreviewScreen` instead of the terminal
- [ ] **Asset handling** — the preview server must serve images, fonts, and other static files from the project directory correctly (this works automatically if the HTTP server serves the whole project directory)
- [ ] **Better CM6 support for web** — ensure HTML, CSS, and JS completions are enabled in `cm6-build`:
  - HTML: tag name completion, attribute completion, closing tag auto-insertion
  - CSS: property completion, value completion
  - JS (inside HTML): `@codemirror/lang-javascript` applied to `<script>` blocks via `@codemirror/lang-html`'s mixed language support

#### Acceptance Criteria

```
✓ Student builds a page with HTML, CSS, and JS → previews it inside the app

✓ Images in the project folder load in the preview

✓ HTML autocomplete suggests valid tag names and attributes
```

---

### 4.4 Java `[HARD]`

#### cm6-build Changes

```bash
# In cm6-build project
npm install @codemirror/lang-java
```

Add to the language map and export in the CM6 bundle.

#### Required Work

- [ ] **Java syntax support in `cm6-build`** — add `@codemirror/lang-java`, export as part of the language bundle
- [ ] **Project template** — `src/Main.java` with a valid `public class Main { public static void main(String[] args) { ... } }`
- [ ] **Package/class naming** — template generator must set the class name to match the filename
- [ ] **Compile and run flow**:
  ```bash
  javac -cp . Main.java && java Main
  ```
  Detect `*.java` files and compile all of them (multi-class support)
- [ ] **Compiler error display** — `javac` errors include filename, line number, and a caret pointing to the problem; parse these and display them clearly; send `MARK_ERROR` bridge messages to highlight lines in the editor
- [ ] **Common error hints** — detect and augment these common Java errors with student-friendly messages:
  - `NullPointerException` → "You're trying to use a variable that is null"
  - `ArrayIndexOutOfBoundsException` → "You're trying to access an array index that doesn't exist"
  - `ClassNotFoundException` → "Check that your class name matches your filename"
- [ ] **Maven support** — 🚫 Defer to v2. Basic `javac`/`java` is sufficient for students.

#### Engine Java Environment
```dockerfile
RUN apt-get install -y openjdk-17-jdk
ENV JAVA_HOME=/usr/lib/jvm/java-17-openjdk-amd64
```

#### Acceptance Criteria

```
✓ Student creates a Java project → writes a class → runs it → sees output

✓ Compilation errors show line numbers in the editor

✓ NullPointerException displays a helpful hint, not just a stack trace
```

---

### 4.5 C and C++ `[MEDIUM]`

#### cm6-build Changes

```bash
npm install @codemirror/lang-cpp
```

#### Required Work

- [ ] **Syntax support** — add `@codemirror/lang-cpp` to `cm6-build` for both C and C++
- [ ] **C template** — `main.c` with `#include <stdio.h>` and `printf`
- [ ] **C++ template** — `main.cpp` with `#include <iostream>` and `cout`
- [ ] **Compile and run flow**:
  - C: `gcc main.c -o out -lm && ./out`
  - C++: `g++ main.cpp -o out && ./out`
- [ ] **Compiler error display** — `gcc`/`g++` errors include `filename:line:col: error: message`; parse and display; send `MARK_ERROR` to editor
- [ ] **Common error hints**:
  - `segmentation fault` → "Your program accessed memory it shouldn't. Check array bounds and pointer usage."
  - `implicit declaration` → "You're using a function without including its header file."
  - `undefined reference` → "You declared a function but never defined it, or forgot to link a library."
- [ ] **stdin support** — route execution to the interactive terminal (same as Python)

#### Acceptance Criteria

```
✓ Student creates a C program → compiles → runs → sees output

✓ Compiler errors show line numbers in the editor

✓ Segfaults display a helpful message
```

---

## Phase 5 — Package Manager

> **Goal:** Replace static package manager mock screens with real package operations.
> **Priority:** 🔵 Important but not blocking for the core editor/run loop.

---

### Supported Ecosystems (in order)

| Ecosystem | Command | Config file | Phase |
|-----------|---------|-------------|-------|
| npm (Node) | `npm install <pkg>` | `package.json` | Phase 5 |
| pip (Python) | `pip3 install <pkg>` | `requirements.txt` | Phase 5 |
| Maven (Java) | 🚫 Deferred | `pom.xml` | v2 |

### Required Work

#### Search
- [ ] Wire `SearchInput` in `PackageManagerScreen` to the npm registry API for Node projects:
  ```
  GET https://registry.npmjs.org/-/v1/search?text={query}&size=20
  ```
- [ ] For Python projects, use the PyPI JSON API:
  ```
  GET https://pypi.org/pypi/{package}/json
  GET https://pypi.org/search/?q={query}  (scrape or use PyPI XML endpoint)
  ```
- [ ] Detect the current project's language and show the appropriate package ecosystem
- [ ] Cache last 20 searches per ecosystem in MMKV (expire after 1 hour)

#### Install / Uninstall / Update
- [ ] **Install flow**:
  1. User taps "Install" on a package
  2. App sends `npm install <package>` or `pip3 install <package>` to the active session via the engine's exec API
  3. Show real-time log output in `InstallProgressCard`
  4. On success: update `package.json` / `requirements.txt` on disk and re-upload to session
  5. On failure: show the error log with a "Retry" button
- [ ] **Uninstall** — `npm uninstall <package>` or `pip3 uninstall -y <package>` via engine exec
- [ ] **Update** — `npm update <package>` or `pip3 install --upgrade <package>`
- [ ] **Installed packages list** — read `package.json` dependencies / `requirements.txt` to populate the installed tab

#### Package Manager Screen Tabs

```
PackageManagerScreen
  ├── Tab: Search         → live search npm/PyPI
  ├── Tab: Installed      → packages in current project
  └── Tab: Runtimes       → available Piston runtimes (or engine runtimes)
```

#### Acceptance Criteria

```
✓ Student searches "requests" in a Python project → installs it → imports it in code → runs without error

✓ Student searches "express" in a Node project → installs it → require('express') works

✓ Install log is visible — student sees what is happening

✓ Failed installs show the error and a retry option

✓ Installed packages tab reflects the actual project dependencies
```

---

## Phase 6 — Git

> **Goal:** Make Git useful for student projects without overwhelming them with complexity.
> **Priority:** 🔵 Important for learning good practices; not critical for core run loop.

---

### Git Feature Tiers

| Tier | Features | Phase |
|------|---------|-------|
| **Local Git** | init, status, add, commit, log, diff | Phase 6 |
| **Remote Git** | clone, push, pull, remote management | Phase 6 (carefully) |
| **Advanced** | rebase, cherry-pick, merge conflict resolution | 🚫 v2 |

### Required Work

#### Local Git (Complete First)
- [ ] Verify `GitService` (isomorphic-git + RNFS adapter) works reliably for:
  - `git.init` — create a new repo in the project directory
  - `git.statusMatrix` — get per-file change status
  - `git.add` — stage a file
  - `git.commit` — create a commit with message and author
  - `git.log` — read commit history (depth: 20)
- [ ] **File tree status badges** — after any save or commit, refresh `gitService.statusMatrix()` and update file tree badges:
  - `M` modified (orange dot)
  - `A` newly added (green dot)
  - `D` deleted (red dot)
  - `U` untracked (gray dot)
- [ ] **Commit screen** — a bottom sheet or modal with:
  - Staged files checklist (checkboxes to stage/unstage)
  - Commit message text input
  - Author name and email (auto-fill from MMKV `gitAuthorName` / `gitAuthorEmail`)
  - "Commit" button
- [ ] **Diff view** — show a simple side-by-side or inline diff for a selected file using the `diff` npm package against the HEAD version
- [ ] **History screen** — a `FlatList` of commits showing: short hash, message, author, date

#### Remote Git (Only After Local Is Solid)
- [ ] **Clone screen** — URL input + PAT (Personal Access Token) input + destination folder selector
- [ ] **Push** — push current branch to origin using stored PAT
- [ ] **Pull** — pull latest changes from origin
- [ ] **PAT storage** — store encrypted in MMKV; never log or expose in UI
- [ ] **Conflict detection** — if a merge conflict occurs, show a clear "Merge conflict in X files — resolve manually or abort" message; do NOT attempt automatic resolution in v1

#### Safety Guards
- [ ] Confirm dialog before any destructive operation (reset, force push)
- [ ] Never show a "force push" option in the UI — too dangerous for students
- [ ] Show a clear warning if the user tries to commit with no staged files

#### Acceptance Criteria

```
✓ Student initializes a repo → makes changes → commits → sees commit in history

✓ File tree shows correct M/A/D/U badges after changes

✓ Clone works for a public GitHub repo with a valid PAT

✓ A merge conflict shows a clear message instead of a confusing error
```

---

## Phase 7 — Authentication, Sync, and User Data

> **Goal:** Make user identity and settings reliable before any production use.
> **Priority:** 🔵 Required for cloud features; not blocking local-only use.

---

### What Gets Synced (Decisions Required Early)

| Data | Sync? | Reasoning |
|------|-------|-----------|
| App settings (theme, font size) | ✅ Yes | Small, safe, useful |
| Editor settings | ✅ Yes | Small, safe, useful |
| Recent projects list | ✅ Yes | Metadata only |
| Project files | ⚠️ Optional | Privacy concern — only if user opts in |
| Git credentials (PAT) | ❌ Never | Security risk |
| Engine session tokens | ❌ Never | Security risk |

### Required Work

#### Auth Audit
- [ ] Audit the existing Firebase auth flow for:
  - Token refresh handling (what happens when the token expires mid-session?)
  - Login failure handling (network error vs wrong credentials)
  - Sign-out flow — must clear: MMKV session tokens, Zustand user state, active engine sessions
- [ ] Add a proper `AuthService` wrapping Firebase with predictable error types:
  ```typescript
  type AuthError = 'network' | 'invalid-credentials' | 'user-not-found' | 'too-many-requests' | 'unknown';
  ```

#### Settings Sync
- [ ] Define a `UserSettings` schema (Firestore document or Supabase row):
  ```typescript
  type UserSettings = {
    theme: 'dark' | 'light' | 'high-contrast';
    fontSize: number;
    tabWidth: number;
    wordWrap: boolean;
    gitAuthorName: string;
    gitAuthorEmail: string;
    pistonApiUrl?: string;
    updatedAt: number;
  };
  ```
- [ ] On login: fetch `UserSettings` from cloud → merge with local MMKV (cloud wins on conflict)
- [ ] On settings change: write to MMKV immediately (synchronous, for instant feedback) + write to cloud in background (debounced 5 seconds)
- [ ] On logout: clear MMKV session tokens and sensitive data; keep local settings for convenience

#### Offline and Conflict States
- [ ] Settings write must queue when offline (use MMKV offline queue pattern from the main roadmap)
- [ ] On reconnect: flush the queue
- [ ] On conflict (cloud `updatedAt` is newer than local): show "Settings were updated on another device — use cloud or keep local?"

#### Auth State in UI
- [ ] Show a loading state on app startup while auth token is being validated
- [ ] Show an offline indicator when the device has no connectivity
- [ ] Gracefully degrade: the app must be fully usable for local editing when offline; only cloud features (engine, sync) require connectivity

#### Acceptance Criteria

```
✓ Logging in on a new device restores settings within 5 seconds

✓ Logout clears all session state — no sensitive tokens remain in MMKV

✓ App works fully for local editing with no internet connection

✓ Settings change on device A is reflected on device B after sync
```

---

## Phase 8 — Production Backend and Deployment

> **Goal:** Make `nova-engine` deployable, observable, and maintainable.
> **Priority:** 🟠 Required before any real students use the cloud features.

---

### Deployment Configuration

#### `nova-engine` Environment Variables

```bash
# Required
PORT=3000
JWT_SECRET=<256-bit random secret>
ALLOWED_ORIGINS=https://your-app-domain.com

# Session limits
MAX_SESSIONS_PER_USER=2
SESSION_IDLE_TIMEOUT_MINUTES=30
SESSION_MAX_DURATION_MINUTES=120

# Container limits
CONTAINER_MEMORY_MB=256
CONTAINER_CPU_SHARES=512
CONTAINER_PIDS_LIMIT=50
CONTAINER_DISK_MB=100

# Rate limiting
RATE_LIMIT_SESSIONS_PER_HOUR=5
RATE_LIMIT_COMMANDS_PER_MINUTE=30

# Logging
LOG_LEVEL=info
LOG_FORMAT=json  # structured logging

# Database (for session persistence)
DATABASE_URL=postgresql://...

# Optional: metrics
METRICS_PORT=9090
```

#### Docker Compose (Development)

```yaml
version: '3.8'
services:
  engine:
    build: .
    ports:
      - "3000:3000"
      - "9090:9090"
    environment:
      - JWT_SECRET=${JWT_SECRET}
      - DATABASE_URL=postgresql://postgres:password@db:5432/novaengine
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - db

  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: password
      POSTGRES_DB: novaengine
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

### Required Work

#### Health and Observability
- [ ] `GET /health` endpoint returns:
  ```json
  {
    "status": "ok",
    "activeSessions": 42,
    "containerPoolSize": 10,
    "uptime": 3600,
    "version": "1.2.0"
  }
  ```
- [ ] **Structured logging** — every log line is a JSON object with: `timestamp`, `level`, `event`, `userId` (if applicable), `sessionId` (if applicable), `durationMs`, `error`
- [ ] **Metrics** (Prometheus format at `/metrics`):
  - `nova_sessions_active` gauge
  - `nova_sessions_total` counter
  - `nova_command_duration_ms` histogram
  - `nova_container_spawn_duration_ms` histogram
  - `nova_errors_total` counter (by error type)
  - `nova_rate_limit_hits_total` counter

#### Reliability
- [ ] **Graceful shutdown** — on `SIGTERM`: stop accepting new connections, wait for active commands to complete (max 30 seconds), then exit
- [ ] **Versioned API** — add `X-Nova-Engine-Version` header to all responses; app checks this on startup and shows a warning if versions are incompatible
- [ ] **Database migrations** — use a migration tool (e.g., Flyway, golang-migrate) so schema changes are applied cleanly

#### Deployment
- [ ] `Dockerfile` for `nova-engine` — multi-stage build, non-root user, minimal image
- [ ] `docker-compose.prod.yml` for production (with proper secrets management)
- [ ] `README.md` in `nova-engine` covering: prerequisites, environment variable reference, deployment steps, upgrade procedure

#### Backup and Cleanup
- [ ] Nightly cleanup job: remove Docker containers for sessions that have been idle for >24 hours
- [ ] Database backup: daily PostgreSQL dump to object storage (S3/GCS)
- [ ] Disk cleanup: remove workspace files for expired sessions

#### Acceptance Criteria

```
✓ Engine can be deployed from scratch with documented steps in <30 minutes

✓ /health endpoint returns accurate session count

✓ A new engineer can understand the log output without asking for help

✓ SIGTERM causes a clean shutdown — no orphaned containers

✓ App shows a clear message when it is incompatible with the engine version
```

---

## Phase 9 — Testing

> **Goal:** Prevent regressions across app, editor, and engine. Build confidence for production releases.

---

### 9.1 App Tests `[MEDIUM]`

#### Unit Tests

| Module | What to Test |
|--------|-------------|
| `FileService` | readDir sorting, path construction, error propagation |
| `PistonService` | Request payload construction, error handling, timeout |
| `SearchService` | File indexing, content search batching, regex edge cases |
| `PackageService` | API response parsing, cache expiry |
| `GitService` | Status parsing, commit payload, error types |
| `RunService` | Language detection, run config resolution |
| `SyncService` | Offline queue logic, conflict detection |
| `useEditorStore` | openFile, closeFile, dirty/clean state transitions |

```bash
# Testing setup
npm install --save-dev jest @testing-library/react-native @testing-library/jest-native
```

#### Integration Tests

- [ ] **Project creation flow** — create each template type, verify file structure, verify files are valid
- [ ] **File open/save cycle** — write a string to a file via FileService, open it in the editor (mocked bridge), verify content matches
- [ ] **Run flow** — mock PistonService/engine, trigger run, verify correct payload is constructed and output is displayed

#### Android Device Testing Checklist (Manual)

Run before every release build on:
- [ ] A flagship device (Samsung Galaxy S-series, Pixel)
- [ ] A mid-range device (Redmi, Realme, Galaxy A-series) — **most important**
- [ ] An Android 10 device (API 29) — oldest supported
- [ ] An Android 14 device (API 34) — newest

Checklist for each device:
- [ ] App launches in <3 seconds
- [ ] All 5 tabs navigate correctly
- [ ] File tree loads a 50-file project without lag
- [ ] Editor opens a 500-line file in <2 seconds
- [ ] Typing in the editor is responsive — no input lag
- [ ] Keyboard accessory bar inserts characters correctly
- [ ] Save completes without error
- [ ] Run produces output in terminal
- [ ] App survives being backgrounded and foregrounded
- [ ] App survives a phone call interruption
- [ ] App survives Android killing it for memory (open many other apps, return to Nova Code)

---

### 9.2 Editor Tests `[MEDIUM]`

Test the `cm6-build` bundle in isolation (Node.js/browser test environment, not inside RN).

- [ ] Each language loads without error (JS, TS, Python, Java, C, C++, HTML, CSS, JSON, Markdown)
- [ ] `SET_CONTENT` bridge message updates the editor document
- [ ] `GET_CONTENT` returns the current document content
- [ ] `SET_LANGUAGE` changes the syntax highlighting without errors
- [ ] `SET_FONT_SIZE` updates the font without errors
- [ ] `TOGGLE_SEARCH` opens/closes the search panel
- [ ] Editing marks the document as dirty (triggers `CONTENT_CHANGED` message)
- [ ] Large file (50KB) loads in under 2 seconds in a headless browser

---

### 9.3 Engine Tests `[HARD]`

```bash
# Testing stack for nova-engine
npm install --save-dev jest supertest ws
```

- [ ] **WebSocket connection** — client connects with valid JWT → session is created → WS upgrades successfully
- [ ] **WebSocket auth** — client connects without JWT → gets 401 → connection closed
- [ ] **File upload** — upload a 10-file project → files appear in session workspace
- [ ] **Path traversal** — upload a file with path `../../etc/passwd` → request is rejected with 400
- [ ] **Command execution** — POST `/sessions/:id/exec` with `echo hello` → response contains `hello`
- [ ] **Session cleanup** — create a session, wait for idle timeout (mocked), verify container is removed
- [ ] **Timeout** — run `sleep 999` in a session, verify it is killed by the timeout
- [ ] **Memory limit** — run a Python script that allocates 512MB, verify it is OOM-killed and the error is reported
- [ ] **Concurrent sessions** — create 3 sessions as the same user (max is 2), verify the 3rd is rejected

#### Acceptance Criteria

```
✓ All security boundary tests pass with no false negatives

✓ Timeout and quota tests pass reliably

✓ Every new engine feature has at least one test before merging
```

---

## Phase 10 — UX Polish

> **Goal:** Make the app feel complete and comfortable for students.
> **Priority:** 🟢 Do last — but do it properly before real users.

---

### Empty States

Every screen that can be empty needs a designed empty state:

| Screen | Empty State Message |
|--------|-------------------|
| File Explorer | "No projects yet. Tap + to create your first project." |
| Editor | "No file open. Select a file from the Explorer." |
| Terminal | "Terminal ready. Run a file or open a session to start." |
| Search | "Start typing to search across your project files." |
| Packages | "Search for packages to add to your project." |
| Git History | "No commits yet. Make your first commit to get started." |

### Loading and Error States

- [ ] All screens must show a skeleton loader (not a spinner) while loading
- [ ] All network errors must show: what failed, why (if known), and what to do (retry button)
- [ ] Never show a raw error object or stack trace to the user
- [ ] All error messages must be actionable: "Could not save file — Check storage permissions" > "Error: RNFS write failed"

### Onboarding

- [ ] **First launch** — after permission grant, show a 3-screen onboarding:
  1. "Create a project" — animated walkthrough
  2. "Write and run code" — shows the run button
  3. "Preview your web projects" — shows the preview tab
- [ ] **First project** — for new users, auto-navigate to a "Create Project" modal on first launch
- [ ] **Run hints** — when a file is opened in a language with a run config, show a subtle hint bar: "Tap ▶ to run this file with Python 3"

### Keyboard and Layout

- [ ] **Keyboard-aware layouts** — all input screens must use `KeyboardAvoidingView` so the keyboard never covers the active input
- [ ] **Small screen support** — test on 5-inch screens (e.g., Pixel 4a); ensure all core actions are reachable without scrolling
- [ ] **Safe area** — all screens must respect notches, punch-holes, and navigation bars

### Accessibility

- [ ] Add `accessibilityLabel` to all icon-only buttons
- [ ] Add `accessibilityHint` to all interactive elements that are not obviously labeled
- [ ] Ensure tap targets are at least 44×44dp (Android minimum)

### Visual Coherence

- [ ] Terminal, editor, file explorer, preview, search, Git, and packages should feel like parts of the same app — consistent header style, consistent empty states, consistent action sheet patterns
- [ ] Audit all screens for inconsistent spacing, misaligned elements, and font size violations against the theme system

### Animation (Last)

```bash
npm install react-native-reanimated
```

- [ ] Tab switching: fade transition (100ms)
- [ ] File tree expand/collapse: height animation (150ms)
- [ ] Terminal new rows: slide-in (50ms)
- [ ] Modals: slide up from bottom (200ms)
- [ ] Do NOT add animations that block user interaction

#### Acceptance Criteria

```
✓ A new student can create and run a first Python project in under 3 minutes
  with no external instructions

✓ Core workflows are usable on a 5-inch screen

✓ No screen is ever blank — every state has a designed response

✓ All icon buttons have accessibility labels
```

---

## Suggested Build Order

Work in this sequence to get from 45% to a working student MVP as fast as possible, while managing risk:

```
1. ████████░░  Stabilize file ops, editor bridge, project templates     Phase 1
2. ████████░░  Connect terminal to nova-engine (real WS PTY)            Phase 2.1–2.2
3. ████████░░  Run Python and JavaScript reliably end-to-end            Phase 1.3 + 4.1–4.2
4. ████████░░  Secure the engine (Docker, auth, limits)                 Phase 2.3  ← DO NOT SKIP
5. ████░░░░░░  Add browser preview for HTML/CSS/JS                      Phase 3
6. ████░░░░░░  npm and pip package installation                         Phase 5
7. ████░░░░░░  Java support                                             Phase 4.4
8. ████░░░░░░  C and C++ support                                        Phase 4.5
9. ████░░░░░░  Local Git (solid before remote Git)                      Phase 6
10. ████░░░░░░ Auth audit and settings sync                              Phase 7
11. ████░░░░░░ Tests and production deployment                           Phase 8–9
12. ████░░░░░░ UX polish and onboarding                                  Phase 10
```

> ⚠️ **Never skip Phase 2.3 (Secure Execution).** Deploying an unsandboxed code execution engine is a critical security incident waiting to happen.

---

## MVP Definition

The first serious MVP — the minimum the app must have before student use — is:

### MVP Checklist

#### Must Have ✅
- [ ] Project creation: Python, JavaScript, HTML/CSS/JS
- [ ] Reliable file explorer — create, open, rename, delete, save
- [ ] Editor with syntax highlighting, autosave, dirty-state tracking, mobile keyboard helpers
- [ ] Real terminal connected to `nova-engine` via WebSocket PTY
- [ ] Run support for Python and JavaScript (output in terminal)
- [ ] Integrated browser preview for HTML/CSS/JS projects
- [ ] Basic Git: init, status, add, commit, log
- [ ] Settings: theme, font size, tab width
- [ ] Clear error handling throughout
- [ ] Containerized, authenticated execution engine
- [ ] Manual Android testing checklist passed

#### Can Wait Until After MVP 🚫
- [ ] Java, C, C++ support
- [ ] Package manager (npm/pip)
- [ ] Remote Git (push/pull)
- [ ] Cloud project sync
- [ ] Advanced autocomplete / IntelliSense
- [ ] Multiple editor splits
- [ ] Plugin system

---

## Production Readiness Checklist

Complete every item before real students use the cloud execution feature:

### Security
- [ ] Containerized execution (Docker or equivalent)
- [ ] Per-user authentication (JWT, validated on every request)
- [ ] Per-session authorization (userId must match sessionOwnerId)
- [ ] File path validation (no traversal, no absolute paths, no null bytes)
- [ ] CPU limits enforced per container
- [ ] Memory limits enforced per container
- [ ] Disk limits enforced per container
- [ ] Process limits (pids) enforced per container
- [ ] Network policy (outbound restricted by default)
- [ ] Session idle timeout enforced
- [ ] Session max duration enforced
- [ ] Rate limiting (session creation, command execution)
- [ ] Abuse monitoring alerts configured

### Observability
- [ ] Structured JSON logging
- [ ] Health check endpoint
- [ ] Metrics endpoint (or equivalent)
- [ ] Error alerting configured

### Operations
- [ ] Deployment documentation complete
- [ ] Environment variable documentation complete
- [ ] Graceful shutdown implemented
- [ ] Backup strategy for database
- [ ] Cleanup strategy for expired containers and workspaces
- [ ] Versioned API contracts documented

### Legal and Privacy
- [ ] Privacy review completed — what data is collected, stored, retained
- [ ] Terms of service drafted
- [ ] Acceptable use policy drafted (especially important for code execution)
- [ ] GDPR/applicable data law review (if serving EU students)

---

## Main Risks

### 🔴 Security Risk — Highest Priority

**The single largest risk is running untrusted student code.**

Students will intentionally and accidentally write:
- Infinite loops
- Fork bombs
- Scripts that read `/etc/passwd`
- Scripts that try to contact external servers
- Scripts that fill the disk

The engine **must not** execute code directly on the host machine in production. There are no exceptions to this rule. A single uncontained session can compromise the entire server.

**Mitigation:** Docker containers with all resource limits applied before any real users.

---

### 🟠 Scope Risk

The feature list is large. Attempting to finish Python, JavaScript, HTML preview, Java, C, C++, packages, Git, sync, and cloud execution simultaneously will result in nothing working well.

**Mitigation:** The "Suggested Build Order" above is strictly prioritized. Finish the vertical Python/JS/web slice first. Everything else waits.

---

### 🟠 Mobile UX Risk

Code editing on phones is genuinely difficult. The default CodeMirror 6 experience is designed for desktop browsers. Without mobile-specific adaptations, the editing experience will be frustrating.

Key pain points:
- Cursor placement by touch is imprecise
- The default virtual keyboard covers the code
- Copy/paste in WebView behaves differently per Android version
- Pinch-to-zoom conflicts with the editor's own touch handling

**Mitigation:** The keyboard accessory bar (Phase 1.2) is not optional. Mobile keyboard helpers are what separates a usable mobile IDE from a frustrating one.

---

### 🔵 Backend Cost Risk

Cloud execution can become expensive if sessions are not managed aggressively.

Estimates (rough, vary by provider):
- 1 Docker container running = ~50–100 MB RAM
- 100 concurrent students = 5–10 GB RAM on the engine server
- An idle session left running for hours wastes resources and money

**Mitigation:** Session idle timeout (30 min), session max duration (2 hours), max sessions per user (2), and nightly cleanup of orphaned containers are all required before launch.

---

## Recommended Next Milestone

Before any further broad feature development, build and validate this **vertical slice**:

```
Step 1: Create a Python project
        └── Template: main.py with print("Hello, World!")

Step 2: Open main.py in the editor
        └── Verify: syntax highlighting, cursor placement, typing

Step 3: Edit the file
        └── Change to: name = input("Your name: ")
                       print(f"Hello, {name}!")

Step 4: Save the file
        └── Verify: dirty indicator clears, file written to disk

Step 5: Run the file through nova-engine
        └── Verify: terminal connects, "Your name: " prompt appears

Step 6: Type a name in the terminal
        └── Verify: greeting appears in output

Step 7: Stop the process (if still running)
        └── Verify: process terminates cleanly

Step 8: Close the app completely (swipe away from recents)

Step 9: Reopen the app
        └── Verify: project appears in recent projects
                   file reopens with correct content
                   no data loss
```

**After this works:**
- Repeat for JavaScript (same slice with `readline`)
- Repeat for HTML/CSS/JS (same slice with browser preview)

**This single slice tests:**
- Project creation ✓
- File editing ✓
- Save reliability ✓
- Engine connection ✓
- Interactive stdin ✓
- State restoration ✓
- Data integrity ✓

Do not move to Phase 2 features until this slice works flawlessly on a physical mid-range Android device.

---

*Nova Code Final Master Roadmap · v2.0 · Android-first student IDE*
*Projects: `NovaCode` (RN app) · `cm6-build` (editor bundle) · `nova-engine` (execution backend)*
*Supersedes: `NOVA_CODE_MASTER_ROADMAPCv2.md` and `NOVA_CODE_COMPLETION_PLAN.md`*

---

---

## Appendix — Current Project State & Pre-Phase 1 Preparation

> **Read this before writing a single line of Phase 1 code.**
> This appendix documents exactly what was verified against the current project structure on disk, what is ahead of schedule, what is missing, and the exact 7-step cleanup sequence that must be completed before Phase 1 begins.

---

### A.1 What Was Built Beyond the Original Roadmap

The following files were added during the previous roadmap cycle that were not planned but are all beneficial. They are already in place and accelerate several phases of this plan.

| File | Why It Matters For This Plan |
|------|------------------------------|
| `src/screens/AuthScreen.tsx` | Ready for Phase 7 auth work — do not rebuild |
| `src/screens/SettingsScreen.tsx` | Ready for Phase 1.2 dynamic settings — audit and wire it |
| `src/features/files/components/NewProjectModal.tsx` | Phase 1.1 project creation — wire to `ProjectService` |
| `src/features/files/components/ProjectSwitcherModal.tsx` | Phase 1.1 multi-project workflow — wire to `useProjectStore` |
| `src/features/files/components/SourceControlDrawer.tsx` | Phase 6 Git UI panel — wire to `GitService` |
| `src/features/files/hooks/useFileTree.ts` | Phase 1.1 file explorer — verify lazy-load logic |
| `src/features/files/services/ProjectService.ts` | Phase 1.1 project CRUD — audit for error handling |
| `src/features/files/utils/fileIcons.ts` | Phase 1.1 file tree — extension → icon map, extend for Java/C/C++ |
| `src/components/modals/NewItemModal.tsx` | Phase 1.1 file/folder creation — verify it calls `FileService` |
| `src/features/editor/components/QuickNavDrawer.tsx` | Phase 1.2 editor navigation — wire to open file list |
| `src/features/editor/hooks/useAutosave.ts` | Phase 1.2 autosave — audit for AppState background handling |
| `src/features/editor/hooks/useFileOpen.ts` | Phase 1.2 file switching — audit for race condition on rapid switches |
| `src/features/editor/services/EditorBridge.ts` | Phase 1.2 bridge — audit message queue for pre-READY messages |
| `src/features/editor/components/WebViewEditor.tsx` | Phase 1.2 editor shell — verify lazy-mount pattern |
| `src/features/terminal/components/ConsoleBottomSheet.tsx` | Phase 1.3 output panel — wire to `PistonService` output |
| `src/features/terminal/components/InteractiveConsole.tsx` | Phase 1.3 + 2.1 stdin support — wire to execution flow |
| `src/features/terminal/hooks/useTerminalEngine.ts` | Phase 1.3 run workflow — audit for stop/cancel support |
| `src/features/terminal/services/PistonService.ts` | Phase 1.3 execution — audit timeout and error handling |
| `src/services/git/GitService.ts` | Phase 6 Git — `RNFSAdapter` shim is in place; validate before wiring UI |
| `src/services/git/RNFSAdapter.ts` | Phase 6 Git — the critical fs shim; test independently first |
| `src/services/SyncService.ts` | Phase 7 sync — created early; add `SYNC_ENABLED` feature flag |
| `src/templates/blank.ts` | Phase 1.1 templates — present |
| `src/templates/python.ts` | Phase 1.1 templates — verify `main.py` content is syntactically valid |
| `src/templates/node.ts` | Phase 1.1 templates — verify `index.js` + `package.json` are valid |
| `src/templates/reactNative.ts` | Bonus — keep but not part of the student IDE scope |
| `android/app/src/main/assets/editor/index.html` | Phase 1.2 — CM6 HTML asset is bundled locally ✅ |
| `android/app/src/main/assets/editor/editor.bundle.js` | Phase 1.2 — CM6 JS bundle is compiled and in place ✅ |
| `android/app/google-services.json` | Phase 7 — Firebase is configured; see auth decision below |

---

### A.2 What Is Missing and Must Be Added Before Phase 1

Three infrastructure folders specified in the original roadmap are absent. Every phase in this plan imports from them. Create them before touching any other file.

#### ❌ Missing: `src/hooks/`

App-wide hooks that don't belong inside a single feature. Each feature folder already has its own `hooks/` — this folder is only for hooks consumed by multiple features or by screens.

```
src/hooks/
├── index.ts
├── usePermissions.ts    ← wraps PermissionService — call on app start
├── useNetworkState.ts   ← wraps @react-native-community/netinfo
└── useTheme.ts          ← reads theme from useSettingsStore, returns theme tokens
```

#### ❌ Missing: `src/types/`

Domain types are currently scattered inline inside store files and service files. As soon as two features share a type (e.g., `FileEntry` appears in `FileService`, `useFileTree`, `SearchService`, `GitService`), you get type drift. Centralise once now.

```
src/types/
└── index.ts
```

Minimum types to define here on creation:

```typescript
export type FileEntry = {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  mtime?: number;
  extension?: string;
};

export type OpenFile = {
  path: string;
  name: string;
  language: string;
  isDirty: boolean;
  isSynced: boolean;
};

export type ProjectMeta = {
  id: string;
  name: string;
  rootPath: string;
  language: string;
  createdAt: number;
  lastOpenedAt: number;
};

export type TerminalEntry = {
  id: string;
  type: 'stdout' | 'stderr' | 'system' | 'input';
  content: string;
  timestamp: number;
};

export type PistonRuntime = {
  language: string;
  version: string;
  aliases: string[];
};

export type AuthError =
  | 'network'
  | 'invalid-credentials'
  | 'user-not-found'
  | 'too-many-requests'
  | 'unknown';

export type SyncStatus = 'synced' | 'syncing' | 'pending' | 'offline' | 'error';
```

After creating this file, search all existing service and store files for inline type definitions that duplicate these — delete the duplicates and import from `src/types` instead.

#### ❌ Missing: `src/constants/`

Hardcoded values spread across files cause silent mismatches when one changes. Two files needed immediately:

```
src/constants/
├── index.ts          ← PROJECTS_DIR, PISTON_API_BASE, timeouts, limits
└── languageMap.ts    ← extension → language ID, extension → RunConfig
```

**`src/constants/index.ts` starter content:**

```typescript
import RNFS from 'react-native-fs';

export const PROJECTS_DIR = `${RNFS.ExternalDirectoryPath}/NovaCode/projects`;
export const PISTON_API_BASE = 'https://emkc.org/api/v2/piston';
export const AUTOSAVE_INTERVAL_MS = 30_000;
export const SEARCH_DEBOUNCE_MS = 300;
export const PISTON_TIMEOUT_MS = 15_000;
export const BRIDGE_TIMEOUT_MS = 5_000;
export const MAX_RECENT_PROJECTS = 10;
export const MAX_FILE_SIZE_WARN_BYTES = 50_000;    // 50 KB — show spinner
export const MAX_FILE_SIZE_HARD_BYTES = 500_000;   // 500 KB — warn user
```

**`src/constants/languageMap.ts` starter content:**

```typescript
export const EXTENSION_TO_LANGUAGE: Record<string, string> = {
  js: 'javascript', jsx: 'jsx', ts: 'typescript', tsx: 'tsx',
  py: 'python', java: 'java', cpp: 'cpp', cc: 'cpp',
  c: 'c', h: 'c', html: 'html', css: 'css',
  json: 'json', md: 'markdown', sh: 'shell', xml: 'xml',
  sql: 'sql', rs: 'rust', go: 'go', rb: 'ruby', php: 'php',
};

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
  c:          { command: 'bash',    args: ['-c', 'gcc {filename} -o out -lm && ./out'], workingDir: 'project', requiresSave: true },
  cpp:        { command: 'bash',    args: ['-c', 'g++ {filename} -o out && ./out'], workingDir: 'project', requiresSave: true },
  html:       { command: 'preview', args: [], workingDir: 'project', requiresSave: true },
};
```

---

### A.3 Files That Need Cleanup Before Phase 1

| File | Issue | Action |
|------|-------|--------|
| `src/features/editor/components/CodeLine.tsx` | Legacy static line renderer — replaced by CM6 WebView. Causes confusion about which render path is active. | Move to `src/features/editor/legacy/` |
| `src/features/editor/components/SyntaxToken.tsx` | Legacy static token renderer — same issue. | Move to `src/features/editor/legacy/` |
| `src/services/SyncService.ts` | Scaffolded early — verify it is NOT making live network calls during Phase 1 testing. A sync error mid-editor test creates confusing noise. | Add `const SYNC_ENABLED = false;` guard at the top until Phase 7 |
| `src/screens/SettingsScreen.tsx` | Created early — verify it reads from `useSettingsStore` and not from hardcoded values. | Audit before Phase 1.2 |
| `android/app/google-services.json` | Firebase is configured. If Supabase Auth is also planned, running both creates token conflicts. | Decide now: Firebase Auth only, or Supabase Auth only. See A.4. |

---

### A.4 Auth Provider Decision (Must Resolve Before Phase 7, Preferably Now)

The project has `google-services.json` confirming Firebase is set up. The original roadmap planned Supabase. Using both for auth causes session token conflicts and doubles the maintenance surface.

**Option A — Firebase Auth only (recommended if Firebase is already working)**
- Keep `google-services.json`
- Use Firebase Auth for login
- Use `@supabase/supabase-js` for Storage only (project file sync)
- Remove any Supabase Auth imports from `AuthScreen.tsx` and `SyncService.ts`

**Option B — Supabase Auth only**
- Remove `google-services.json` and `@react-native-firebase` packages
- Use Supabase Auth for login
- Use Supabase Storage for file sync
- Simpler — one provider for everything

**Make this decision before Phase 7. Write it in a comment at the top of `src/screens/AuthScreen.tsx` so it is visible.**

---

### A.5 Missing Templates (Required Before Phase 4, Add Now)

`src/templates/` exists but is missing four of the six required language templates.

| Template file | Status | Phase needed |
|---------------|--------|--------------|
| `src/templates/blank.ts` | ✅ Exists | Phase 1.1 |
| `src/templates/python.ts` | ✅ Exists | Phase 1.1 — verify `main.py` is syntactically valid Python |
| `src/templates/node.ts` | ✅ Exists | Phase 1.1 — verify `index.js` + `package.json` are valid |
| `src/templates/reactNative.ts` | ✅ Exists | Bonus — keep |
| `src/templates/html.ts` | ❌ Missing | Phase 4.3 |
| `src/templates/java.ts` | ❌ Missing | Phase 4.4 |
| `src/templates/c.ts` | ❌ Missing | Phase 4.5 |
| `src/templates/cpp.ts` | ❌ Missing | Phase 4.5 |

Create the missing files now (even as stubs) so `src/templates/index.ts` can export a complete list and `NewProjectModal.tsx` can show all 6 language options from day one.

Minimum stub for `src/templates/html.ts`:
```typescript
export const htmlTemplate = {
  language: 'html',
  label: 'HTML / CSS / JS',
  files: [
    { name: 'index.html', content: '<!DOCTYPE html>\n<html lang="en">\n<head>\n  <meta charset="UTF-8" />\n  <title>My Page</title>\n  <link rel="stylesheet" href="style.css" />\n</head>\n<body>\n  <h1>Hello, World!</h1>\n  <script src="script.js"></script>\n</body>\n</html>\n' },
    { name: 'style.css', content: 'body {\n  font-family: sans-serif;\n  margin: 2rem;\n}\n' },
    { name: 'script.js', content: 'console.log("Hello from script.js");\n' },
  ],
};
```

---

### A.6 Phase-by-Phase Readiness Checklist

Use this before starting each phase to confirm the gate conditions are met.

#### Before Phase 1 (Stabilize MVP)
- [ ] `src/hooks/`, `src/types/`, `src/constants/` folders created and populated
- [ ] Shared types moved to `src/types/index.ts` — no duplicate inline type definitions in store files
- [ ] Constants extracted to `src/constants/index.ts` — no hardcoded paths or timeouts in service files
- [ ] `CodeLine.tsx` and `SyntaxToken.tsx` moved to `src/features/editor/legacy/`
- [ ] `SYNC_ENABLED = false` guard added to `SyncService.ts`
- [ ] `src/templates/html.ts`, `java.ts`, `c.ts`, `cpp.ts` created as stubs
- [ ] Auth provider decision documented in `AuthScreen.tsx`
- [ ] `npx tsc --noEmit` passes with zero errors
- [ ] App launches on physical Android device — all 5 tabs navigate without crash

#### Before Phase 2 (Real Terminal)
- [ ] Phase 1 acceptance criteria all pass
- [ ] `PistonService.ts` error handling verified (timeout, network failure, rate limit)
- [ ] `useTerminalEngine.ts` has abort/cancel support verified
- [ ] `ConsoleBottomSheet.tsx` shows Piston output correctly on physical device

#### Before Phase 3 (Browser Preview)
- [ ] Phase 2 acceptance criteria all pass
- [ ] `nova-engine` WebSocket terminal connection stable
- [ ] Python and JavaScript vertical slices both work end-to-end

#### Before Phase 4 (Language Support)
- [ ] Phase 3 acceptance criteria all pass OR preview is explicitly deferred
- [ ] All 6 language templates exist and are syntactically valid
- [ ] `cm6-build` has Java and C/C++ language packages installed and bundled

#### Before Phase 5 (Package Manager)
- [ ] Phase 4 Python and JavaScript support verified
- [ ] `nova-engine` exec API available for running npm/pip commands

#### Before Phase 6 (Git)
- [ ] Phase 1 filesystem is fully stable — no data loss bugs
- [ ] `GitService.ts` + `RNFSAdapter.ts` tested in isolation (not inside the full app)
- [ ] `git.init` and `git.status` confirmed working via a standalone test script

#### Before Phase 7 (Auth/Sync)
- [ ] Auth provider decision finalised and implemented
- [ ] All local-only features (Phases 1–6) are stable
- [ ] `SYNC_ENABLED` guard is in place and the flag can be safely turned on

#### Before Phase 8 (Backend)
- [ ] App-side features are feature-complete enough that the engine API contract is stable
- [ ] No planned app changes that would require breaking engine API changes

#### Before Phase 9 (Testing)
- [ ] All feature phases complete
- [ ] Manual Android testing checklist has been run at least once on a mid-range device

#### Before Phase 10 (Polish)
- [ ] Phase 9 critical-path tests pass
- [ ] No known data loss bugs
- [ ] No known crash-on-launch scenarios

---

### A.7 Overall Structural Score (Verified)

| Category | Score | Status |
|----------|-------|--------|
| Navigation | 10/10 | ✅ Complete — `RootNavigator`, `EditorStack`, typed params |
| State management | 9/10 | ✅ `useEditorStore`, `useProjectStore`, `useTerminalStore`, `useSettingsStore`, MMKV |
| File system service | 8/10 | ✅ `FileService` + `PermissionService` exist — audit error handling |
| Editor architecture | 9/10 | ✅ CM6 bundle, bridge, `WebViewEditor`, `useAutosave`, `useFileOpen` all present |
| Terminal / Piston | 8/10 | ✅ `PistonService` + `useTerminalEngine` + console components exist |
| Search | 7/10 | ⚠️ `SearchService` exists — verify `fuse.js` integration and batching |
| Git | 7/10 | ⚠️ `GitService` + `RNFSAdapter` scaffolded — validate adapter before wiring UI |
| Templates | 5/10 | ⚠️ Python + Node exist, 4 missing |
| Package manager | 4/10 | ⚠️ Full UI scaffolded, `PackageService` does not exist yet |
| Auth / Sync | 5/10 | ⚠️ Firebase present, provider decision pending |
| Infrastructure folders | 3/10 | ❌ `src/hooks/`, `src/types/`, `src/constants/` missing |
| Legacy cleanup | 6/10 | ⚠️ `CodeLine.tsx`, `SyntaxToken.tsx` still present |

**Revised completion estimate:** ~55–60% toward usable student MVP · ~40% toward production-quality cloud IDE

---

### A.8 The 7 Pre-Phase 1 Steps

Complete these in order. Estimated total time: 2–3 hours. Do not skip any step — each one prevents a class of bugs in Phase 1.

#### Step 1 — Create the three missing infrastructure folders
```bash
mkdir -p src/hooks src/types src/constants
touch src/hooks/index.ts
touch src/types/index.ts
touch src/constants/index.ts
touch src/constants/languageMap.ts
```
Then populate each file with the starter content from sections A.2 above.

#### Step 2 — Centralise shared types
Search all files in `src/store/`, `src/services/`, and `src/features/` for inline type definitions that match the types defined in section A.2. Delete the duplicates. Add `import type { FileEntry, OpenFile, ... } from '../../types';` at the top of each affected file.

```bash
# Quick search for inline type definitions to migrate
grep -rn "^export type FileEntry\|^export type OpenFile\|^export type ProjectMeta\|^export type TerminalEntry\|^export type PistonRuntime" src/
```

#### Step 3 — Extract all hardcoded constants
Search for hardcoded paths, URLs, and timeouts:
```bash
grep -rn "NovaCode/projects\|emkc.org\|30_000\|30000\|15_000\|15000" src/
```
Replace every match with the imported constant from `src/constants/index.ts`.

#### Step 4 — Decide on auth provider
Open `src/screens/AuthScreen.tsx`. Add a comment block at the very top:
```typescript
/**
 * AUTH PROVIDER: [FIREBASE | SUPABASE]
 * Decision date: YYYY-MM-DD
 * Reason: ...
 * If Firebase: uses @react-native-firebase/auth. google-services.json is in android/app/.
 * If Supabase: uses @supabase/supabase-js createClient. Remove google-services.json.
 */
```
Fill it in. Then make the code match the decision.

#### Step 5 — Archive legacy editor files
```bash
mkdir -p src/features/editor/legacy
mv src/features/editor/components/CodeLine.tsx src/features/editor/legacy/
mv src/features/editor/components/SyntaxToken.tsx src/features/editor/legacy/
```
Search for any imports of `CodeLine` or `SyntaxToken` in the codebase and remove them:
```bash
grep -rn "CodeLine\|SyntaxToken" src/
```

#### Step 6 — Add SYNC_ENABLED guard to SyncService
Open `src/services/SyncService.ts`. Add at the top of the file, before any class or function body:
```typescript
// Set to true only in Phase 7 when cloud sync is being wired up.
// Keeping this false prevents SyncService from making live network calls
// during Phase 1–6 testing and causing confusing noise in logs.
const SYNC_ENABLED = false;
```
Wrap every outbound network call in `if (!SYNC_ENABLED) return;`.

#### Step 7 — Add missing template stubs and verify existing ones
```bash
touch src/templates/html.ts src/templates/java.ts src/templates/c.ts src/templates/cpp.ts
```
Add the HTML stub from section A.5. Add minimal Java/C/C++ stubs following the same shape.

Then open `src/templates/python.ts` and `src/templates/node.ts` — manually copy the file content they produce and verify it is syntactically valid (paste into an online Python/Node validator if unsure).

Finally update `src/templates/index.ts` to export all 7 templates (including `reactNative`).

#### Step 8 — Final validation pass
```bash
# TypeScript must be clean before Phase 1 starts
npx tsc --noEmit

# App must launch on device
npx react-native run-android
```

If `tsc` reports errors: fix them before continuing. If the app crashes on launch: fix it before continuing. Do not start Phase 1 feature work with a broken baseline.

#### Commit checkpoint
```bash
git add .
git commit -m "chore: pre-phase-1 preparation — types, constants, hooks scaffolds, legacy cleanup, missing templates, auth decision"
```

---

*Nova Code Final Master Roadmap · v2.0*
*This file supersedes `NOVA_CODE_MASTER_ROADMAPCv2.md` and `NOVA_CODE_COMPLETION_PLAN.md`.*
*Delete both predecessor files after committing this one.*
