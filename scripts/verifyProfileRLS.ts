import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

// Load environment variables
dotenv.config();

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
const seniorUserID = process.env.TEST_SENIOR_USER_ID || "replace-with-senior-id";

// Family/health professional test key (should be configured in Supabase)
const familyKey = process.env.TEST_FAMILY_KEY || "replace-with-family-key";

// Create clients with different auth contexts
const supabaseAnon = createClient(supabaseUrl!, supabaseAnonKey!);
const supabaseFamily = createClient(supabaseUrl!, familyKey);

async function testProfileAccess() {
  console.log("=============== PROFILE RLS TEST ==============");
  
  // Test 1: Anonymous user should not be able to access profiles
  console.log("\n1. Anonymous access - should see error or empty data:");
  const { data: anonData, error: anonError } = await supabaseAnon
    .from("profiles")
    .select("*")
    .eq("id", seniorUserID);
  console.log({ error: anonError?.message, rowCount: anonData?.length });

  // Test 2: Family user access to profile with share_data = true
  console.log("\n2. Family access to profile with share_data=true - should see data:");
  const { data: familyData, error: familyError } = await supabaseFamily
    .from("profiles")
    .select("*")
    .eq("id", seniorUserID)
    .eq("share_data", true);
  console.log({ error: familyError?.message, data: familyData });

  // Test 3: Family user access to profile with share_data = false
  console.log("\n3. Family access to profile with share_data=false - should see error or empty data:");
  const { data: familyNoShareData, error: familyNoShareError } = await supabaseFamily
    .from("profiles")
    .select("*")
    .eq("id", seniorUserID)
    .eq("share_data", false);
  console.log({ error: familyNoShareError?.message, rowCount: familyNoShareData?.length });

  // Test 4: Attempt to update a profile from family account (should be denied)
  console.log("\n4. Family attempting update - should see permission error:");
  const { data: updateData, error: updateError } = await supabaseFamily
    .from("profiles")
    .update({ high_contrast: true })
    .eq("id", seniorUserID)
    .select();
  console.log({ error: updateError?.message, success: updateData ? true : false });
}

// Run the tests
testProfileAccess()
  .then(() => console.log("\nTests completed!"))
  .catch(err => console.error("Error running tests:", err)); 