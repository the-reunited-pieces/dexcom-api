import z from "zod";
import { getSecrets } from "./secrets.js";
async function makeRequest(path, validator) {
    const fail = (error) => ({ error, value: null, sandbox: !!process.env.DEXCOM_SANDBOX });
    console.log(`[API] Making outgoing request to \`${path}\``);
    const secrets = await getSecrets();
    if (!secrets || secrets.expires_at <= Date.now())
        return fail("auth");
    const res = await fetch(`${process.env.DEXCOM_API}/v3/users/self${path}`, { headers: { Authorization: `Bearer ${secrets.access_token}` } });
    if (res.status === 401 || res.status === 403)
        return fail("auth");
    if (!res.ok)
        return fail("dexcom");
    const data = await res
        .json()
        .then(async (raw) => {
        const { success, data, error } = await validator.safeParseAsync(raw);
        if (!success) {
            console.error(`[API] DEXCOM response failed validation:\n${error.issues.map((issue) => `- [${issue.path}] ${issue.message}`).join("\n")}\nJSON: ${JSON.stringify(raw, null, 4)}`);
            return null;
        }
        return data;
    })
        .catch(() => null);
    if (data === null)
        return fail("parse");
    return { error: null, value: data, sandbox: !!process.env.DEXCOM_SANDBOX };
}
export const api = {
    egvs: async (start, end) => await makeRequest(`/egvs?${new URLSearchParams({ startDate: start.toISOString().slice(0, -1), endDate: end.toISOString().slice(0, -1) })}`, egvsValidator),
    dataRange: async () => await makeRequest("/dataRange", dataRangeValidator),
    events: async (start, end) => await makeRequest(`/events?${new URLSearchParams({ startDate: start.toISOString().slice(0, -1), endDate: end.toISOString().slice(0, -1) })}`, eventsValidator),
    alerts: async (start, end) => await makeRequest(`/alerts?${new URLSearchParams({ startDate: start.toISOString().slice(0, -1), endDate: end.toISOString().slice(0, -1) })}`, alertsValidator),
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
const eventsValidator = z.object({
    recordType: z.literal("event"),
    recordVersion: z.string(),
    userId: z.string(),
    records: z
        .object({
        recordId: z.string(),
        systemTime: z.string(),
        displayTime: z.string(),
        eventStatus: z.string(),
        eventType: z.string(),
        eventSubType: z.string().optional(),
        value: z.string(),
        unit: z.string(),
        transmitterId: z.string(),
        transmitterGeneration: z.string(),
        transmitterGenerationVariant: z.string(),
        displayDevice: z.string(),
    })
        .array(),
});
const alertsValidator = z.object({
    recordType: z.literal("alert"),
    recordVersion: z.string(),
    userId: z.string(),
    records: z
        .object({
        recordId: z.string(),
        systemTime: z.string(),
        displayTime: z.string(),
        alertName: z.string(),
        alertState: z.string(),
        displayDevice: z.string(),
        transmitterGeneration: z.string(),
        transmitterGenerationVariant: z.string(),
        transmitterId: z.string(),
        displayApp: z.string(),
    })
        .array(),
});
//# sourceMappingURL=dexcom.js.map