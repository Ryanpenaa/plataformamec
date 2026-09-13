create policy "No public reads of Vega test events"
on public.vega_test_events
for select
to anon, authenticated
using (false);

create policy "No public writes of Vega test events"
on public.vega_test_events
for insert
to anon, authenticated
with check (false);

create policy "No public updates of Vega test events"
on public.vega_test_events
for update
to anon, authenticated
using (false)
with check (false);

create policy "No public deletes of Vega test events"
on public.vega_test_events
for delete
to anon, authenticated
using (false);