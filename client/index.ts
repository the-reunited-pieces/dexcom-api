import { createTRPCClient, httpBatchLink } from "@trpc/client";
import type { AppRouter } from "../server/appRouter.js";
import "dotenv/config.js";

export const trpc = createTRPCClient<AppRouter>({
    links: [
        httpBatchLink({
            url: `http://localhost:${process.env.PORT}`,
        }),
    ],
});
