import { request } from "@playwright/test";
import { BookingClient } from "../api/bookingClient";

export async function createBookingViaAPI() {
  const req = await request.newContext();
  const bookingClient = new BookingClient(
    req,
    "https://restful-booker.herokuapp.com",
  );

  const payload = {
    firstname: "Integration",
    lastname: "Test",
    totalprice: 150,
    depositpaid: true,
    bookingdates: {
      checkin: "2025-01-01",
      checkout: "2025-01-05",
    },
    additionalneeds: "Breakfast",
  };

  const res = await bookingClient.createBooking(payload);
  await req.dispose();
  return res;
}
