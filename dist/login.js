import "dotenv/config.js";
import Fastify from "fastify";
import { tokenResponseValidator } from "./server/dexcom.js";
import { writeSecrets } from "./server/secrets.js";
const expectedState = new Array(32)
    .fill(0)
    .map((_) => "abcdef0123456789"[Math.floor(Math.random() * 16)])
    .join("");
const fastify = Fastify({
    logger: true,
});
fastify.get("/auth-callback", async (request, reply) => {
    const url = new URL(`http://localhost:3000${request.url}`);
    const error = url.searchParams.get("error");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");
    if (error == "access_denied") {
        await reply.code(401).send("Access denied! Log in again.");
        process.exit(0);
    }
    if (!code || !state) {
        await reply.code(400).send("Missing code or state!");
        process.exit(0);
    }
    if (state != expectedState) {
        await reply.code(400).send("State mis-match!");
        process.exit(0);
    }
    const res = await fetch(`${process.env.DEXCOM_API}/v3/oauth2/token`, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
            client_id: process.env.DEXCOM_CLIENT_ID,
            client_secret: process.env.DEXCOM_CLIENT_SECRET,
            code,
            grant_type: "authorization_code",
            redirect_uri: process.env.OAUTH_REDIRECT,
        }),
    });
    if (!res.ok) {
        await reply.code(500).send(`DEXCOM token exchange status was ${res.status} != 200!`);
        process.exit(0);
    }
    const data = await res
        .json()
        .then(async (data) => await tokenResponseValidator.parseAsync(data))
        .catch(() => null);
    if (data == null) {
        await reply.code(500).send("DEXCOM token exchange response failed validation!");
        process.exit(0);
    }
    const success = await writeSecrets({
        access_token: data.access_token,
        refresh_token: data.refresh_token,
        expires_at: Date.now() + data.expires_in * 1000,
    });
    if (!success) {
        await reply.code(500).send("DEXCOM token exchange succeeded, but failed to write secrets to file!");
        process.exit(0);
    }
    await reply.code(200).send("Login successful!");
    process.exit(0);
});
fastify.listen({ port: +process.env.LOGIN_PORT }, (err) => {
    if (err) {
        fastify.log.error(err);
        process.exit(1);
    }
});
console.log("---------------------");
console.log("CLICK BELOW TO LOG IN");
console.log(`${process.env.DEXCOM_API}/v3/oauth2/login?client_id=${process.env.DEXCOM_CLIENT_ID}&redirect_uri=${process.env.OAUTH_REDIRECT}&response_type=code&scope=offline_access&state=${expectedState}`);
console.log("---------------------");
//# sourceMappingURL=login.js.map