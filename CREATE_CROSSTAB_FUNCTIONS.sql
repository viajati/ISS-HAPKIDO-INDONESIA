-- =====================================================
-- CROSSTAB ANALYTICS FUNCTIONS
-- =====================================================
-- Run this SQL in Supabase SQL Editor to create all crosstab functions
-- needed for Download Center

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS analytics_crosstab_summary(DATE, DATE);
DROP FUNCTION IF EXISTS analytics_crosstab_by_injury_type(DATE, DATE, INT);
DROP FUNCTION IF EXISTS analytics_crosstab_by_mechanism(DATE, DATE, INT);
DROP FUNCTION IF EXISTS analytics_crosstab_by_location(DATE, DATE, INT);
DROP FUNCTION IF EXISTS analytics_crosstab_by_severity(DATE, DATE);

-- 1. Summary: Total Atlet dan Cedera (Training vs Competition)
CREATE OR REPLACE FUNCTION analytics_crosstab_summary(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  kategori TEXT,
  training BIGINT,
  competition BIGINT,
  total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH base_data AS (
    SELECT 
      ir.id,
      ir.activity_type,
      ir.injury_count
    FROM injury_reports ir
    WHERE ir.status = 'verified'
      AND ir.injury_date >= start_date
      AND ir.injury_date <= end_date
  )
  SELECT 
    'Atlet'::TEXT AS kategori,
    COUNT(DISTINCT CASE WHEN activity_type = 'Training' THEN id END) AS training,
    COUNT(DISTINCT CASE WHEN activity_type = 'Competition' THEN id END) AS competition,
    COUNT(DISTINCT id) AS total
  FROM base_data
  
  UNION ALL
  
  SELECT 
    'Cedera'::TEXT AS kategori,
    COALESCE(SUM(CASE WHEN activity_type = 'Training' THEN injury_count END), 0) AS training,
    COALESCE(SUM(CASE WHEN activity_type = 'Competition' THEN injury_count END), 0) AS competition,
    COALESCE(SUM(injury_count), 0) AS total
  FROM base_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. By Injury Type (Jenis Cedera) - SEMUA DATA, TIDAK ADA LIMIT
CREATE OR REPLACE FUNCTION analytics_crosstab_by_injury_type(
  start_date DATE,
  end_date DATE,
  top_n INT DEFAULT 9999
)
RETURNS TABLE (
  kategori TEXT,
  training BIGINT,
  competition BIGINT,
  total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH injury_expanded AS (
    SELECT 
      ir.activity_type,
      (jsonb_array_elements(ir.injuries)->>'type')::TEXT AS injury_type
    FROM injury_reports ir
    WHERE ir.status = 'verified'
      AND ir.injury_date >= start_date
      AND ir.injury_date <= end_date
      AND ir.injuries IS NOT NULL
  ),
  counted AS (
    SELECT 
      COALESCE(injury_type, 'Tidak Diketahui') AS kategori,
      COUNT(*) FILTER (WHERE activity_type = 'Training') AS training,
      COUNT(*) FILTER (WHERE activity_type = 'Competition') AS competition,
      COUNT(*) AS total
    FROM injury_expanded
    GROUP BY injury_type
    ORDER BY total DESC
    LIMIT top_n
  )
  SELECT * FROM counted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. By Mechanism (Mekanisme Cedera) - SEMUA DATA, TIDAK ADA LIMIT
CREATE OR REPLACE FUNCTION analytics_crosstab_by_mechanism(
  start_date DATE,
  end_date DATE,
  top_n INT DEFAULT 9999
)
RETURNS TABLE (
  kategori TEXT,
  training BIGINT,
  competition BIGINT,
  total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH injury_expanded AS (
    SELECT 
      ir.activity_type,
      (jsonb_array_elements(ir.injuries)->>'mechanism')::TEXT AS mechanism
    FROM injury_reports ir
    WHERE ir.status = 'verified'
      AND ir.injury_date >= start_date
      AND ir.injury_date <= end_date
      AND ir.injuries IS NOT NULL
  ),
  counted AS (
    SELECT 
      COALESCE(mechanism, 'Tidak Diketahui') AS kategori,
      COUNT(*) FILTER (WHERE activity_type = 'Training') AS training,
      COUNT(*) FILTER (WHERE activity_type = 'Competition') AS competition,
      COUNT(*) AS total
    FROM injury_expanded
    GROUP BY mechanism
    ORDER BY total DESC
    LIMIT top_n
  )
  SELECT * FROM counted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. By Location (Lokasi Cedera) - SEMUA DATA, TIDAK ADA LIMIT
CREATE OR REPLACE FUNCTION analytics_crosstab_by_location(
  start_date DATE,
  end_date DATE,
  top_n INT DEFAULT 9999
)
RETURNS TABLE (
  kategori TEXT,
  training BIGINT,
  competition BIGINT,
  total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH injury_expanded AS (
    SELECT 
      ir.activity_type,
      (jsonb_array_elements(ir.injuries)->>'location')::TEXT AS location
    FROM injury_reports ir
    WHERE ir.status = 'verified'
      AND ir.injury_date >= start_date
      AND ir.injury_date <= end_date
      AND ir.injuries IS NOT NULL
  ),
  counted AS (
    SELECT 
      COALESCE(location, 'Tidak Diketahui') AS kategori,
      COUNT(*) FILTER (WHERE activity_type = 'Training') AS training,
      COUNT(*) FILTER (WHERE activity_type = 'Competition') AS competition,
      COUNT(*) AS total
    FROM injury_expanded
    GROUP BY location
    ORDER BY total DESC
    LIMIT top_n
  )
  SELECT * FROM counted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. By Severity (Derajat Cedera)
CREATE OR REPLACE FUNCTION analytics_crosstab_by_severity(
  start_date DATE,
  end_date DATE
)
RETURNS TABLE (
  kategori TEXT,
  training BIGINT,
  competition BIGINT,
  total BIGINT
) AS $$
BEGIN
  RETURN QUERY
  WITH injury_expanded AS (
    SELECT 
      ir.activity_type,
      (jsonb_array_elements(ir.injuries)->>'severity_level')::TEXT AS severity
    FROM injury_reports ir
    WHERE ir.status = 'verified'
      AND ir.injury_date >= start_date
      AND ir.injury_date <= end_date
      AND ir.injuries IS NOT NULL
  )
  SELECT 
    COALESCE(severity, 'Tidak Diketahui') AS kategori,
    COUNT(*) FILTER (WHERE activity_type = 'Training') AS training,
    COUNT(*) FILTER (WHERE activity_type = 'Competition') AS competition,
    COUNT(*) AS total
  FROM injury_expanded
  GROUP BY severity
  ORDER BY 
    CASE severity
      WHEN 'Ringan' THEN 1
      WHEN 'Sedang' THEN 2
      WHEN 'Berat' THEN 3
      ELSE 4
    END;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION analytics_crosstab_summary(DATE, DATE) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_crosstab_by_injury_type(DATE, DATE, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_crosstab_by_mechanism(DATE, DATE, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_crosstab_by_location(DATE, DATE, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION analytics_crosstab_by_severity(DATE, DATE) TO authenticated;

-- Test the functions (optional - comment out if not needed)
-- SELECT * FROM analytics_crosstab_summary('2024-01-01', '2024-12-31');
-- SELECT * FROM analytics_crosstab_by_injury_type('2024-01-01', '2024-12-31', 10);
-- SELECT * FROM analytics_crosstab_by_mechanism('2024-01-01', '2024-12-31', 10);
-- SELECT * FROM analytics_crosstab_by_location('2024-01-01', '2024-12-31', 10);
-- SELECT * FROM analytics_crosstab_by_severity('2024-01-01', '2024-12-31');
