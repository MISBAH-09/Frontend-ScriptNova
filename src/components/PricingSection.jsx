import { motion } from "framer-motion";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createCheckoutSession } from "../services/payment";

function PricingSection() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

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
      const checkoutUrl = await createCheckoutSession();
      window.location.href = checkoutUrl;
    } catch (err) {
      setError(err.response?.data?.message || err.message || "Unable to start checkout");
      setIsLoading(false);
    }
  };

  return (
    <section id="pricing" className="py-24 bg-gray-950 text-white">
      <div className="max-w-6xl mx-auto px-6 text-center">
        <h3 className="text-4xl font-bold mb-16">Simple Pricing</h3>
        {error && (
          <p className="mb-6 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        )}
        <div className="grid md:grid-cols-2 gap-10">
          <div className="bg-gray-900 p-10 rounded-3xl">
            <h4 className="text-2xl font-semibold">Free</h4>
            <p className="text-4xl font-bold mt-4">$0</p>
            <ul className="mt-6 space-y-3 text-gray-400">
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
              disabled={isLoading}
              className="mt-8 w-full bg-black py-3 rounded-xl font-semibold disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Opening Checkout..." : "Upgrade Now"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}


export default PricingSection;
