# relay-cli

A beautiful, professional terminal HTTP client with Postman-like features and environment variable support.

## ✨ Features

🎯 **Professional HTTP Testing**
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Environment variables with `{{variable}}` substitution
- Request/response file management
- Clean single-response focused UI

🎨 **Beautiful Interface**
- Animated loading screen on startup
- Gradient ASCII art branding
- Responsive terminal design
- Semantic color theming
- Smart spacing and layout

⚡ **Developer Productivity**
- Powerful keyboard shortcuts (Ctrl+E, Ctrl+C, Ctrl+H, Ctrl+S, Ctrl+L)
- Postman-like slash commands
- Environment switching (dev/staging/prod)
- Request collections via JSON files
- Response saving and history
- File auto-completion and suggestions

� **Environment Variables**
- `{{variable}}` substitution in URLs, headers, and bodies
- Multiple environments (development, staging, production)
- Persistent variable storage
- Environment file management

## 🚀 Quick Start

### Installation

```bash
git clone https://github.com/rafi-haque/Relay.git
cd Relay
npm install
```

### Run the App

```bash
npm run dev
```

### Basic Usage

1. **Simple Request**:
   ```bash
   > /url https://jsonplaceholder.typicode.com/posts/1
   > /execute  # or press Ctrl+E
   ```

2. **With Environment Variables**:
   ```bash
   > /env load jsonplaceholder
   > /url {{API_BASE_URL}}/posts/{{POST_ID}}
   > /execute  # or press Ctrl+E
   ```

3. **Load Pre-made Request**:
   ```bash
   > /file get-user.json
   > /execute  # or press Ctrl+E
   ```

4. **Using Keyboard Shortcuts**:
   ```bash
   > /url https://api.example.com/users
   > Ctrl+E              # Execute instantly
   > Ctrl+S              # Save response
   > Ctrl+C              # Clear and start fresh
   ```

## ⌨️ Keyboard Shortcuts

Boost your productivity with these powerful keyboard shortcuts:

| Shortcut | Action | Description |
|----------|--------|-------------|
| `Ctrl+E` | Execute Request | Run the current HTTP request |
| `Ctrl+C` | Clear Request | Clear all request data and start fresh |
| `Ctrl+H` | Show Help | Display all commands and shortcuts |
| `Ctrl+S` | Save Response | Save the last response to a file |
| `Ctrl+L` | List Variables | Show all environment variables |

💡 **Pro Tip**: Keyboard shortcuts are shown at the bottom of the interface and work from anywhere in the app!

## 📋 Slash Commands

| Command | Description | Example |
|---------|-------------|---------|
| `/url <url>` | Set request URL | `/url https://api.example.com/users` |
| `/method <method>` | Set HTTP method | `/method POST` |
| `/header <key:value>` | Add header | `/header Authorization:Bearer {{AUTH_TOKEN}}` |
| `/body <json>` | Set request body | `/body {"name": "{{USER_NAME}}"}` |
| `/file <filename>` | Load request from JSON file | `/file get-user.json` |
| `/execute` | Execute the request | `/execute` (or press `Ctrl+E`) |
| `/clear` | Clear current request | `/clear` (or press `Ctrl+C`) |
| `/save <filename>` | Save response to file | `/save my-response.json` (or press `Ctrl+S`) |
| `/env <action>` | Environment variables | `/env set API_KEY abc123` |
| `/help` | Show available commands | `/help` (or press `Ctrl+H`) |

## 🌍 Environment Variables

### Quick Demo
```bash
# Load demo environment
> /env load jsonplaceholder

# Use variables in request
> /url {{API_BASE_URL}}/posts/{{POST_ID}}
> /execute

# Change variable dynamically
> /env set POST_ID 5
> /execute  # Now gets post #5
```

### Environment Commands
```bash
# Set variables
> /env set API_BASE_URL https://api.example.com
> /env set AUTH_TOKEN your-token-here

# Get variable
> /env get API_BASE_URL

# List all variables
> /env list

# Clear all variables
> /env clear

# Load environment from file
> /env load development
```

### Variable Substitution
Use `{{variable}}` syntax anywhere:
- **URLs**: `{{API_BASE_URL}}/users/{{USER_ID}}`
- **Headers**: `Authorization: Bearer {{AUTH_TOKEN}}`
- **Bodies**: `{"userId": "{{USER_ID}}", "name": "{{USER_NAME}}"}`

## 📁 File Management

### Request Files
Store and reuse requests as JSON files in the `requests/` directory:

```json
{
  "method": "GET",
  "url": "{{API_BASE_URL}}/users/{{USER_ID}}",
  "headers": {
    "Accept": "application/json",
    "Authorization": "Bearer {{AUTH_TOKEN}}"
  },
  "body": "{\"name\": \"{{USER_NAME}}\"}"
}
```

**Included Examples**:
- `get-user.json` - Simple GET request
- `create-post.json` - POST with JSON body  
- `get-user-with-env.json` - GET with environment variables
- `jsonplaceholder-post.json` - Demo request for JSONPlaceholder

### Response Files
Save responses for later analysis:

```bash
> /execute
> /save my-response.json
```

Responses are saved to `responses/` with complete request/response context.

### Environment Files
Manage different environments in the `environments/` directory:

**Available Environments**:
- `development.json` - Local development
- `staging.json` - Staging environment
- `production.json` - Production environment  
- `jsonplaceholder.json` - Demo environment

## 🎯 Workflows

### API Development Workflow
```bash
# 1. Load development environment
> /env load development

# 2. Test user endpoint
> /url {{API_BASE_URL}}/{{API_VERSION}}/users/{{USER_ID}}
> /header Authorization:Bearer {{AUTH_TOKEN}}
> /execute

# 3. Switch to staging
> /env load staging
> /execute  # Same request, different environment

# 4. Save response for analysis
> /save staging-user-response.json
```

### Quick Testing with JSONPlaceholder
```bash
# Load demo environment
> /env load jsonplaceholder

# Test different endpoints
> /file jsonplaceholder-post.json
> /execute

> /env set POST_ID 3
> /execute  # Get different post

# Try creating a post
> /method POST
> /url {{API_BASE_URL}}/posts
> /body {"title": "Test", "body": "Testing", "userId": {{USER_ID}}}
> /execute
```

## 🔧 Advanced Features

### Smart Input System
- **Cursor Navigation**: Use ← → arrow keys to edit anywhere in input
- **File Auto-completion**: Tab completion for `/file` command
- **Command History**: ↑ ↓ to navigate previous commands
- **Command Suggestions**: Auto-suggestions as you type

### Professional UI
- **Loading Animation**: Smooth startup experience
- **Single Response View**: Clean focus on current request/response
- **Responsive Layout**: Adapts to terminal size
- **Color-coded Status**: Visual feedback for request states

## 🏗 Architecture

Built with modern tools and patterns:

- **React + Ink**: Component-based terminal UI
- **TypeScript**: Full type safety
- **Modular Design**: Clean separation of concerns
- **Environment Management**: Professional variable handling
- **File System Integration**: Persistent storage for environments and responses

## 📦 Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Run tests
npm test

# Test specific features
npm test -- --testPathPatterns=Environment
```

### Project Structure
```
src/
├── core/                    # Core business logic
│   ├── http-client.ts      # HTTP request handling
│   └── environment-manager.ts # Environment variables
├── ui/                     # UI components
│   ├── App.tsx            # Main application
│   ├── components/        # Reusable components
│   └── colors.ts          # Theme system
├── __tests__/             # Test files
environments/              # Environment files
├── development.json       # Dev environment
├── staging.json          # Staging environment
├── production.json       # Production environment
└── jsonplaceholder.json  # Demo environment
requests/                  # Request templates
responses/                 # Saved responses
```

## 🎨 Theme System

Semantic color system with gradient support:
- **Primary**: Main content and text
- **Secondary**: Subtle details and metadata  
- **Accent**: Commands and interactive elements
- **Success/Error/Warning**: Status indicators
- **Gradient**: Beautiful ASCII art and highlights

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

---

**relay-cli** - Professional HTTP testing in your terminal 🚀