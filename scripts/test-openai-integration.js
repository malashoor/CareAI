#!/usr/bin/env node

/**
 * Test script for OpenAI API integration
 * Run this to verify your API key and connection
 */

const dotenv = require('dotenv');
const fetch = require('node-fetch');

// Load environment variables
dotenv.config();

const OPENAI_API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
const MODEL = process.env.EXPO_PUBLIC_OPENAI_MODEL || 'gpt-3.5-turbo';

async function testOpenAIConnection() {
  console.log('🧪 Testing OpenAI API Integration...\n');

  // Check if API key is configured
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key') {
    console.log('❌ OpenAI API key not configured');
    console.log('📝 Please set EXPO_PUBLIC_OPENAI_API_KEY in your .env file');
    console.log('💡 The app will use mock responses until API key is configured\n');
    return;
  }

  console.log('✅ OpenAI API key found');
  console.log(`🤖 Using model: ${MODEL}\n`);

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          {
            role: 'system',
            content: 'You are Sarah, a compassionate AI healthcare companion for elderly users.',
          },
          {
            role: 'user',
            content: 'Hello Sarah, can you help me with my health questions?',
          },
        ],
        max_tokens: 100,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.log('❌ API Connection Failed');
      console.log(`🚨 Error: ${errorData.error?.message || response.statusText}`);
      
      if (response.status === 401) {
        console.log('💡 This usually means your API key is invalid');
      } else if (response.status === 429) {
        console.log('💡 Rate limit exceeded - too many requests');
      } else if (response.status === 403) {
        console.log('💡 Access denied - check your API key permissions');
      }
      return;
    }

    const data = await response.json();
    console.log('✅ API Connection Successful!');
    console.log(`💬 AI Response: "${data.choices[0].message.content}"`);
    console.log(`📊 Tokens used: ${data.usage.total_tokens}`);
    console.log(`💰 Estimated cost: $${(data.usage.total_tokens * 0.000002).toFixed(6)}\n`);
    
    console.log('🎉 Your chat integration is ready to work with real AI responses!');

  } catch (error) {
    console.log('❌ Connection Error');
    console.log(`🚨 ${error.message}`);
    console.log('💡 Check your internet connection and API key\n');
  }
}

// Environment setup instructions
function showSetupInstructions() {
  console.log('📋 Setup Instructions:');
  console.log('1. Create a .env file in your project root');
  console.log('2. Add your OpenAI API key:');
  console.log('   EXPO_PUBLIC_OPENAI_API_KEY=sk-your-actual-api-key-here');
  console.log('3. Optionally configure other settings:');
  console.log('   EXPO_PUBLIC_OPENAI_MODEL=gpt-3.5-turbo');
  console.log('   EXPO_PUBLIC_OPENAI_MAX_TOKENS=150');
  console.log('   EXPO_PUBLIC_OPENAI_TEMPERATURE=0.7');
  console.log('4. Restart your Expo development server\n');
}

async function main() {
  await testOpenAIConnection();
  
  if (!OPENAI_API_KEY || OPENAI_API_KEY === 'your_openai_api_key') {
    showSetupInstructions();
  }
}

main().catch(console.error); 