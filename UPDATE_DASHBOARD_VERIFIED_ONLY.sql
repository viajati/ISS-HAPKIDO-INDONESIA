-- Update dashboard_national_summary to only show verified reports
create or replace function public.dashboard_national_summary(p_months int default 3)
returns json
language sql
stable
as $$
with
-- last N months range (inclusive start, exclusive end)
range as (
  select
    (date_trunc('month', now()) - (p_months - 1) * interval '1 month')::date as d_from,
    (date_trunc('month', now()) + interval '1 month')::date as d_to
),

hero as (
  select
    (select count(*) from public.injury_reports where status = 'verified')::int as total_cedera,
    (select count(distinct athlete_name) from public.injury_reports where status = 'verified')::int as total_atlet,
    (select count(*) from public.profiles where role = 'pelatih')::int as total_pelatih,
    (select count(*) from public.profiles where role = 'admin_daerah')::int as total_pengurus
),

monthly as (
  select
    date_trunc('month', ir.injury_date::date) as m,
    to_char(date_trunc('month', ir.injury_date::date), 'TMMonth YYYY') as month,
    count(*)::int as total
  from public.injury_reports ir, range r
  where ir.status = 'verified'
    and ir.injury_date::date >= r.d_from
    and ir.injury_date::date <  r.d_to
  group by 1,2
  order by m
),

monthly_with_pct as (
  select
    month,
    total,
    round((total::numeric / nullif((select sum(total) from monthly),0)) * 100, 1) as percentage
  from monthly
),

-- ✅ reports in range (per laporan) for severity distribution
reports_in_range as (
  select
    ir.id,
    ir.severity_level
  from public.injury_reports ir, range r
  where ir.status = 'verified'
    and ir.injury_date::date >= r.d_from
    and ir.injury_date::date <  r.d_to
),

injuries_flat as (
  select
    coalesce(nullif(trim(x->>'location'), ''), 'Lainnya') as lokasi,
    coalesce(nullif(trim(x->>'injuryType'), ''), 'Lainnya') as jenis
  from public.injury_reports ir
  join range r on true
  cross join lateral jsonb_array_elements(ir.injuries::jsonb) x
  where ir.status = 'verified'
    and ir.injury_date::date >= r.d_from
    and ir.injury_date::date <  r.d_to
),

lokasi_dist as (
  select lokasi, count(*)::int as count
  from injuries_flat
  group by 1
  order by count desc
  limit 10
),

jenis_dist as (
  select jenis, count(*)::int as count
  from injuries_flat
  group by 1
  order by count desc
  limit 10
),

-- ✅ derajat distribution based on severity_level (per laporan)
derajat_dist as (
  select
    case
      when lower(coalesce(severity_level,'')) = 'ringan' then 'Ringan'
      when lower(coalesce(severity_level,'')) = 'sedang' then 'Sedang'
      when lower(coalesce(severity_level,'')) = 'berat'  then 'Berat'
      else 'Lainnya'
    end as derajat,
    count(*)::int as count
  from reports_in_range
  group by 1
  order by count desc
),

lokasi_with_pct as (
  select lokasi, count,
    round((count::numeric / nullif((select sum(count) from lokasi_dist),0)) * 100, 1) as percentage
  from lokasi_dist
),

jenis_with_pct as (
  select jenis, count,
    round((count::numeric / nullif((select sum(count) from jenis_dist),0)) * 100, 1) as percentage
  from jenis_dist
),

derajat_with_pct as (
  select derajat, count,
    round((count::numeric / nullif((select sum(count) from derajat_dist),0)) * 100, 1) as percentage
  from derajat_dist
)

select json_build_object(
  'hero', (select row_to_json(hero) from hero),
  'monthly', (select coalesce(json_agg(row_to_json(monthly_with_pct)), '[]'::json) from monthly_with_pct),
  'lokasi', (select coalesce(json_agg(row_to_json(lokasi_with_pct)), '[]'::json) from lokasi_with_pct),
  'jenis',  (select coalesce(json_agg(row_to_json(jenis_with_pct)),  '[]'::json) from jenis_with_pct),
  'derajat',(select coalesce(json_agg(row_to_json(derajat_with_pct)), '[]'::json) from derajat_with_pct)
);
$$;
