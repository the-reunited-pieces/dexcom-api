import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config.js";
import type { AppRouter } from "../server/appRouter.js";

export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `http://localhost:${process.env.PORT}`,
        }),
    ],
});
