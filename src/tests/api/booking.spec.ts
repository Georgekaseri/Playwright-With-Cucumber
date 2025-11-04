import { test, expect, request } from "@playwright/test";
import { BookingClient } from "../../api/bookingClient";

test.describe("@api Booking API Tests", () => {
  const baseURL = "https://restful-booker.herokuapp.com";

  const georgeKaseriPayload = {
    firstname: "George",
    lastname: "Kaseri",
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: "2018-01-01",
      checkout: "2019-01-01",
    },
    additionalneeds: "Breakfast",
  };

  test("@api @smoke should create booking with George Kaseri data", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    const response = await bookingAPI.createBooking(georgeKaseriPayload);

    expect(response).toHaveProperty("bookingid");
    expect(response).toHaveProperty("booking");
    expect(typeof response.bookingid).toBe("number");
    expect(response.bookingid).toBeGreaterThan(0);

    // Validate booking data matches request
    expect(response.booking.firstname).toBe("George");
    expect(response.booking.lastname).toBe("Kaseri");
    expect(response.booking.totalprice).toBe(111);
    expect(response.booking.depositpaid).toBe(true);
    expect(response.booking.bookingdates.checkin).toBe("2018-01-01");
    expect(response.booking.bookingdates.checkout).toBe("2019-01-01");
    expect(response.booking.additionalneeds).toBe("Breakfast");

    console.log(`Created booking with ID: ${response.bookingid}`);

    await req.dispose();
  });

  test("@api @smoke should retrieve created booking", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    // Create booking first
    const createResponse = await bookingAPI.createBooking(georgeKaseriPayload);
    const bookingId = createResponse.bookingid;

    // Retrieve the created booking
    const retrievedBooking = await bookingAPI.getBooking(bookingId);

    // Validate retrieved data matches original
    expect(retrievedBooking.firstname).toBe("George");
    expect(retrievedBooking.lastname).toBe("Kaseri");
    expect(retrievedBooking.totalprice).toBe(111);
    expect(retrievedBooking.depositpaid).toBe(true);
    expect(retrievedBooking.bookingdates.checkin).toBe("2018-01-01");
    expect(retrievedBooking.bookingdates.checkout).toBe("2019-01-01");
    expect(retrievedBooking.additionalneeds).toBe("Breakfast");

    console.log(`Successfully retrieved booking ID: ${bookingId}`);

    await req.dispose();
  });

  test("@api @regression should handle invalid booking data", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    const invalidPayload = {
      firstname: "", // Invalid: empty firstname
      lastname: "Kaseri",
      totalprice: -10, // Invalid: negative price
      depositpaid: true,
      bookingdates: {
        checkin: "2025-01-01",
        checkout: "2024-01-01", // Invalid: checkout before checkin
      },
      additionalneeds: "Wifi",
    };

    // Should handle invalid data gracefully
    await expect(async () => {
      await bookingAPI.createBooking(invalidPayload);
    }).rejects.toThrow();

    await req.dispose();
  });

  test("@api @regression should retrieve all bookings", async () => {
    const req = await request.newContext();

    // Get list of bookings
    const response = await req.get(`${baseURL}/booking`);
    expect(response.status()).toBe(200);

    const bookings = await response.json();
    expect(Array.isArray(bookings)).toBe(true);
    expect(bookings.length).toBeGreaterThan(0);

    // Validate booking list structure
    if (bookings.length > 0) {
      expect(bookings[0]).toHaveProperty("bookingid");
      expect(typeof bookings[0].bookingid).toBe("number");
    }

    console.log(`📋 Found ${bookings.length} bookings in the system`);

    await req.dispose();
  });

  test("@api @smoke should handle non-existent booking gracefully", async () => {
    const req = await request.newContext();

    // Try to get a booking that doesn't exist
    const response = await req.get(`${baseURL}/booking/999999`);
    expect(response.status()).toBe(404);

    await req.dispose();
  });

  test("@api @performance should create booking within time threshold", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    const startTime = Date.now();
    await bookingAPI.createBooking(georgeKaseriPayload);
    const duration = Date.now() - startTime;

    // API should respond within 5 seconds
    expect(duration).toBeLessThan(5000);
    console.log(`⚡ API response time: ${duration}ms`);

    await req.dispose();
  });

  test("@api @health should verify API service availability", async () => {
    const req = await request.newContext();

    // Check if API is available
    const healthResponse = await req.get(`${baseURL}/ping`);
    expect(healthResponse.status()).toBe(201);

    console.log("API service is healthy and available");

    await req.dispose();
  });

  test("@api @regression should test utility method", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    // Test the utility method
    const utilityPayload = BookingClient.createGeorgeKaseriBooking();
    const response = await bookingAPI.createBooking(utilityPayload);

    expect(response.booking.firstname).toBe("George");
    expect(response.booking.lastname).toBe("Kaseri");

    console.log("Utility method works correctly");

    await req.dispose();
  });
});
