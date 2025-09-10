#!/usr/bin/env node

/**
 * Developer Onboarding Validation Utility
 * Validates the setup created by init.sh or init.ps1
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Colors for console output
const colors = {
    reset: '\x1b[0m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    cyan: '\x1b[36m'
};

class SetupValidator {
    constructor() {
        this.results = {
            passed: 0,
            failed: 0,
            warnings: 0,
            tests: []
        };
    }

    log(message, color = 'reset') {
        console.log(`${colors[color]}${message}${colors.reset}`);
    }

    logInfo(message) {
        this.log(`[INFO] ${message}`, 'blue');
    }

    logSuccess(message) {
        this.log(`[SUCCESS] ${message}`, 'green');
    }

    logWarning(message) {
        this.log(`[WARNING] ${message}`, 'yellow');
    }

    logError(message) {
        this.log(`[ERROR] ${message}`, 'red');
    }

    runTest(testName, testFunction) {
        this.logInfo(`Running: ${testName}`);

        try {
            const result = testFunction();
            if (result.success) {
                this.results.passed++;
                this.results.tests.push({ name: testName, status: 'PASS', message: result.message });
                this.logSuccess(`${testName}: ${result.message}`);
            } else {
                this.results.failed++;
                this.results.tests.push({ name: testName, status: 'FAIL', message: result.message });
                this.logError(`${testName}: ${result.message}`);
            }

            if (result.warnings) {
                result.warnings.forEach(warning => {
                    this.results.warnings++;
                    this.logWarning(warning);
                });
            }
        } catch (error) {
            this.results.failed++;
            this.results.tests.push({ name: testName, status: 'ERROR', message: error.message });
            this.logError(`${testName}: ${error.message}`);
        }

        console.log('');
    }

    validateEnvFiles() {
        const services = [
            { name: 'app', expectedPort: 3001 },
            { name: 'auth', expectedPort: 3000 },
            { name: 'catalogos', expectedPort: 3002 }
        ];

        const results = {
            success: true,
            message: '',
            warnings: []
        };

        const messages = [];

        for (const service of services) {
            const envPath = path.join(service.name, '.env');

            if (!fs.existsSync(envPath)) {
                results.success = false;
                messages.push(`${service.name}/.env not found`);
                continue;
            }

            try {
                const envContent = fs.readFileSync(envPath, 'utf8');

                // Check for required variables
                const requiredVars = ['CORS_ORIGIN', 'JWT_SECREAT_KEY', 'PORT'];
                const missingVars = [];

                for (const varName of requiredVars) {
                    if (!envContent.includes(`${varName}=`)) {
                        missingVars.push(varName);
                    }
                }

                if (missingVars.length > 0) {
                    results.success = false;
                    messages.push(`${service.name}/.env missing variables: ${missingVars.join(', ')}`);
                    continue;
                }

                // Check PORT value
                const portMatch = envContent.match(/PORT=(\d+)/);
                if (!portMatch) {
                    results.success = false;
                    messages.push(`${service.name}/.env missing or invalid PORT`);
                } else if (parseInt(portMatch[1]) !== service.expectedPort) {
                    results.warnings.push(`${service.name}/.env has PORT=${portMatch[1]}, expected ${service.expectedPort}`);
                }

                messages.push(`${service.name}/.env validated successfully`);

            } catch (error) {
                results.success = false;
                messages.push(`Error reading ${service.name}/.env: ${error.message}`);
            }
        }

        results.message = messages.join('; ');
        return results;
    }

    validateMicroservicesEnv() {
        const envPath = path.join('microservices', '.env');

        if (!fs.existsSync(envPath)) {
            return {
                success: false,
                message: 'microservices/.env not found'
            };
        }

        try {
            const envContent = fs.readFileSync(envPath, 'utf8');

            const requiredVars = ['MAIL_HOST', 'MAIL_PORT', 'MAIL_USER', 'MAIL_PASSWORD'];
            const missingVars = [];

            for (const varName of requiredVars) {
                if (!envContent.includes(`${varName}=`)) {
                    missingVars.push(varName);
                }
            }

            if (missingVars.length > 0) {
                return {
                    success: false,
                    message: `microservices/.env missing variables: ${missingVars.join(', ')}`
                };
            }

            return {
                success: true,
                message: 'microservices/.env validated successfully'
            };

        } catch (error) {
            return {
                success: false,
                message: `Error reading microservices/.env: ${error.message}`
            };
        }
    }

    validateDatabaseStructure() {
        const requiredDirs = ['database', 'database/app', 'database/auth', 'database/catalogos', '.db'];
        const missingDirs = [];

        for (const dir of requiredDirs) {
            if (!fs.existsSync(dir)) {
                missingDirs.push(dir);
            }
        }

        if (missingDirs.length > 0) {
            return {
                success: false,
                message: `Missing directories: ${missingDirs.join(', ')}`
            };
        }

        return {
            success: true,
            message: 'Database directory structure validated'
        };
    }

    validatePackageJson() {
        if (!fs.existsSync('package.json')) {
            return {
                success: false,
                message: 'package.json not found'
            };
        }

        try {
            const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));

            const requiredScripts = [
                'database:migrate-app',
                'database:migrate-auth',
                'database:migrate-cat',
                'database:seed'
            ];

            const missingScripts = [];

            for (const script of requiredScripts) {
                if (!packageJson.scripts || !packageJson.scripts[script]) {
                    missingScripts.push(script);
                }
            }

            if (missingScripts.length > 0) {
                return {
                    success: false,
                    message: `Missing npm scripts: ${missingScripts.join(', ')}`
                };
            }

            return {
                success: true,
                message: 'package.json scripts validated'
            };

        } catch (error) {
            return {
                success: false,
                message: `Error parsing package.json: ${error.message}`
            };
        }
    }

    validateNodeModules() {
        if (!fs.existsSync('node_modules')) {
            return {
                success: false,
                message: 'node_modules directory not found - dependencies not installed'
            };
        }

        // Check if package-lock.json exists
        if (!fs.existsSync('package-lock.json')) {
            return {
                success: true,
                message: 'node_modules exists but package-lock.json missing',
                warnings: ['package-lock.json not found - dependencies may not be locked']
            };
        }

        return {
            success: true,
            message: 'Dependencies appear to be installed'
        };
    }

    validateScriptFiles() {
        const scripts = ['init.sh', 'init.ps1'];
        const existingScripts = [];
        const missingScripts = [];

        for (const script of scripts) {
            if (fs.existsSync(script)) {
                existingScripts.push(script);
            } else {
                missingScripts.push(script);
            }
        }

        if (existingScripts.length === 0) {
            return {
                success: false,
                message: 'No initialization scripts found'
            };
        }

        const warnings = missingScripts.length > 0
            ? [`Missing scripts: ${missingScripts.join(', ')}`]
            : [];

        return {
            success: true,
            message: `Found initialization scripts: ${existingScripts.join(', ')}`,
            warnings
        };
    }

    validateTemplateFiles() {
        const templates = ['.env.development.example', '.env.microservice.example'];
        const missingTemplates = [];

        for (const template of templates) {
            if (!fs.existsSync(template)) {
                missingTemplates.push(template);
            }
        }

        if (missingTemplates.length > 0) {
            return {
                success: false,
                message: `Missing template files: ${missingTemplates.join(', ')}`
            };
        }

        return {
            success: true,
            message: 'All template files found'
        };
    }

    generateReport() {
        this.log('\n==========================================', 'cyan');
        this.log('Setup Validation Report', 'cyan');
        this.log('==========================================', 'cyan');

        this.log(`\nTests Run: ${this.results.passed + this.results.failed}`);
        this.log(`Passed: ${this.results.passed}`, 'green');
        this.log(`Failed: ${this.results.failed}`, this.results.failed > 0 ? 'red' : 'reset');
        this.log(`Warnings: ${this.results.warnings}`, this.results.warnings > 0 ? 'yellow' : 'reset');

        this.log('\nDetailed Results:', 'cyan');
        for (const test of this.results.tests) {
            const color = test.status === 'PASS' ? 'green' : 'red';
            this.log(`  ${test.status === 'PASS' ? '✓' : '✗'} ${test.name}: ${test.message}`, color);
        }

        if (this.results.failed === 0) {
            this.log('\n🎉 Setup validation completed successfully!', 'green');
            this.log('Your development environment is ready to use.', 'green');
        } else {
            this.log('\n❌ Setup validation found issues that need attention.', 'red');
            this.log('Please review the failed tests and run the initialization script again.', 'yellow');
        }

        return this.results.failed === 0;
    }

    run() {
        this.log('Developer Onboarding Setup Validator', 'cyan');
        this.log('====================================\n', 'cyan');

        // Run all validation tests
        this.runTest('Template Files', () => this.validateTemplateFiles());
        this.runTest('Initialization Scripts', () => this.validateScriptFiles());
        this.runTest('Package Configuration', () => this.validatePackageJson());
        this.runTest('Dependencies', () => this.validateNodeModules());
        this.runTest('Database Structure', () => this.validateDatabaseStructure());
        this.runTest('Service Environment Files', () => this.validateEnvFiles());
        this.runTest('Microservices Environment', () => this.validateMicroservicesEnv());

        return this.generateReport();
    }
}

// CLI handling
if (require.main === module) {
    const args = process.argv.slice(2);

    if (args.includes('--help') || args.includes('-h')) {
        console.log('Usage: node validate-setup.js [options]');
        console.log('Options:');
        console.log('  --help, -h    Show this help message');
        console.log('');
        console.log('This script validates that the developer onboarding setup');
        console.log('has been completed successfully.');
        process.exit(0);
    }

    const validator = new SetupValidator();
    const success = validator.run();

    process.exit(success ? 0 : 1);
}

module.exports = SetupValidator;
