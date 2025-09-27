# Contributing to relay-cli

Thank you for your interest in contributing to relay-cli! This document outlines the process for contributing to this project.

## Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/Relay.git
   cd Relay
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Run the development version**:
   ```bash
   npm run dev
   ```

## Development Workflow

### Making Changes

1. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes** following the project structure:
   ```
   src/
   ├── core/                # Business logic
   ├── ui/                  # UI components
   └── __tests__/           # Tests
   ```

3. **Add tests** for new functionality:
   ```bash
   npm test -- --testPathPatterns=YourFeature
   ```

4. **Run all tests** to ensure nothing is broken:
   ```bash
   npm test
   ```

### Code Style

- **TypeScript**: Use TypeScript for all new code
- **Components**: Follow React component patterns with Ink
- **Naming**: Use descriptive names for variables and functions
- **Comments**: Add JSDoc comments for public functions
- **Testing**: Aim for good test coverage of new features

### Commit Messages

Use conventional commit format:
```
feat: add environment variable substitution
fix: resolve text concatenation in responses
docs: update README with new features
test: add tests for environment manager
```

## Types of Contributions

### 🐛 Bug Reports
- Use GitHub Issues
- Include steps to reproduce
- Provide terminal output if relevant
- Mention your OS and terminal

### ✨ Feature Requests
- Use GitHub Issues with "enhancement" label
- Describe the use case
- Explain how it fits with existing features
- Consider backward compatibility

### 🔧 Code Contributions

**Good First Issues**:
- Add new environment templates
- Improve error messages
- Add keyboard shortcuts
- Enhance documentation

**Advanced Features**:
- Authentication helpers (OAuth, API keys)
- Request collections and runners
- Response validation and testing
- Import/export from other tools (Postman, Insomnia)

## Testing

### Running Tests
```bash
# All tests
npm test

# Specific test file
npm test -- --testPathPatterns=EnvironmentManager

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### Writing Tests
- **Unit tests**: For core logic (EnvironmentManager, HttpClient)
- **Component tests**: For UI components using ink-testing-library
- **Integration tests**: For complete workflows

### Test Structure
```typescript
describe('FeatureName', () => {
  beforeEach(() => {
    // Setup
  });

  it('should do something specific', () => {
    // Test implementation
  });
});
```

## Documentation

### README Updates
- Keep examples up to date
- Add new features to the features list
- Update usage examples

### Code Documentation
- Add JSDoc comments for public APIs
- Document complex algorithms
- Include usage examples in comments

## Release Process

1. **Update version** in package.json
2. **Update CHANGELOG.md** with new features
3. **Create pull request** for review
4. **Merge to main** after approval
5. **Tag release** with version number

## Project Architecture

### Core Modules
- **EnvironmentManager**: Variable storage and substitution
- **HttpClient**: HTTP request handling with Axios
- **InputPrompt**: Command parsing and user input

### UI Components
- **App**: Main application container
- **Header**: Branding and tips
- **ResponseHistory**: Request/response display
- **LoadingScreen**: Startup animation

### File Structure
- **environments/**: Environment variable files
- **requests/**: Request template files  
- **responses/**: Saved response files

## Need Help?

- **Questions**: Open a GitHub Discussion
- **Bugs**: Open a GitHub Issue
- **Security**: Email maintainers directly

## Recognition

Contributors will be:
- Listed in the README
- Mentioned in release notes
- Given credit in commit messages

Thank you for contributing to relay-cli! 🚀