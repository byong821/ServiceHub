# ServiceHub API Documentation

Base URL: `http://localhost:5001/api`

---

## Authentication

### Register
- **POST** `/auth/register`
- **Body**: `{ username, email, password, major?, gradYear? }`
- **Response**: `{ user: { _id, username, email, ... } }`
- **Notes**: Email must end with `.edu`

### Login
- **POST** `/auth/login`
- **Body**: `{ email, password }`
- **Response**: `{ user: { _id, username, email, ... } }`
- **Notes**: Creates session cookie

### Logout
- **POST** `/auth/logout`
- **Response**: `{ message: 'Logged out' }`

### Get Current User
- **GET** `/auth/me`
- **Response**: `{ user: { _id, username, email, ... } }`
- **Auth**: Required

---

## Users

### Get User
- **GET** `/users/:id`
- **Response**: `{ user: { _id, username, email, major, gradYear, ... } }`

### Update User
- **PUT** `/users/:id`
- **Body**: `{ username?, major?, gradYear? }`
- **Response**: `{ user: { ... } }`
- **Auth**: Required (own profile only)

---

## Services

### Create Service
- **POST** `/services`
- **Body**: `{ title, description, category, hourlyRate, location, isEmergency? }`
- **Response**: `{ service: { _id, ... } }`
- **Auth**: Required

### List Services
- **GET** `/services?q=search&category=tech&min=10&max=100&page=1&limit=10`
- **Query Params**: `q, category, min, max, page, limit`
- **Response**: `{ items: [...], total, page, limit }`

### Get Service
- **GET** `/services/:id`
- **Response**: `{ service: { _id, title, ... } }`

### Update Service
- **PUT** `/services/:id`
- **Body**: `{ title?, description?, hourlyRate?, ... }`
- **Response**: `{ service: { ... } }`
- **Auth**: Required (owner only)

### Delete Service
- **DELETE** `/services/:id`
- **Response**: `{ message: 'Deleted' }`
- **Auth**: Required (owner only)

---

## Bookings

### Create Booking
- **POST** `/bookings`
- **Body**: `{ serviceId, providerId, date, time, duration, message?, totalPrice }`
- **Response**: `{ booking: { _id, ... } }`
- **Auth**: Required
- **Notes**: Checks for time conflicts

### List Bookings
- **GET** `/bookings?role=customer&status=pending&page=1&limit=10`
- **Query Params**: `role (customer|provider), status, page, limit`
- **Response**: `{ bookings: [...], total, page, limit }`
- **Auth**: Required

### Get Booking
- **GET** `/bookings/:id`
- **Response**: `{ booking: { _id, ..., messages: [...] } }`
- **Auth**: Required (customer or provider only)

### Update Booking Status
- **PUT** `/bookings/:id/status`
- **Body**: `{ status: 'confirmed' | 'completed' | 'cancelled' }`
- **Response**: `{ success: true, status }`
- **Auth**: Required (provider for confirm/complete, customer for cancel)

### Add Message
- **POST** `/bookings/:id/messages`
- **Body**: `{ text }`
- **Response**: `{ message: { userId, text, timestamp } }`
- **Auth**: Required (customer or provider only)

### Get Stats
- **GET** `/bookings/stats`
- **Response**: `{ stats: { totalEarnings, completedCount, pendingCount, confirmedCount } }`
- **Auth**: Required

---

## Reviews

### Create Review
- **POST** `/reviews`
- **Body**: `{ bookingId, serviceId, providerId, rating, comment }`
- **Response**: `{ review: { _id, ... } }`
- **Auth**: Required
- **Notes**: Only for completed bookings, one review per booking

### Get Service Reviews
- **GET** `/reviews/service/:serviceId?page=1&limit=10`
- **Response**: `{ reviews: [...], total, averageRating, page, limit }`

### Get Provider Reviews
- **GET** `/reviews/provider/:providerId?page=1&limit=10`
- **Response**: `{ reviews: [...], total, page, limit }`

### Update Review
- **PUT** `/reviews/:id`
- **Body**: `{ rating, comment }`
- **Response**: `{ success: true }`
- **Auth**: Required (own review only)

### Add Provider Response
- **POST** `/reviews/:id/response`
- **Body**: `{ response }`
- **Response**: `{ success: true }`
- **Auth**: Required (provider only)

---

## Error Responses

All endpoints return errors in format:
```json
{
  "error": "Error message"
}
```

Common status codes:
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
