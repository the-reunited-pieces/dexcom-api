import { createHTTPServer } from "@trpc/server/adapters/standalone";
import "dotenv/config.js";
import { appRouter } from "./appRouter.js";
import { keepalive } from "./keepalive.js";
const server = createHTTPServer({
    router: appRouter,
    middleware(req, res, next) {
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.setHeader("Access-Control-Request-Method", "*");
        res.setHeader("Access-Control-Allow-Methods", "OPTIONS, GET");
        res.setHeader("Access-Control-Allow-Headers", "*");
        if (req.method === "OPTIONS") {
            res.writeHead(200);
            res.end();
            return;
        }
        next();
    },
});
server.listen(process.env.PORT);
console.log(`[API] Listening on :${process.env.PORT}`);
keepalive();
//# sourceMappingURL=index.js.map