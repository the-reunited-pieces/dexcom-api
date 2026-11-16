import Fastify from "fastify";
import { tokenResponseValidator } from "./server/dexcom.ts";
import { writeSecrets } from "./server/secrets.ts";
import "dotenv/config.js";

const expectedState = new Array(32)
    .fill(0)
    .map((_) => "abcdef0123456789"[Math.floor(Math.random() * 16)])
    .join("");

const fastify = Fastify({
    logger: true,
});

fastify.get("/auth-callback", async (request) => {
    const url = new URL(`http://localhost:3000${request.url}`);
    const error = url.searchParams.get("error");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    if (error == "access_denied") {
        console.log("Access Denied!\nLogin again.");
        process.exit(0);
    }
    if (!code || !state) {
        console.log("Missing code or state.");
        process.exit(0);
    }

    if (state != expectedState) {
        console.log("state missmatch");
        process.exit(0);
    }

    const res = await fetch(`${process.env.DEXCOM_API}/v3/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.DEXCOM_CLIENT_ID!,
            client_secret: process.env.DEXCOM_CLIENT_SECRET!,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.OAUTH_REDIRECT!,
        }),
    });

    if (!res.ok) {
        console.log("token exchanged failed.");
        process.exit(0);
    }

    const data = await res
        .json()
        .then(async (data) => await tokenResponseValidator.parseAsync(data))
        .catch(() => null);

    if (data == null) {
        console.log("Data failed validation");
        process.exit(0);
    }

    const success = await writeSecrets({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
    });

    if (!success) console.log("Failed to write secrets to file.");
    process.exit(0);
});

fastify.listen({ port: +process.env.LOGIN_PORT! }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});

console.log(
    `${process.env.DEXCOM_API}/v3/oauth2/login?client_id=${process.env.DEXCOM_CLIENT_ID}&redirect_uri=${process.env.OAUTH_REDIRECT}&response_type=code&scope=offline_access&state=${expectedState}`,
);
