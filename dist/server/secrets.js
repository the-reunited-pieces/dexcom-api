import { readFile, writeFile } from "node:fs/promises";
import { z } from "zod";
const secretsValidator = z.object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_at: z.number(),
});
export async function getSecrets() {
    const text = await readFile("secrets.json", "utf-8");
    try {
        return secretsValidator.parse(JSON.parse(text));
    }
    catch (e) {
        console.error(e);
    }
}
export async function writeSecrets(obj) {
    try {
        await writeFile("secrets.json", JSON.stringify(obj));
        return true;
    }
    catch (e) {
        console.error(e);
        return false;
    }
}
//# sourceMappingURL=secrets.js.map