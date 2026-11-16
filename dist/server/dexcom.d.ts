import z from "zod";
export declare const api: {
    egvs: (start: Date, end: Date) => Promise<{
        error: string;
        value: null;
    } | {
        error: null;
        value: {
            recordType: "egv";
            recordVersion: string;
            userId: string;
            records: {
                recordId: string;
                systemTime: string;
                displayTime: string;
                transmitterId?: string | undefined;
                transmitterTicks: number;
                value?: number | undefined;
                status?: string | undefined;
                trend?: string | undefined;
                trendRate?: number | undefined;
                unit: "mg/dL";
                rateUnit: "mg/dL/min";
                displayDevice: string;
                transmitterGeneration: string;
                transmitterGenerationVariant?: string | undefined;
                displayApp?: string | undefined;
                valueInMgdl: number | undefined;
                valueInMmoll: number | undefined;
                rateInMgdlmin: number | undefined;
                rateInMmollmin: number | undefined;
            }[];
        };
    }>;
    dataRange: () => Promise<{
        error: string;
        value: null;
    } | {
        error: null;
        value: {
            recordType: "dataRange";
            recordVersion: string;
            userId: string;
            calibrations?: {
                start: {
                    systemTime: string;
                    displayTime: string;
                };
                end: {
                    systemTime: string;
                    displayTime: string;
                };
            } | undefined;
            egvs?: {
                start: {
                    systemTime: string;
                    displayTime: string;
                };
                end: {
                    systemTime: string;
                    displayTime: string;
                };
            } | undefined;
            events?: {
                start: {
                    systemTime: string;
                    displayTime: string;
                };
                end: {
                    systemTime: string;
                    displayTime: string;
                };
            } | undefined;
        };
    }>;
    events: (start: Date, end: Date) => Promise<{
        error: string;
        value: null;
    } | {
        error: null;
        value: {
            recordType: "event";
            recordVersion: string;
            userId: string;
            records: {
                recordId: string;
                systemTime: string;
                displayTime: string;
                eventStatus: string;
                eventType: string;
                eventSubType?: string | undefined;
                value: string;
                unit: string;
                transmitterId: string;
                transmitterGeneration: string;
                transmitterGenerationVariant: string;
                displayDevice: string;
            }[];
        };
    }>;
    alerts: (start: Date, end: Date) => Promise<{
        error: string;
        value: null;
    } | {
        error: null;
        value: {
            recordType: "alert";
            recordVersion: string;
            userId: string;
            records: {
                recordId: string;
                systemTime: string;
                displayTime: string;
                alertName: string;
                alertState: string;
                displayDevice: string;
                transmitterGeneration: string;
                transmitterGenerationVariant: string;
                transmitterId: string;
                displayApp: string;
            }[];
        };
    }>;
};
export declare const tokenResponseValidator: z.ZodObject<{
    access_token: z.ZodString;
    expires_in: z.ZodNumber;
    token_type: z.ZodLiteral<"Bearer">;
    refresh_token: z.ZodString;
}, z.core.$strip>;
//# sourceMappingURL=dexcom.d.ts.map