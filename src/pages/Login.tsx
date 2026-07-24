import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCompleteUrlV1 } from "../utils";

const LoginPage = () => {
  const [input, setInput] = useState(() => {
    return localStorage.getItem("remembered_login_input") || "";
  });
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem("remember_me") === "true";
  });
  const [otp, setOtp] = useState("");
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const validateInput = (value: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const mobileRegex = /^\d{10}$/;
    return emailRegex.test(value) || mobileRegex.test(value);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!isOtpSent) {
      if (validateInput(input)) {
        setIsLoading(true);
        setTimeout(() => {
          setIsOtpSent(true);
          setIsLoading(false);
        }, 800);
      } else {
        setError("Please enter a valid email or 10-digit mobile number");
      }
    } else {
      if (otp.length === 6) {
        setIsLoading(true);
        let formattedInput = input;
        if (/^\d{10}$/.test(input)) {
          formattedInput = `+91-${input}`;
        }

        try {
          const response = await fetch(getCompleteUrlV1("auth/login"), {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: formattedInput, otp: Number(otp) }),
          });
          const data = await response.json();

          if (data.token) {
            localStorage.setItem(
              "user",
              JSON.stringify({
                token: data.token,
                user: data.user,
              })
            );
            if (rememberMe) {
              localStorage.setItem("remembered_login_input", input);
              localStorage.setItem("remember_me", "true");
            } else {
              localStorage.removeItem("remembered_login_input");
              localStorage.removeItem("remember_me");
            }
            navigate("/dashboard");
          } else {
            setError(data.message || "Login Failed. Please check your OTP.");
          }
        } catch (err) {
          setError("Something went wrong. Please try again later.");
        } finally {
          setIsLoading(false);
        }
      } else {
        setError("Please enter a valid 6-digit OTP");
      }
    }
  };

  return (
    <div className="login-wrapper">
      {/* ───── Left Blue Panel ───── */}
      <div className="login-left">
        {/* Logo top-left */}
        <div className="absolute top-8 left-8 z-10 flex items-center gap-3">
          <div className="bg-white rounded-2xl p-3 shadow-lg">
            <img
              src="/lottmart-logo.png"
              alt="Lottmart"
              className="h-24 w-auto object-contain"
            />
          </div>
          <span className="text-white text-2xl font-bold tracking-tight drop-shadow-md">
            Lottmart
          </span>
        </div>

        {/* Illustration */}
        <div className="relative z-10 mt-12">
          <img
            src="/login-illustration.png"
            alt="Illustration"
            className="w-72 mb-10 drop-shadow-2xl"
          />

          <h1 className="text-white text-[2.2rem] font-extrabold leading-tight mb-4">
            A few more clicks to
            <br />
            sign in to your account.
          </h1>
          <p className="text-blue-200 text-base">
            Manage all your Lottmart App accounts in one place
          </p>
        </div>
      </div>

      {/* ───── Right White Panel ───── */}
      <div className="login-right">
        <div className="w-full max-w-sm">
          {/* Sign In heading */}
          <h2 className="text-2xl font-bold text-slate-900 mb-8">Sign In</h2>

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email / Mobile input */}
            {!isOtpSent ? (
              <div>
                <input
                  id="login-email"
                  type="text"
                  placeholder="Email"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3644d6] focus:border-transparent outline-none transition-all placeholder:text-slate-400"
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium text-slate-700">
                    Verification Code
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsOtpSent(false);
                      setOtp("");
                    }}
                    className="text-xs font-semibold text-[#3644d6] hover:underline"
                  >
                    Change email?
                  </button>
                </div>
                <input
                  id="login-otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  maxLength={6}
                  onChange={(e) => setOtp(e.target.value)}
                  disabled={isLoading}
                  className="w-full px-4 py-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-[#3644d6] focus:border-transparent outline-none transition-all text-center text-lg font-bold tracking-[0.4em]"
                />
                <p className="text-xs text-slate-400 text-center mt-1">
                  OTP sent to{" "}
                  <span className="font-semibold text-slate-600">{input}</span>
                </p>
              </div>
            )}

            {/* Remember me / Forgot */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-300 accent-[#3644d6]"
                />
                Remember me
              </label>
              <a
                href="#"
                className="text-slate-600 hover:text-[#3644d6] font-medium transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {/* Error */}
            {error && (
              <div className="bg-red-50 text-red-600 text-sm py-2.5 px-4 rounded-lg border border-red-100">
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={isLoading}
              className="w-40 bg-[#3644d6] hover:bg-[#2c38b8] text-white font-semibold py-3 rounded-full shadow-md transition-all active:scale-[0.97] flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : isOtpSent ? (
                "Verify & Login"
              ) : (
                "Login"
              )}
            </button>
          </form>

          {/* Footer */}
          <div className="mt-10">
            <p className="text-xs text-slate-400 leading-relaxed">
              By signing up, you agree to our
              <br />
              <a href="#" className="text-[#3644d6] font-semibold hover:underline">
                Terms and Conditions
              </a>{" "}
              &amp;{" "}
              <a href="#" className="text-[#3644d6] font-semibold hover:underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export { LoginPage };
