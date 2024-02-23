// eslint-disable-next-line @typescript-eslint/no-explicit-any
(global as any).process = (global as any).process ?? { env: {} };

export function getEnvVariable(name: string): string | undefined {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (global as any).process.env[name];
}