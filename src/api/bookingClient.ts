import { APIRequestContext, expect } from "@playwright/test";
import Joi from "joi";

export interface BookingPayload {
  firstname: string;
  lastname: string;
  totalprice: number;
  depositpaid: boolean;
  bookingdates: {
    checkin: string;
    checkout: string;
  };
  additionalneeds?: string;
}

export class BookingClient {
  constructor(
    private request: APIRequestContext,
    private baseURL: string,
  ) {}

  async createBooking(payload: BookingPayload) {
    const res = await this.request.post(`${this.baseURL}/booking`, {
      data: payload,
    });
    expect(res.ok()).toBeTruthy();

    const body = await res.json();

    // ✅ Schema validation
    const schema = Joi.object({
      bookingid: Joi.number().required(),
      booking: Joi.object({
        firstname: Joi.string().required(),
        lastname: Joi.string().required(),
        totalprice: Joi.number().required(),
        depositpaid: Joi.boolean().required(),
        bookingdates: Joi.object({
          checkin: Joi.string().isoDate().required(),
          checkout: Joi.string().isoDate().required(),
        }),
        additionalneeds: Joi.string().optional(),
      }),
    });

    const { error } = schema.validate(body, { abortEarly: false });
    expect(
      error,
      `Schema validation failed: ${error?.message}`,
    ).toBeUndefined();

    return body;
  }

  async getBooking(id: number) {
    const res = await this.request.get(`${this.baseURL}/booking/${id}`);
    expect(res.ok()).toBeTruthy();
    return res.json();
  }
}
