import { createHTTPServer } from "@trpc/server/adapters/standalone";
import "dotenv/config.js";
import { appRouter } from "./appRouter.js";
import { keepalive } from "./keepalive.js";
const server = createHTTPServer({ router: appRouter });
server.listen(process.env.PORT);
console.log(`[API] Listening on :${process.env.PORT}`);
keepalive();
//# sourceMappingURL=index.js.map