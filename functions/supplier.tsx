export function formatTime(timeStr: string) {
    if (!timeStr) return "";
    const [hour, minute] = timeStr.split(":").map(Number);
    const suffix = hour >= 12 ? "PM" : "AM";
    const adjustedHour = hour % 12 || 12;
    return `${adjustedHour}:${minute.toString().padStart(2, "0")} ${suffix}`;
}

// 🧠 Determine if store is open and within 1 hour of closing
export function getStoreStatus(storeTimings: any[]) {
    const now = new Date();
    const day = now.toLocaleString("en-US", { weekday: "long" });
    const currentTime = now.toTimeString().slice(0, 5); // "HH:MM"

    const today = storeTimings?.find((d) => d.day === day);
    if (!today || !today.status)
        return {
            isOpen: false,
            showCloseTime: false,
            closeAt: null,
            nextOpen: null,
            nextDay: null,
        };

    const currentSlot = today.timing?.find(
        (slot: any) => currentTime >= slot.open && currentTime <= slot.close
    );

    if (currentSlot) {
        // ✅ Store is open
        const closeTime = new Date();
        const [ch, cm] = currentSlot.close.split(":").map(Number);
        closeTime.setHours(ch, cm, 0, 0);

        const diffMinutes = (closeTime.getTime() - now.getTime()) / (1000 * 60);
        const showCloseTime = diffMinutes <= 60;

        return {
            isOpen: true,
            showCloseTime,
            closeAt: currentSlot.close,
            nextOpen: null,
            nextDay: null,
        };
    } else {
        // 🔴 Store closed → find next open day
        const daysOfWeek = [
            "Sunday",
            "Monday",
            "Tuesday",
            "Wednesday",
            "Thursday",
            "Friday",
            "Saturday",
        ];
        let nextDayIndex = (daysOfWeek.indexOf(day) + 1) % 7;

        for (let i = 0; i < 7; i++) {
            const nextDay = storeTimings.find(
                (d) =>
                    d.day === daysOfWeek[nextDayIndex] && d.status && d.timing?.length
            );
            if (nextDay) {
                const nextOpen = nextDay.timing[0].open;
                return {
                    isOpen: false,
                    showCloseTime: false,
                    closeAt: null,
                    nextOpen,
                    nextDay: nextDay.day,
                };
            }
            nextDayIndex = (nextDayIndex + 1) % 7;
        }
    }

    return {
        isOpen: false,
        showCloseTime: false,
        closeAt: null,
        nextOpen: null,
        nextDay: null,
    };
}
