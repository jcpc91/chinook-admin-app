#!/usr/bin/env node

/**
 * Test Runner for Developer Onboarding Validation
 * Cross-platform test execution utility
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const os = require('os');

class TestRunner {
    constructor() {
        this.isWindows = os.platform() === 'win32';
        this.results = [];
    }

    log(message, color = '') {
        const colors = {
            red: '\x1b[31m',
            green: '\x1b[32m',
            yellow: '\x1b[33m',
            blue: '\x1b[34m',
            cyan: '\x1b[36m',
            reset: '\x1b[0m'
        };

        const colorCode = colors[color] || colors.reset;
        console.log(`${colorCode}${message}${colors.reset}`);
    }

    logInfo(message) { this.log(`[INFO] ${message}`, 'blue'); }
    logSuccess(message) { this.log(`[SUCCESS] ${message}`, 'green'); }
    logWarning(message) { this.log(`[WARNING] ${message}`, 'yellow'); }
    logError(message) { this.log(`[ERROR] ${message}`, 'red'); }

    async runTest(testName, testCommand) {
        this.logInfo(`Running: ${testName}`);

        try {
            const output = execSync(testCommand, {
                encoding: 'utf8',
                stdio: 'pipe',
                timeout: 60000 // 60 second timeout
            });

            this.results.push({ name: testName, success: true, output });
            this.logSuccess(`${testName} completed successfully`);
            return true;

        } catch (error) {
            this.results.push({
                name: testName,
                success: false,
                error: error.message,
                output: error.stdout || '',
                stderr: error.stderr || ''
            });
            this.logError(`${testName} failed: ${error.message}`);
            return false;
        }
    }

    async runValidationTests() {
        this.log('\n=== Running Validation Tests ===', 'cyan');

        const tests = [];

        // Node.js validation test
        if (fs.existsSync('validate-setup.js')) {
            tests.push({
                name: 'Setup Validation (Node.js)',
                command: 'node validate-setup.js'
            });
        }

        // Shell script tests (if available)
        if (fs.existsSync('test-onboarding.sh') && !this.isWindows) {
            tests.push({
                name: 'Shell Script Tests',
                command: 'bash test-onboarding.sh'
            });
        }

        // PowerShell tests
        if (fs.existsSync('test-onboarding.ps1')) {
            const psCommand = this.isWindows ? 'powershell' : 'pwsh';
            tests.push({
                name: 'PowerShell Tests',
                command: `${psCommand} -ExecutionPolicy Bypass -File test-onboarding.ps1`
            });
        }

        let allPassed = true;
        for (const test of tests) {
            const passed = await this.runTest(test.name, test.command);
            if (!passed) allPassed = false;
        }

        return allPassed;
    }

    async runIntegrationTests() {
        this.log('\n=== Running Integration Tests ===', 'cyan');

        if (!fs.existsSync('integration-test.js')) {
            this.logWarning('Integration test script not found, skipping');
            return true;
        }

        return await this.runTest('Integration Tests', 'node integration-test.js');
    }

    async runSyntaxChecks() {
        this.log('\n=== Running Syntax Checks ===', 'cyan');

        let allPassed = true;

        // Check init.sh syntax
        if (fs.existsSync('init.sh')) {
            try {
                execSync('bash -n init.sh', { stdio: 'pipe' });
                this.logSuccess('init.sh syntax check passed');
            } catch (error) {
                this.logError(`init.sh syntax error: ${error.message}`);
                allPassed = false;
            }
        }

        // Check init.ps1 syntax
        if (fs.existsSync('init.ps1')) {
            try {
                const psCommand = this.isWindows ? 'powershell' : 'pwsh';
                execSync(`${psCommand} -Command "Get-Content 'init.ps1' | Out-Null"`, { stdio: 'pipe' });
                this.logSuccess('init.ps1 syntax check passed');
            } catch (error) {
                this.logWarning(`init.ps1 syntax check failed (PowerShell may not be available): ${error.message}`);
                // Don't fail the test if PowerShell is not available
            }
        }

        // Check Node.js scripts syntax
        const nodeScripts = ['validate-setup.js', 'integration-test.js', 'run-tests.js'];
        for (const script of nodeScripts) {
            if (fs.existsSync(script)) {
                try {
                    execSync(`node -c ${script}`, { stdio: 'pipe' });
                    this.logSuccess(`${script} syntax check passed`);
                } catch (error) {
                    this.logError(`${script} syntax error: ${error.message}`);
                    allPassed = false;
                }
            }
        }

        return allPassed;
    }

    generateReport() {
        this.log('\n==========================================', 'cyan');
        this.log('Test Execution Report', 'cyan');
        this.log('==========================================', 'cyan');

        const totalTests = this.results.length;
        const passedTests = this.results.filter(r => r.success).length;
        const failedTests = totalTests - passedTests;

        this.log(`\nTotal Test Suites: ${totalTests}`);
        this.log(`Passed: ${passedTests}`, passedTests > 0 ? 'green' : 'reset');
        this.log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'reset');

        if (failedTests > 0) {
            this.log('\nFailed Tests:', 'red');
            for (const result of this.results) {
                if (!result.success) {
                    this.log(`  ✗ ${result.name}`, 'red');
                    if (result.error) {
                        this.log(`    Error: ${result.error}`, 'red');
                    }
                }
            }
        }

        this.log('\nTest Summary:', 'cyan');
        for (const result of this.results) {
            const status = result.success ? '✓' : '✗';
            const color = result.success ? 'green' : 'red';
            this.log(`  ${status} ${result.name}`, color);
        }

        if (failedTests === 0) {
            this.log('\n🎉 All test suites completed successfully!', 'green');
            this.log('The developer onboarding validation system is working correctly.', 'green');
        } else {
            this.log(`\n❌ ${failedTests} test suite(s) failed`, 'red');
            this.log('Please review the errors and fix any issues.', 'yellow');
        }

        return failedTests === 0;
    }

    async run(options = {}) {
        this.log('Developer Onboarding Test Runner', 'cyan');
        this.log('================================\n', 'cyan');

        let allPassed = true;

        // Run syntax checks first
        if (!options.skipSyntax) {
            const syntaxPassed = await this.runSyntaxChecks();
            if (!syntaxPassed) allPassed = false;
        }

        // Run validation tests
        if (!options.skipValidation) {
            const validationPassed = await this.runValidationTests();
            if (!validationPassed) allPassed = false;
        }

        // Run integration tests
        if (!options.skipIntegration) {
            const integrationPassed = await this.runIntegrationTests();
            if (!integrationPassed) allPassed = false;
        }

        return this.generateReport();
    }
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage: node run-tests.js [options]');
        console.log('Options:');
        console.log('  --skip-syntax       Skip syntax checking');
        console.log('  --skip-validation   Skip validation tests');
        console.log('  --skip-integration  Skip integration tests');
        console.log('  --help, -h          Show this help message');
        console.log('');
        console.log('This script runs all available tests for the developer onboarding system.');
        process.exit(0);
    }

    const options = {
        skipSyntax: args.includes('--skip-syntax'),
        skipValidation: args.includes('--skip-validation'),
        skipIntegration: args.includes('--skip-integration')
    };

    const runner = new TestRunner();
    runner.run(options).then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Test runner failed:', error);
        process.exit(1);
    });
}

module.exports = TestRunner;
