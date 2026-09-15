CREATE POLICY vega_webhook_events_deny_client_access ON public.vega_webhook_events FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
CREATE POLICY integration_settings_deny_client_access ON public.integration_settings FOR ALL TO anon, authenticated USING (false) WITH CHECK (false);
ALTER EXTENSION citext SET SCHEMA extensions;