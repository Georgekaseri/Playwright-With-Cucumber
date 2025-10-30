import { test, expect, request } from "@playwright/test";
import { BookingClient } from "../../api/bookingClient";

test.describe("@api Booking API Tests", () => {
  const baseURL = "https://restful-booker.herokuapp.com";

  const payload = {
    firstname: "Jim",
    lastname: "Brown",
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: "2018-01-01",
      checkout: "2019-01-01",
    },
    additionalneeds: "Breakfast",
  };

  test("@api @smoke should create and retrieve a booking", async () => {
    const req = await request.newContext();
    const bookingAPI = new BookingClient(req, baseURL);

    const created = await bookingAPI.createBooking(payload);
    const id = created.bookingid;

    const fetched = await bookingAPI.getBooking(id);

    expect(fetched.firstname).toBe(payload.firstname);
    expect(fetched.lastname).toBe(payload.lastname);

    await req.dispose();
  });

  test("@api @regression should handle invalid booking data", async () => {
    const req = await request.newContext();

    const invalidPayload = {
      firstname: "", // Invalid: empty firstname
      lastname: "Smith",
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
      const bookingAPI = new BookingClient(req, baseURL);
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
    await bookingAPI.createBooking(payload);
    const duration = Date.now() - startTime;

    // API should respond within 5 seconds
    expect(duration).toBeLessThan(5000);
    console.log(`API response time: ${duration}ms`);

    await req.dispose();
  });

  test("@api @health should verify API service availability", async () => {
    const req = await request.newContext();

    // Check if API is available
    const healthResponse = await req.get(`${baseURL}/ping`);
    expect(healthResponse.status()).toBe(201);

    await req.dispose();
  });
});
