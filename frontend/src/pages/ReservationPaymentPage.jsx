import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { useSettings } from "../contexts/SettingsContext";
import {
  Calendar,
  Clock,
  CreditCard,
  CheckCircle,
  Loader2,
  MapPin,
  Users,
} from "lucide-react";

import { reservationAPI, paymentAPI } from "../services/api";
import { loadScript } from "../utils/razorpay";

const DEFAULT_DEPOSIT_AMOUNT = 100;

const ReservationPaymentPage = () => {
  const { reservationId } = useParams();
  const navigate = useNavigate();
  const { restaurantName } = useSettings();

  const [reservation, setReservation] = useState(null);
  const [loadingReservation, setLoadingReservation] = useState(true);
  const [paying, setPaying] = useState(false);

  useEffect(() => {
    const fetchReservation = async () => {
      try {
        setLoadingReservation(true);
        const res = await reservationAPI.getReservation(reservationId);
        setReservation(res.data.data);
      } catch (error) {
        const errorMessage =
          error.response?.data?.error ||
          "Failed to load reservation details";
        toast.error(errorMessage);
        navigate("/my-reservations");
      } finally {
        setLoadingReservation(false);
      }
    };

    if (reservationId) {
      fetchReservation();
    }
  }, [reservationId, navigate]);

  const canPay = () => {
    if (!reservation) return false;
    if (reservation.depositPaid) return false;
    if (reservation.paymentStatus === "completed") return false;
    if (reservation.status === "confirmed") return false;
    if (reservation.status === "cancelled" || reservation.status === "completed")
      return false;
    return true;
  };

  const handlePayDeposit = async () => {
    if (!reservation) return;

    if (!canPay()) {
      toast.info("Deposit already paid or payment already completed.");
      navigate("/my-reservations");
      return;
    }

    setPaying(true);
    try {
      const depositAmount = DEFAULT_DEPOSIT_AMOUNT;
      const paymentOrderRes = await paymentAPI.createReservationPayment({
        reservationId,
        amount: depositAmount,
        currency: "INR",
      });

      const order = paymentOrderRes.data.data;

      const scriptLoaded = await loadScript(
        "https://checkout.razorpay.com/v1/checkout.js"
      );
      if (!scriptLoaded) {
        throw new Error("Razorpay SDK failed to load. Please try again.");
      }

      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: restaurantName,
        description: "Reservation deposit",
        order_id: order.id,
        prefill: {
          name: reservation.name,
          email: reservation.email,
          contact: reservation.phone,
        },
        theme: {
          color: "#f97316",
        },
        handler: async function (response) {
          try {
            const verifyRes = await paymentAPI.verifyPayment(response);
            const emailSent = verifyRes?.data?.data?.emailSent;
            toast.success(
              emailSent
                ? "Deposit payment successful! Receipt sent to your email."
                : "Deposit payment successful! (Receipt email could not be sent.)"
            );
            navigate("/my-reservations");
          } catch (err) {
            const errorMessage =
              err.response?.data?.error ||
              "Payment verification failed. Please try again.";
            toast.error(errorMessage);
          } finally {
            setPaying(false);
          }
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", async function (paymentResponse) {
        try {
          await paymentAPI.markReservationPaymentFailed({
            reservationId,
            reason:
              paymentResponse?.error?.description ||
              paymentResponse?.error?.reason ||
              "Payment failed",
          });
        } catch (markErr) {
          console.error("Failed to mark payment failure:", markErr);
        } finally {
          setPaying(false);
        }
        toast.error("Payment failed. Your reservation was saved but not confirmed.");
        navigate("/my-reservations");
      });
      rzp.open();
    } catch (error) {
      const errorMessage =
        error.response?.data?.error ||
        error.message ||
        "Failed to initiate payment";
      toast.error(errorMessage);
      setPaying(false);
    }
  };

  if (loadingReservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="animate-spin h-10 w-10 text-orange-600 mx-auto mb-3" />
          <p className="text-gray-700 font-semibold">
            Loading reservation...
          </p>
        </div>
      </div>
    );
  }

  if (!reservation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <p className="text-gray-700 font-semibold">
          Reservation not found.
        </p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50">
      <div className="w-full px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">
              Complete Your <span className="text-orange-600">Deposit</span>
            </h1>
            <p className="text-gray-600">
              Pay a fixed deposit of{" "}
              <span className="font-semibold">
                ₹{DEFAULT_DEPOSIT_AMOUNT}
              </span>{" "}
              to confirm your reservation.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Reservation for {reservation.name}
                </h2>
                <p className="text-gray-600">{reservation.email}</p>
              </div>
              {reservation.depositPaid ? (
                <div className="flex items-center gap-2 text-green-700 font-semibold">
                  <CheckCircle className="h-6 w-6" />
                  Paid
                </div>
              ) : (
                <div className="flex items-center gap-2 text-orange-700 font-semibold">
                  <CreditCard className="h-6 w-6" />
                  Deposit Required
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Date</p>
                  <p className="font-semibold text-gray-900">
                    {new Date(reservation.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Time</p>
                  <p className="font-semibold text-gray-900">
                    {reservation.time}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Guests</p>
                  <p className="font-semibold text-gray-900">
                    {reservation.numberOfPeople} {reservation.numberOfPeople === 1 ? "Guest" : "Guests"}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <MapPin className="h-5 w-5 text-gray-500" />
                <div>
                  <p className="text-sm text-gray-500">Table</p>
                  <p className="font-semibold text-gray-900 capitalize">
                    {reservation.tableType?.replace("-", " ")}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <button
                onClick={handlePayDeposit}
                disabled={paying || !canPay()}
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 text-white py-4 px-6 rounded-xl font-bold text-lg hover:from-orange-600 hover:to-red-700 focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-[1.01] shadow-lg hover:shadow-xl"
              >
                {paying ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 className="animate-spin h-5 w-5" />
                    Processing...
                  </div>
                ) : (
                  `Pay ₹${DEFAULT_DEPOSIT_AMOUNT} Deposit`
                )}
              </button>

              <p className="mt-4 text-sm text-gray-600 text-center">
                After successful payment, a receipt will be emailed to your reservation email.
              </p>

              <button
                onClick={() => navigate("/my-reservations")}
                className="mt-4 w-full text-gray-700 hover:text-orange-600 hover:bg-orange-50 transition-colors py-2 rounded-xl font-semibold"
                disabled={paying}
              >
                Back to My Reservations
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReservationPaymentPage;

