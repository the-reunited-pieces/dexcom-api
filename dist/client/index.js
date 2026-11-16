import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config.js";
export const trpc = createTRPCClient({
    links: [
        httpBatchLink({
            url: `http://localhost:${process.env.PORT}`,
        }),
    ],
});
//# sourceMappingURL=index.js.map