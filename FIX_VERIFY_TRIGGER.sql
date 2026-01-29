-- Fix the trigger to allow SECURITY DEFINER functions to update reports
-- The trigger should allow updates when:
-- 1. Status is changing TO 'verified' or 'rejected' (verification action)
-- 2. verified_by column is being set (admin verification)

-- First, let's find and drop the existing trigger
DROP TRIGGER IF EXISTS check_admin_update_trigger ON injury_reports;

-- Drop the old function
DROP FUNCTION IF EXISTS check_admin_update();

-- Create new trigger function with proper logic
CREATE OR REPLACE FUNCTION check_admin_update()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
DECLARE
  v_user_role text;
BEGIN
  -- Allow verification actions (when verified_by is being set)
  -- This covers both direct admin updates and SECURITY DEFINER function calls
  IF NEW.status IN ('verified', 'rejected') AND NEW.verified_by IS NOT NULL THEN
    -- If verified_by is set, validate that user is admin_nasional
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = NEW.verified_by;
    
    IF v_user_role = 'admin_nasional' THEN
      RETURN NEW;
    END IF;
  END IF;
  
  -- For non-verification updates, check auth.uid()
  IF OLD.status != 'draft' AND NEW.status != 'draft' THEN
    -- Get the role of the current user
    SELECT role INTO v_user_role
    FROM profiles
    WHERE id = auth.uid();
    
    -- Only admin_nasional can update non-draft reports (except verification handled above)
    IF v_user_role IS NULL OR v_user_role != 'admin_nasional' THEN
      RAISE EXCEPTION 'Only admin_nasional can update non-draft reports';
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER check_admin_update_trigger
  BEFORE UPDATE ON injury_reports
  FOR EACH ROW
  EXECUTE FUNCTION check_admin_update();

COMMENT ON FUNCTION check_admin_update IS 'Enforces that only admin_nasional can update non-draft reports, with exception for verification actions';
