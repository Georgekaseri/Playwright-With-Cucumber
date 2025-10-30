import { APIRequestContext } from "@playwright/test";
import * as Joi from "joi";

// Booking interfaces
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

export interface BookingResponse {
  bookingid: number;
  booking: BookingPayload;
}

export class BookingClient {
  private static readonly bookingSchema = Joi.object({
    firstname: Joi.string().min(1).required(),
    lastname: Joi.string().min(1).required(),
    totalprice: Joi.number().positive().required(),
    depositpaid: Joi.boolean().required(),
    bookingdates: Joi.object({
      checkin: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
      checkout: Joi.string()
        .pattern(/^\d{4}-\d{2}-\d{2}$/)
        .required(),
    }).required(),
    additionalneeds: Joi.string().optional().allow(""),
  });

  private static readonly responseSchema = Joi.object({
    bookingid: Joi.number().positive().required(),
    booking: BookingClient.bookingSchema.required(),
  });

  constructor(
    private request: APIRequestContext,
    private baseURL: string
  ) {}

  async createBooking(payload: BookingPayload): Promise<BookingResponse> {
    this.validatePayload(payload);

    const response = await this.request.post(`${this.baseURL}/booking`, {
      data: payload,
      headers: { "Content-Type": "application/json" },
    });

    if (!response.ok()) {
      throw new Error(`API request failed with status: ${response.status()}`);
    }

    const responseData = (await response.json()) as BookingResponse;
    this.validateResponse(responseData);

    return responseData;
  }

  async getBooking(bookingId: number): Promise<BookingPayload> {
    const response = await this.request.get(
      `${this.baseURL}/booking/${bookingId}`
    );

    if (!response.ok()) {
      throw new Error(
        `Failed to get booking with ID ${bookingId}: ${response.status()}`
      );
    }

    const bookingData = (await response.json()) as BookingPayload;
    this.validatePayload(bookingData);

    return bookingData;
  }

  private validatePayload(data: BookingPayload): void {
    const { error } = BookingClient.bookingSchema.validate(data, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(`Validation failed: ${error.message}`);
    }
  }

  private validateResponse(data: BookingResponse): void {
    const { error } = BookingClient.responseSchema.validate(data, {
      abortEarly: false,
    });
    if (error) {
      throw new Error(`Response validation failed: ${error.message}`);
    }
  }

  static createGeorgeKaseriBooking(): BookingPayload {
    return {
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
  }
}
