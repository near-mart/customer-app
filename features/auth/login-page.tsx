"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Phone, KeyRound } from "lucide-react";
import Link from "next/link";
import axios from "axios";
import { notify } from "@/functions/notify";
import { useRouter } from "next/navigation";
import { useAuthValidator } from "@/store/authValidater";

export default function LoginPage() {
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const route = useRouter();
    const { handleAuthenticate, handleUserDetails } = useAuthValidator((state) => state);

    const countryCode = "91"; // 🇮🇳 default

    // 📤 Send OTP (Login)
    const handleSendOtp = async () => {
        if (mobile.length !== 10) {
            notify("Please enter a valid 10-digit mobile number", "error");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.BASE_URL}/service/customer_service/v1/no-auth/customer/login`,
                { mobile, countryCode },
                { withCredentials: true }
            );

            notify(data?.message || "OTP sent successfully!", "success");
            setOtpSent(true);
        } catch (err: any) {
            console.error(err);
            notify(err?.response?.data?.message || "Failed to send OTP", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 4) {
            notify("Please enter a valid 4-digit OTP", "error");
            return;
        }

        setIsLoading(true);
        try {
            const { data } = await axios.post(
                `${process.env.BASE_URL}/service/customer_service/v1/no-auth/customer/verify-otp`,
                { mobile, countryCode, otp },
                { withCredentials: true }
            );

            const { accessToken, user } = data?._payload || {};
            if (accessToken && user) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("user", user?._id);
                handleUserDetails(user);
                handleAuthenticate(true);
                notify("Login successful!", "success");
                route.replace("/");
            }
        } catch (err: any) {
            console.error(err);
            notify(err?.response?.data?.message || "Invalid or expired OTP", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // 🔁 Resend OTP
    const handleResendOtp = async () => {
        setResending(true);
        try {
            const { data } = await axios.post(
                `${process.env.BASE_URL}/service/customer_service/v1/no-auth/customer/resend-otp`,
                { mobile, countryCode },
                { withCredentials: true }
            );

            notify(data?.message || "OTP resent successfully!", "success");
        } catch (err: any) {
            console.error(err);
            notify(err?.response?.data?.message || "Failed to resend OTP", "error");
        } finally {
            setResending(false);
        }
    };

    return (
        <section className="min-h-[70vh] md:min-h-[85vh] flex items-center justify-center">
            <div className="w-full max-w-sm bg-white border border-gray-200 rounded-2xl shadow-md p-6 sm:p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-primary">Near Mart</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {otpSent ? "Verify your mobile number" : "Sign in with your mobile number"}
                    </p>
                </div>

                {/* 📱 Mobile Field */}
                {!otpSent && (
                    <div className="flex flex-col gap-2 mb-4">
                        <Label>Mobile Number</Label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Enter 10-digit mobile number"
                                className="pl-9"
                                value={mobile}
                                maxLength={10}
                                onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                disabled={isLoading}
                            />
                        </div>
                    </div>
                )}

                {/* 🟢 OTP Field */}
                {otpSent && (
                    <div className="flex flex-col gap-2 mb-4 animate-fadeIn">
                        <Label>Enter OTP</Label>
                        <div className="relative">
                            <KeyRound className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                            <Input
                                placeholder="Enter 6-digit OTP"
                                className="pl-9"
                                maxLength={6}
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                            />
                        </div>

                        <div className="text-right mt-1">
                            <button
                                onClick={handleResendOtp}
                                disabled={resending}
                                className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
                            >
                                {resending ? "Resending..." : "Resend OTP"}
                            </button>
                        </div>
                    </div>
                )}

                {/* 🔘 OTP Buttons */}
                {!otpSent ? (
                    <Button
                        onClick={handleSendOtp}
                        className="w-full bg-primary text-white font-semibold py-5 text-base rounded-xl transition"
                        disabled={isLoading}
                    >
                        {isLoading ? "Sending..." : "Send OTP"}
                    </Button>
                ) : (
                    <Button
                        onClick={handleVerifyOtp}
                        className="w-full bg-primary text-white font-semibold py-5 text-base rounded-xl transition"
                        disabled={isLoading}
                    >
                        {isLoading ? "Verifying..." : "Verify OTP"}
                    </Button>
                )}

                {/* 🟩 Register Link */}
                <p className="text-center text-sm text-gray-600 mt-6">
                    Don’t have an account?{" "}
                    <Link href="/register" className="text-primary font-semibold hover:underline">
                        Register
                    </Link>
                </p>
            </div>
        </section>
    );
}
