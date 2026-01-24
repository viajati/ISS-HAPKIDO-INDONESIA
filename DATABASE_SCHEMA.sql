-- ============================================
-- ISS HAPKIDO INDONESIA - DATABASE SCHEMA
-- ============================================
-- Paste this entire script in Supabase SQL Editor
-- ============================================

-- ============================================
-- 1. PROFILES TABLE (User Management)
-- ============================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(100) NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('pelatih', 'admin_daerah', 'admin_nasional')),
  wilayah VARCHAR(100),
  dojang VARCHAR(100),
  phone VARCHAR(20),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- ============================================
-- 2. INJURY REPORTS TABLE (Data Cedera)
-- ============================================
CREATE TABLE injury_reports (
  id SERIAL PRIMARY KEY,
  report_id VARCHAR(20) UNIQUE NOT NULL,
  user_id UUID NOT NULL REFERENCES profiles(id),
  created_by_username VARCHAR(50) NOT NULL,
  wilayah VARCHAR(100) NOT NULL,
  dojang VARCHAR(100),
  nama_atlet VARCHAR(100) NOT NULL,
  tanggal_lahir DATE NOT NULL,
  jenis_kelamin VARCHAR(10) NOT NULL CHECK (jenis_kelamin IN ('Laki-laki', 'Perempuan')),
  berat_badan DECIMAL(5,2),
  tinggi_badan DECIMAL(5,2),
  tingkat_sabuk VARCHAR(50),
  pengalaman_latihan INTEGER,
  tanggal_cedera DATE NOT NULL,
  waktu_cedera TIME NOT NULL,
  jenis_cedera VARCHAR(100) NOT NULL,
  lokasi_cedera VARCHAR(100) NOT NULL,
  mekanisme_cedera VARCHAR(100) NOT NULL,
  aktivitas_saat_cedera VARCHAR(100) NOT NULL,
  tingkat_keparahan VARCHAR(20) NOT NULL CHECK (tingkat_keparahan IN ('Ringan', 'Sedang', 'Berat')),
  red_flags JSONB DEFAULT '[]',
  penanganan_awal TEXT,
  rujukan_medis BOOLEAN DEFAULT false,
  tempat_rujukan VARCHAR(100),
  catatan_tambahan TEXT,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'verified', 'rejected')),
  verification_status VARCHAR(20) CHECK (verification_status IN ('pending', 'verified', 'rejected')),
  verified_by UUID REFERENCES profiles(id),
  verified_at TIMESTAMPTZ,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  submitted_at TIMESTAMPTZ
);

-- ============================================
-- 3. REGISTRATION TOKENS TABLE
-- ============================================
CREATE TABLE registration_tokens (
  id SERIAL PRIMARY KEY,
  token VARCHAR(8) UNIQUE NOT NULL,
  role VARCHAR(20) NOT NULL CHECK (role IN ('pelatih', 'admin_daerah', 'admin_nasional')),
  wilayah VARCHAR(100),
  created_by UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  used_by UUID REFERENCES profiles(id),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- ============================================
-- 4. AUDIT LOG TABLE
-- ============================================
CREATE TABLE audit_logs (
  id SERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  action VARCHAR(50) NOT NULL,
  entity_type VARCHAR(50) NOT NULL,
  entity_id VARCHAR(100) NOT NULL,
  old_data JSONB,
  new_data JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================
-- 5. INDEXES
-- ============================================
CREATE INDEX idx_injury_reports_user_id ON injury_reports(user_id);
CREATE INDEX idx_injury_reports_status ON injury_reports(status);
CREATE INDEX idx_injury_reports_wilayah ON injury_reports(wilayah);
CREATE INDEX idx_injury_reports_created_at ON injury_reports(created_at DESC);
CREATE INDEX idx_injury_reports_report_id ON injury_reports(report_id);
CREATE INDEX idx_profiles_username ON profiles(username);
CREATE INDEX idx_profiles_role ON profiles(role);
CREATE INDEX idx_tokens_token ON registration_tokens(token);

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS)
-- ============================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE injury_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Admin nasional can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin_nasional'
    )
  );

-- Injury Reports Policies
CREATE POLICY "Pelatih can view own reports"
  ON injury_reports FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin_daerah', 'admin_nasional')
    )
  );

CREATE POLICY "Admin daerah can view reports in their region"
  ON injury_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() 
        AND role = 'admin_daerah'
        AND profiles.wilayah = injury_reports.wilayah
    )
  );

CREATE POLICY "Admin nasional can view all reports"
  ON injury_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin_nasional'
    )
  );

CREATE POLICY "Pelatih can insert own reports"
  ON injury_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own draft reports"
  ON injury_reports FOR UPDATE
  USING (user_id = auth.uid() AND status = 'draft');

CREATE POLICY "Admins can update report status"
  ON injury_reports FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role IN ('admin_daerah', 'admin_nasional')
    )
  );

-- Tokens Policies
CREATE POLICY "Admin nasional can manage tokens"
  ON registration_tokens FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE id = auth.uid() AND role = 'admin_nasional'
    )
  );

CREATE POLICY "Anyone can view active tokens for registration"
  ON registration_tokens FOR SELECT
  USING (status = 'active' AND expires_at > NOW());

-- ============================================
-- 7. FUNCTIONS & TRIGGERS
-- ============================================

-- Auto-generate Report ID
CREATE OR REPLACE FUNCTION generate_report_id()
RETURNS TRIGGER AS $$
DECLARE
  current_year VARCHAR(4);
  sequence_number INTEGER;
  new_report_id VARCHAR(20);
BEGIN
  current_year := TO_CHAR(NEW.created_at, 'YYYY');
  
  SELECT COALESCE(MAX(
    CAST(SUBSTRING(report_id FROM 6) AS INTEGER)
  ), 0) + 1
  INTO sequence_number
  FROM injury_reports
  WHERE report_id LIKE current_year || '-%';
  
  new_report_id := current_year || '-' || LPAD(sequence_number::TEXT, 3, '0');
  
  NEW.report_id := new_report_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_report_id
  BEFORE INSERT ON injury_reports
  FOR EACH ROW
  WHEN (NEW.report_id IS NULL)
  EXECUTE FUNCTION generate_report_id();

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_injury_reports_updated_at
  BEFORE UPDATE ON injury_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- ============================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- PROFILES TABLE POLICIES
-- Allow users to view their own profile
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Allow users to insert their own profile (on signup)
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- REGISTRATION TOKENS TABLE POLICIES
-- ONLY ADMIN NASIONAL can manage tokens
-- ============================================

-- Admin Nasional can view all tokens
CREATE POLICY "Admin Nasional can view all tokens"
  ON registration_tokens FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
  );

-- Admin Nasional can create tokens
CREATE POLICY "Admin Nasional can create tokens"
  ON registration_tokens FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
    AND created_by = auth.uid()
  );

-- Admin Nasional can update tokens
CREATE POLICY "Admin Nasional can update tokens"
  ON registration_tokens FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
  );

-- Admin Nasional can delete tokens
CREATE POLICY "Admin Nasional can delete tokens"
  ON registration_tokens FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin_nasional'
    )
  );

-- Enable RLS on registration_tokens
ALTER TABLE registration_tokens ENABLE ROW LEVEL SECURITY;

-- ============================================
-- INJURY REPORTS TABLE POLICIES
-- ============================================

-- Users can view their own injury reports
CREATE POLICY "Users can view own injury reports"
  ON injury_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Admin Nasional and Admin Daerah can view all reports in their scope
CREATE POLICY "Admins can view injury reports"
  ON injury_reports FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND (profiles.role = 'admin_nasional' 
        OR (profiles.role = 'admin_daerah' AND profiles.wilayah = injury_reports.wilayah))
    )
  );

-- Users can create injury reports
CREATE POLICY "Users can create injury reports"
  ON injury_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own reports
CREATE POLICY "Users can update own injury reports"
  ON injury_reports FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Enable RLS on injury_reports
ALTER TABLE injury_reports ENABLE ROW LEVEL SECURITY;

-- ============================================
-- AUDIT LOGS TABLE POLICIES
-- ============================================

-- Users can view their own audit logs
CREATE POLICY "Users can view own audit logs"
  ON audit_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Enable RLS on audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- ============================================
-- SCHEMA SETUP COMPLETE
-- ============================================
