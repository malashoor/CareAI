-- Function to get tables without RLS enabled
CREATE OR REPLACE FUNCTION public.get_tables_without_rls()
RETURNS TABLE (table_name text) 
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::text
  FROM information_schema.tables t
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND t.table_name NOT IN (
      SELECT tablename::text 
      FROM pg_tables 
      WHERE schemaname = 'public' 
        AND rowsecurity = true
    );
END;
$$;

-- Function to get tables without any RLS policies
CREATE OR REPLACE FUNCTION public.get_tables_without_policies()
RETURNS TABLE (table_name text)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY
  SELECT t.table_name::text
  FROM information_schema.tables t
  LEFT JOIN pg_policies p ON p.tablename::text = t.table_name
  WHERE t.table_schema = 'public'
    AND t.table_type = 'BASE TABLE'
    AND p.tablename IS NULL;
END;
$$;

-- Grant execute permissions to authenticated users
GRANT EXECUTE ON FUNCTION public.get_tables_without_rls() TO authenticated;
GRANT EXECUTE ON FUNCTION public.get_tables_without_policies() TO authenticated; 