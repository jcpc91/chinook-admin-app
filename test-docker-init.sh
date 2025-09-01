#!/bin/bash

# Simple test to validate docker-init.dev.sh script structure
echo "Testing docker-init.dev.sh script..."

# Check if script exists and is executable
if [ -f "docker-init.dev.sh" ] && [ -x "docker-init.dev.sh" ]; then
    echo "✅ Script exists and is executable"
else
    echo "❌ Script missing or not executable"
    exit 1
fi

# Check if script has proper shebang
if head -1 docker-init.dev.sh | grep -q "#!/bin/bash"; then
    echo "✅ Script has proper shebang"
else
    echo "❌ Script missing proper shebang"
    exit 1
fi

# Check if script has no syntax errors
if bash -n docker-init.dev.sh; then
    echo "✅ Script syntax is valid"
else
    echo "❌ Script has syntax errors"
    exit 1
fi

# Check if Docker Compose file exists
if [ -f "docker-compose.dev.yml" ]; then
    echo "✅ Docker Compose development file exists"
else
    echo "❌ Docker Compose development file missing"
    exit 1
fi

echo "🎉 All tests passed! Script is ready for use."