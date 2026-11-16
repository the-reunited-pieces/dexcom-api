import { z } from "zod";
import { api } from "./dexcom.ts";
import { proc, router } from "./trpc.ts";

export const appRouter = router({
    egvs: proc.input(z.object({ start: z.number(), end: z.number() })).query(async ({ input: { start, end } }) => {
        console.log(`[API] Handling /egvs start=${start} end=${end}`);
        return await api.egvs(new Date(start), new Date(end));
    }),
    dataRange: proc.query(async () => {
        console.log(`[API] Handling /dataRange`);
        return await api.dataRange();
    }),
    events: proc.input(z.object({ start: z.number(), end: z.number() })).query(async ({ input: { start, end } }) => {
        console.log(`[API] handling /events start=${start} end=${end}`);
        return await api.events(new Date(start), new Date(end));
    }),
    alerts: proc.input(z.object({ start: z.number(), end: z.number() })).query(async ({ input: { start, end } }) => {
        console.log(`[API] handling /alerts start=${start} end=${end}`);
        return await api.alerts(new Date(start), new Date(end));
    }),
});

export type AppRouter = typeof appRouter;
