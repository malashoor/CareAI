# CareAI

CareAI is a mobile application designed to provide intelligent care assistance and monitoring capabilities.

## Features

- Real-time health monitoring
- Location tracking
- Camera integration
- Push notifications
- Offline support
- Deep linking
- Multi-language support

## Prerequisites

- Node.js >= 16
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/care-ai.git
cd care-ai
```

2. Install dependencies:
```bash
npm install
# or
yarn install
```

3. Create a `.env` file in the root directory and add your environment variables:
```bash
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## Development

Start the development server:
```bash
npm run dev
# or
yarn dev
```

## Building for Production

### Android

1. Generate a keystore:
```bash
keytool -genkey -v -keystore my-release-key.keystore -alias key_alias -keyalg RSA -keysize 2048 -validity 10000
```

2. Build the APK:
```bash
eas build -p android
```

### iOS

1. Build the IPA:
```bash
eas build -p ios
```

## Testing

## Running Tests

The project uses Jest for testing. Here are the available test commands:

- `npm test`: Run all tests
- `npm run test:watch`: Run tests in watch mode
- `npm run test:coverage`: Run tests with coverage report
- `npm run test:ci`: Run tests in CI environment

## Test Coverage

We maintain a high test coverage threshold:
- Branches: 80%
- Functions: 80%
- Lines: 80%
- Statements: 80%

## Test Categories

Our test suite includes:

1. **Unit Tests**: Testing individual components and functions
2. **Integration Tests**: Testing component interactions
3. **Edge Cases**:
   - Rapid state changes
   - Invalid operations
   - Network state changes
   - Platform-specific behavior
   - Subscription state transitions

4. **State Management Tests**:
   - State persistence across app restarts
   - Race conditions
   - Error recovery
   - Platform-specific features

## Continuous Integration

We use GitHub Actions for continuous integration. The CI pipeline:
- Runs on both Node.js 16.x and 18.x
- Executes all tests
- Generates and uploads coverage reports
- Caches dependencies for faster builds

The CI workflow runs on:
- Every push to the main branch
- Every pull request targeting the main branch

## Continuous Integration and Deployment (CI/CD)

Our project uses GitHub Actions for automated CI/CD. The pipeline includes:

1. **Code Quality Checks**:
   - ESLint for code style and best practices
   - TypeScript type checking
   - Automated on every push and pull request

2. **Testing Pipeline**:
   - Runs all unit and integration tests
   - Generates and uploads test coverage reports
   - Ensures code quality and reliability

3. **Android Build and Deploy**:
   - Automatically builds Android APK and App Bundle
   - Deploys to Google Play Store
   - Handles signing and versioning
   - Uses secure secrets for credentials

The CI/CD pipeline is triggered on:
- Every push to the main branch
- Every pull request targeting the main branch

## Adding New Tests

When adding new features, ensure to:
1. Write tests before implementing features (TDD approach)
2. Cover both success and failure scenarios
3. Test edge cases and error conditions
4. Maintain consistent state structure
5. Mock external dependencies appropriately

## Best Practices

- Keep tests focused and atomic
- Use descriptive test names
- Follow the Arrange-Act-Assert pattern
- Mock external dependencies
- Clean up after tests
- Avoid test interdependence

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For support, email support@careai.com or join our Slack channel.

## Quick-start for new devs

This guide will help you get the CareAI application up and running quickly:

1. **Clone the repository and install dependencies:**
   ```bash
   git clone https://github.com/yourusername/care-ai.git
   cd care-ai
   npm install --legacy-peer-deps
   ```

2. **Set up your environment:**
   ```bash
   cp .env.example .env
   ```
   Edit the `.env` file and fill in your API keys and credentials.

3. **Run the development server:**
   ```bash
   npm run dev
   ```

4. **Handling Expo/Metro issues:**
   If you encounter bundler issues, use the reset script:
   ```bash
   ./reset-project.sh
   ```

5. **Running on device:**
   - iOS: `npm run ios`
   - Android: `npm run android`
   
   Or scan the QR code in the terminal with the Expo Go app.

6. **Testing your setup:**
   ```bash
   npm test
   ```

7. **Common issues and solutions:**
   - Metro bundler hanging: `watchman watch-del-all && npm run dev`
   - Missing modules: `npm install --legacy-peer-deps`
   - iOS build errors: Check Xcode settings and provisioning profiles
   - Android build errors: Check gradlew permissions and Android SDK setup
