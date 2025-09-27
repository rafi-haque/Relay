# Demo Request Files

This folder contains example HTTP request files that can be used with the `/file` command in Relay CLI.

## Usage

```bash
/file get-user.json
/execute
```

## Available Demo Files

### `get-user.json`
- **Method**: GET
- **URL**: JSONPlaceholder API - Get user by ID
- **Headers**: Accept and User-Agent
- **Description**: Simple GET request to fetch user data

### `create-post.json`
- **Method**: POST
- **URL**: JSONPlaceholder API - Create new post
- **Headers**: Content-Type and Accept
- **Body**: JSON with title, body, and userId
- **Description**: POST request with JSON payload

### `auth-api.json`
- **Method**: GET
- **URL**: HTTPBin Bearer token test endpoint
- **Headers**: Authorization Bearer token
- **Description**: Authenticated API request example

### `update-user.json`
- **Method**: PUT
- **URL**: JSONPlaceholder API - Update user
- **Headers**: Content-Type and Accept
- **Body**: JSON with updated user data
- **Description**: PUT request to update existing resource

### `delete-post.json`
- **Method**: DELETE
- **URL**: JSONPlaceholder API - Delete post
- **Headers**: Accept
- **Description**: DELETE request to remove resource

## File Format

Request files should be JSON with the following structure:

```json
{
  "method": "GET|POST|PUT|DELETE|PATCH",
  "url": "https://api.example.com/endpoint",
  "headers": {
    "Header-Name": "Header-Value"
  },
  "body": "optional request body as string"
}
```

## Creating Your Own Files

1. Create a new `.json` file in this directory
2. Follow the format above
3. Use the `/file` command to load it
4. Execute with `/execute`

Example:
```bash
/file my-request.json
/execute
```