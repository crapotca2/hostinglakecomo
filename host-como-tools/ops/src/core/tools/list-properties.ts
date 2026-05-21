import { z } from "zod";
import { Beds24Client, loadBeds24Env } from "../beds24-client.js";

export const ListPropertiesInput = z.object({});
export type ListPropertiesInput = z.infer<typeof ListPropertiesInput>;

export const ListPropertiesOutput = z.object({
  count: z.number(),
  properties: z.array(
    z.object({
      id: z.union([z.string(), z.number()]),
      name: z.string().optional(),
      city: z.string().optional(),
    }),
  ),
});
export type ListPropertiesOutput = z.infer<typeof ListPropertiesOutput>;

export async function listProperties(
  _input: ListPropertiesInput = {},
): Promise<ListPropertiesOutput> {
  const env = loadBeds24Env();
  const client = new Beds24Client(env);
  const raw = (await client.listProperties()) as { data?: unknown[] };
  const list = Array.isArray(raw?.data) ? raw.data : [];
  const properties = list.map((p) => {
    const o = p as Record<string, unknown>;
    return {
      id: (o.id ?? o.propertyId ?? "") as string | number,
      name: (o.name as string | undefined) ?? undefined,
      city: (o.city as string | undefined) ?? undefined,
    };
  });
  return ListPropertiesOutput.parse({ count: properties.length, properties });
}
