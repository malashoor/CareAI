import { testGooglePlayCredentials } from '../utils/testCredentials';

console.log('Testing Google Play credentials...');
const result = testGooglePlayCredentials();
console.log('Test result:', result ? '✅ Passed' : '❌ Failed'); 