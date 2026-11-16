export async function sendAlert(message: string, urgent: boolean = false) {
    try {
        const url = new URL(process.env.ALERT_WEBHOOK!);
        url.searchParams.set("wait", "true");
        url.searchParams.delete("with_components");

        const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ content: `${urgent ? "@everyone " : ""}${message}`.slice(0, 2000), allowed_mentions: { parse: ["everyone"] } }),
        });

        const data = await res.json();
        if (!("id" in data)) throw data;
    } catch (error) {
        console.error("Error sending alert to webhook!", error);
    }
}
