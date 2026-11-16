import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/appRouter.js";
import "dotenv/config.js";

const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `http://localhost:${process.env.PORT}`,
        }),
    ],
});

console.log(JSON.stringify(await trpc.egvs.query({ start: Date.now() - 6 * 60 * 60 * 1000, end: Date.now() - 5 * 60 * 60 * 1000 }), null, 4));
