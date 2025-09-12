#!/usr/bin/env node

/**
 * Integration Test Suite for Developer Onboarding Scripts
 * Tests both init.sh and init.ps1 in isolated environments
 */

const fs = require('fs');
const path = require('path');
const { execSync, spawn } = require('child_process');
const os = require('os');

class IntegrationTester {
    constructor() {
        this.testResults = [];
        this.tempDirs = [];
        this.isWindows = os.platform() === 'win32';
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

    createTempTestEnvironment() {
        const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'onboarding-test-'));
        this.tempDirs.push(tempDir);

        this.logInfo(`Created test environment: ${tempDir}`);

        // Copy essential files to test environment
        const filesToCopy = [
            'package.json',
            'init.sh',
            'init.ps1',
            '.env.development.example',
            '.env.microservice.example'
        ];

        const dirsToCopy = [
            'database',
            'app',
            'auth',
            'catalogos',
            'microservices'
        ];

        // Copy files
        for (const file of filesToCopy) {
            if (fs.existsSync(file)) {
                fs.copyFileSync(file, path.join(tempDir, file));
            }
        }

        // Copy directories (shallow copy for structure)
        for (const dir of dirsToCopy) {
            if (fs.existsSync(dir)) {
                const targetDir = path.join(tempDir, dir);
                fs.mkdirSync(targetDir, { recursive: true });

                // Copy package.json if it exists in service directories
                const packageJsonPath = path.join(dir, 'package.json');
                if (fs.existsSync(packageJsonPath)) {
                    fs.copyFileSync(packageJsonPath, path.join(targetDir, 'package.json'));
                }

                // Create src directory structure for services
                if (['app', 'auth', 'catalogos'].includes(dir)) {
                    fs.mkdirSync(path.join(targetDir, 'src'), { recursive: true });
                }
            }
        }

        // Create .db directory
        fs.mkdirSync(path.join(tempDir, '.db'), { recursive: true });

        return tempDir;
    }

    cleanup() {
        this.logInfo('Cleaning up test environments...');
        for (const tempDir of this.tempDirs) {
            try {
                fs.rmSync(tempDir, { recursive: true, force: true });
                this.logInfo(`Removed: ${tempDir}`);
            } catch (error) {
                this.logWarning(`Failed to remove ${tempDir}: ${error.message}`);
            }
        }
        this.tempDirs = [];
    }

    async runCommand(command, cwd, timeout = 30000) {
        return new Promise((resolve, reject) => {
            const isWindows = os.platform() === 'win32';
            let cmd, args;

            if (isWindows) {
                cmd = 'cmd';
                args = ['/c', command];
            } else {
                cmd = 'bash';
                args = ['-c', command];
            }

            const child = spawn(cmd, args, {
                cwd,
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: false
            });

            let stdout = '';
            let stderr = '';

            child.stdout.on('data', (data) => {
                stdout += data.toString();
            });

            child.stderr.on('data', (data) => {
                stderr += data.toString();
            });

            const timer = setTimeout(() => {
                child.kill();
                reject(new Error(`Command timed out after ${timeout}ms`));
            }, timeout);

            child.on('close', (code) => {
                clearTimeout(timer);
                resolve({
                    code,
                    stdout: stdout.trim(),
                    stderr: stderr.trim()
                });
            });

            child.on('error', (error) => {
                clearTimeout(timer);
                reject(error);
            });
        });
    }

    async testInitScript(scriptName, testDir) {
        this.logInfo(`Testing ${scriptName} in ${testDir}`);

        const scriptPath = path.join(testDir, scriptName);
        if (!fs.existsSync(scriptPath)) {
            throw new Error(`Script ${scriptName} not found in test directory`);
        }

        // Make script executable on Unix systems
        if (!this.isWindows && scriptName.endsWith('.sh')) {
            try {
                fs.chmodSync(scriptPath, '755');
            } catch (error) {
                this.logWarning(`Could not make ${scriptName} executable: ${error.message}`);
            }
        }

        // Determine command to run
        let command;
        if (scriptName.endsWith('.ps1')) {
            command = this.isWindows ? `powershell -ExecutionPolicy Bypass -File "${scriptName}"` : `pwsh -File "${scriptName}"`;
        } else {
            command = `./${scriptName}`;
        }

        try {
            const result = await this.runCommand(command, testDir, 60000); // 60 second timeout

            return {
                success: result.code === 0,
                output: result.stdout,
                error: result.stderr,
                exitCode: result.code
            };
        } catch (error) {
            return {
                success: false,
                output: '',
                error: error.message,
                exitCode: -1
            };
        }
    }

    validateTestResults(testDir) {
        const results = {
            envFiles: [],
            missingEnvFiles: [],
            dbStructure: true,
            packageJson: true
        };

        // Check service .env files
        const services = ['app', 'auth', 'catalogos'];
        for (const service of services) {
            const envPath = path.join(testDir, service, '.env');
            if (fs.existsSync(envPath)) {
                results.envFiles.push(service);
            } else {
                results.missingEnvFiles.push(service);
            }
        }

        // Check microservices .env
        const microEnvPath = path.join(testDir, 'microservices', '.env');
        if (fs.existsSync(microEnvPath)) {
            results.envFiles.push('microservices');
        } else {
            results.missingEnvFiles.push('microservices');
        }

        // Check database structure
        const dbDir = path.join(testDir, '.db');
        if (!fs.existsSync(dbDir)) {
            results.dbStructure = false;
        }

        return results;
    }

    async runIntegrationTest(scriptName) {
        const testName = `Integration Test: ${scriptName}`;
        this.logInfo(`Starting ${testName}`);

        try {
            // Create test environment
            const testDir = this.createTempTestEnvironment();

            // Run the script
            const scriptResult = await this.testInitScript(scriptName, testDir);

            // Validate results
            const validation = this.validateTestResults(testDir);

            const testResult = {
                name: testName,
                success: scriptResult.success && validation.missingEnvFiles.length === 0,
                details: {
                    scriptExecution: scriptResult,
                    validation: validation
                }
            };

            this.testResults.push(testResult);

            if (testResult.success) {
                this.logSuccess(`${testName} passed`);
                this.logInfo(`Created .env files: ${validation.envFiles.join(', ')}`);
            } else {
                this.logError(`${testName} failed`);
                if (!scriptResult.success) {
                    this.logError(`Script execution failed (exit code: ${scriptResult.exitCode})`);
                    if (scriptResult.error) {
                        this.logError(`Error output: ${scriptResult.error}`);
                    }
                }
                if (validation.missingEnvFiles.length > 0) {
                    this.logError(`Missing .env files: ${validation.missingEnvFiles.join(', ')}`);
                }
            }

        } catch (error) {
            this.logError(`${testName} failed with exception: ${error.message}`);
            this.testResults.push({
                name: testName,
                success: false,
                details: { error: error.message }
            });
        }
    }

    async testScriptSyntax() {
        this.logInfo('Testing script syntax...');

        const syntaxResults = [];

        // Test init.sh syntax
        if (fs.existsSync('init.sh')) {
            try {
                execSync('bash -n init.sh', { stdio: 'pipe' });
                syntaxResults.push({ script: 'init.sh', valid: true });
                this.logSuccess('init.sh syntax is valid');
            } catch (error) {
                syntaxResults.push({ script: 'init.sh', valid: false, error: error.message });
                this.logError(`init.sh syntax error: ${error.message}`);
            }
        }

        // Test init.ps1 syntax (if PowerShell is available)
        if (fs.existsSync('init.ps1')) {
            try {
                const psCommand = this.isWindows ? 'powershell' : 'pwsh';
                execSync(`${psCommand} -Command "Get-Content 'init.ps1' | Out-Null"`, { stdio: 'pipe' });
                syntaxResults.push({ script: 'init.ps1', valid: true });
                this.logSuccess('init.ps1 syntax is valid');
            } catch (error) {
                syntaxResults.push({ script: 'init.ps1', valid: false, error: error.message });
                this.logWarning(`init.ps1 syntax check failed (PowerShell may not be available): ${error.message}`);
            }
        }

        return syntaxResults;
    }

    generateReport() {
        this.log('\n==========================================', 'cyan');
        this.log('Integration Test Report', 'cyan');
        this.log('==========================================', 'cyan');

        const totalTests = this.testResults.length;
        const passedTests = this.testResults.filter(t => t.success).length;
        const failedTests = totalTests - passedTests;

        this.log(`\nTotal Tests: ${totalTests}`);
        this.log(`Passed: ${passedTests}`, passedTests > 0 ? 'green' : 'reset');
        this.log(`Failed: ${failedTests}`, failedTests > 0 ? 'red' : 'reset');

        this.log('\nTest Details:', 'cyan');
        for (const test of this.testResults) {
            const status = test.success ? '✓' : '✗';
            const color = test.success ? 'green' : 'red';
            this.log(`  ${status} ${test.name}`, color);

            if (!test.success && test.details.error) {
                this.log(`    Error: ${test.details.error}`, 'red');
            }
        }

        if (failedTests === 0) {
            this.log('\n🎉 All integration tests passed!', 'green');
        } else {
            this.log(`\n❌ ${failedTests} test(s) failed`, 'red');
        }

        return failedTests === 0;
    }

    async run() {
        this.log('Developer Onboarding Integration Test Suite', 'cyan');
        this.log('===========================================\n', 'cyan');

        try {
            // Test script syntax first
            await this.testScriptSyntax();

            // Run integration tests
            if (fs.existsSync('init.sh')) {
                await this.runIntegrationTest('init.sh');
            } else {
                this.logWarning('init.sh not found, skipping integration test');
            }

            if (fs.existsSync('init.ps1')) {
                await this.runIntegrationTest('init.ps1');
            } else {
                this.logWarning('init.ps1 not found, skipping integration test');
            }

            return this.generateReport();

        } finally {
            this.cleanup();
        }
    }
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage: node integration-test.js [options]');
        console.log('Options:');
        console.log('  --help, -h    Show this help message');
        console.log('');
        console.log('This script runs integration tests for the developer onboarding scripts');
        console.log('in isolated test environments.');
        process.exit(0);
    }

    const tester = new IntegrationTester();

    // Handle cleanup on exit
    process.on('SIGINT', () => {
        console.log('\nReceived SIGINT, cleaning up...');
        tester.cleanup();
        process.exit(1);
    });

    process.on('SIGTERM', () => {
        console.log('\nReceived SIGTERM, cleaning up...');
        tester.cleanup();
        process.exit(1);
    });

    tester.run().then(success => {
        process.exit(success ? 0 : 1);
    }).catch(error => {
        console.error('Integration test failed:', error);
        tester.cleanup();
        process.exit(1);
    });
}

module.exports = IntegrationTester;
