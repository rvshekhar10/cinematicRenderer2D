#!/usr/bin/env node

/**
 * Pre-publish validation script
 * Checks if the package is ready to be published to NPM
 */

import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkmark() {
  return `${colors.green}✓${colors.reset}`;
}

function crossmark() {
  return `${colors.red}✗${colors.reset}`;
}

function warning() {
  return `${colors.yellow}⚠${colors.reset}`;
}

let hasErrors = false;
let hasWarnings = false;

log('\n🔍 Pre-Publish Validation Check\n', 'cyan');

// Check 1: package.json exists and is valid
log('Checking package.json...', 'blue');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check required fields
  const requiredFields = ['name', 'version', 'description', 'main', 'types', 'license'];
  const missingFields = requiredFields.filter(field => !packageJson[field]);
  
  if (missingFields.length > 0) {
    log(`${crossmark()} Missing required fields: ${missingFields.join(', ')}`, 'red');
    hasErrors = true;
  } else {
    log(`${checkmark()} All required fields present`, 'green');
  }
  
  // Check author
  if (packageJson.author === 'Your Name') {
    log(`${warning()} Author field needs to be updated`, 'yellow');
    hasWarnings = true;
  } else {
    log(`${checkmark()} Author field set`, 'green');
  }
  
  // Check repository URL
  if (packageJson.repository && packageJson.repository.url.includes('yourusername')) {
    log(`${warning()} Repository URL contains 'yourusername' - needs to be updated`, 'yellow');
    hasWarnings = true;
  } else if (packageJson.repository) {
    log(`${checkmark()} Repository URL set`, 'green');
  }
  
  // Check files field
  if (!packageJson.files || packageJson.files.length === 0) {
    log(`${warning()} No 'files' field specified - all files will be published`, 'yellow');
    hasWarnings = true;
  } else {
    log(`${checkmark()} Files field configured: ${packageJson.files.join(', ')}`, 'green');
  }
  
} catch (error) {
  log(`${crossmark()} Error reading package.json: ${error.message}`, 'red');
  hasErrors = true;
}

// Check 2: README exists
log('\nChecking README.md...', 'blue');
if (fs.existsSync('README.md')) {
  const readme = fs.readFileSync('README.md', 'utf8');
  if (readme.length < 100) {
    log(`${warning()} README is very short (${readme.length} chars)`, 'yellow');
    hasWarnings = true;
  } else {
    log(`${checkmark()} README.md exists (${readme.length} chars)`, 'green');
  }
} else {
  log(`${crossmark()} README.md not found`, 'red');
  hasErrors = true;
}

// Check 3: LICENSE exists
log('\nChecking LICENSE...', 'blue');
if (fs.existsSync('LICENSE')) {
  log(`${checkmark()} LICENSE file exists`, 'green');
} else {
  log(`${warning()} LICENSE file not found`, 'yellow');
  hasWarnings = true;
}

// Check 4: dist folder exists
log('\nChecking build output...', 'blue');
if (fs.existsSync('dist')) {
  const distFiles = fs.readdirSync('dist');
  if (distFiles.length === 0) {
    log(`${crossmark()} dist/ folder is empty - run 'npm run build'`, 'red');
    hasErrors = true;
  } else {
    log(`${checkmark()} dist/ folder exists with ${distFiles.length} files`, 'green');
    
    // Check for essential files
    const essentialFiles = ['index.js', 'index.cjs', 'index.d.ts'];
    const missingFiles = essentialFiles.filter(file => !distFiles.includes(file));
    
    if (missingFiles.length > 0) {
      log(`${warning()} Missing essential files in dist/: ${missingFiles.join(', ')}`, 'yellow');
      hasWarnings = true;
    } else {
      log(`${checkmark()} All essential files present in dist/`, 'green');
    }
  }
} else {
  log(`${crossmark()} dist/ folder not found - run 'npm run build'`, 'red');
  hasErrors = true;
}

// Check 5: NPM login status
log('\nChecking NPM authentication...', 'blue');
try {
  const npmUser = execSync('npm whoami', { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] }).trim();
  log(`${checkmark()} Logged in as: ${npmUser}`, 'green');
} catch (error) {
  log(`${crossmark()} Not logged in to NPM - run 'npm login'`, 'red');
  hasErrors = true;
}

// Check 6: Git status
log('\nChecking git status...', 'blue');
try {
  const gitStatus = execSync('git status --porcelain', { encoding: 'utf8' });
  if (gitStatus.trim().length > 0) {
    log(`${warning()} Uncommitted changes detected:`, 'yellow');
    console.log(gitStatus);
    hasWarnings = true;
  } else {
    log(`${checkmark()} Working directory clean`, 'green');
  }
} catch (error) {
  log(`${warning()} Not a git repository or git not available`, 'yellow');
  hasWarnings = true;
}

// Check 7: Test if package name is available
log('\nChecking package name availability...', 'blue');
try {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  const packageName = packageJson.name;
  
  try {
    execSync(`npm view ${packageName}`, { encoding: 'utf8', stdio: ['pipe', 'pipe', 'pipe'] });
    log(`${warning()} Package '${packageName}' already exists on NPM`, 'yellow');
    log(`   This is OK if you're updating an existing package`, 'yellow');
    hasWarnings = true;
  } catch (error) {
    log(`${checkmark()} Package name '${packageName}' is available`, 'green');
  }
} catch (error) {
  log(`${warning()} Could not check package name availability`, 'yellow');
}

// Summary
log('\n' + '='.repeat(50), 'cyan');
if (hasErrors) {
  log('\n❌ VALIDATION FAILED', 'red');
  log('Please fix the errors above before publishing.\n', 'red');
  process.exit(1);
} else if (hasWarnings) {
  log('\n⚠️  VALIDATION PASSED WITH WARNINGS', 'yellow');
  log('Review the warnings above before publishing.\n', 'yellow');
  log('To publish anyway, run: npm publish\n', 'cyan');
  process.exit(0);
} else {
  log('\n✅ ALL CHECKS PASSED', 'green');
  log('Your package is ready to publish!\n', 'green');
  log('To publish, run: npm publish\n', 'cyan');
  process.exit(0);
}
