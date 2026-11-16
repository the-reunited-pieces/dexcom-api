import z from "zod";
import { getSecrets } from "./secrets.ts";

async function makeRequest<T extends z.ZodObject>(path: string, validator: T): Promise<{ error: string; value: null } | { error: null; value: z.infer<T> }> {
    const secrets = await getSecrets();
    if (!secrets || secrets.expires_at <= Date.now()) return { error: "auth", value: null };

    const res = await fetch(`${process.env.DEXCOM_API}/v3/users/self${path}`, { headers: { Authorization: `Bearer ${secrets.access_token}` } });
    if (res.status === 401 || res.status === 403) return { error: "auth", value: null };
    if (!res.ok) return { error: "dexcom", value: null };

    const data = await res
        .json()
        .then(async (data) => await validator.parseAsync(data))
        .catch(() => null);

    if (data === null) return { error: "parse", value: null };

    return { error: null, value: data };
}

export const api = {
    egvs: async (start: Date, end: Date) =>
        await makeRequest(
            `/egvs?${new URLSearchParams({ startDate: start.toISOString().slice(0, -1), endDate: end.toISOString().slice(0, -1) })}`,
            egvsValidator,
        ),
    dataRange: async () => await makeRequest("/dataRange", dataRangeValidator),
};

export const tokenResponseValidator = z.object({
    access_token: z.string(),
    expires_in: z.number(),
    token_type: z.literal("Bearer"),
    refresh_token: z.string(),
});

const systemAndDisplayTime = z.object({
    systemTime: z.string(),
    displayTime: z.string(),
});

const startAndEnd = z.object({
    start: systemAndDisplayTime,
    end: systemAndDisplayTime,
});

const dataRangeValidator = z.object({
    recordType: z.literal("dataRange"),
    recordVersion: z.string(),
    userId: z.string(),
    calibrations: startAndEnd.optional(),
    egvs: startAndEnd.optional(),
    events: startAndEnd.optional(),
});

const egvsValidator = z.object({
    recordType: z.literal("egv"),
    recordVersion: z.string(),
    userId: z.string(),
    records: z
        .object({
            recordId: z.string(),
            systemTime: z.string(),
            displayTime: z.string(),
            transmitterId: z.string().optional(),
            transmitterTicks: z.number(),
            value: z.number().optional(),
            status: z.string().optional(),
            trend: z.string().optional(),
            trendRate: z.number().optional(),
            unit: z.literal("mg/dL"),
            rateUnit: z.literal("mg/dL/min"),
            displayDevice: z.string(),
            transmitterGeneration: z.string(),
            transmitterGenerationVariant: z.string().optional(),
            displayApp: z.string().optional(),
        })
        .transform((obj) => ({
            ...obj,
            valueInMgdl: obj.value,
            valueInMmoll: obj.value === undefined ? undefined : obj.value / 18,
            rateInMgdlmin: obj.trendRate,
            rateInMmollmin: obj.trendRate === undefined ? undefined : obj.trendRate / 18,
        }))
        .array(),
});
