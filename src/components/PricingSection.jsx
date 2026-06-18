import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { createCheckoutSession, getPaymentStatus } from "../services/payment";

function PricingSection() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState("free");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    const refreshStatus = async () => {
      try {
        const status = await getPaymentStatus(searchParams.get("session_id"));
        setPlan(status?.plan || "free");

        if (searchParams.get("checkout") === "success") {
           const nextMonthDate = new Date();
            nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);

            setMessage(
              `Subscription enabled until ${nextMonthDate.toLocaleDateString()}`
            );
        }
      } catch (err) {
        setPlan("free");
        setError(err.message || "Unable to refresh payment status.");
      }
    };

    refreshStatus();
  }, [searchParams]);

  const handleFreePlan = () => {
    const token = localStorage.getItem("userToken");
    navigate(token ? "/dashboard" : "/auth");
  };

  const handleUpgrade = async () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      navigate("/auth?next=checkout");
      return;
    }

    setIsLoading(true);
    setError("");
    setMessage("");

    try {
      const status = await getPaymentStatus();
      if (status?.plan === "pro") {
        setPlan("pro");
        setIsLoading(false);
        return;
      }

      const checkoutUrl = await createCheckoutSession();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to start checkout");
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-slate-200  text-black">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <div className="mb-6 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-700">
          NO PAYMENT YET - THIS IS JUST FOR TESTING AND INTEGRATION. WEBSITE IS FREE RIGHT NOW
        </div>
        <h3 className="text-4xl font-bold mb-16">Simple Pricing</h3>
        {plan === "pro" && (
          <p className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700">
            You are currently on the Pro plan.
          </p>
        )}
        {message && (
          <p className="mb-6 rounded-xl border border-blue-500/40 bg-blue-500/10 px-4 py-3 text-sm text-black">
            {message}
          </p>
        )}
        {error && (
          <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-black">
            {error}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-10 ">
          <div className="bg-pink-400 p-10 rounded-3xl">
            <h4 className="text-2xl font-semibold">Free</h4>
            <p className="text-4xl font-bold mt-4">$0</p>
            <ul className="mt-6 space-y-3 ">
              <li>5 AI generations / month</li>
              <li>Basic Dashboard</li>
              <li>Email Support</li>
            </ul>
            <button
              onClick={handleFreePlan}
              className="mt-8 disabled:cursor-not-allowed w-full bg-indigo-600 py-3 rounded-xl font-semibold"
            >
              Your Current Plan
            </button>
          </div>

          <div className="bg-indigo-400 p-10 rounded-3xl">
            <h4 className="text-2xl font-semibold">Pro</h4>
            <p className="text-4xl font-bold mt-4">$19/mo</p>
            <ul className="mt-6 space-y-3">
              <li>Unlimited AI Generations</li>
              <li>Advanced Analytics</li>
              <li>Priority Support</li>
            </ul>
            <button
              onClick={handleUpgrade}
              disabled={isLoading || plan === "pro"}
              className="text-white mt-8 w-full bg-black py-3 rounded-xl font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {plan === "pro" ? "Current Plan" : isLoading ? "Opening Checkout..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


export default PricingSection;
