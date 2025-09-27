# Changelog

All notable changes to this project will be documented in this file.

## [2.1.0] - 2025-09-27

### Major Features Added
- **Keyboard Shortcuts System**: Professional shortcuts for all major actions
- **Centered Professional Header**: Improved branding and visual appeal
- **Enhanced Help System**: Comprehensive documentation with shortcuts
- **Streamlined Testing**: Cleaned up test suite for maintainability

### Keyboard Shortcuts
- `Ctrl+E` - Execute current request (instant execution)
- `Ctrl+C` - Clear request data (quick reset)
- `Ctrl+H` - Show help with commands and shortcuts
- `Ctrl+S` - Save last response to file
- `Ctrl+L` - List all environment variables
- Visual shortcuts display at bottom of interface
- Context-aware shortcuts (shown only when relevant)

### UI/UX Improvements
- **Centered Header**: Professional branding with "🚀 Professional HTTP Client v1.0.0 🚀"
- **Updated Tips**: Modern keyboard shortcut hints
- **Enhanced Help Display**: Dedicated keyboard shortcuts section in help
- **Visual Feedback**: Keyboard shortcuts shown at bottom with conditional rendering
- **Professional Polish**: Improved overall aesthetics and user experience

### Developer Experience
- **Streamlined Tests**: Removed redundant test files for cleaner codebase
- **Improved Test Structure**: Simplified integration tests with proper mocking
- **Better Documentation**: Updated README with comprehensive keyboard shortcuts guide
- **Professional Features**: All keyboard shortcuts documented and integrated

### Technical Improvements
- Enhanced `InputPrompt` component with keyboard event handling
- Improved `useInput` hook with Ctrl key detection
- Better event handling and user interaction patterns
- Cleaner test architecture with focused testing approach

### Documentation Updates
- **README**: Added keyboard shortcuts section with visual table
- **Features List**: Highlighted keyboard shortcuts as productivity feature
- **Usage Examples**: Updated to show keyboard shortcut alternatives
- **Quick Start**: Added keyboard shortcut workflow example

## [2.0.0] - 2025-09-27

### Major Features Added
- **Environment Variables System**: Complete implementation with `{{variable}}` substitution
- **Loading Screen Animation**: Beautiful startup experience with progress bar
- **Response Saving**: `/save` command to export responses to JSON files
- **Single Response View**: Clean UI showing only current request/response

### Environment Variables
- `/env set`, `/env get`, `/env list`, `/env clear`, `/env load` commands
- Variable substitution in URLs, headers, and request bodies
- Multiple environment support (development, staging, production, jsonplaceholder)
- Persistent file-based storage in `environments/` directory
- Auto-loading of default environment on startup

### UI/UX Improvements
- **Animated Loading Screen**: Smooth startup with relay-cli branding
- **Fixed Display Issues**: Resolved text concatenation problems
- **Better Spacing**: Reduced vertical padding for cleaner layout
- **Response Order**: Latest responses now appear at bottom (natural terminal behavior)
- **Clean Response View**: Previous responses cleared on new requests

### File Management
- **Response Saving**: Save complete request/response data to `responses/` directory
- **Environment Files**: Pre-configured environments for different stages
- **Sample Requests**: Example files demonstrating environment variable usage
- **Organized Structure**: Clear separation of requests, responses, and environments

### Developer Experience
- **Comprehensive Testing**: 35+ tests covering all functionality
- **TypeScript Integration**: Full type safety for environment manager
- **Modular Architecture**: Clean separation of concerns
- **Professional Documentation**: Complete README and usage examples

### Breaking Changes
- Removed `/full` and `/compact` commands (replaced with `/save`)
- Changed response display to single-view (clears previous responses)
- Updated ASCII art branding from "RELAY" to "relay-cli"

### Bug Fixes
- Fixed text concatenation in response display
- Resolved layout issues in large terminals
- Improved cursor navigation and input handling
- Better error handling for file operations

## [1.0.0] - 2025-09-27

### Initial Release
- Basic HTTP client functionality
- Slash command system
- File loading capabilities
- Request history
- Beautiful terminal UI with gradients
- TypeScript + React + Ink architecture

### Features
- Support for GET, POST, PUT, DELETE, PATCH methods
- Custom headers and request bodies
- JSON file loading for requests
- Command history and suggestions
- Responsive terminal design
- Clean component architecture