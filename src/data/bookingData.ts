export interface BookingTestData {
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

export const bookingTemplates = {
  standard: {
    firstname: "George",
    lastname: "Kaseri",
    totalprice: 111,
    depositpaid: true,
    bookingdates: {
      checkin: "2024-01-01",
      checkout: "2024-01-02",
    },
    additionalneeds: "Breakfast",
  },

  premium: {
    firstname: "Premium",
    lastname: "Guest",
    totalprice: 500,
    depositpaid: true,
    bookingdates: {
      checkin: "2024-06-15",
      checkout: "2024-06-20",
    },
    additionalneeds: "Spa, Breakfast, Dinner",
  },

  budget: {
    firstname: "Budget",
    lastname: "Traveler",
    totalprice: 75,
    depositpaid: false,
    bookingdates: {
      checkin: "2024-03-10",
      checkout: "2024-03-12",
    },
    additionalneeds: "None",
  },

  longStay: {
    firstname: "Long",
    lastname: "Stay",
    totalprice: 1200,
    depositpaid: true,
    bookingdates: {
      checkin: "2024-02-01",
      checkout: "2024-02-15",
    },
    additionalneeds: "Weekly cleaning, Kitchen access",
  },
};

// Dynamic booking data generator
export function generateBookingData(
  template: keyof typeof bookingTemplates = "standard",
): BookingTestData {
  const base = bookingTemplates[template];
  const today = new Date();
  const checkin = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000); // 7 days from now
  const checkout = new Date(checkin.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days after checkin

  // Generate truly unique identifier using random component
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  const uniqueId = `${timestamp}_${random}`;

  return {
    ...base,
    firstname: `${base.firstname}_${uniqueId}`, // Make unique with random component
    bookingdates: {
      checkin: checkin.toISOString().split("T")[0],
      checkout: checkout.toISOString().split("T")[0],
    },
  };
}
