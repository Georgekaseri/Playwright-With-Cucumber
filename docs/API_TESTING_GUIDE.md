# API Testing Guide

## Overview

This project uses Playwright for API testing with a custom BookingClient that provides type-safe, validated API interactions. The API tests target the Restful-Booker API for demonstration purposes.

## Key Commands

### Run API Tests

```bash
# Run all API tests
npm run test:api

# Run API tests with specific tags
npx playwright test --grep @api

# Run API smoke tests only
npx playwright test --grep "@api @smoke"

# Run API tests with browser UI
npx playwright test --grep @api --ui
```

### BDD API Tests

```bash
# Run BDD API scenarios
npm run bdd -- --tags "@api"

# Run BDD API smoke tests
npm run bdd:smoke -- --tags "@api"
```

## Architecture

### BookingClient

The `BookingClient` class (`src/api/bookingClient.ts`) provides a type-safe wrapper around the Restful-Booker API:

- **Validation**: Uses Joi schemas for request and response validation
- **Type Safety**: TypeScript interfaces for all payloads and responses
- **Error Handling**: Meaningful error messages for failed requests

### Key Interfaces

```typescript
interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;  // Format: YYYY-MM-DD
    checkout: string; // Format: YYYY-MM-DD
  };
  additionalneeds?: string;
}

interface BookingResponse {
  bookingid: number;
  booking: BookingPayload;
}
```

### Available Methods

| Method | Description | Returns |
|--------|-------------|---------|
| `createBooking(payload)` | Creates a new booking with validation | `BookingResponse` |
| `createBookingRaw(payload)` | Creates booking without validation (for testing invalid data) | `APIResponse` |
| `getBooking(bookingId)` | Retrieves a booking by ID | `BookingPayload` |
| `deleteBooking(bookingId)` | Deletes a booking (requires authentication) | `void` |
| `auth()` | Authenticates and returns a token | `string` |
| `healthCheck()` | Checks API service availability | `boolean` |

## Test Types

### Smoke Tests (`@api @smoke`)

Quick validation tests that verify basic API functionality:

- Create booking
- Retrieve booking
- API health check

### Regression Tests (`@api @regression`)

Comprehensive tests covering edge cases:

- Invalid data handling
- Non-existent resource handling
- Data validation

### Performance Tests (`@api @performance`)

Response time validation:

- Booking creation under 5 seconds
- API response time monitoring

### Contract Tests (`@api @contract-testing`)

API contract validation:

- Response schema validation
- Required field verification

## Environment Configuration

### API Endpoints

The default API base URL is `https://restful-booker.herokuapp.com`. Configure via environment variables:

```env
BOOKER_BASE_URL=https://restful-booker.herokuapp.com
BOOKER_USERNAME=admin
BOOKER_PASSWORD=password123
```

### Environment-Specific Testing

```bash
# Run API tests against development environment
npm run test:api -- --grep "@api"

# Run with specific environment
cross-env NODE_ENV=qa npm run test:api
```

## Writing API Tests

### Basic Test Structure

```typescript
import { test, expect, request } from "@playwright/test";
import { BookingClient } from "../../api/bookingClient";

test.describe("@api Booking API Tests", () => {
  const baseURL = "https://restful-booker.herokuapp.com";

  test("@api @smoke should create booking", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    const payload = BookingClient.createGeorgeKaseriBooking();
    const response = await bookingAPI.createBooking(payload);

    expect(response.bookingid).toBeGreaterThan(0);
    expect(response.booking.firstname).toBe("George");

    await req.dispose();
  });
});
```

### Using Utility Functions

```typescript
import { createBookingViaAPI } from "../../utils/apiUtils";

// Create booking using utility function
const booking = await createBookingViaAPI();
expect(booking.bookingid).toBeGreaterThan(0);
```

## Troubleshooting

### API Connection Issues

If tests fail with connection errors:

1. Check API service availability: `curl https://restful-booker.herokuapp.com/ping`
2. Verify network connectivity
3. Check for rate limiting (wait and retry)

### Validation Errors

If validation errors occur:

1. Check payload format matches `BookingPayload` interface
2. Verify date format is `YYYY-MM-DD`
3. Ensure required fields are provided

### Authentication Failures

If authentication fails:

1. Verify credentials in environment variables
2. Check token expiration
3. Use `createBookingRaw()` for testing without authentication

## Best Practices

### Request Handling

- Always dispose of request context after use: `await req.dispose()`
- Use meaningful test data (George Kaseri example)
- Validate both success and error scenarios

### Test Organization

- Tag tests appropriately (`@api`, `@smoke`, `@regression`)
- Group related tests in describe blocks
- Use descriptive test names

### Data Management

- Clean up created resources when possible
- Use unique identifiers for test data
- Avoid hardcoded IDs in tests

### Error Handling

- Test both valid and invalid inputs
- Verify error messages are meaningful
- Check appropriate HTTP status codes

## File Locations

- **API Client**: `src/api/bookingClient.ts`
- **API Tests**: `src/tests/api/booking.spec.ts`
- **BDD Features**: `src/bdd/features/api-booking.feature`
- **Step Definitions**: `src/bdd/steps/api-booking.steps.ts`
- **Utilities**: `src/utils/apiUtils.ts`
- **Package Scripts**: `package.json` (test:api command)
