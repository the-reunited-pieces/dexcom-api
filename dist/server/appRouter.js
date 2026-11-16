import { z } from "zod";
import { api } from "./dexcom.js";
import { proc, router } from "./trpc.js";
export const appRouter = router({
    egvs: proc.input(z.object({ start: z.number(), end: z.number() })).query(async ({ input: { start, end } }) => {
        return await api.egvs(new Date(start), new Date(end));
    }),
    dataRange: proc.query(api.dataRange),
});
//# sourceMappingURL=appRouter.js.map