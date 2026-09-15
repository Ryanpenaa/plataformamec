import { createFileRoute } from "@tanstack/react-router";
import type { SupabaseClient } from "@supabase/supabase-js";
import { makeVegaAccessHandler } from "@/lib/vega/handler";

export const Route = createFileRoute("/api/public/vega-access")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const handler = makeVegaAccessHandler({
          secret: process.env["VEGA_TEST_SECRET"] ?? "",
          enabled: process.env["VEGA_ACCESS_ENABLED"] === "true",
          process: async (event, payloadHash) => {
            const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
            const admin = supabaseAdmin as unknown as SupabaseClient;
            const { data, error } = await admin.rpc("process_vega_purchase", {
              p_transaction_token: event.transactionToken,
              p_status: event.status,
              p_customer_email: event.customerEmail,
              p_customer_name: event.customerName,
              p_source_version: event.sourceVersion,
              p_event_occurred_at: event.eventOccurredAt,
              p_product_codes: event.productCodes,
              p_payload_hash: payloadHash,
            });
            if (error) throw new Error("Vega event could not be processed");
            return data;
          },
        });
        return handler(request);
      },
    },
  },
});
