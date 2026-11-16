import { createHTTPServer } from "@trpc/server/adapters/standalone";
import { appRouter } from "./appRouter.js";
import "dotenv/config.js";
const server = createHTTPServer({
    router: appRouter,
});
server.listen(process.env.PORT);
//# sourceMappingURL=index.js.map