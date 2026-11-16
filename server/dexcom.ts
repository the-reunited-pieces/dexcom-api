import z from "zod";
import { getSecrets, writeSecrets } from "./secrets.ts";
import { Mutex } from "async-mutex";

const mutex = new Mutex();

async function makeRequest<T extends z.ZodObject>(path: string, validator: T): Promise<{ error: string; value: null } | { error: null; value: z.infer<T> }> {
    return await mutex.runExclusive(async () => {
        const secrets = await getSecrets();
        if (!secrets) return { error: "auth", value: null };

        if (secrets.expires_at <= Date.now()) return { error: "auth", value: null };
        let access_token = secrets.access_token;

        if (secrets.expires_at <= Date.now() + 10 * 60 * 60 * 1000) {
            const res = await fetch(`${process.env.DEXCOM_API}/v3/oauth2/token`, {
                method: "post",
                headers: {
                    "Content-Type": "application/x-www-form-urlencoded",
                },
                body: new URLSearchParams({
                    client_id: process.env.DEXCOM_CLIENT_ID!,
                    client_secret: process.env.DEXCOM_CLIENT_SECRET!,
                    grant_type: "refresh_token",
                    refresh_token: secrets.refresh_token,
                }),
            });

            if (!res.ok) return { error: "auth", value: null };

            const data = await res
                .json()
                .then(async (data) => await tokenResponseValidator.parseAsync(data))
                .catch(() => null);

            if (data == null) return { error: "auth", value: null };
            access_token = data.access_token;
            const success = await writeSecrets({
                access_token: data.access_token,
                refresh_token: data.refresh_token,
                expires_at: Date.now() + data.expires_in * 1000,
            });
            if (!success) return { error: "write", value: null };
        }

        const res = await fetch(`${process.env.DEXCOM_API}/v3/users/self${path}`, { headers: { Authorization: `Bearer ${access_token}` } });

        if (res.status === 401 || res.status === 403) return { error: "auth", value: null };

        if (!res.ok) return { error: "dexcom", value: null };

        const data = await res
            .json()
            .then(async (data) => await validator.parseAsync(data))
            .catch(() => null);

        if (data === null) return { error: "parse", value: null };

        return { error: null, value: data };
    });
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
