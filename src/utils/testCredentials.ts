export function testGooglePlayCredentials() {
  const credentialsPath = process.env.GOOGLE_PLAY_CREDENTIALS;
  console.log("Google Play credentials file path:", credentialsPath);

  if (!credentialsPath) {
    console.error("❌ Error: GOOGLE_PLAY_CREDENTIALS environment variable is not set");
    return false;
  }

  try {
    // Try to require the file to check if it exists
    require(credentialsPath);
    console.log("✅ Success: Google Play credentials file exists");
    return true;
  } catch (error) {
    console.error("❌ Error: Could not find Google Play credentials file at:", credentialsPath);
    return false;
  }
} 