import { z } from "zod";

const Beds24EnvSchema = z.object({
  BEDS24_API_TOKEN: z.string().min(1, "BEDS24_API_TOKEN missing in env"),
  BEDS24_BASE_URL: z.string().url().default("https://api.beds24.com/v2"),
});

export type Beds24Env = z.infer<typeof Beds24EnvSchema>;

export function loadBeds24Env(env: NodeJS.ProcessEnv = process.env): Beds24Env {
  return Beds24EnvSchema.parse({
    BEDS24_API_TOKEN: env.BEDS24_API_TOKEN,
    BEDS24_BASE_URL: env.BEDS24_BASE_URL ?? "https://api.beds24.com/v2",
  });
}

export class Beds24Client {
  constructor(private readonly env: Beds24Env) {}

  private async request<T>(path: string, init: RequestInit = {}): Promise<T> {
    const url = `${this.env.BEDS24_BASE_URL}${path}`;
    const res = await fetch(url, {
      ...init,
      headers: {
        "Content-Type": "application/json",
        token: this.env.BEDS24_API_TOKEN,
        ...(init.headers ?? {}),
      },
    });
    if (!res.ok) {
      const body = await res.text();
      throw new Error(`Beds24 ${init.method ?? "GET"} ${path} failed: ${res.status} ${body}`);
    }
    return (await res.json()) as T;
  }

  async listProperties(): Promise<unknown> {
    return this.request("/properties");
  }
}
