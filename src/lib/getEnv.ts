// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).process = (globalThis as any).process ?? { env: {} };

export function getEnvVariable(name: string): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (globalThis as any).process.env[name];
}