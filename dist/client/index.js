import { createTRPCClient, httpBatchLink } from "@trpc/client";
export const makeTRPCClient = (url) => createTRPCClient({ links: [httpBatchLink({ url })] });
//# sourceMappingURL=index.js.map