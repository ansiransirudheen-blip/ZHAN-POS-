
create or replace function public.zahn_adjust_invoice(p_request_id uuid,p_invoice_id text,p_kind text,p_reason text,p_payload jsonb default '{}'::jsonb)
returns jsonb language plpgsql security invoker set search_path='' as $$
declare
 v_owner uuid := (select auth.uid()); v_original jsonb; v_result jsonb;
 v_date date; v_return jsonb; v_new jsonb; v_return_id text; v_new_id text;
 v_subtotal numeric:=0; v_discount numeric; v_item jsonb; v_qty numeric; v_ml numeric; v_price numeric;
begin
 if v_owner is null then raise exception 'Sign in required'; end if;
 if p_request_id is null or p_kind is null or p_kind not in ('return','edit') or length(trim(coalesce(p_reason,'')))=0 then raise exception 'Action and reason required'; end if;
 perform pg_advisory_xact_lock(hashtextextended(v_owner::text||':adjust:'||p_request_id::text,0));
 select jsonb_agg(payload order by (payload->>'invoicePurpose'='return') desc,id) into v_result from public.zahn_invoice_records where owner_id=v_owner and payload->>'operationRequestId'=p_request_id::text;
 if v_result is not null then return v_result; end if;
 select payload into v_original from public.zahn_invoice_records where id=p_invoice_id and owner_id=v_owner for update;
 if v_original is null then raise exception 'Original invoice not found. Sync this device first.'; end if;
 if coalesce(v_original->>'invoicePurpose','sale') not in ('sale','') then raise exception 'Only sale invoices can be edited or returned'; end if;
 if exists(select 1 from public.zahn_invoice_records where owner_id=v_owner and payload->>'invoicePurpose'='return' and payload->>'originalInvoiceId'=p_invoice_id) then raise exception 'This invoice was already returned or replaced. Sync and open the latest invoice.'; end if;
 if p_kind='edit' then v_date:=(v_original->>'date')::date; else v_date:=(now() at time zone 'Asia/Riyadh')::date; end if;
 if exists(select 1 from public.zahn_day_closes where owner_id=v_owner and close_date=v_date) then raise exception 'The action date is closed. Reopen that day before continuing.'; end if;
 if p_kind='edit' then
  if jsonb_typeof(p_payload->'items') is distinct from 'array' or jsonb_array_length(p_payload->'items')=0 then raise exception 'Add at least one item'; end if;
  for v_item in select value from jsonb_array_elements(p_payload->'items') loop
   v_qty:=(v_item->>'qty')::numeric;v_ml:=(v_item->>'ml')::numeric;v_price:=(v_item->>'price')::numeric;
   if coalesce(length(trim(v_item->>'name')),0)=0 or v_qty is null or v_qty<=0 or v_qty<>trunc(v_qty) or v_qty>100000 or v_ml is null or v_ml<=0 or v_ml>100000 or v_price is null or v_price<0 or v_price>1000000 then raise exception 'Invalid item values'; end if;
   v_subtotal:=v_subtotal+v_qty*v_price;
  end loop;
  v_subtotal:=round(v_subtotal,2);v_discount:=round(coalesce((p_payload->>'discount')::numeric,0),2);
  if v_discount<0 or v_discount>v_subtotal then raise exception 'Invalid discount'; end if;
  if coalesce(p_payload->>'payment','') not in ('Cash','Mada','Bank Transfer') then raise exception 'Choose a payment method'; end if;
 end if;
 v_return_id:='ZHN-R-'||p_request_id::text;
 v_return:=(v_original - 'client_request_id')||jsonb_build_object('id',v_return_id,'invoicePurpose','return','date',v_date::text,'createdAt',now(),'originalInvoiceId',p_invoice_id,'adjustmentKind',p_kind,'reason',left(trim(p_reason),1000),'operationRequestId',p_request_id::text);
 if p_kind='return' then
  if coalesce(p_payload->>'payment','') not in ('Cash','Mada','Bank Transfer') then raise exception 'Choose a refund payment method'; end if;
  v_return:=v_return||jsonb_build_object('payment',p_payload->>'payment');
 end if;
 if p_kind='edit' then
  v_new_id:='ZHN-'||lpad(nextval('public.zahn_staging_invoice_seq')::text,7,'0');
  v_new:=jsonb_build_object('id',v_new_id,'invoicePurpose','sale','vatRate',coalesce(v_original->'vatRate','0'::jsonb),'date',v_date::text,'customer',coalesce(p_payload->>'customer',''),'phone',coalesce(p_payload->>'phone',''),'payment',p_payload->>'payment','items',p_payload->'items','subtotal',v_subtotal,'discount',v_discount,'total',v_subtotal-v_discount,'createdAt',now(),'replacesInvoiceId',p_invoice_id,'operationRequestId',p_request_id::text,'reason',left(trim(p_reason),1000));
  v_return:=v_return||jsonb_build_object('replacementInvoiceId',v_new_id);
 end if;
 insert into public.zahn_invoice_records(id,owner_id,invoice_date,payload) values(v_return_id,v_owner,v_date,v_return);
 if v_new is not null then insert into public.zahn_invoice_records(id,owner_id,invoice_date,payload) values(v_new_id,v_owner,v_date,v_new); end if;
 return case when v_new is null then jsonb_build_array(v_return) else jsonb_build_array(v_return,v_new) end;
end $$;
revoke all on function public.zahn_adjust_invoice(uuid,text,text,text,jsonb) from public,anon;
grant execute on function public.zahn_adjust_invoice(uuid,text,text,text,jsonb) to authenticated;
