# Theme Application Script

Automated script to convert hardcoded light theme classes to centralized theme variables.

## Usage

### Single File
```bash
cd frontend
node apply-theme.js src/pages/admin/Dashboard.tsx
```

### Entire Directory
```bash
cd frontend
node apply-theme.js src/pages/admin
node apply-theme.js src/pages/user
node apply-theme.js src/pages/auditor
node apply-theme.js src/pages/security
```

### All Pages at Once
```bash
cd frontend
node apply-theme.js src/pages
```

## What It Does

1. **Adds Theme Import** - Ensures `import { theme } from '@/config/theme';` exists
2. **Replaces Classes** - Converts hardcoded classes to theme variables:
   - `bg-white` → `${theme.bg.card}`
   - `text-gray-900` → `${theme.text.primary}`
   - `border-gray-200` → `${theme.border.primary}`
   - And many more...
3. **Fixes Syntax** - Wraps className in template literals when needed

## Class Mappings

### Backgrounds
- `bg-white` → `${theme.bg.card}`
- `bg-gray-50` → `${theme.bg.secondary}`
- `bg-gray-100` → `${theme.bg.tertiary}`
- `hover:bg-gray-50` → `${theme.bg.hover}`

### Text
- `text-gray-900`, `text-gray-800` → `${theme.text.primary}`
- `text-gray-700`, `text-gray-600` → `${theme.text.secondary}`
- `text-gray-500` → `${theme.text.tertiary}`
- `text-gray-400` → `${theme.text.muted}`

### Borders
- `border-gray-200` → `${theme.border.primary}`
- `border-gray-300` → `${theme.border.secondary}`
- `hover:border-gray-400` → `${theme.border.hover}`

### Accent Colors
- `bg-blue-600` → `bg-cyan-600`
- `text-blue-600` → `text-cyan-400`

## Example

**Before:**
```tsx
<div className="bg-white rounded-lg p-4">
  <h1 className="text-gray-900 font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

**After:**
```tsx
<div className={`${theme.bg.card} rounded-lg p-4`}>
  <h1 className={`${theme.text.primary} font-bold`}>Title</h1>
  <p className={theme.text.secondary}>Description</p>
</div>
```

## Notes

- The script is safe to run multiple times (idempotent)
- It preserves all other classes and formatting
- Creates a backup is not needed - use git to revert if needed
- Review changes before committing

## Quick Start

Apply theme to all admin pages:
```bash
cd frontend
node apply-theme.js src/pages/admin