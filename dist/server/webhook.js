export async function sendAlert(message, urgent = false) {
    try {
        console.log(`[ALERT] Sending ${urgent ? "urgent" : "non-urgent"} alert to webhook: ${message}`);
        const url = new URL(process.env.ALERT_WEBHOOK);
        url.searchParams.set("wait", "true");
        url.searchParams.delete("with_components");
        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `${urgent ? "@everyone " : ""}${message}`.slice(0, 2000), allowed_mentions: { parse: ["everyone"] } }),
        });
        const data = await res.json();
        if (!("id" in data))
            throw data;
    }
    catch (error) {
        console.error(`[ALERT] Error sending alert to webhook: ${error}`);
    }
}
//# sourceMappingURL=webhook.js.map