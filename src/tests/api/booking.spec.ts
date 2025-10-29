import { test, expect, request } from "@playwright/test";
import { BookingClient } from "../../api/bookingClient";

test.describe("@api Booking API", () => {
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
});
