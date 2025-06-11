#!/bin/bash

# 🧪 CareAI Security Scan Test Script
# Tests the pre-commit hook and security scanning functionality

echo "🧪 Testing CareAI Security Scanning..."
echo "======================================"

# Test 1: Pre-commit hook exists and is executable
echo ""
echo "📋 Test 1: Pre-commit Hook Setup"
if [ -f ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-commit" ]; then
    echo "✅ Pre-commit hook is installed and executable"
else
    echo "❌ Pre-commit hook is missing or not executable"
    echo "💡 Run: chmod +x .git/hooks/pre-commit"
fi

# Test 2: .gitignore protects .env files
echo ""
echo "📋 Test 2: .gitignore Protection"
if grep -q "\.env" .gitignore; then
    echo "✅ .env files are listed in .gitignore"
else
    echo "❌ .env files not protected by .gitignore"
    echo "💡 Add .env to .gitignore file"
fi

# Test 3: Check for any existing .env files in repo
echo ""
echo "📋 Test 3: Repository Clean Check"
env_files=$(find . -name "*.env*" -not -path "./node_modules/*" -not -path "./.git/*" | grep -v ".env.example" || true)
if [ -z "$env_files" ]; then
    echo "✅ No .env files found in repository"
else
    echo "❌ .env files found in repository:"
    echo "$env_files"
    echo "💡 These should be removed from the repository"
fi

# Test 4: Scan for potential secrets in files
echo ""
echo "📋 Test 4: Secret Pattern Detection"
secret_found=false

# Check for OpenAI keys
if grep -r -E "sk-[a-zA-Z0-9]{20,}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="test-security-scan.sh" 2>/dev/null; then
    echo "❌ Potential OpenAI API keys detected"
    secret_found=true
fi

# Check for JWT tokens
if grep -r -E "eyJ[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+\.[a-zA-Z0-9_-]+" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="test-security-scan.sh" 2>/dev/null; then
    echo "❌ Potential JWT tokens detected"
    secret_found=true
fi

# Check for Google API keys
if grep -r -E "AIza[a-zA-Z0-9_-]{35}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="test-security-scan.sh" 2>/dev/null; then
    echo "❌ Potential Google API keys detected"
    secret_found=true
fi

# Check for Resend keys
if grep -r -E "re_[a-zA-Z0-9]{16,}" . --exclude-dir=node_modules --exclude-dir=.git --exclude="*.md" --exclude="test-security-scan.sh" 2>/dev/null; then
    echo "❌ Potential Resend API keys detected"
    secret_found=true
fi

if [ "$secret_found" = false ]; then
    echo "✅ No secret patterns detected in repository"
fi

# Test 5: Environment file examples
echo ""
echo "📋 Test 5: Environment Examples"
if [ -f ".env.example" ]; then
    echo "✅ .env.example file exists"
    # Check if it contains placeholders instead of real values
    if grep -q "your_.*_key\|placeholder\|example\|xxx" .env.example; then
        echo "✅ .env.example contains placeholder values"
    else
        echo "⚠️  .env.example might contain real values instead of placeholders"
    fi
else
    echo "❌ .env.example file missing"
    echo "💡 Create .env.example with placeholder values"
fi

# Test 6: GitHub Actions workflow
echo ""
echo "📋 Test 6: GitHub Actions Security Workflow"
if [ -f ".github/workflows/security-scan.yml" ]; then
    echo "✅ GitHub Actions security workflow exists"
else
    echo "❌ GitHub Actions security workflow missing"
    echo "💡 Security workflow provides backup scanning in CI/CD"
fi

# Summary
echo ""
echo "🎯 SECURITY SCAN SUMMARY"
echo "========================"

total_tests=6
passed_tests=0

# Count passed tests (simplified)
[ -f ".git/hooks/pre-commit" ] && [ -x ".git/hooks/pre-commit" ] && ((passed_tests++))
grep -q "\.env" .gitignore && ((passed_tests++))
[ -z "$(find . -name "*.env*" -not -path "./node_modules/*" -not -path "./.git/*" | grep -v ".env.example")" ] && ((passed_tests++))
[ "$secret_found" = false ] && ((passed_tests++))
[ -f ".env.example" ] && ((passed_tests++))
[ -f ".github/workflows/security-scan.yml" ] && ((passed_tests++))

echo "📊 Tests Passed: $passed_tests/$total_tests"

if [ $passed_tests -eq $total_tests ]; then
    echo "🎉 All security tests passed!"
    echo "🛡️  Your repository is well-protected against credential leaks"
    exit 0
else
    echo "⚠️  Some security measures need attention"
    echo "🔧 Please address the issues above to improve security"
    exit 1
fi 