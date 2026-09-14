import { makeHandler } from "./handler.ts";

Deno.serve(
  makeHandler({
    secret: Deno.env.get("VEGA_TEST_SECRET"),
    url: Deno.env.get("SUPABASE_URL"),
    serviceKey: Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"),
  }),
);
