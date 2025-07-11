# ✅ CareAI AI-Fix Validation Protocol

> Use this standard every time an AI tool (e.g., Cursor, Copilot) provides a code fix. Challenge assumptions, verify behavior, and ensure real functionality.

---

## 🧩 1. Validate Against Functional Requirements

| **Claim**                         | **How to Verify**                                                                                                                            |
| --------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------- |
| ✅ Theme works (light/dark/system) | - Log `theme.colors` in a screen<br>- Toggle theme manually<br>- Check AsyncStorage for persisted value                                      |
| ✅ Splash screen is fixed          | - Ensure `SplashScreen.hideAsync()` is called **after** readiness<br>- Simulate delay (e.g., 1000ms)<br>- Confirm fallback when layout fails |
| ✅ Navigation is working           | - Manually test all routes (`/`, `/admin`, `/sos`, `/dashboard`)<br>- Check for missing layout or import issues                              |
| ✅ Supabase config is safe         | - Ensure `@supabase/realtime-js` is removed<br>- Use only `.auth.getSession()` or `.onAuthStateChange()`<br>- No `.channel()` usage          |
| ✅ Cleanup script works            | - Run `./cleanup.sh`<br>- Confirm cache clears & iOS rebuilds properly<br>- Verify app boots after clean state                               |

---

## 🔍 2. Challenge Code with Intent Questions

* Why was this file or logic added/removed?
* Was this change fixing the root cause or suppressing the error?
* Does the fix maintain the architectural intent?
* Was anything removed that should be restored with a better path?

---

## 🧪 3. Controlled Scenario Testing

| **Test**                       | **Purpose**                                   |
| ------------------------------ | --------------------------------------------- |
| Comment out ThemeProvider      | Ensure fallback/default styles exist          |
| Simulate AsyncStorage failure  | Confirm no crash; default theme loads         |
| Open all navigation routes     | Validate layout & navigation correctness      |
| Strip all font/image assets    | Confirm missing assets do not crash UI        |
| Run on real device & simulator | Detect simulator-only fixes or missed crashes |

---

## 🧠 4. Post-Fix Reflection Checklist

After every fix, ask:

* ✅ What files were changed? (`git diff`)
* ✅ Which app features were impacted?
* ✅ Was the problem solved or just silenced?
* ✅ Is the fix observable in dev logs/tests?

---

## 🚨 5. Red Flags to Catch Early

| **Symptom**                       | **Likely Problem**                             |
| --------------------------------- | ---------------------------------------------- |
| "Removed X temporarily"           | Missing dependency or context misunderstanding |
| "Added fallback without root fix" | Likely hiding a real issue                     |
| App starts but renders nothing    | Broken layout or slot issue                    |
| No logs, no error boundaries      | Observability is broken — fix before debugging |

---

## 🧱 Best Practice

Integrate this document into:

* Pull request templates
* Cursor fix summaries (`AI_FIX_LOG.md`)
* Release readiness reviews (`RELEASE_CHECKLIST.md`)
* QA and dev team training

---

**CareAI is a medically sensitive and accessibility-critical app — every change must pass this validation before merge or release.**
