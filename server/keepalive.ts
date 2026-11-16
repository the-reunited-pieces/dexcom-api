import { tokenResponseValidator } from "./dexcom.ts";
import { getSecrets, writeSecrets } from "./secrets.ts";
import { sendAlert } from "./webhook.ts";

async function refresh() {
    const quit = (message: string, fatal: boolean) =>
        sendAlert(`API authentication auto-refresh failed: ${message}. ${fatal ? "The server is now stopping" : "Non-fatal—will try again later"}.`, fatal)
            .catch(() => null)
            .then(() => fatal && process.exit(0));

    const data = await getSecrets();
    if (!data) return quit("No `secrets.json`—please run `node login.ts` on the server", true);

    if (data.expires_at <= Date.now())
        return quit("`secrets.json` has fully expired and cannot be refreshed—please re-run `node login.ts` on the server", true);

    if (data.expires_at > Date.now() + 10 * 60 * 60 * 1000) return; // No refresh needed yet

    const res = await fetch(`${process.env.DEXCOM_API}/v3/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.DEXCOM_CLIENT_ID!,
            client_secret: process.env.DEXCOM_CLIENT_SECRET!,
            grant_type: "refresh_token",
            refresh_token: data.refresh_token,
        }),
    });

    if (!res.ok) return quit(`the DEXCOM response was not OK (status code ${res.status})`, false);

    const text = await res.text();

    const result = await new Promise((res) => res(JSON.parse(text))).then(async (result) => await tokenResponseValidator.parseAsync(result)).catch(() => null);

    if (result == null) return quit(`the DEXCOM response could not be parsed (text: ${text})`, false);

    const success = await writeSecrets({
        access_token: result.access_token,
        refresh_token: result.refresh_token,
        expires_at: Date.now() + result.expires_in * 1000,
    });

    if (!success) return quit("the refresh succeeded, but `secrets.json` could not be updated", true);
}

export function keepalive() {
    refresh();
    setInterval(refresh, 5 * 60 * 1000);
}
