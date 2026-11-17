import { createTRPCClient, httpBatchLink } from "@trpc/client";
export const makeTRPCClient = (url) => createTRPCClient({ links: [httpBatchLink({ url })] });
export {};
//# sourceMappingURL=index.js.map