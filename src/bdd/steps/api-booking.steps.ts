import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { BookingClient, BookingPayload } from "../../api/bookingClient";
import { CustomWorld } from "../support/world";

// Background steps
Given("I have access to the booking API", function (this: CustomWorld) {
  this.baseURL = "https://restful-booker.herokuapp.com";
});

Given("I can create valid booking requests", function (this: CustomWorld) {
  expect(this.baseURL).toBeDefined();
});

// George Kaseri booking scenario
Given(
  "I have a booking request for George Kaseri",
  function (this: CustomWorld) {
    this.bookingPayload = {
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
  },
);

When(
  "I submit the booking request to the API",
  async function (this: CustomWorld) {
    // Create request context on demand if not available
    if (!this.request) {
      const { request } = await import("playwright");
      this.request = await request.newContext();
    }

    this.bookingAPI = new BookingClient(this.request, this.baseURL);
    this.bookingResponse = await this.bookingAPI.createBooking(
      this.bookingPayload,
    );
  },
);

Then(
  "the booking should be created successfully",
  function (this: CustomWorld) {
    expect(this.bookingResponse).toBeDefined();
    expect(this.bookingResponse).toHaveProperty("bookingid");
    expect(this.bookingResponse).toHaveProperty("booking");
  },
);

Then(
  "the response should contain a valid booking ID",
  function (this: CustomWorld) {
    expect(typeof this.bookingResponse.bookingid).toBe("number");
    expect(this.bookingResponse.bookingid).toBeGreaterThan(0);

    // Store for later use
    this.createdBookingId = this.bookingResponse.bookingid;
  },
);

Then(
  "the booking details should match the request data",
  function (this: CustomWorld) {
    const booking = this.bookingResponse.booking;

    expect(booking.firstname).toBe("George");
    expect(booking.lastname).toBe("Kaseri");
    expect(booking.totalprice).toBe(111);
    expect(booking.depositpaid).toBe(true);
    expect(booking.bookingdates.checkin).toBe("2018-01-01");
    expect(booking.bookingdates.checkout).toBe("2019-01-01");
    expect(booking.additionalneeds).toBe("Breakfast");

    console.log(`Created booking with ID: ${this.createdBookingId}`);
  },
);

// Retrieve booking scenario
// Retrieve booking scenario
Given(
  "I have created a booking for George Kaseri",
  async function (this: CustomWorld) {
    // Create request context on demand if not available
    if (!this.request) {
      const { request } = await import("playwright");
      this.request = await request.newContext();
    }

    this.bookingAPI = new BookingClient(this.request, this.baseURL);
    const payload = BookingClient.createGeorgeKaseriBooking();
    this.bookingResponse = await this.bookingAPI.createBooking(payload);
    this.createdBookingId = this.bookingResponse.bookingid;
  },
);

When("I retrieve the booking by ID", async function (this: CustomWorld) {
  this.retrievedBooking = await this.bookingAPI.getBooking(
    this.createdBookingId,
  );
});

Then(
  "the booking details should be returned correctly",
  function (this: CustomWorld) {
    expect(this.retrievedBooking).toBeDefined();
    expect(this.retrievedBooking.firstname).toBe("George");
    expect(this.retrievedBooking.lastname).toBe("Kaseri");
  },
);

Then(
  "all booking fields should match the original request",
  function (this: CustomWorld) {
    expect(this.retrievedBooking.totalprice).toBe(111);
    expect(this.retrievedBooking.depositpaid).toBe(true);
    expect(this.retrievedBooking.bookingdates.checkin).toBe("2018-01-01");
    expect(this.retrievedBooking.bookingdates.checkout).toBe("2019-01-01");
    expect(this.retrievedBooking.additionalneeds).toBe("Breakfast");

    console.log(`Successfully retrieved booking ID: ${this.createdBookingId}`);
  },
);

// Error handling scenario
Given("I have an invalid booking request", function (this: CustomWorld) {
  this.invalidPayload = {
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
});

When(
  "I submit the invalid booking request",
  async function (this: CustomWorld) {
    try {
      // Create request context on demand if not available
      if (!this.request) {
        const { request } = await import("playwright");
        this.request = await request.newContext();
      }

      this.bookingAPI = new BookingClient(this.request, this.baseURL);
      // Force the invalid payload to be passed (this is expected to fail)
      await this.bookingAPI.createBooking(
        this.invalidPayload as BookingPayload,
      );
      this.requestSucceeded = true;
    } catch (error) {
      this.requestError = error as Error;
      this.requestSucceeded = false;
    }
  },
);

Then("the API should reject the request", function (this: CustomWorld) {
  expect(this.requestSucceeded).toBe(false);
});

Then("an appropriate error should be returned", function (this: CustomWorld) {
  expect(this.requestError).toBeDefined();
  console.log(
    `Properly handled invalid request with error: ${this.requestError.message}`,
  );
});

// Performance scenario
Given("I have a valid booking request", function (this: CustomWorld) {
  this.bookingPayload = BookingClient.createGeorgeKaseriBooking();
});

When("I submit the booking request", async function (this: CustomWorld) {
  // Create request context on demand if not available
  if (!this.request) {
    const { request } = await import("playwright");
    this.request = await request.newContext();
  }

  this.bookingAPI = new BookingClient(this.request, this.baseURL);
  this.startTime = Date.now();
  this.bookingResponse = await this.bookingAPI.createBooking(
    this.bookingPayload,
  );
  this.duration = Date.now() - this.startTime;
});

Then("the API should respond within 5 seconds", function (this: CustomWorld) {
  expect(this.duration).toBeLessThan(5000);
  console.log(`API response time: ${this.duration}ms`);
});

Then("the response should be successful", function (this: CustomWorld) {
  expect(this.bookingResponse).toBeDefined();
  expect(this.bookingResponse.bookingid).toBeGreaterThan(0);
});

// Health check scenario
Given("the booking service is running", function (this: CustomWorld) {
  // Service should be accessible
  expect(this.baseURL).toBe("https://restful-booker.herokuapp.com");
});

When("I check the API health endpoint", async function (this: CustomWorld) {
  // Create request context on demand if not available
  if (!this.request) {
    const { request } = await import("playwright");
    this.request = await request.newContext();
  }

  this.healthResponse = await this.request.get(`${this.baseURL}/ping`);
});

Then("the service should be available", function (this: CustomWorld) {
  expect(this.healthResponse.status()).toBe(201);
});

Then("return a healthy status", function (this: CustomWorld) {
  console.log("API service is healthy and available");
});
