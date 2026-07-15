# Svelte 5 Runes Review Checklist

## Priority Order

### CRITICAL PRIORITY (Check First):
1. **$props() usage** - Must appear ONLY ONCE per component to destructure ALL props
   - ❌ WRONG: `let { prop1 } = $props(); let { prop2 } = $props();`
   - ✅ CORRECT: `let { prop1, prop2 } = $props();`

### HIGH PRIORITY (Check Second):
2. **Event handlers** - Use `onclick`, `onkeydown` (no colon) not `on:click`
3. **Conditional rendering** - Use `{#if}` blocks, NOT `{condition && <element>}`
4. **Import statements** - NO import runes from 'svelte'
   - ❌ WRONG: `import { $state } from 'svelte';`
   - ✅ CORRECT: `let count = $state(0);`

## Svelte 5 Runes Reference
- `$state(value)` - for local state
- `$derived(() => expression)` - for computed values
- `$effect(() => {})` - for side effects
- `$props()` - for component props (ONCE only)
- `$bindable()` - for two-way binding props

## Official Documentation
- https://svelte.dev/docs/svelte/runes
- https://svelte.dev/docs/svelte/what-are-runes
- https://svelte.dev/docs/svelte/$state
- https://svelte.dev/docs/svelte/$derived
- https://svelte.dev/docs/svelte/$effect
- https://svelte.dev/docs/svelte/$props
- https://svelte.dev/docs/svelte/$bindable

## Review Order
1. Check $props() usage (critical - catches runtime errors)
2. Check event handler syntax
3. Check conditional rendering syntax
4. Validate other rune usage

## Idiomatic Svelte 5 Code Guidelines

Use the following guidelines for writing idiomatic Svelte 5 code, referencing ZipLookup.svelte as a model:

### 1. State Management
- Use `$state()` for local reactive state
- Keep state objects focused and minimal
- Don't unnecessarily wrap props in `$state()` if they're used directly

### 2. Props & Bindings
- Use `$props()` once to destructure all props
- Leverage Svelte's two-way binding (`bind:value={prop}`) instead of manual event handling when appropriate
- Avoid `$bindable()` unless you specifically need to pass binding to parent components

### 3. Event Handling
- Use inline handlers when simple: `oninput={(e) => {handler(e.target.value)}}`
- Create separate functions for complex logic
- Pass values directly to handlers rather than DOM events when possible

### 4. Lifecycle Management
- Use `onMount()` for initialization logic
- Perform initial data loading in `onMount` when props are available

### 5. Reactivity
- Leverage Svelte's automatic reactivity
- Directly assign to reactive variables: `zipCode = val` rather than nested state updates
- Use simple assignments rather than complex state mutations

### 6. Component Structure
- Keep components focused on a single responsibility
- Use simple, readable code that takes advantage of Svelte's reactivity
- Avoid unnecessary complexity or over-engineering

### 7. Reference Component
**DO NOT modify** `@src/lib/Components/Forms/ZipLookup.svelte` - use it as the reference for idiomatic Svelte 5 code.

This component demonstrates:
- Proper use of `bind:value` for two-way binding
- Simple state structure with `$state()`
- Direct prop usage instead of complex state wrapping
- Appropriate use of `onMount` for initialization
- Clean, readable code structure

## HTML5 Semantics (Always Check)
- Every `<label>` needs `for` attribute
- Every `<a>` and `<button>` needs `title` attribute
- All `<a>` tags need `target="_parent"`

## Styling and UI Guidelines
- Do not rewrite any classes in CSS (except for RotaryContextMenu.svelte which is allowed to have custom styles)
- Always use Bootstrap 5.3.8 and bootstrap-icons 1.13.1
- Do not add styles to components (except for RotaryContextMenu.svelte which is allowed to have custom styles)
- Do not hard code data in components
- All CRUD actions should have icons

## Special Exception
- RotaryContextMenu.svelte is the only component allowed to have custom CSS styles due to its complex geometric positioning requirements

## Communication Pattern
- Always use callback props for child-to-parent communication, not Svelte's event dispatching system
- Child components should accept callback functions as props (e.g., `onZipChange`, `onLocationChange`)
- Child components should call these callback functions when values change
- Parent components handle the callbacks to update their state
- This ensures consistent data flow throughout the application

## Global State Management
- Global state is stored in src/lib/rf.svelte.ts as rfState
- To use rfState in Svelte components, import it as: `import { rfState } from './lib/rf.svelte'`
- Note: When importing rfState in .svelte files, do not include the .ts extension
- rfState contains global application state including API host, current user, work orders, contacts, etc.
- Use rfState.api for backend API calls (e.g., rfState.api.rfCityStateFromZip)

## Work Orders and WebSocket Integration
- rfState.workOrders serves as the single source of truth for work order data
- Work order updates are handled via WebSocket connections for real-time synchronization
- All work order view components (WorkOrdersView.svelte, WorkOrdersListView.svelte) should use rfState.workOrders as their primary data source
- Never directly modify rfState.workOrders in view components - all changes come through WebSocket events
- When implementing search/filter functionality, create local state to avoid modifying the global rfState.workOrders
- WebSocket events automatically update rfState.workOrders, which triggers reactive updates in all subscribed components
- Always test WebSocket synchronization with multiple browser instances to ensure real-time updates work correctly

## RIPFLO Project Specifics
- Global JS in @public/rfjs.js (set IP on installation)
- Global state in @src/lib/rf.svelte.ts (rfState)
- Backend format: `{data: {tablename:[{}], error:{message:''}}}`
- Error check: `message === null` means no error