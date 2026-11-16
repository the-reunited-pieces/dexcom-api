export declare function getSecrets(): Promise<{
    access_token: string;
    refresh_token: string;
    expires_at: number;
} | undefined>;
export declare function writeSecrets(obj: {
    access_token: string;
    refresh_token: string;
    expires_at: number;
}): Promise<boolean>;
//# sourceMappingURL=secrets.d.ts.map