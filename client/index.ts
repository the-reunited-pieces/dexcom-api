import { createTRPCClient, httpBatchLink } from "@trpc/client";
import "dotenv/config.js";
import type { AppRouter } from "../server/appRouter.js";

export const makeTRPCClient = (url: string) => createTRPCClient<AppRouter>({ links: [httpBatchLink({ url })] });
