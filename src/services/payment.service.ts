import axios from "axios";

interface CardChargeData {
  tx_ref: string;
  amount: number;
  currency: string;
  redirect_url: string;
  payment_type: string;
  card: {
    number: string;
    cvv: string;
    expiry_month: string;
    expiry_year: string;
  };
  customer: {
    id: string;
    email: string;
    name?: string; // Optional fields can be marked with `?`
  };
}

interface SaveCardData {
  token: string; // Card token provided by the payment gateway
  customer: {
    id: string;
    email: string;
  };
}

class PaymentService {
  private flutterwaveBaseUrl = "https://api.flutterwave.com/v3";
  private flutterwaveSecretKey = process.env.FLUTTERWAVE_SECRET_KEY;

  async processPayment(
    userId: string,
    cardToken: string,
    amount: number,
    courseId?: string,
  ) {
    console.log(courseId);
    const paymentPayload = {
      tx_ref: `TX-${Date.now()}`,
      amount,
      currency: "USD",
      redirect_url: "https://your-frontend-url.com/payment-redirect",
      payment_type: "card",
      card: {
        token: cardToken,
      },
      customer: {
        id: userId,
      },
    };

    try {
      const response = await axios.post(
        "https://api.flutterwave.com/v3/payments",
        paymentPayload,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error("Payment processing failed:", error); // Log the error for debugging
      throw new Error("Payment processing failed");
    }
  }

  async verifyPayment(paymentId: string) {
    try {
      const response = await axios.get(
        `https://api.flutterwave.com/v3/transactions/${paymentId}/verify`,
        {
          headers: {
            Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
          },
        },
      );

      return response.data;
    } catch (error) {
      console.error(error); // Log the error for debugging
      throw new Error("Payment verification failed");
    }
  }

  async chargeCard(data: CardChargeData) {
    const url = `${this.flutterwaveBaseUrl}/charges?type=card`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    };
    const response = await axios.post(url, data, config);
    return response.data;
  }

  async saveCard(data: SaveCardData) {
    const url = `${this.flutterwaveBaseUrl}/tokens`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    };
    const response = await axios.post(url, data, config);
    return response.data;
  }

  async deleteCard(cardToken: string) {
    const url = `${this.flutterwaveBaseUrl}/tokens/${cardToken}`;
    const config = {
      headers: {
        Authorization: `Bearer ${this.flutterwaveSecretKey}`,
      },
    };
    const response = await axios.delete(url, config);
    return response.data;
  }
}

export default new PaymentService();
