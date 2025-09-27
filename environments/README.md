# Environment Variables

Environment variables in relay-cli allow you to use dynamic values in your requests, making it easy to switch between different environments (development, staging, production) and reuse common values.

## Usage

### Basic Commands

```bash
# Set a variable
> /env set API_BASE_URL https://api.example.com
> /env set AUTH_TOKEN your-token-here

# Get a variable
> /env get API_BASE_URL
API_BASE_URL = https://api.example.com

# List all variables
> /env list
Environment variables (2): API_BASE_URL=https://api.example.com, AUTH_TOKEN=your-token-here

# Clear all variables
> /env clear
All environment variables cleared

# Load environment from file
> /env load development
Loaded environment 'development'
```

### Using Variables in Requests

Use `{{variable_name}}` syntax in URLs, headers, and request bodies:

```bash
# Set up variables
> /env set API_BASE_URL https://jsonplaceholder.typicode.com
> /env set USER_ID 1

# Use in URL
> /url {{API_BASE_URL}}/users/{{USER_ID}}

# Use in headers  
> /header Authorization:Bearer {{AUTH_TOKEN}}

# Execute request
> /execute
```

## Environment Files

### Available Environments

- **development.json** - Local development environment
- **staging.json** - Staging environment for testing
- **production.json** - Production environment (use with caution)
- **jsonplaceholder.json** - JSONPlaceholder API for demos

### Creating Custom Environments

Create a new JSON file in the `environments/` directory:

```json
{
  "name": "my-environment",
  "description": "Custom environment description",
  "variables": {
    "API_BASE_URL": "https://my-api.com",
    "AUTH_TOKEN": "my-auth-token",
    "USER_ID": "123"
  }
}
```

## Example Workflows

### 1. JSONPlaceholder Demo

```bash
# Load JSONPlaceholder environment
> /env load jsonplaceholder

# Use pre-made request file
> /file jsonplaceholder-post.json

# Execute to get post #1
> /execute

# Change post ID
> /env set POST_ID 5

# Execute again to get post #5
> /execute
```

### 2. API Development Workflow

```bash
# Load development environment
> /env load development

# Test user endpoint
> /url {{API_BASE_URL}}/{{API_VERSION}}/users/{{USER_ID}}
> /header Authorization:Bearer {{AUTH_TOKEN}}
> /execute

# Switch to staging
> /env load staging
> /execute  # Same request, different environment
```

### 3. Dynamic Request Building

```bash
# Set variables for a POST request
> /env set API_BASE_URL https://api.example.com
> /env set CONTENT_TYPE application/json

# Build POST request
> /method POST
> /url {{API_BASE_URL}}/users
> /header Content-Type:{{CONTENT_TYPE}}
> /body {"name": "{{USER_NAME}}", "email": "{{USER_EMAIL}}"}

# Set dynamic values
> /env set USER_NAME "John Doe"
> /env set USER_EMAIL "john@example.com"

# Execute
> /execute
```

## Advanced Features

### Variable Substitution

- Variables are substituted in URLs, headers, and request bodies
- Use `{{variable_name}}` syntax
- Nested variables are supported
- Missing variables will show a warning and remain as-is

### Persistent Storage

- Environments are automatically saved to the `environments/` directory
- The default environment is loaded on startup
- Changes are persisted immediately

### Error Handling

- Missing variables show warnings but don't break requests
- Invalid environment files are handled gracefully
- Clear error messages for malformed commands

## Tips

1. **Use descriptive variable names**: `API_BASE_URL` instead of `URL`
2. **Group related variables**: Keep all API-related vars together
3. **Environment-specific values**: Use different tokens for dev/staging/prod
4. **Version your environments**: Save environment files in version control
5. **Security**: Don't commit production secrets to version control

## Sample Request Files

The `requests/` directory contains several example files that demonstrate environment variable usage:

- `get-user-with-env.json` - GET request with auth
- `create-user-with-env.json` - POST request with variables in body
- `jsonplaceholder-post.json` - Simple JSONPlaceholder example
- `jsonplaceholder-update-post.json` - PUT request with variables

Try them out:
```bash
> /env load jsonplaceholder
> /file jsonplaceholder-post.json
> /execute
```