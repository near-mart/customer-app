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
import { useBookmarkStore } from "@/store/bookmarkStore";
import { supplierBookMarkMerge } from "@/services/suppliers";
import { mergeCart, mergeWishlist } from "@/services/products";
import { useCartStore } from "@/store/cartStore";
import { useWishlistStore } from "@/store/wishlistStore";

export default function LoginPage() {
    const [mobile, setMobile] = useState("");
    const [otp, setOtp] = useState("");
    const [otpSent, setOtpSent] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const route = useRouter();
    const { handleAuthenticate, handleUserDetails } = useAuthValidator((state) => state);
    const countryCode = "91"; // 🇮🇳 default

    // 📤 Send OTP
    const handleSendOtp = async (e: React.FormEvent) => {
        e.preventDefault();
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
            notify(err?.response?.data?.message || "Failed to send OTP", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ✅ Verify OTP
    const handleVerifyOtp = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length !== 4 && otp.length !== 6) {
            notify("Please enter a valid OTP", "error");
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

                // Merge local data
                await mergeLocalData();

                notify("Login successful!", "success");
                route.replace("/");
            }
        } catch (err: any) {
            notify(err?.response?.data?.message || "Invalid or expired OTP", "error");
        } finally {
            setIsLoading(false);
        }
    };

    // ♻️ Merge local stores (bookmarks, cart, wishlist)
    const mergeLocalData = async () => {
        const localBookmarks = useBookmarkStore.getState().bookmarks;
        const localCart = useCartStore.getState().suppliers;
        const localWishlist = useWishlistStore.getState().wishlist;

        try {
            if (localBookmarks.length) {
                await supplierBookMarkMerge({ supplier_ids: localBookmarks });
                useBookmarkStore.getState().clearBookmarks();
            }

            if (Object.keys(localCart).length) {
                await mergeCart({ suppliers: localCart });
                useCartStore.getState().clearAll();
            }

            if (localWishlist.length) {
                const productIds = localWishlist.map((item) => item.productId);
                await mergeWishlist({ wishlist: productIds });
                useWishlistStore.getState().clearWishlist();
            }
        } catch (err) {
            console.error("❌ Merge error:", err);
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

                {!otpSent ? (
                    <form onSubmit={handleSendOtp} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="mobile">Mobile Number</Label>
                            <div className="relative mt-1">
                                <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                <Input
                                    id="mobile"
                                    placeholder="Enter 10-digit mobile number"
                                    className="pl-9"
                                    value={mobile}
                                    maxLength={10}
                                    onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary text-white font-semibold py-5 text-base rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? "Sending..." : "Send OTP"}
                        </Button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOtp} className="flex flex-col gap-4">
                        <div>
                            <Label htmlFor="otp">Enter OTP</Label>
                            <div className="relative mt-1">
                                <KeyRound className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                <Input
                                    id="otp"
                                    placeholder="Enter OTP"
                                    className="pl-9"
                                    value={otp}
                                    maxLength={6}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                                />
                            </div>

                            <div className="text-right mt-1">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    disabled={resending}
                                    className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
                                >
                                    {resending ? "Resending..." : "Resend OTP"}
                                </button>
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary text-white font-semibold py-5 text-base rounded-xl"
                            disabled={isLoading}
                        >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </form>
                )}

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
