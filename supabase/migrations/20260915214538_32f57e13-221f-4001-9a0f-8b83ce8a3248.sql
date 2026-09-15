CREATE EXTENSION IF NOT EXISTS citext;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TABLE public.student_profiles (
  user_id uuid PRIMARY KEY,
  display_name text NOT NULL CHECK (char_length(display_name) BETWEEN 2 AND 120),
  normalized_email citext NOT NULL UNIQUE,
  email_confirmed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.student_profiles TO authenticated;
GRANT ALL ON public.student_profiles TO service_role;
ALTER TABLE public.student_profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY student_profiles_read_own ON public.student_profiles
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER student_profiles_set_updated_at
  BEFORE UPDATE ON public.student_profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vega_customers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  normalized_email citext NOT NULL UNIQUE,
  customer_name text NOT NULL DEFAULT '',
  user_id uuid UNIQUE,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vega_customers TO authenticated;
GRANT ALL ON public.vega_customers TO service_role;
ALTER TABLE public.vega_customers ENABLE ROW LEVEL SECURITY;
CREATE POLICY vega_customers_read_own ON public.vega_customers
  FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE TRIGGER vega_customers_set_updated_at
  BEFORE UPDATE ON public.vega_customers FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vega_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id uuid NOT NULL REFERENCES public.vega_customers(id) ON DELETE RESTRICT,
  transaction_token text NOT NULL UNIQUE,
  status text NOT NULL CHECK (status IN ('pending','approved','declined','refunded','chargeback','cancelled')),
  source_version text NOT NULL CHECK (source_version IN ('v1','v2')),
  event_occurred_at timestamptz NOT NULL,
  test_mode boolean NOT NULL DEFAULT false CHECK (test_mode = false),
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.vega_purchases TO authenticated;
GRANT ALL ON public.vega_purchases TO service_role;
ALTER TABLE public.vega_purchases ENABLE ROW LEVEL SECURITY;
CREATE POLICY vega_purchases_read_own ON public.vega_purchases
  FOR SELECT TO authenticated USING (
    EXISTS (SELECT 1 FROM public.vega_customers c WHERE c.id = customer_id AND c.user_id = auth.uid())
  );
CREATE INDEX vega_purchases_customer_id_idx ON public.vega_purchases(customer_id);
CREATE TRIGGER vega_purchases_set_updated_at
  BEFORE UPDATE ON public.vega_purchases FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vega_purchase_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES public.vega_purchases(id) ON DELETE CASCADE,
  product_code text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (purchase_id, product_code)
);
GRANT SELECT ON public.vega_purchase_items TO authenticated;
GRANT ALL ON public.vega_purchase_items TO service_role;
ALTER TABLE public.vega_purchase_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY vega_purchase_items_read_own ON public.vega_purchase_items
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.vega_purchases p
      JOIN public.vega_customers c ON c.id = p.customer_id
      WHERE p.id = purchase_id AND c.user_id = auth.uid()
    )
  );
CREATE INDEX vega_purchase_items_purchase_id_idx ON public.vega_purchase_items(purchase_id);
CREATE TRIGGER vega_purchase_items_set_updated_at
  BEFORE UPDATE ON public.vega_purchase_items FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.purchase_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_id uuid NOT NULL REFERENCES public.vega_purchases(id) ON DELETE CASCADE,
  entitlement text NOT NULL CHECK (entitlement IN ('course:auto','course:ar','course:eletrica','course:motos','course:som','materials:apostilas','materials:imprimiveis')),
  active boolean NOT NULL DEFAULT true,
  revoked_at timestamptz,
  revoked_reason text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (purchase_id, entitlement)
);
GRANT SELECT ON public.purchase_entitlements TO authenticated;
GRANT ALL ON public.purchase_entitlements TO service_role;
ALTER TABLE public.purchase_entitlements ENABLE ROW LEVEL SECURITY;
CREATE POLICY purchase_entitlements_read_own ON public.purchase_entitlements
  FOR SELECT TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.vega_purchases p
      JOIN public.vega_customers c ON c.id = p.customer_id
      WHERE p.id = purchase_id AND c.user_id = auth.uid()
    )
  );
CREATE INDEX purchase_entitlements_purchase_id_idx ON public.purchase_entitlements(purchase_id);
CREATE TRIGGER purchase_entitlements_set_updated_at
  BEFORE UPDATE ON public.purchase_entitlements FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.vega_webhook_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_token text NOT NULL,
  source_version text NOT NULL CHECK (source_version IN ('v1','v2')),
  status text NOT NULL CHECK (status IN ('pending','approved','declined','refunded','chargeback','cancelled')),
  event_occurred_at timestamptz NOT NULL,
  payload_hash text NOT NULL CHECK (char_length(payload_hash) = 64),
  outcome text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (transaction_token, source_version, status, event_occurred_at, payload_hash)
);
GRANT ALL ON public.vega_webhook_events TO service_role;
ALTER TABLE public.vega_webhook_events ENABLE ROW LEVEL SECURITY;

CREATE TABLE public.integration_settings (
  integration text PRIMARY KEY,
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT ALL ON public.integration_settings TO service_role;
ALTER TABLE public.integration_settings ENABLE ROW LEVEL SECURITY;
CREATE TRIGGER integration_settings_set_updated_at
  BEFORE UPDATE ON public.integration_settings FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.integration_settings (integration, enabled) VALUES ('vega_access', false);

CREATE OR REPLACE FUNCTION public.link_verified_student(
  p_user_id uuid,
  p_email text,
  p_display_name text
) RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, auth, pg_temp
AS $$
DECLARE
  v_email citext := lower(trim(p_email))::citext;
  v_confirmed boolean;
BEGIN
  SELECT email_confirmed_at IS NOT NULL AND lower(email)::citext = v_email
  INTO v_confirmed
  FROM auth.users
  WHERE id = p_user_id;

  IF coalesce(v_confirmed, false) IS NOT TRUE THEN
    RAISE EXCEPTION 'verified email required';
  END IF;

  INSERT INTO public.student_profiles (user_id, display_name, normalized_email, email_confirmed)
  VALUES (p_user_id, left(coalesce(nullif(trim(p_display_name), ''), 'Aluno'), 120), v_email, true)
  ON CONFLICT (user_id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    normalized_email = EXCLUDED.normalized_email,
    email_confirmed = true;

  UPDATE public.vega_customers
  SET user_id = p_user_id
  WHERE normalized_email = v_email AND (user_id IS NULL OR user_id = p_user_id);
END;
$$;
REVOKE ALL ON FUNCTION public.link_verified_student(uuid,text,text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.link_verified_student(uuid,text,text) TO service_role;

CREATE OR REPLACE FUNCTION public.process_vega_purchase(
  p_transaction_token text,
  p_status text,
  p_customer_email text,
  p_customer_name text,
  p_source_version text,
  p_event_occurred_at timestamptz,
  p_product_codes text[],
  p_payload_hash text
) RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
DECLARE
  v_customer_id uuid;
  v_purchase_id uuid;
  v_current_status text;
  v_current_date timestamptz;
  v_apply boolean := false;
  v_event_id uuid;
  v_code text;
  v_entitlement text;
  v_entitlements text[] := ARRAY[]::text[];
  v_rank jsonb := '{"pending":10,"approved":20,"declined":30,"cancelled":40,"refunded":50,"chargeback":60}'::jsonb;
BEGIN
  IF NOT coalesce((SELECT enabled FROM public.integration_settings WHERE integration = 'vega_access'), false) THEN
    RETURN jsonb_build_object('processed', false, 'reason', 'disabled');
  END IF;
  IF p_status NOT IN ('pending','approved','declined','refunded','chargeback','cancelled')
     OR p_source_version NOT IN ('v1','v2')
     OR p_transaction_token IS NULL OR trim(p_transaction_token) = ''
     OR p_customer_email IS NULL OR position('@' in p_customer_email) = 0
     OR p_event_occurred_at IS NULL
     OR p_payload_hash IS NULL OR char_length(p_payload_hash) <> 64 THEN
    RAISE EXCEPTION 'invalid normalized Vega event';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtextextended(trim(p_transaction_token), 0));

  INSERT INTO public.vega_webhook_events
    (transaction_token, source_version, status, event_occurred_at, payload_hash, outcome)
  VALUES
    (trim(p_transaction_token), p_source_version, p_status, p_event_occurred_at, p_payload_hash, 'received')
  ON CONFLICT DO NOTHING
  RETURNING id INTO v_event_id;
  IF v_event_id IS NULL THEN
    RETURN jsonb_build_object('processed', false, 'reason', 'duplicate');
  END IF;

  INSERT INTO public.vega_customers (normalized_email, customer_name)
  VALUES (lower(trim(p_customer_email))::citext, coalesce(trim(p_customer_name), ''))
  ON CONFLICT (normalized_email) DO UPDATE SET
    customer_name = CASE WHEN EXCLUDED.customer_name <> '' THEN EXCLUDED.customer_name ELSE public.vega_customers.customer_name END
  RETURNING id INTO v_customer_id;

  INSERT INTO public.vega_purchases
    (customer_id, transaction_token, status, source_version, event_occurred_at, test_mode)
  VALUES
    (v_customer_id, trim(p_transaction_token), p_status, p_source_version, p_event_occurred_at, false)
  ON CONFLICT (transaction_token) DO NOTHING
  RETURNING id INTO v_purchase_id;

  IF v_purchase_id IS NULL THEN
    SELECT id, status, event_occurred_at INTO v_purchase_id, v_current_status, v_current_date
    FROM public.vega_purchases WHERE transaction_token = trim(p_transaction_token) FOR UPDATE;
    v_apply := coalesce((v_rank ->> p_status)::int, 0) > coalesce((v_rank ->> v_current_status)::int, 0)
      OR (p_status = v_current_status AND p_event_occurred_at > v_current_date);
    IF v_apply THEN
      UPDATE public.vega_purchases SET status = p_status, source_version = p_source_version,
        event_occurred_at = p_event_occurred_at WHERE id = v_purchase_id;
    END IF;
  ELSE
    v_apply := true;
  END IF;

  IF v_apply AND p_status = 'approved' THEN
    FOREACH v_code IN ARRAY coalesce(p_product_codes, ARRAY[]::text[]) LOOP
      v_code := upper(trim(v_code));
      INSERT INTO public.vega_purchase_items (purchase_id, product_code)
      VALUES (v_purchase_id, v_code) ON CONFLICT DO NOTHING;
      CASE v_code
        WHEN '3MKJ1N' THEN v_entitlements := v_entitlements || ARRAY['course:auto','materials:apostilas'];
        WHEN '3MNO78' THEN v_entitlements := v_entitlements || ARRAY['course:auto','materials:apostilas','materials:imprimiveis','course:ar'];
        WHEN '3MNO79' THEN v_entitlements := v_entitlements || ARRAY['course:auto','materials:apostilas','materials:imprimiveis','course:eletrica'];
        WHEN '3MNO7B' THEN v_entitlements := v_entitlements || ARRAY['course:auto','materials:apostilas','materials:imprimiveis','course:motos'];
        WHEN '3MOP51' THEN v_entitlements := v_entitlements || ARRAY['course:auto','materials:apostilas','materials:imprimiveis','course:som'];
        ELSE NULL;
      END CASE;
    END LOOP;
    FOREACH v_entitlement IN ARRAY v_entitlements LOOP
      INSERT INTO public.purchase_entitlements (purchase_id, entitlement, active, revoked_at, revoked_reason)
      VALUES (v_purchase_id, v_entitlement, true, NULL, NULL)
      ON CONFLICT (purchase_id, entitlement) DO UPDATE SET active = true, revoked_at = NULL, revoked_reason = NULL;
    END LOOP;
  ELSIF v_apply THEN
    UPDATE public.purchase_entitlements SET active = false, revoked_at = now(), revoked_reason = p_status
    WHERE purchase_id = v_purchase_id AND active = true;
  END IF;

  UPDATE public.vega_webhook_events
  SET outcome = CASE WHEN v_apply THEN 'applied' ELSE 'ignored_older_state' END
  WHERE id = v_event_id;
  RETURN jsonb_build_object('processed', v_apply, 'reason', CASE WHEN v_apply THEN 'applied' ELSE 'ignored_older_state' END);
END;
$$;
REVOKE ALL ON FUNCTION public.process_vega_purchase(text,text,text,text,text,timestamptz,text[],text) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.process_vega_purchase(text,text,text,text,text,timestamptz,text[],text) TO service_role;