# Theme Configuration Guide

## Overview
AegisAI uses a centralized theme system that allows you to switch between light and dark modes by changing a single variable.

## Quick Start

### Changing the Theme
Edit `frontend/src/config/theme.ts` and change the `THEME_MODE` constant:

```typescript
// For dark mode (default)
export const THEME_MODE: 'light' | 'dark' = 'dark';

// For light mode
export const THEME_MODE: 'light' | 'dark' = 'light';
```

After changing, rebuild the frontend:
```bash
docker-compose up -d --build frontend
```

## Using Theme in Components

### Import the theme
```typescript
import { theme, isDarkMode } from '@/config/theme';
```

### Apply theme classes
```typescript
// Background
<div className={theme.bg.primary}>
<div className={theme.bg.card}>

// Text
<h1 className={theme.text.primary}>
<p className={theme.text.secondary}>

// Borders
<div className={`border ${theme.border.primary}`}>

// Buttons
<button className={theme.button.primary}>
<button className={theme.button.secondary}>

// Status/Severity
<div className={theme.status.critical.bg}>
<div className={theme.status.success.bg}>

// Tables
<thead className={theme.table.header}>
<tr className={theme.table.rowHover}>

// Inputs
<input className={`${theme.input.bg} ${theme.input.border} ${theme.input.text}`} />
```

## Theme Categories

### Backgrounds (`theme.bg`)
- `primary` - Main background color
- `secondary` - Secondary background
- `tertiary` - Tertiary background
- `card` - Card/panel background (uses glassmorphism in dark mode)
- `hover` - Hover state background

### Text (`theme.text`)
- `primary` - Main text color
- `secondary` - Secondary text
- `tertiary` - Tertiary text
- `muted` - Muted/disabled text

### Borders (`theme.border`)
- `primary` - Main border color
- `secondary` - Secondary border
- `hover` - Hover state border

### Inputs (`theme.input`)
- `bg` - Input background
- `border` - Input border
- `text` - Input text color
- `placeholder` - Placeholder text
- `focus` - Focus state (border + ring)

### Buttons (`theme.button`)
- `primary` - Primary action button
- `secondary` - Secondary button
- `ghost` - Ghost/transparent button

### Status (`theme.status`)
Each status has `bg`, `border`, and `text`:
- `critical` - Critical/error state
- `high` - High priority
- `medium` - Medium priority
- `low` - Low priority
- `success` - Success state
- `info` - Info state

### Tables (`theme.table`)
- `header` - Table header
- `row` - Table row
- `rowHover` - Row hover state
- `border` - Table borders

### Charts (`theme.chart`)
- `grid` - Chart grid lines
- `text` - Chart text/labels
- `tooltip.bg` - Tooltip background
- `tooltip.border` - Tooltip border
- `tooltip.text` - Tooltip text

## Example Component

```typescript
import { theme } from '@/config/theme';

export const MyComponent = () => {
  return (
    <div className={`${theme.bg.card} ${theme.border.primary} border rounded-lg p-6`}>
      <h2 className={`${theme.text.primary} text-xl font-bold mb-4`}>
        Title
      </h2>
      <p className={theme.text.secondary}>
        Description text
      </p>
      <button className={`${theme.button.primary} px-4 py-2 rounded-lg`}>
        Action
      </button>
    </div>
  );
};
```

## Dark Mode Features

When `THEME_MODE = 'dark'`:
- Glassmorphism effects on cards
- Neon accent colors (cyan, purple, pink)
- Gradient text effects
- Custom dark scrollbar
- Backdrop blur effects
- Pulse animations on live indicators

## Light Mode Features

When `THEME_MODE = 'light'`:
- Clean white backgrounds
- Standard gray text colors
- Blue accent colors
- Traditional borders
- Standard scrollbar

## Best Practices

1. **Always use theme variables** instead of hardcoded colors
2. **Test both themes** when adding new components
3. **Use semantic names** from the theme object
4. **Combine with Tailwind** utilities for spacing, sizing, etc.
5. **Keep glassmorphism** effects for dark mode only

## Troubleshooting

**Theme not updating?**
- Rebuild the frontend container: `docker-compose up -d --build frontend`
- Clear browser cache
- Check that you're importing from `@/config/theme`

**Colors look wrong?**
- Verify `THEME_MODE` is set correctly
- Check that you're using theme variables, not hardcoded classes
- Ensure Tailwind config includes dark theme colors

## Future Enhancements

- [ ] Add theme toggle in UI
- [ ] Persist theme preference in localStorage
- [ ] Add more theme variants (high contrast, etc.)
- [ ] Support custom color schemes