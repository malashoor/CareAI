# ✅ CareAI Metro Bundler Troubleshooting Guide

> This document provides a comprehensive guide for resolving Metro bundler connection issues in the CareAI project.

---

## 🔄 Quick Reset Process

For most Metro connection issues, running our custom reset script will resolve the problem:

```bash
./reset-metro.sh
```

For more persistent issues that include iOS build problems:

```bash
./reset-metro.sh --rebuild-ios
```

---

## 🧩 Common Metro Connection Issues & Solutions

| **Issue** | **Symptoms** | **Solution** |
|-----------|--------------|--------------|
| ❌ Port conflict | `Error: listen EADDRINUSE: address already in use :::8081` | Run `lsof -i :8081` to identify process, then `kill -9 <PID>` |
| ❌ Corrupt cache | `Error: Unable to resolve module...` | Clear cache with `watchman watch-del-all` and `rm -rf /tmp/metro-*` |
| ❌ Network interface | QR code doesn't work on physical device | Use `REACT_NATIVE_PACKAGER_HOSTNAME=<your-lan-ip> npx expo start` |
| ❌ Watchman issues | `Error: watchman watch-project` errors | Reinstall watchman or run `watchman watch-del-all` |
| ❌ Version mismatch | Cryptic bundling errors | Update Metro: `npm install metro@latest` |

---

## 🔍 Detailed Troubleshooting Guide

### 1. Verify Port Availability

```bash
# Check if port 8081 is in use
lsof -i :8081

# If something is using the port, kill it
kill -9 <PID>
```

### 2. Check Metro Configuration

Ensure your `metro.config.js` contains:

```javascript
const { getDefaultConfig } = require("@expo/metro-config");
const config = getDefaultConfig(__dirname);

// Improve compatibility
config.resolver.resolverMainFields = ["sbmodern", "browser", "main"];
config.server = {
  ...config.server,
  port: 8081,
  enhanceMiddleware: (middleware) => middleware,
};

module.exports = config;
```

### 3. Network Interface Selection

For real device testing:

```bash
# Find your local IP address
ipconfig getifaddr en0

# Start Expo with a specific IP
REACT_NATIVE_PACKAGER_HOSTNAME=192.168.1.X npx expo start
```

### 4. Dependency Alignment

If Metro errors persist after cache clearing:

```bash
# Update Metro and related tools
npm install metro@latest
npm install @react-native-community/cli@latest

# Check for version compatibility issues
npx expo doctor
```

---

## 🧠 Prevention Strategies

1. **Never kill Metro improperly** - Always use `Ctrl+C` to properly exit, not closing the terminal window
2. **Beware of multiple Metro instances** - Check for orphaned processes with `ps aux | grep metro`
3. **Network stability** - Ensure devices and development machine are on stable WiFi
4. **Regular clean start** - Periodically run `./reset-metro.sh` as preventative maintenance
5. **Consistent Node version** - Use the same Node.js version across team using `.nvmrc`

---

## 📱 Simulator-Specific Tips

| **Simulator** | **Tip** |
|---------------|---------|
| iOS Simulator | Reset simulator content via Device menu when issues persist |
| Android Emulator | Ensure ADB is connected with `adb devices` |
| Web | Clear browser cache for consistent debugging |

---

## 🚨 When to Escalate

After trying these solutions, escalate if:

1. Metro starts but fails to serve bundles (timeout errors)
2. Multiple developers experience the same Metro error
3. Metro errors appear after merging specific branches
4. Changes to native code don't propagate after rebuild

---

**CareAI Development Helpdesk:**  
For additional help, contact the development team at [dev-support@careai.com](mailto:dev-support@careai.com). 