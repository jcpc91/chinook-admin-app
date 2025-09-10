# Developer Onboarding Testing Guide

This document describes the testing utilities created for validating the developer onboarding scripts (`init.sh` and `init.ps1`).

## Overview

The testing suite consists of several utilities that validate different aspects of the onboarding process:

- **Validation Tests**: Verify that the setup was completed correctly
- **Integration Tests**: Test the actual execution of initialization scripts
- **Cross-Platform Tests**: Ensure compatibility across different operating systems
- **Cleanup Utilities**: Reset the environment for testing

## Test Files

### Core Test Scripts

| File | Purpose | Platform |
|------|---------|----------|
| `validate-setup.js` | Validates completed setup | Cross-platform |
| `integration-test.js` | Tests script execution in isolated environments | Cross-platform |
| `test-onboarding.sh` | Comprehensive test suite for Unix/Linux | Unix/Linux/macOS |
| `test-onboarding.ps1` | Comprehensive test suite for Windows | Windows/PowerShell |
| `run-tests.js` | Master test runner | Cross-platform |

### Documentation

| File | Purpose |
|------|---------|
| `TESTING.md` | This documentation file |

## Quick Start

### Run All Tests

```bash
# Cross-platform test runner
node run-tests.js

# Or run individual test suites
node validate-setup.js
node integration-test.js
```

### Platform-Specific Tests

#### Unix/Linux/macOS
```bash
# Make executable (if needed)
chmod +x test-onboarding.sh

# Run tests
./test-onboarding.sh

# Run with options
./test-onboarding.sh --no-cleanup
./test-onboarding.sh --cleanup-only
```

#### Windows/PowerShell
```powershell
# Run tests
.\test-onboarding.ps1

# Run with options
.\test-onboarding.ps1 -NoCleanup
.\test-onboarding.ps1 -CleanupOnly
```

## Test Categories

### 1. Setup Validation Tests

**Purpose**: Verify that the onboarding setup completed successfully

**What it checks**:
- ✅ Environment files (`.env`) created for all services
- ✅ Correct PORT assignments (auth=3000, app=3001, catalogos=3002)
- ✅ Microservices environment with dummy values
- ✅ Database directory structure
- ✅ Required npm scripts in package.json
- ✅ Dependencies installed (node_modules)

**Usage**:
```bash
node validate-setup.js
```

### 2. Integration Tests

**Purpose**: Test the actual execution of initialization scripts in isolated environments

**What it tests**:
- ✅ Script syntax validation
- ✅ End-to-end script execution
- ✅ File creation verification
- ✅ Cross-platform compatibility
- ✅ Error handling

**Usage**:
```bash
node integration-test.js
```

### 3. Cross-Platform Tests

**Purpose**: Ensure scripts work correctly on different operating systems

**What it validates**:
- ✅ Script file existence and permissions
- ✅ Template file availability
- ✅ Platform-specific command compatibility
- ✅ File path handling
- ✅ Environment variable processing

### 4. Cleanup Utilities

**Purpose**: Reset the environment for testing

**What it cleans**:
- 🧹 Test `.env` files
- 🧹 Test database files
- 🧹 Temporary directories
- 🧹 Test artifacts

## Test Options and Flags

### validate-setup.js
```bash
node validate-setup.js --help    # Show help
```

### integration-test.js
```bash
node integration-test.js --help  # Show help
```

### test-onboarding.sh
```bash
./test-onboarding.sh --help           # Show help
./test-onboarding.sh --cleanup-only   # Only run cleanup
./test-onboarding.sh --no-cleanup     # Don't cleanup after tests
```

### test-onboarding.ps1
```powershell
.\test-onboarding.ps1 -Help          # Show help
.\test-onboarding.ps1 -CleanupOnly   # Only run cleanup
.\test-onboarding.ps1 -NoCleanup     # Don't cleanup after tests
```

### run-tests.js
```bash
node run-tests.js --help              # Show help
node run-tests.js --skip-syntax       # Skip syntax checking
node run-tests.js --skip-validation   # Skip validation tests
node run-tests.js --skip-integration  # Skip integration tests
```

## Test Scenarios

### Scenario 1: Fresh Repository Setup
Tests the complete onboarding process from a clean state:

1. Clone repository
2. Run initialization script
3. Validate all components are set up correctly

### Scenario 2: Partial Existing Setup
Tests script behavior when some components already exist:

1. Create some `.env` files manually
2. Run initialization script
3. Verify existing files are preserved and missing files are created

### Scenario 3: Permission Issues
Tests error handling for file system permission problems:

1. Simulate restricted file permissions
2. Run initialization script
3. Verify appropriate error messages and graceful handling

### Scenario 4: Missing Dependencies
Tests behavior when required tools are not available:

1. Simulate missing npm or other dependencies
2. Run initialization script
3. Verify clear error messages and guidance

## Expected Test Results

### Successful Test Run
```
[SUCCESS] Cross-platform compatibility check passed
[SUCCESS] Environment file creation validation passed
[SUCCESS] Database migration verification passed
[SUCCESS] Script execution simulation passed
[SUCCESS] init.sh integration test passed
[SUCCESS] init.ps1 integration test passed
[SUCCESS] Environment file validation passed

🎉 All tests passed!
```

### Failed Test Example
```
[ERROR] Environment file creation validation failed
[ERROR] app/.env missing correct PORT configuration

❌ 1 test(s) failed
```

## Troubleshooting

### Common Issues

#### PowerShell Execution Policy (Windows)
```powershell
# If you get execution policy errors
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

#### Permission Denied (Unix/Linux)
```bash
# Make scripts executable
chmod +x test-onboarding.sh
chmod +x init.sh
```

#### Node.js Not Found
```bash
# Ensure Node.js is installed and in PATH
node --version
npm --version
```

#### Missing PowerShell (Unix/Linux)
```bash
# Install PowerShell Core (optional)
# Ubuntu/Debian
sudo apt-get install -y powershell

# macOS
brew install --cask powershell
```

### Test Environment Issues

#### Cleanup Not Working
```bash
# Manual cleanup
rm -f app/.env auth/.env catalogos/.env microservices/.env
rm -f .db/test_*.sqlite3
```

#### Temporary Directory Issues
```bash
# Check temp directory permissions
ls -la /tmp/
# Or use alternative temp directory
export TMPDIR=/path/to/writable/directory
```

## Continuous Integration

### GitHub Actions Example
```yaml
name: Test Onboarding Scripts
on: [push, pull_request]
jobs:
  test:
    runs-on: ${{ matrix.os }}
    strategy:
      matrix:
        os: [ubuntu-latest, windows-latest, macos-latest]
    steps:
      - uses: actions/checkout@v2
      - uses: actions/setup-node@v2
        with:
          node-version: '16'
      - name: Run tests
        run: node run-tests.js
```

### Local Pre-commit Hook
```bash
#!/bin/sh
# .git/hooks/pre-commit
node run-tests.js --skip-integration
```

## Contributing

When modifying the onboarding scripts, always:

1. Run the full test suite: `node run-tests.js`
2. Test on multiple platforms if possible
3. Update tests if adding new functionality
4. Ensure all tests pass before committing

## Test Coverage

The test suite covers:

- ✅ **Requirements 1.4**: Validation of complete setup process
- ✅ **Requirements 2.5**: Environment file creation and validation
- ✅ **Requirements 4.5**: Database migration verification
- ✅ **Requirements 6.1-6.5**: Cross-platform compatibility testing

## Support

If you encounter issues with the testing utilities:

1. Check this documentation for common solutions
2. Run tests with verbose output for debugging
3. Verify your environment meets the requirements
4. Check the specific error messages for guidance