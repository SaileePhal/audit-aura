#!/usr/bin/env node

/**
 * Script to automatically replace hardcoded light theme classes with centralized theme variables
 * Usage: node apply-theme.js <file-path>
 * Example: node apply-theme.js src/pages/admin/Dashboard.tsx
 */

const fs = require('fs');
const path = require('path');

// Mapping of hardcoded classes to theme variables
const classReplacements = {
  // Background colors
  'bg-white': '${theme.bg.card}',
  'bg-gray-50': '${theme.bg.secondary}',
  'bg-gray-100': '${theme.bg.tertiary}',
  'hover:bg-gray-50': '${theme.bg.hover}',
  'hover:bg-white': '${theme.bg.hover}',
  
  // Text colors
  'text-gray-900': '${theme.text.primary}',
  'text-gray-800': '${theme.text.primary}',
  'text-gray-700': '${theme.text.secondary}',
  'text-gray-600': '${theme.text.secondary}',
  'text-gray-500': '${theme.text.tertiary}',
  'text-gray-400': '${theme.text.muted}',
  
  // Border colors
  'border-gray-200': '${theme.border.primary}',
  'border-gray-300': '${theme.border.secondary}',
  'hover:border-gray-400': '${theme.border.hover}',
  
  // Button colors (keep specific ones, replace generic)
  'bg-blue-600': 'bg-cyan-600',
  'hover:bg-blue-700': 'hover:bg-cyan-700',
  'text-blue-600': 'text-cyan-400',
  'text-blue-700': 'text-cyan-400',
};

function replaceClasses(content) {
  let modified = content;
  let replacementCount = 0;
  
  // Replace each hardcoded class
  for (const [oldClass, newClass] of Object.entries(classReplacements)) {
    const regex = new RegExp(`\\b${oldClass}\\b`, 'g');
    const matches = (modified.match(regex) || []).length;
    if (matches > 0) {
      modified = modified.replace(regex, newClass);
      replacementCount += matches;
      console.log(`  ✓ Replaced ${matches}x: ${oldClass} → ${newClass}`);
    }
  }
  
  return { modified, replacementCount };
}

function ensureThemeImport(content) {
  // Check if theme import already exists
  if (content.includes("import { theme } from '@/config/theme'")) {
    return content;
  }
  
  // Find the last import statement
  const importRegex = /^import .+ from .+;$/gm;
  const imports = content.match(importRegex);
  
  if (imports && imports.length > 0) {
    const lastImport = imports[imports.length - 1];
    const lastImportIndex = content.lastIndexOf(lastImport);
    const insertPosition = lastImportIndex + lastImport.length;
    
    // Insert theme import after last import
    const before = content.substring(0, insertPosition);
    const after = content.substring(insertPosition);
    
    return before + "\nimport { theme } from '@/config/theme';" + after;
  }
  
  return content;
}

function wrapClassNamesWithTemplate(content) {
  // Find className attributes and wrap them in template literals if they contain theme variables
  const classNameRegex = /className=["']([^"']*\$\{theme\.[^"']*["'])/g;
  
  let modified = content.replace(classNameRegex, (match, classes) => {
    // If already using template literal, skip
    if (match.includes('className={`')) {
      return match;
    }
    
    // Convert to template literal
    const cleanClasses = classes.replace(/["']$/, '');
    return `className={\`${cleanClasses}\`}`;
  });
  
  return modified;
}

function processFile(filePath) {
  console.log(`\n📝 Processing: ${filePath}`);
  
  if (!fs.existsSync(filePath)) {
    console.error(`❌ File not found: ${filePath}`);
    process.exit(1);
  }
  
  // Read file
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Step 1: Ensure theme import
  console.log('\n1️⃣ Checking theme import...');
  content = ensureThemeImport(content);
  if (content !== originalContent) {
    console.log('  ✓ Added theme import');
  } else {
    console.log('  ✓ Theme import already exists');
  }
  
  // Step 2: Replace hardcoded classes
  console.log('\n2️⃣ Replacing hardcoded classes...');
  const { modified, replacementCount } = replaceClasses(content);
  content = modified;
  
  if (replacementCount === 0) {
    console.log('  ℹ️ No hardcoded classes found to replace');
  } else {
    console.log(`  ✅ Total replacements: ${replacementCount}`);
  }
  
  // Step 3: Wrap className with template literals where needed
  console.log('\n3️⃣ Fixing className syntax...');
  content = wrapClassNamesWithTemplate(content);
  console.log('  ✓ Updated className syntax');
  
  // Write back to file
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`\n✅ Successfully updated: ${filePath}`);
    console.log(`📊 Total changes: ${replacementCount} class replacements`);
  } else {
    console.log(`\n✨ No changes needed for: ${filePath}`);
  }
}

function processDirectory(dirPath) {
  console.log(`\n📁 Processing directory: ${dirPath}`);
  
  if (!fs.existsSync(dirPath)) {
    console.error(`❌ Directory not found: ${dirPath}`);
    process.exit(1);
  }
  
  const files = fs.readdirSync(dirPath);
  const tsxFiles = files.filter(f => f.endsWith('.tsx'));
  
  console.log(`Found ${tsxFiles.length} .tsx files`);
  
  tsxFiles.forEach(file => {
    const filePath = path.join(dirPath, file);
    processFile(filePath);
  });
  
  console.log(`\n✅ Processed ${tsxFiles.length} files in ${dirPath}`);
}

// Main execution
const args = process.argv.slice(2);

if (args.length === 0) {
  console.log(`
🎨 Theme Application Script
===========================

Usage:
  node apply-theme.js <file-or-directory>

Examples:
  node apply-theme.js src/pages/admin/Dashboard.tsx
  node apply-theme.js src/pages/admin
  node apply-theme.js src/pages

This script will:
1. Add theme import if missing
2. Replace hardcoded light theme classes with theme variables
3. Fix className syntax for template literals
  `);
  process.exit(0);
}

const target = args[0];
const targetPath = path.resolve(target);

if (fs.statSync(targetPath).isDirectory()) {
  processDirectory(targetPath);
} else {
  processFile(targetPath);
}

console.log('\n🎉 Done!\n');