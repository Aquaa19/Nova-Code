# 📱 Nova Code — Manual Verification & Device Compatibility Survey

Use this document to log manual testing runs across various Android emulators (AVDs) and physical devices.

---

## 📋 Quick Setup for AVD Testing on Windows
1. **Metro Bundler**: Run `npm start` in your Windows host console.
2. **Launch Emulator**: Open the `android` folder in Android Studio and start your target device from the **Device Manager**.
3. **Backend Engine**: Ensure the backend engine is running on the host, and set the **Engine URL** inside the app's settings to `ws://10.0.2.2:3000` (so the emulator loops back to the Windows host).

---

# 🗂️ Test Run Logs

## 📱 Test Run 1: High-End / Flagship Phone (e.g., Pixel 8 Pro / Galaxy S24 Ultra)

### ⚙️ Hardware & OS Profile
- **Device Model / AVD Profile Name:** AVD Google Pixel 8 Pro
- **Screen Resolution & Size:** [ ] Small (~5") | [ ] Medium (~6") | [x] Large (~6.7"+) | [ ] Tablet (8"+)
- **Aspect Ratio:** [ ] 16:9 | [ ] 18:9 | [x] 19.5:9 (with Notch/Punch-hole) | [ ] Other
- **Android OS Version:** [ ] Android 10 (API 29) | [ ] Android 11/12 (API 30/31) | [ ] Android 13 (API 33) | [x] Android 14+ (API 34+)
- **Test Environment:** [x] Emulator (AVD) | [ ] Physical Device
- **Tester Name:** ________________________
- **Date Tested:** 2026-05-23
- **Overall Status:** [ ] PASSED | [ ] PASSED WITH MINOR ISSUES | [ ] FAILED

### 🧪 Feature Verification Matrix

| Category / Feature | Test Description | Status (Pass/Fail) | Notes / Observations |
| :--- | :--- | :---: | :--- |
| **1. App Launch & Styling** | | | |
| Launch Speed | App boots to Home screen in under 3 seconds. | `[ ]` | |
| Theme Rendering | Glassmorphic, Light, and Dark themes render without visual bugs. | `[ ]` | |
| Safe Area & Notches | UI respects status bar, camera punch-holes, and system nav bars. | `[ ]` | |
| Touch Target Size | Main buttons and tab bars are easy to tap (min 44x44dp targets). | `[ ]` | |
| **2. Project & File System** | | | |
| Template Instantiation | All templates (Python, JS, HTML, Java, C, C++) create files correctly. | `[ ]` | |
| Folder Tree Navigation | Explorer renders nested directories without lag or overflow. | `[ ]` | |
| File CRUD Operations | Creating, renaming, and deleting files/folders updates immediately. | `[ ]` | |
| Error Toast/Modal | Invalid names (e.g. using `\0` or `/`) show helpful error messages. | `[ ]` | |
| **3. Code Editor (CM6 WebView)** | | | |
| Editor Load Time | Webview initializes and loads a 100-line file in < 2 seconds. | `[ ]` | |
| Typing Performance | Continuous typing feels instant with zero keyboard lag. | `[ ]` | |
| Syntax Highlighting | Correct colors applied instantly when switching between languages. | `[ ]` | |
| Undo / Redo | State changes correctly when triggering undo/redo. | `[ ]` | |
| Large File Guard | Files > 50KB show a loading spinner. Files > 500KB trigger a warning. | `[ ]` | |
| Binary File Block | Opening binary files (e.g. `.png`) is blocked; placeholder displays. | `[ ]` | |
| **4. Keyboard Accessory Bar** | | | |
| Bar Positioning | Accessory bar stays glued to the top of the soft keyboard when open. | `[ ]` | |
| Input Injection | Tapping punctuation/operators inserts them instantly at cursor. | `[ ]` | |
| Language Comments | Tapping comment button inserts `#` or `//` depending on active file. | `[ ]` | |
| Tab Space Insertion | Tapping Tab inserts correct settings-defined spaces (e.g. 2 or 4). | `[ ]` | |
| **5. WS Terminal & PTY** | | | |
| WS Connection | Connects to `ws://10.0.2.2:3000` session. | `[ ]` | |
| Terminal Fit | xterm.js scales perfectly to fill the panel without horizontal clip. | `[ ]` | |
| Interactive Stdin | Typing inside the terminal triggers response in interactive shell. | `[ ]` | |
| Signal Keys (Ctrl+C) | Keyboard helper shortcuts (Ctrl+C, Ctrl+D) terminate active processes. | `[ ]` | |
| Reconnect Banner | Disconnecting/offline modes trigger a visible reconnect toast/button. | `[ ]` | |
| **6. Browser Preview** | | | |
| Static HTML Preview | Running HTML project launches browser preview pointing to `index.html`. | `[ ]` | |
| Live Reload | Modifying HTML/CSS and saving triggers reload in < 2 seconds. | `[ ]` | |
| Scroll Preservation | Reloading preserves the vertical scroll position in the preview. | `[ ]` | |
| Console Forwarding | JavaScript console errors in preview are redirected to debug drawer. | `[ ]` | |
| **7. Package Manager** | | | |
| Package Search | Searching npm/pip queries registry and outputs result cards. | `[ ]` | |
| Exec Log Streams | Installing package shows real-time progress logs in progress card. | `[ ]` | |
| Disk Sync | Package updates are written to `package.json` or `requirements.txt`. | `[ ]` | |
| **8. Git Integration** | | | |
| Local Git CRUD | Git init, status check, adding files, and committing work locally. | `[ ]` | |
| Diff & History | Commit history lists and changes render correctly in Git tab. | `[ ]` | |
| **9. Interruption & Lifecycle** | | | |
| App Backgrounding | Leaving app to Home and returning restores active file & state. | `[ ]` | |
| Phone Call Simulation | Simulating incoming call overlay doesn't crash WebView or drop state. | `[ ]` | |
| OS Process Termination | Running `adb shell am kill com.novacode` recovers state cleanly. | `[ ]` | |
| Unsaved Changes Guard | Closing a modified file or app triggers "Save / Discard / Cancel". | `[ ]` | |

### 📝 Bugs, Visual Issues, & Detailed Observations (High-End Phone)
1. 
2. 

---

## 📱 Test Run 2: Mid-Range / Medium Phone (e.g., Pixel 5 / Galaxy A54)

### ⚙️ Hardware & OS Profile
- **Device Model / AVD Profile Name:** AVD Google Pixel 5
- **Screen Resolution & Size:** [ ] Small (~5") | [x] Medium (~6") | [ ] Large (~6.7"+) | [ ] Tablet (8"+)
- **Aspect Ratio:** [ ] 16:9 | [ ] 18:9 | [x] 19.5:9 (with Notch/Punch-hole) | [ ] Other
- **Android OS Version:** [ ] Android 10 (API 29) | [ ] Android 11/12 (API 30/31) | [x] Android 13 (API 33) | [ ] Android 14+ (API 34+)
- **Test Environment:** [x] Emulator (AVD) | [ ] Physical Device
- **Tester Name:** ________________________
- **Date Tested:** 2026-05-23
- **Overall Status:** [ ] PASSED | [ ] PASSED WITH MINOR ISSUES | [ ] FAILED

### 🧪 Feature Verification Matrix

| Category / Feature | Test Description | Status (Pass/Fail) | Notes / Observations |
| :--- | :--- | :---: | :--- |
| **1. App Launch & Styling** | | | |
| Launch Speed | App boots to Home screen in under 3 seconds. | `[ ]` | |
| Theme Rendering | Glassmorphic, Light, and Dark themes render without visual bugs. | `[ ]` | |
| Safe Area & Notches | UI respects status bar, camera punch-holes, and system nav bars. | `[ ]` | |
| Touch Target Size | Main buttons and tab bars are easy to tap (min 44x44dp targets). | `[ ]` | |
| **2. Project & File System** | | | |
| Template Instantiation | All templates (Python, JS, HTML, Java, C, C++) create files correctly. | `[ ]` | |
| Folder Tree Navigation | Explorer renders nested directories without lag or overflow. | `[ ]` | |
| File CRUD Operations | Creating, renaming, and deleting files/folders updates immediately. | `[ ]` | |
| Error Toast/Modal | Invalid names (e.g. using `\0` or `/`) show helpful error messages. | `[ ]` | |
| **3. Code Editor (CM6 WebView)** | | | |
| Editor Load Time | Webview initializes and loads a 100-line file in < 2 seconds. | `[ ]` | |
| Typing Performance | Continuous typing feels instant with zero keyboard lag. | `[ ]` | |
| Syntax Highlighting | Correct colors applied instantly when switching between languages. | `[ ]` | |
| Undo / Redo | State changes correctly when triggering undo/redo. | `[ ]` | |
| Large File Guard | Files > 50KB show a loading spinner. Files > 500KB trigger a warning. | `[ ]` | |
| Binary File Block | Opening binary files (e.g. `.png`) is blocked; placeholder displays. | `[ ]` | |
| **4. Keyboard Accessory Bar** | | | |
| Bar Positioning | Accessory bar stays glued to the top of the soft keyboard when open. | `[ ]` | |
| Input Injection | Tapping punctuation/operators inserts them instantly at cursor. | `[ ]` | |
| Language Comments | Tapping comment button inserts `#` or `//` depending on active file. | `[ ]` | |
| Tab Space Insertion | Tapping Tab inserts correct settings-defined spaces (e.g. 2 or 4). | `[ ]` | |
| **5. WS Terminal & PTY** | | | |
| WS Connection | Connects to `ws://10.0.2.2:3000` session. | `[ ]` | |
| Terminal Fit | xterm.js scales perfectly to fill the panel without horizontal clip. | `[ ]` | |
| Interactive Stdin | Typing inside the terminal triggers response in interactive shell. | `[ ]` | |
| Signal Keys (Ctrl+C) | Keyboard helper shortcuts (Ctrl+C, Ctrl+D) terminate active processes. | `[ ]` | |
| Reconnect Banner | Disconnecting/offline modes trigger a visible reconnect toast/button. | `[ ]` | |
| **6. Browser Preview** | | | |
| Static HTML Preview | Running HTML project launches browser preview pointing to `index.html`. | `[ ]` | |
| Live Reload | Modifying HTML/CSS and saving triggers reload in < 2 seconds. | `[ ]` | |
| Scroll Preservation | Reloading preserves the vertical scroll position in the preview. | `[ ]` | |
| Console Forwarding | JavaScript console errors in preview are redirected to debug drawer. | `[ ]` | |
| **7. Package Manager** | | | |
| Package Search | Searching npm/pip queries registry and outputs result cards. | `[ ]` | |
| Exec Log Streams | Installing package shows real-time progress logs in progress card. | `[ ]` | |
| Disk Sync | Package updates are written to `package.json` or `requirements.txt`. | `[ ]` | |
| **8. Git Integration** | | | |
| Local Git CRUD | Git init, status check, adding files, and committing work locally. | `[ ]` | |
| Diff & History | Commit history lists and changes render correctly in Git tab. | `[ ]` | |
| **9. Interruption & Lifecycle** | | | |
| App Backgrounding | Leaving app to Home and returning restores active file & state. | `[ ]` | |
| Phone Call Simulation | Simulating incoming call overlay doesn't crash WebView or drop state. | `[ ]` | |
| OS Process Termination | Running `adb shell am kill com.novacode` recovers state cleanly. | `[ ]` | |
| Unsaved Changes Guard | Closing a modified file or app triggers "Save / Discard / Cancel". | `[ ]` | |

### 📝 Bugs, Visual Issues, & Detailed Observations (Mid-Range Phone)
1. 
2. 

---

## 📱 Test Run 3: Small Phone (e.g., Generic 5" / Android One)

### ⚙️ Hardware & OS Profile
- **Device Model / AVD Profile Name:** AVD Nexus 5 (Small)
- **Screen Resolution & Size:** [x] Small (~5") | [ ] Medium (~6") | [ ] Large (~6.7"+) | [ ] Tablet (8"+)
- **Aspect Ratio:** [x] 16:9 | [ ] 18:9 | [ ] 19.5:9 | [ ] Other
- **Android OS Version:** [x] Android 10 (API 29) | [ ] Android 11/12 (API 30/31) | [ ] Android 13 (API 33) | [ ] Android 14+ (API 34+)
- **Test Environment:** [x] Emulator (AVD) | [ ] Physical Device
- **Tester Name:** ________________________
- **Date Tested:** 2026-05-23
- **Overall Status:** [ ] PASSED | [ ] PASSED WITH MINOR ISSUES | [ ] FAILED

### 🧪 Feature Verification Matrix

| Category / Feature | Test Description | Status (Pass/Fail) | Notes / Observations |
| :--- | :--- | :---: | :--- |
| **1. App Launch & Styling** | | | |
| Launch Speed | App boots to Home screen in under 3 seconds. | `[ ]` | |
| Theme Rendering | Glassmorphic, Light, and Dark themes render without visual bugs. | `[ ]` | |
| Safe Area & Notches | UI respects status bar, camera punch-holes, and system nav bars. | `[ ]` | |
| Touch Target Size | Main buttons and tab bars are easy to tap (min 44x44dp targets). | `[ ]` | |
| **2. Project & File System** | | | |
| Template Instantiation | All templates (Python, JS, HTML, Java, C, C++) create files correctly. | `[ ]` | |
| Folder Tree Navigation | Explorer renders nested directories without lag or overflow. | `[ ]` | |
| File CRUD Operations | Creating, renaming, and deleting files/folders updates immediately. | `[ ]` | |
| Error Toast/Modal | Invalid names (e.g. using `\0` or `/`) show helpful error messages. | `[ ]` | |
| **3. Code Editor (CM6 WebView)** | | | |
| Editor Load Time | Webview initializes and loads a 100-line file in < 2 seconds. | `[ ]` | |
| Typing Performance | Continuous typing feels instant with zero keyboard lag. | `[ ]` | |
| Syntax Highlighting | Correct colors applied instantly when switching between languages. | `[ ]` | |
| Undo / Redo | State changes correctly when triggering undo/redo. | `[ ]` | |
| Large File Guard | Files > 50KB show a loading spinner. Files > 500KB trigger a warning. | `[ ]` | |
| Binary File Block | Opening binary files (e.g. `.png`) is blocked; placeholder displays. | `[ ]` | |
| **4. Keyboard Accessory Bar** | | | |
| Bar Positioning | Accessory bar stays glued to the top of the soft keyboard when open. | `[ ]` | |
| Input Injection | Tapping punctuation/operators inserts them instantly at cursor. | `[ ]` | |
| Language Comments | Tapping comment button inserts `#` or `//` depending on active file. | `[ ]` | |
| Tab Space Insertion | Tapping Tab inserts correct settings-defined spaces (e.g. 2 or 4). | `[ ]` | |
| **5. WS Terminal & PTY** | | | |
| WS Connection | Connects to `ws://10.0.2.2:3000` session. | `[ ]` | |
| Terminal Fit | xterm.js scales perfectly to fill the panel without horizontal clip. | `[ ]` | |
| Interactive Stdin | Typing inside the terminal triggers response in interactive shell. | `[ ]` | |
| Signal Keys (Ctrl+C) | Keyboard helper shortcuts (Ctrl+C, Ctrl+D) terminate active processes. | `[ ]` | |
| Reconnect Banner | Disconnecting/offline modes trigger a visible reconnect toast/button. | `[ ]` | |
| **6. Browser Preview** | | | |
| Static HTML Preview | Running HTML project launches browser preview pointing to `index.html`. | `[ ]` | |
| Live Reload | Modifying HTML/CSS and saving triggers reload in < 2 seconds. | `[ ]` | |
| Scroll Preservation | Reloading preserves the vertical scroll position in the preview. | `[ ]` | |
| Console Forwarding | JavaScript console errors in preview are redirected to debug drawer. | `[ ]` | |
| **7. Package Manager** | | | |
| Package Search | Searching npm/pip queries registry and outputs result cards. | `[ ]` | |
| Exec Log Streams | Installing package shows real-time progress logs in progress card. | `[ ]` | |
| Disk Sync | Package updates are written to `package.json` or `requirements.txt`. | `[ ]` | |
| **8. Git Integration** | | | |
| Local Git CRUD | Git init, status check, adding files, and committing work locally. | `[ ]` | |
| Diff & History | Commit history lists and changes render correctly in Git tab. | `[ ]` | |
| **9. Interruption & Lifecycle** | | | |
| App Backgrounding | Leaving app to Home and returning restores active file & state. | `[ ]` | |
| Phone Call Simulation | Simulating incoming call overlay doesn't crash WebView or drop state. | `[ ]` | |
| OS Process Termination | Running `adb shell am kill com.novacode` recovers state cleanly. | `[ ]` | |
| Unsaved Changes Guard | Closing a modified file or app triggers "Save / Discard / Cancel". | `[ ]` | |

### 📝 Bugs, Visual Issues, & Detailed Observations (Small Phone)
1. *Check for text truncation or compressed layouts on smaller screen margins.*
2. 

---

## 📱 Test Run 4: Android Tablet (e.g., Pixel Tablet / Galaxy Tab)

### ⚙️ Hardware & OS Profile
- **Device Model / AVD Profile Name:** AVD Google Pixel Tablet
- **Screen Resolution & Size:** [ ] Small (~5") | [ ] Medium (~6") | [ ] Large (~6.7"+) | [x] Tablet (8"+)
- **Aspect Ratio:** [ ] 16:9 | [ ] 18:9 | [ ] 19.5:9 | [x] 16:10 / 4:3 (Tablet Landscape/Portrait)
- **Android OS Version:** [ ] Android 10 (API 29) | [ ] Android 11/12 (API 30/31) | [x] Android 13 (API 33) | [ ] Android 14+ (API 34+)
- **Test Environment:** [x] Emulator (AVD) | [ ] Physical Device
- **Tester Name:** ________________________
- **Date Tested:** 2026-05-23
- **Overall Status:** [ ] PASSED | [ ] PASSED WITH MINOR ISSUES | [ ] FAILED

### 🧪 Feature Verification Matrix

| Category / Feature | Test Description | Status (Pass/Fail) | Notes / Observations |
| :--- | :--- | :---: | :--- |
| **1. App Launch & Styling** | | | |
| Launch Speed | App boots to Home screen in under 3 seconds. | `[ ]` | |
| Theme Rendering | Glassmorphic, Light, and Dark themes render without visual bugs. | `[ ]` | |
| Safe Area & Notches | UI respects status bar, camera punch-holes, and system nav bars. | `[ ]` | |
| Touch Target Size | Main buttons and tab bars are easy to tap (min 44x44dp targets). | `[ ]` | |
| **2. Project & File System** | | | |
| Template Instantiation | All templates (Python, JS, HTML, Java, C, C++) create files correctly. | `[ ]` | |
| Folder Tree Navigation | Explorer renders nested directories without lag or overflow. | `[ ]` | |
| File CRUD Operations | Creating, renaming, and deleting files/folders updates immediately. | `[ ]` | |
| Error Toast/Modal | Invalid names (e.g. using `\0` or `/`) show helpful error messages. | `[ ]` | |
| **3. Code Editor (CM6 WebView)** | | | |
| Editor Load Time | Webview initializes and loads a 100-line file in < 2 seconds. | `[ ]` | |
| Typing Performance | Continuous typing feels instant with zero keyboard lag. | `[ ]` | |
| Syntax Highlighting | Correct colors applied instantly when switching between languages. | `[ ]` | |
| Undo / Redo | State changes correctly when triggering undo/redo. | `[ ]` | |
| Large File Guard | Files > 50KB show a loading spinner. Files > 500KB trigger a warning. | `[ ]` | |
| Binary File Block | Opening binary files (e.g. `.png`) is blocked; placeholder displays. | `[ ]` | |
| **4. Keyboard Accessory Bar** | | | |
| Bar Positioning | Accessory bar stays glued to the top of the soft keyboard when open. | `[ ]` | |
| Input Injection | Tapping punctuation/operators inserts them instantly at cursor. | `[ ]` | |
| Language Comments | Tapping comment button inserts `#` or `//` depending on active file. | `[ ]` | |
| Tab Space Insertion | Tapping Tab inserts correct settings-defined spaces (e.g. 2 or 4). | `[ ]` | |
| **5. WS Terminal & PTY** | | | |
| WS Connection | Connects to `ws://10.0.2.2:3000` session. | `[ ]` | |
| Terminal Fit | xterm.js scales perfectly to fill the panel without horizontal clip. | `[ ]` | |
| Interactive Stdin | Typing inside the terminal triggers response in interactive shell. | `[ ]` | |
| Signal Keys (Ctrl+C) | Keyboard helper shortcuts (Ctrl+C, Ctrl+D) terminate active processes. | `[ ]` | |
| Reconnect Banner | Disconnecting/offline modes trigger a visible reconnect toast/button. | `[ ]` | |
| **6. Browser Preview** | | | |
| Static HTML Preview | Running HTML project launches browser preview pointing to `index.html`. | `[ ]` | |
| Live Reload | Modifying HTML/CSS and saving triggers reload in < 2 seconds. | `[ ]` | |
| Scroll Preservation | Reloading preserves the vertical scroll position in the preview. | `[ ]` | |
| Console Forwarding | JavaScript console errors in preview are redirected to debug drawer. | `[ ]` | |
| **7. Package Manager** | | | |
| Package Search | Searching npm/pip queries registry and outputs result cards. | `[ ]` | |
| Exec Log Streams | Installing package shows real-time progress logs in progress card. | `[ ]` | |
| Disk Sync | Package updates are written to `package.json` or `requirements.txt`. | `[ ]` | |
| **8. Git Integration** | | | |
| Local Git CRUD | Git init, status check, adding files, and committing work locally. | `[ ]` | |
| Diff & History | Commit history lists and changes render correctly in Git tab. | `[ ]` | |
| **9. Interruption & Lifecycle** | | | |
| App Backgrounding | Leaving app to Home and returning restores active file & state. | `[ ]` | |
| Phone Call Simulation | Simulating incoming call overlay doesn't crash WebView or drop state. | `[ ]` | |
| OS Process Termination | Running `adb shell am kill com.novacode` recovers state cleanly. | `[ ]` | |
| Unsaved Changes Guard | Closing a modified file or app triggers "Save / Discard / Cancel". | `[ ]` | |

### 📝 Bugs, Visual Issues, & Detailed Observations (Tablet)
1. *Check for scaling issues in landscape mode.*
2. 

---

## 📱 Test Run 5: Low-End / Budget Device (e.g., 2GB RAM / Android Go)

### ⚙️ Hardware & OS Profile
- **Device Model / AVD Profile Name:** AVD Generic Low-End Device
- **Screen Resolution & Size:** [ ] Small (~5") | [x] Medium (~6") | [ ] Large (~6.7"+) | [ ] Tablet (8"+)
- **Aspect Ratio:** [ ] 16:9 | [x] 18:9 | [ ] 19.5:9 | [ ] Other
- **Android OS Version:** [ ] Android 10 (API 29) | [x] Android 11/12 (API 30/31) | [ ] Android 13 (API 33) | [ ] Android 14+ (API 34+)
- **Test Environment:** [x] Emulator (AVD) | [ ] Physical Device
- **Tester Name:** ________________________
- **Date Tested:** 2026-05-23
- **Overall Status:** [ ] PASSED | [ ] PASSED WITH MINOR ISSUES | [ ] FAILED

### 🧪 Feature Verification Matrix

| Category / Feature | Test Description | Status (Pass/Fail) | Notes / Observations |
| :--- | :--- | :---: | :--- |
| **1. App Launch & Styling** | | | |
| Launch Speed | App boots to Home screen in under 3 seconds. | `[ ]` | |
| Theme Rendering | Glassmorphic, Light, and Dark themes render without visual bugs. | `[ ]` | |
| Safe Area & Notches | UI respects status bar, camera punch-holes, and system nav bars. | `[ ]` | |
| Touch Target Size | Main buttons and tab bars are easy to tap (min 44x44dp targets). | `[ ]` | |
| **2. Project & File System** | | | |
| Template Instantiation | All templates (Python, JS, HTML, Java, C, C++) create files correctly. | `[ ]` | |
| Folder Tree Navigation | Explorer renders nested directories without lag or overflow. | `[ ]` | |
| File CRUD Operations | Creating, renaming, and deleting files/folders updates immediately. | `[ ]` | |
| Error Toast/Modal | Invalid names (e.g. using `\0` or `/`) show helpful error messages. | `[ ]` | |
| **3. Code Editor (CM6 WebView)** | | | |
| Editor Load Time | Webview initializes and loads a 100-line file in < 2 seconds. | `[ ]` | |
| Typing Performance | Continuous typing feels instant with zero keyboard lag. | `[ ]` | |
| Syntax Highlighting | Correct colors applied instantly when switching between languages. | `[ ]` | |
| Undo / Redo | State changes correctly when triggering undo/redo. | `[ ]` | |
| Large File Guard | Files > 50KB show a loading spinner. Files > 500KB trigger a warning. | `[ ]` | |
| Binary File Block | Opening binary files (e.g. `.png`) is blocked; placeholder displays. | `[ ]` | |
| **4. Keyboard Accessory Bar** | | | |
| Bar Positioning | Accessory bar stays glued to the top of the soft keyboard when open. | `[ ]` | |
| Input Injection | Tapping punctuation/operators inserts them instantly at cursor. | `[ ]` | |
| Language Comments | Tapping comment button inserts `#` or `//` depending on active file. | `[ ]` | |
| Tab Space Insertion | Tapping Tab inserts correct settings-defined spaces (e.g. 2 or 4). | `[ ]` | |
| **5. WS Terminal & PTY** | | | |
| WS Connection | Connects to `ws://10.0.2.2:3000` session. | `[ ]` | |
| Terminal Fit | xterm.js scales perfectly to fill the panel without horizontal clip. | `[ ]` | |
| Interactive Stdin | Typing inside the terminal triggers response in interactive shell. | `[ ]` | |
| Signal Keys (Ctrl+C) | Keyboard helper shortcuts (Ctrl+C, Ctrl+D) terminate active processes. | `[ ]` | |
| Reconnect Banner | Disconnecting/offline modes trigger a visible reconnect toast/button. | `[ ]` | |
| **6. Browser Preview** | | | |
| Static HTML Preview | Running HTML project launches browser preview pointing to `index.html`. | `[ ]` | |
| Live Reload | Modifying HTML/CSS and saving triggers reload in < 2 seconds. | `[ ]` | |
| Scroll Preservation | Reloading preserves the vertical scroll position in the preview. | `[ ]` | |
| Console Forwarding | JavaScript console errors in preview are redirected to debug drawer. | `[ ]` | |
| **7. Package Manager** | | | |
| Package Search | Searching npm/pip queries registry and outputs result cards. | `[ ]` | |
| Exec Log Streams | Installing package shows real-time progress logs in progress card. | `[ ]` | |
| Disk Sync | Package updates are written to `package.json` or `requirements.txt`. | `[ ]` | |
| **8. Git Integration** | | | |
| Local Git CRUD | Git init, status check, adding files, and committing work locally. | `[ ]` | |
| Diff & History | Commit history lists and changes render correctly in Git tab. | `[ ]` | |
| **9. Interruption & Lifecycle** | | | |
| App Backgrounding | Leaving app to Home and returning restores active file & state. | `[ ]` | |
| Phone Call Simulation | Simulating incoming call overlay doesn't crash WebView or drop state. | `[ ]` | |
| OS Process Termination | Running `adb shell am kill com.novacode` recovers state cleanly. | `[ ]` | |
| Unsaved Changes Guard | Closing a modified file or app triggers "Save / Discard / Cancel". | `[ ]` | |

### 📝 Bugs, Visual Issues, & Detailed Observations (Low-End Device)
1. *Monitor for performance stutter when switching themes or loading large projects.*
2. 
