import "dotenv/config.js";
export declare const trpc: import("@trpc/client").TRPCClient<import("@trpc/server").TRPCBuiltRouter<{
    ctx: object;
    meta: object;
    errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    transformer: false;
}, import("@trpc/server").TRPCDecorateCreateRouterOptions<{
    egvs: import("@trpc/server").TRPCQueryProcedure<{
        input: {
            start: number;
            end: number;
        };
        output: {
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
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    }>;
    dataRange: import("@trpc/server").TRPCQueryProcedure<{
        input: void;
        output: {
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
        };
        meta: object;
        errorShape: import("@trpc/server").TRPCDefaultErrorShape;
    }>;
}>>>;
//# sourceMappingURL=index.d.ts.map