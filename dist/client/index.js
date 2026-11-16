import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config.js";
export const makeTRPCClient = (url) => createTRPCClient({ links: [httpBatchLink({ url })] });
//# sourceMappingURL=index.js.map