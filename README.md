# Relay HTTP CLI

A beautiful terminal HTTP client inspired by Google's Gemini CLI design patterns.

## Features

🎨 **Beautiful Interface**
- Gradient ASCII art logo
- Semantic color theming
- Responsive terminal design
- Clean, modern UI

⚡ **Powerful HTTP Client**
- Support for all HTTP methods (GET, POST, PUT, DELETE, PATCH)
- Custom headers and request bodies
- Response time and size metrics
- Beautiful response formatting

🛠 **Developer Experience**
- TypeScript for type safety
- React + Ink for component-based UI
- Modular architecture
- Extensible theme system

## Installation

```bash
npm install -g @relay/http-cli
```

## Usage

Simply run the CLI:

```bash
relay
```

Follow the interactive prompts:
1. Select HTTP method
2. Enter URL
3. Add headers (optional)
4. Add request body (for POST/PUT/PATCH)

## Examples

### GET Request
```
Method: GET
URL: https://jsonplaceholder.typicode.com/posts/1
```

### POST Request with JSON
```
Method: POST
URL: https://jsonplaceholder.typicode.com/posts
Headers: Content-Type:application/json
Body: {"title": "Test Post", "body": "This is a test", "userId": 1}
```

### Enhanced Input Features

**Smart Cursor Navigation:**
- Use ← → arrow keys to move cursor within input
- Insert/edit text at any position
- Backspace works from cursor position
- Visual cursor indicator with `_`

**File Auto-Completion:**
- Type `/file ` to see available .json files
- Files auto-discovered from `requests/` folder
- Tab completion for file names
- Smart filtering as you type

## Slash Commands

Relay supports Postman-like slash commands for quick request building:

| Command | Description | Example |
|---------|-------------|---------|
| `/url <url>` | Set request URL | `/url https://api.example.com/users` |
| `/method <method>` | Set HTTP method | `/method POST` |
| `/header <key:value>` | Add header | `/header Authorization:Bearer token123` |
| `/body <json>` | Set request body | `/body {"name": "John Doe"}` |
| `/file <filename>` | Load request from JSON file | `/file get-user.json` |
| `/execute` | Execute the request | `/execute` |
| `/clear` | Clear current request | `/clear` |
| `/help` | Show available commands | `/help` |

### Request Files

Load pre-configured requests from JSON files:

```bash
/file get-user.json
/execute
```

**Demo files included:**
- `get-user.json` - Simple GET request
- `create-post.json` - POST with JSON body
- `auth-api.json` - Authenticated request
- `update-user.json` - PUT request
- `delete-post.json` - DELETE request

**File format:**
```json
{
  "method": "GET",
  "url": "https://api.example.com/users/1",
  "headers": {
    "Accept": "application/json",
    "Authorization": "Bearer token"
  },
  "body": "{\"key\": \"value\"}"
}
```

## Architecture

Based on Gemini CLI's design patterns:

- **React Components**: Modular, reusable UI components
- **Semantic Colors**: Structured color system with themes
- **Responsive Design**: Adapts to terminal size
- **Clean Architecture**: Separation of concerns

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Run built version
npm start
```

## Theme System

Relay uses a semantic color system inspired by Gemini CLI:

- **Primary**: Main text and content
- **Secondary**: Subtle text and details
- **Accent**: Highlights and important elements
- **Status**: Success, error, warning, info states

## License

MIT License - see LICENSE file for details.