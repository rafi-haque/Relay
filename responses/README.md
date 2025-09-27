# Response Files

This directory contains saved HTTP response files from relay-cli.

## Usage

Use the `/save` command to save responses:

```bash
> /url https://api.example.com/data
> /execute
> /save my-response.json
```

## File Format

Saved files contain:
- `timestamp`: When the request was made
- `request`: The original request details (method, url, headers, body)
- `response`: The response data (status, headers, data)

## Example

```json
{
  "timestamp": "2025-09-27T10:30:00.000Z",
  "request": {
    "method": "GET",
    "url": "https://api.example.com/posts/1",
    "headers": {
      "Content-Type": "application/json"
    }
  },
  "response": {
    "status": 200,
    "statusText": "OK",
    "headers": {
      "content-type": "application/json"
    },
    "data": {
      "id": 1,
      "title": "Example Post"
    }
  }
}
```