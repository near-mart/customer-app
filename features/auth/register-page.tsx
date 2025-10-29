"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { User, Phone, Mail, ChevronDownIcon, KeyRound } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import axios from "axios";
import { useAuthValidator } from "@/store/authValidater";
import { useRouter } from "next/navigation";
import { notify } from "@/functions/notify";

export default function RegisterPage() {
    const { handleAuthenticate, handleUserDetails } = useAuthValidator((state) => state);
    const route = useRouter();

    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>();
    const [otpSent, setOtpSent] = useState(false);
    const [otp, setOtp] = useState("");
    const [loading, setLoading] = useState(false);
    const [resending, setResending] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        mobile: "",
        countryCode: "91",
        dob: "",
        gender: "",
    });

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    };

    // 🧩 Step 1: Register and send OTP
    const handleRegister = async () => {
        if (!formData.name || !formData.mobile) {
            notify("Please enter name and mobile", "error");
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${process.env.BASE_URL}/service/customer_service/v1/no-auth/customer/register`,
                formData,
                { withCredentials: true }
            );
            notify(data?.message || "OTP sent to your mobile", "success");
            setOtpSent(true);
        } catch (err: any) {
            console.log(err);
            notify(err?.response?.data?.message || "Something went wrong", "error");
        } finally {
            setLoading(false);
        }
    };

    // 🔁 Resend OTP
    const handleResendOtp = async () => {
        try {
            setResending(true);
            const { data } = await axios.post(
                `${process.env.BASE_URL}/service/customer_service/v1/no-auth/customer/resend-otp`,
                {
                    mobile: formData.mobile,
                    countryCode: formData.countryCode,
                },
                { withCredentials: true }
            );
            notify(data?.message || "OTP resent successfully", "success");
        } catch (err: any) {
            console.error(err);
            notify(err?.response?.data?.message || "Failed to resend OTP", "error");
        } finally {
            setResending(false);
        }
    };

    // 🧩 Step 2: Verify OTP
    const handleVerifyOtp = async () => {
        if (otp.length !== 4) {
            notify("Please enter a valid 4-digit OTP", "error");
            return;
        }
        try {
            setLoading(true);
            const { data } = await axios.post(
                `${process.env.BASE_URL}/service/customer_service/v1/no-auth/customer/verify-otp`,
                {
                    mobile: formData.mobile,
                    countryCode: formData.countryCode,
                    otp,
                },
                { withCredentials: true }
            );

            const { accessToken, ...rest } = data?._payload || {};
            if (data && accessToken) {
                localStorage.setItem("accessToken", accessToken);
                localStorage.setItem("user", rest?.user?._id);
                handleUserDetails(rest.user);
                handleAuthenticate(true);
                notify("Registration successful", "success");
                route.replace("/");
            }
        } catch (err: any) {
            console.error(err);
            notify(err?.response?.data?.message || "Invalid OTP", "error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="min-h-[70vh] md:min-h-[85vh] flex items-center justify-center">
            <div className="w-full max-w-lg bg-white border border-gray-200 rounded-2xl shadow-md p-4 sm:p-8">
                <div className="text-center mb-6">
                    <h1 className="text-3xl font-bold text-primary">Near Mart</h1>
                    <p className="text-gray-500 text-sm mt-1">
                        {otpSent ? "Verify your mobile number" : "Create your account"}
                    </p>
                </div>

                {!otpSent ? (
                    <>
                        {/* 👤 Full Name */}
                        <div className="mb-4 flex flex-col gap-1">
                            <Label>Full Name</Label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Enter your full name"
                                    className="pl-9"
                                    value={formData.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 📧 Email */}
                        <div className="mb-4 flex flex-col gap-1">
                            <Label>Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                <Input
                                    placeholder="Enter your email"
                                    type="email"
                                    className="pl-9"
                                    value={formData.email}
                                    onChange={(e) => handleChange("email", e.target.value)}
                                />
                            </div>
                        </div>

                        {/* 📱 Country Code + Mobile */}
                        <div className="flex gap-2 mb-4">
                            <div className="flex flex-col gap-1">
                                <Label>Country Code</Label>
                                <Select
                                    value={formData.countryCode}
                                    onValueChange={(value) => handleChange("countryCode", value)}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="+91" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="91">🇮🇳 +91</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label>Mobile Number</Label>
                                <div className="relative">
                                    <Phone className="absolute left-3 top-3 text-gray-400 w-4 h-4" />
                                    <Input
                                        placeholder="Enter mobile number"
                                        className="pl-9"
                                        maxLength={10}
                                        value={formData.mobile}
                                        onChange={(e) =>
                                            handleChange("mobile", e.target.value.replace(/\D/g, ""))
                                        }
                                    />
                                </div>
                            </div>
                        </div>

                        {/* 🎂 Date + Gender */}
                        <div className="grid grid-cols-2 items-center gap-2 mb-6">
                            <div className="flex flex-col gap-1 w-full">
                                <Label>Date of Birth</Label>
                                <Popover open={open} onOpenChange={setOpen}>
                                    <PopoverTrigger asChild>
                                        <Button
                                            variant="outline"
                                            id="date"
                                            className="w-full justify-between font-normal mt-1"
                                        >
                                            {date ? date.toLocaleDateString() : "Select date"}
                                            <ChevronDownIcon className="ml-2 w-4 h-4 text-gray-500" />
                                        </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto overflow-hidden p-0" align="start">
                                        <Calendar
                                            mode="single"
                                            selected={date}
                                            captionLayout="dropdown"
                                            onSelect={(date) => {
                                                setDate(date);
                                                setOpen(false);
                                                handleChange("dob", date?.toISOString() || "");
                                            }}
                                        />
                                    </PopoverContent>
                                </Popover>
                            </div>

                            <div className="flex flex-col gap-1 w-full">
                                <Label>Gender</Label>
                                <Select
                                    value={formData.gender}
                                    onValueChange={(value) => handleChange("gender", value)}
                                >
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="male">Male</SelectItem>
                                        <SelectItem value="female">Female</SelectItem>
                                        <SelectItem value="other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <Button
                            onClick={handleRegister}
                            className="w-full bg-primary text-white font-semibold py-5 text-base rounded-xl transition"
                            disabled={loading}
                        >
                            {loading ? "Sending OTP..." : "Register"}
                        </Button>
                    </>
                ) : (
                    <>
                        {/* 🔐 OTP Input */}
                        <div className="flex flex-col gap-2 mb-6">
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

                            {/* 🔁 Resend OTP */}
                            <div className="text-right mt-1">
                                <button
                                    type="button"
                                    onClick={handleResendOtp}
                                    className="text-primary text-sm font-semibold hover:underline disabled:opacity-50"
                                    disabled={resending}
                                >
                                    {resending ? "Resending..." : "Resend OTP"}
                                </button>
                            </div>
                        </div>

                        <Button
                            onClick={handleVerifyOtp}
                            className="w-full bg-primary text-white font-semibold py-5 text-base rounded-xl transition"
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Verify OTP"}
                        </Button>
                    </>
                )}

                {/* 🔗 Login Link */}
                <p className="text-center text-sm text-gray-500 mt-4">
                    Already registered?{" "}
                    <a href="/login" className="text-primary font-semibold hover:underline">
                        Login
                    </a>
                </p>
            </div>
        </section>
    );
}
