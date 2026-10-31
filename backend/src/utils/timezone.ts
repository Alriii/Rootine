// Purpose: Format dates and times according to the user's configured IANA timezone.

export function getLocalDateString(timezone: string, date = new Date()): string {
    try {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: timezone || "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    } catch {
        return new Intl.DateTimeFormat("en-CA", {
            timeZone: "Asia/Manila",
            year: "numeric",
            month: "2-digit",
            day: "2-digit",
        }).format(date);
    }
}

export function getLocalTimeString(timezone: string, date = new Date()): string {
    try {
        const parts = new Intl.DateTimeFormat("en-US", {
            timeZone: timezone || "Asia/Manila",
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
        }).formatToParts(date);

        const hour = parts.find((p) => p.type === "hour")?.value || "00";
        const minute = parts.find((p) => p.type === "minute")?.value || "00";
        // Ensure 24-hour hour is 2 digits (e.g. 24 -> 00)
        const normalizedHour = hour === "24" ? "00" : hour;
        return `${normalizedHour}:${minute}`;
    } catch {
        const hours = String(date.getUTCHours()).padStart(2, "0");
        const minutes = String(date.getUTCMinutes()).padStart(2, "0");
        return `${hours}:${minutes}`;
    }
}

export function getLocalHour(timezone: string, date = new Date()): number {
    const timeStr = getLocalTimeString(timezone, date);
    return parseInt(timeStr.split(":")[0], 10);
}

export function getLocalDayOfWeek(timezone: string, date = new Date()): number {
    try {
        // 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat, 7=Sun
        const dayIndex = new Date(
            date.toLocaleString("en-US", { timeZone: timezone || "Asia/Manila" })
        ).getDay();

        return dayIndex === 0 ? 7 : dayIndex;
    } catch {
        const day = date.getUTCDay();
        return day === 0 ? 7 : day;
    }
}
