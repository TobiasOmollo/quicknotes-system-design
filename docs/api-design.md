# QuickNotes REST API Design

## Conventions

- Base URL: `/api/v1`
- Requests and responses use JSON unless a response has no body.
- Endpoints that access a user's notes require a valid bearer token.
- Note IDs are opaque strings. A note belongs to the authenticated user.

## Endpoints

| Method | Path | Description | Success status |
|---|---|---|---|
| `POST` | `/api/v1/notes` | Create a note for the authenticated user. | `201 Created` |
| `GET` | `/api/v1/notes` | List the authenticated user's notes. Supports `limit` and `cursor` query parameters for pagination. | `200 OK` |
| `GET` | `/api/v1/notes/{noteId}` | Retrieve one of the authenticated user's notes. | `200 OK` |
| `PUT` | `/api/v1/notes/{noteId}` | Replace a note's title and body. | `200 OK` |
| `PATCH` | `/api/v1/notes/{noteId}` | Update one or more note fields. | `200 OK` |
| `DELETE` | `/api/v1/notes/{noteId}` | Delete a note. The response has no body. | `204 No Content` |

Notes have a server-generated `id`, an `ownerId`, a `title`, a `body`, and ISO 8601 `createdAt` and `updatedAt` timestamps. Titles are required and may contain up to 100 characters; bodies are required.

## Create a note

### Request

`POST /api/v1/notes`

```http
Authorization: Bearer <access-token>
Content-Type: application/json
```

```json
{
  "title": "Meeting notes",
  "body": "Discuss the launch checklist."
}
```

### Response

`201 Created`

```json
{
  "id": "note_01J8Z6Q5XK2M",
  "ownerId": "user_42",
  "title": "Meeting notes",
  "body": "Discuss the launch checklist.",
  "createdAt": "2026-10-29T15:45:00Z",
  "updatedAt": "2026-10-29T15:45:00Z"
}
```

## List notes

### Request

`GET /api/v1/notes?limit=2`

```http
Authorization: Bearer <access-token>
Accept: application/json
```

### Response

`200 OK`

```json
{
  "items": [
    {
      "id": "note_01J8Z6Q5XK2M",
      "ownerId": "user_42",
      "title": "Meeting notes",
      "body": "Discuss the launch checklist.",
      "createdAt": "2026-10-29T15:45:00Z",
      "updatedAt": "2026-10-29T15:45:00Z"
    },
    {
      "id": "note_01J8Z5T3D9P1",
      "ownerId": "user_42",
      "title": "Ideas",
      "body": "Draft the onboarding flow.",
      "createdAt": "2026-10-28T12:10:00Z",
      "updatedAt": "2026-10-28T12:10:00Z"
    }
  ],
  "nextCursor": null
}
```

`nextCursor` is a string when another page is available and `null` when the list is complete. An empty list returns `"items": []`.

## Error responses

Errors use a consistent JSON body:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "The title is required.",
    "details": [
      {
        "field": "title",
        "issue": "required"
      }
    ]
  }
}
```

The `details` property may be omitted when there are no field-specific details. The API can return these error statuses:

| Status | Meaning | Example code |
|---|---|---|
| `400 Bad Request` | The request is malformed or fails validation. | `VALIDATION_ERROR` |
| `401 Unauthorized` | Authentication is missing, invalid, or expired. | `UNAUTHENTICATED` |
| `403 Forbidden` | The authenticated user is not allowed to perform the operation. | `FORBIDDEN` |
| `404 Not Found` | The requested resource does not exist or is not accessible to the user. | `NOTE_NOT_FOUND` |
| `500 Internal Server Error` | An unexpected server error occurred. | `INTERNAL_ERROR` |
