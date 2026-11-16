import { z } from "zod";
import { api } from "./dexcom.ts";
import { proc, router } from "./trpc.ts";

export const appRouter = router({
    egvs: proc.input(z.object({ start: z.number(), end: z.number() })).query(async ({ input: { start, end } }) => {
        return await api.egvs(new Date(start), new Date(end));
    }),
    dataRange: proc.query(api.dataRange),
});

export type AppRouter = typeof appRouter;
