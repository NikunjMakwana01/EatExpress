export const loadScript = (src) => {
  return new Promise((resolve) => {
    const script = document.createElement("script");
    script.src = src;
    script.onload = () => {
      resolve(true);
    };
    script.onerror = () => {
      resolve(false);
    };
    document.body.appendChild(script);
  });
};

export const displayRazorpay = async (
  orderAmount,
  razorpayOrderId,
  userData,
  restaurantName = "Eat Express"
) => {
  const res = await loadScript("https://checkout.razorpay.com/v1/checkout.js");

  if (!res) {
    alert("Razorpay SDK failed to load. Are you online?");
    return;
  }

  return new Promise((resolve, reject) => {
    const options = {
      key: "rzp_test_WgxamtVupSULV6", // Replace with your actual Razorpay test key from your Razorpay dashboard
      currency: "INR",
      amount: orderAmount * 100, // Razorpay expects amount in paise
      name: restaurantName,
      description: "Food Order Payment",
      order_id: razorpayOrderId,
      prefill: {
        name: userData.name,
        email: userData.email,
        contact: userData.phone,
      },
      theme: {
        color: "#F97316", // Orange color matching your theme
      },
      handler: function (response) {
        console.log("Payment successful in handler:", response);
        resolve(response);
      },
    };

    const paymentObject = new window.Razorpay(options);

    paymentObject.on("payment.failed", function (response) {
      console.log("Payment failed:", response);
      reject(new Error("Payment failed"));
    });

    paymentObject.on("payment.success", function (response) {
      console.log("Payment successful:", response);
      resolve(response);
    });

    // Add timeout to prevent hanging
    const timeout = setTimeout(() => {
      reject(new Error("Payment timeout - user did not complete payment"));
    }, 300000); // 5 minutes timeout

    paymentObject.open();

    // Clear timeout when payment completes
    paymentObject.on("payment.success", function (response) {
      clearTimeout(timeout);
      resolve(response);
    });

    paymentObject.on("payment.failed", function () {
      clearTimeout(timeout);
      reject(new Error("Payment failed"));
    });
  });
};
