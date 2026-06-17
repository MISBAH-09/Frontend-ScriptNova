import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession, getPaymentStatus } from "../services/payment";

function PricingSection() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [plan, setPlan] = useState("free");
  const [error, setError] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("userToken");
    if (!token) return;

    getPaymentStatus()
      .then((status) => setPlan(status?.plan || "free"))
      .catch(() => setPlan("free"));
  }, []);

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
        <h3 className="text-4xl font-bold mb-16">Simple Pricing</h3>
        {plan === "pro" && (
          <p className="mb-6 rounded-xl border border-green-500/40 bg-green-500/10 px-4 py-3 text-sm text-green-700">
            You are currently on the Pro plan.
          </p>
        )}
        {error && (
          <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
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
              className="mt-8 w-full bg-indigo-600 py-3 rounded-xl font-semibold"
            >
              Get Started
            </button>
          </div>

          <div className="bg-indigo-600 p-10 rounded-3xl">
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
