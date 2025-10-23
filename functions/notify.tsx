import { toast, ToastOptions } from "react-toastify";

type ToastType = "success" | "error" | "info" | "warning";

export function notify(
    message: string,
    type: ToastType = "error",
    options?: ToastOptions
) {
    // Call the correct toast function
    switch (type) {
        case "success":
            return toast.success(message, { position: "top-right", ...options });
        case "error":
            return toast.error(message, { position: "top-right", ...options });
        case "info":
            return toast.info(message, { position: "top-right", ...options });
        case "warning":
            return toast.warning(message, { position: "top-right", ...options });
    }
}
