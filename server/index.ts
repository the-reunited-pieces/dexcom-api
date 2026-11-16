import { createHTTPServer } from "@trpc/server/adapters/standalone";
import "dotenv/config.js";
import { appRouter } from "./appRouter.ts";
import { keepalive } from "./keepalive.ts";

const server = createHTTPServer({ router: appRouter });

server.listen(process.env.PORT);
console.log(`[API] Listening on :${process.env.PORT}`);

keepalive();
