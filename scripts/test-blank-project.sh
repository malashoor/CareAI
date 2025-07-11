#!/bin/bash

# Comprehensive test with fresh Expo SDK 51 blank project
echo "🧪 Creating comprehensive fresh Expo SDK 51 test project..."

# Create temp directory with timestamp
TEMP_DIR="/tmp/careai-blank-test-$(date +%s)"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📦 Creating fresh Expo SDK 51 project..."
npx create-expo-app@latest CareAI-Blank --template blank --yes

cd CareAI-Blank

echo "📋 Installing expo-router..."
npx expo install expo-router

echo "📁 Copying your app folder..."
cp -r /Users/moayed/Desktop/Projects/CareAI/app ./

echo "📁 Copying assets if they exist..."
cp -r /Users/moayed/Desktop/Projects/CareAI/assets ./ 2>/dev/null || echo "No assets folder found"

echo "🔧 Updating entry point to use expo-router..."
cat > index.js << 'EOF'
import 'expo-router/entry';
EOF

echo "📦 Installing dependencies..."
npm install

echo "🔍 Testing fresh project BEFORE copying app folder..."
echo "Starting fresh project test..."
npx expo start --clear &
FRESH_PID=$!

# Wait a bit for the fresh project to start
sleep 10

echo "🧪 Testing with your app folder..."
echo "If the fresh project works but fails after copying app/, it's in your app code"
echo "If both fail the same way, it's a deep Metro/Babel/Apple Silicon issue"

echo "📁 Fresh project location: $TEMP_DIR/CareAI-Blank"
echo "🔍 Check the Metro output above for the same error"

# Keep the process running for manual testing
echo "Press Ctrl+C to stop the test..."
wait $FRESH_PID 