# 🚀 RIPFLO Project: Svelte 5 Native Architecture
**Status:** Mandatory for all Qwen-Coder-Plus sessions.
**Context:** Native Svelte 5 Project (Sept 2025). No Legacy Support.

## 📚 Knowledge Base & Docs
- **Svelte 5 Runes:** [https://svelte.dev/docs/svelte/llms.txt](https://svelte.dev/docs/svelte/llms.txt)
- **SvelteKit Specs:** [https://svelte.dev/docs/kit/llms.txt](https://svelte.dev/docs/kit/llms.txt)
- **Full Reference:** [https://svelte.dev/docs/llms-full.txt](https://svelte.dev/docs/llms-full.txt)

---

## 🛠️ CRITICAL PRIORITY: Svelte 5 Review Checklist

### 1. The Single $props() Rule
- **Rule:** Destructure ALL props in exactly **ONE** call.
- ❌ **WRONG:** let { a } = $props(); 
  let { b } = $props();
- ✅ **CORRECT:** let { a, b, ...rest } = $props();

### 2. Event & Template Syntax
- **Events:** Use native attributes (`onclick`, `onkeydown`). **NO colons** (`on:click`).
- **Conditional Rendering:** Use `{#if}` blocks. **DO NOT** use `{condition && <div>}`.
- **Imports:** Never import runes (like `$state`) from 'svelte'. They are globally available.

### 3. Nesting & Logic Rules
- **HTML Nesting:** No interactive nesting (e.g., no `<button>` inside a `<button>` or `<a>`).
- **Template Logic:** If a condition requires grouping parentheses `{#if a && (b || c)}`, extract it to a `$derived` script variable.

---

## 🏗️ RIPFLO Idiomatic Guidelines

### 1. State Management
- **Local:** Use `let x = $state(val)`. Standard `let x = val` is **static/non-reactive**.
- **Derived:** Use `let y = $derived(x * 2)`.
- **Global:** Import `rfState` from `./lib/rf.svelte` (use relative paths, no extensions in .svelte files).

### 2. Component Structure
- **Reference Model:** Refer to `@src/lib/Components/Forms/ZipLookup.svelte` as the "Gold Standard".
- **Communication:** Use callback props (e.g., `onZipChange`) for child-to-parent data flow. No event dispatchers.
- **WebSocket:** Use `rfState.workOrders` as the single source of truth. Mutations come through background WebSocket events.

### 3. HTML5 & UI Standards
- **Semantics:** - `<label>` needs `for` matching an input `id`.
  - `<a>` and `<button>` need a `title` attribute.
  - `<a>` must use `target="_parent"`.
- **Styling:** Bootstrap 5.3.8 + Icons 1.13.1. **NO** custom `<style>` blocks (Exception: `RotaryContextMenu.svelte`).
- **Icons:** All CRUD actions must have icons.

---

## 🔄 Backend & Integration
- **Global JS:** `@public/rfjs.js`.
- **Format:** `{data: {tablename:[{}, ...], error:{message:''}}}`.
- **Error Check:** `message === null` or `message === ''` indicates success.