# Design Document

## Overview

The developer onboarding script will be a cross-platform solution that automates the complete setup process for new developers. The design builds upon the existing init.ps1 script but enhances it with better error handling, comprehensive environment file creation, and improved user feedback. The solution will consist of both shell script (init.sh) and PowerShell script (init.ps1) versions to ensure cross-platform compatibility.

## Architecture

### Script Structure
The onboarding script follows a modular approach with distinct phases:

1. **Initialization Phase**: Welcome message and environment detection
2. **Dependency Installation Phase**: Root-level npm install
3. **Environment Configuration Phase**: .env file creation for all services
4. **Database Setup Phase**: Migration and seeding execution
5. **Completion Phase**: Success confirmation and next steps

### Cross-Platform Strategy
- **Unix/Linux/macOS**: Enhanced init.sh with bash scripting
- **Windows**: Enhanced init.ps1 with PowerShell scripting
- **Shared Logic**: Both scripts implement identical functionality using platform-appropriate commands

## Components and Interfaces

### Core Components

#### 1. Script Orchestrator
**Purpose**: Main entry point that coordinates all setup phases
**Responsibilities**:
- Display welcome message and setup overview
- Execute phases in correct sequence
- Handle global error conditions
- Display final completion status

#### 2. Dependency Manager
**Purpose**: Handles npm dependency installation
**Responsibilities**:
- Execute `npm install` in project root
- Validate successful installation
- Report installation progress and errors

#### 3. Environment File Generator
**Purpose**: Creates .env files for all services
**Responsibilities**:
- Read template files (.env.development.example, .env.microservice.example)
- Generate service-specific .env files with appropriate PORT assignments
- Create microservices .env with dummy values
- Skip existing files with appropriate warnings

#### 4. Database Initializer
**Purpose**: Sets up database schema and seed data
**Responsibilities**:
- Execute migration commands in sequence
- Run database seeding
- Report migration status and errors
- Continue execution even if individual migrations fail

#### 5. Progress Reporter
**Purpose**: Provides user feedback throughout the process
**Responsibilities**:
- Display step-by-step progress indicators
- Show success/error messages
- Provide troubleshooting guidance
- Display final setup summary

### Interface Specifications

#### Environment File Templates
```bash
# Service .env template (app, auth, catalogos)
CORS_ORIGIN=*
JWT_SECREAT_KEY=588eae8f9d7224acdf847c7b07bd2ccf97157d78bdac49954d2c7d8c403ca3fd
PORT={SERVICE_PORT}

# Microservices .env template
MAIL_HOST=localhost
MAIL_PORT=587
MAIL_USER=dummy@example.com
MAIL_PASSWORD=dummypassword
```

#### Port Assignment Strategy
- auth service: PORT=3000
- app service: PORT=3001
- catalogos service: PORT=3002

## Data Models

### Configuration Data Structure
```javascript
const serviceConfig = {
  services: [
    { name: 'auth', port: 3000, directory: 'auth' },
    { name: 'app', port: 3001, directory: 'app' },
    { name: 'catalogos', port: 3002, directory: 'catalogos' }
  ],
  microservices: {
    directory: 'microservices',
    envTemplate: '.env.microservice.example'
  },
  database: {
    migrations: [
      'database:migrate-app',
      'database:migrate-auth', 
      'database:migrate-cat'
    ],
    seed: 'database:seed'
  }
}
```

### Script State Management
```javascript
const scriptState = {
  phase: 'initialization', // initialization, dependencies, environment, database, completion
  completedSteps: [],
  errors: [],
  warnings: [],
  createdFiles: []
}
```

## Error Handling

### Error Categories
1. **Critical Errors**: Stop script execution
   - npm install failure
   - Missing template files
   - File system permission issues

2. **Non-Critical Errors**: Continue with warnings
   - Individual migration failures
   - Existing .env files
   - Database seeding issues

### Error Recovery Strategies
- **Dependency Installation**: Retry with verbose logging, suggest manual intervention
- **File Creation**: Check permissions, suggest running as administrator/sudo
- **Database Operations**: Continue with remaining migrations, report failed operations
- **Platform Detection**: Fallback to manual platform specification

### User Guidance
- Clear error messages with specific troubleshooting steps
- Links to documentation for complex issues
- Suggestions for manual completion of failed steps

## Testing Strategy

### Unit Testing Approach
- **Mock File System Operations**: Test file creation logic without actual file system changes
- **Mock Command Execution**: Test npm and database commands without actual execution
- **Error Simulation**: Test error handling paths with simulated failures

### Integration Testing
- **Full Script Execution**: Test complete script flow in clean environment
- **Partial Failure Scenarios**: Test script behavior when individual steps fail
- **Cross-Platform Validation**: Test both shell and PowerShell versions

### Test Scenarios
1. **Fresh Repository Clone**: Complete setup from scratch
2. **Partial Existing Setup**: Script behavior with some .env files already present
3. **Permission Issues**: Script behavior with restricted file system access
4. **Network Issues**: Script behavior with npm registry connectivity problems
5. **Database Migration Failures**: Script behavior when migrations fail

### Validation Criteria
- All required .env files created with correct content
- Database migrations executed successfully
- Clear progress feedback provided to user
- Appropriate error handling and recovery
- Cross-platform compatibility verified

## Implementation Considerations

### File System Operations
- Use platform-appropriate path separators
- Handle file encoding consistently (UTF-8)
- Implement proper file existence checks
- Ensure atomic file operations where possible

### Command Execution
- Use appropriate shell command syntax per platform
- Implement proper exit code checking
- Capture and display command output appropriately
- Handle long-running operations with progress indicators

### User Experience
- Provide estimated time for completion
- Show clear progress indicators for each phase
- Use consistent messaging format
- Include helpful next steps after completion

### Security Considerations
- Validate template file content before copying
- Use secure default values for dummy configurations
- Avoid exposing sensitive information in error messages
- Implement proper file permission handling