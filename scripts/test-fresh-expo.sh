#!/bin/bash

# Nuclear option: Test with fresh Expo SDK 51 project
echo "🧪 Creating fresh Expo SDK 51 test project..."

# Create temp directory
TEMP_DIR="/tmp/careai-fresh-test-$(date +%s)"
mkdir -p "$TEMP_DIR"
cd "$TEMP_DIR"

echo "📦 Creating fresh Expo project..."
npx create-expo-app@latest CareAI-Fresh --template blank --yes

cd CareAI-Fresh

echo "📋 Installing expo-router..."
npx expo install expo-router

echo "📁 Copying your app folder..."
cp -r /Users/moayed/Desktop/Projects/CareAI/app ./

echo "🔧 Updating entry point..."
cat > index.js << 'EOF'
import 'expo-router/entry';
EOF

echo "📦 Installing dependencies..."
npm install

echo "🚀 Testing fresh project..."
npx expo start --clear

echo "✅ Test complete! Check if the error persists in the fresh project."
echo "📁 Fresh project location: $TEMP_DIR/CareAI-Fresh" 