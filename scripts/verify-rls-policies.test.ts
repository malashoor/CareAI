import { describe, it, expect, vi, beforeEach } from 'vitest';
import { RLSVerifier } from './verify-rls-policies';
import { envLoader } from './utils/env-loader';

// Mock Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: () => ({
    rpc: vi.fn()
  })
}));

describe('RLSVerifier', () => {
  let verifier: RLSVerifier;
  
  beforeEach(() => {
    // Load test environment
    envLoader.loadEnvironment();
    verifier = new RLSVerifier();
  });

  describe('Table Security Checks', () => {
    it('should detect tables without RLS enabled', async () => {
      const mockTables = [
        { name: 'users', hasRLS: false, policies: [], hasForeignKeys: false }
      ];

      vi.spyOn(verifier as any, 'getTables').mockResolvedValue(mockTables);
      vi.spyOn(verifier as any, 'getTablePolicies').mockResolvedValue([]);

      const result = await verifier.verifyAllPolicies();
      expect(result).toBe(false);
    });

    it('should pass when all tables have proper RLS', async () => {
      const mockTables = [
        { 
          name: 'users', 
          hasRLS: true, 
          policies: [
            {
              name: 'Users can view own data',
              action: 'SELECT',
              roles: ['authenticated'],
              command: 'SELECT',
              definition: 'auth.uid() = user_id'
            },
            {
              name: 'Admin full access',
              action: 'ALL',
              roles: ['authenticated'],
              command: 'ALL',
              definition: "is_admin() OR auth.uid() = user_id"
            }
          ],
          hasForeignKeys: false
        }
      ];

      vi.spyOn(verifier as any, 'getTables').mockResolvedValue(mockTables);
      vi.spyOn(verifier as any, 'getTablePolicies').mockResolvedValue(mockTables[0].policies);

      const result = await verifier.verifyAllPolicies();
      expect(result).toBe(true);
    });
  });

  describe('Policy Checks', () => {
    it('should detect missing admin policies', async () => {
      const mockTables = [
        { 
          name: 'users', 
          hasRLS: true, 
          policies: [
            {
              name: 'Users can view own data',
              action: 'SELECT',
              roles: ['authenticated'],
              command: 'SELECT',
              definition: 'auth.uid() = user_id'
            }
          ],
          hasForeignKeys: false
        }
      ];

      vi.spyOn(verifier as any, 'getTables').mockResolvedValue(mockTables);
      vi.spyOn(verifier as any, 'getTablePolicies').mockResolvedValue(mockTables[0].policies);

      const result = await verifier.verifyAllPolicies();
      expect(result).toBe(false);
    });

    it('should detect missing emergency access on critical tables', async () => {
      const mockTables = [
        { 
          name: 'medical_records', 
          hasRLS: true, 
          policies: [
            {
              name: 'Users can view own records',
              action: 'SELECT',
              roles: ['authenticated'],
              command: 'SELECT',
              definition: 'auth.uid() = patient_id'
            },
            {
              name: 'Admin access',
              action: 'ALL',
              roles: ['authenticated'],
              command: 'ALL',
              definition: 'is_admin()'
            }
          ],
          hasForeignKeys: false
        }
      ];

      vi.spyOn(verifier as any, 'getTables').mockResolvedValue(mockTables);
      vi.spyOn(verifier as any, 'getTablePolicies').mockResolvedValue(mockTables[0].policies);

      const result = await verifier.verifyAllPolicies();
      expect(result).toBe(false);
    });

    it('should detect missing audit logging', async () => {
      const mockTables = [
        { 
          name: 'medical_records', 
          hasRLS: true, 
          policies: [
            {
              name: 'Full policy set without audit',
              action: 'ALL',
              roles: ['authenticated'],
              command: 'ALL',
              definition: 'is_admin() OR auth.uid() = patient_id OR has_emergency_access()'
            }
          ],
          hasForeignKeys: false
        }
      ];

      vi.spyOn(verifier as any, 'getTables').mockResolvedValue(mockTables);
      vi.spyOn(verifier as any, 'getTablePolicies').mockResolvedValue(mockTables[0].policies);

      const result = await verifier.verifyAllPolicies();
      expect(result).toBe(false);
    });
  });

  describe('Foreign Key Policies', () => {
    it('should warn about missing FK policies', async () => {
      const mockTables = [
        { 
          name: 'prescriptions', 
          hasRLS: true, 
          policies: [
            {
              name: 'Basic access',
              action: 'ALL',
              roles: ['authenticated'],
              command: 'ALL',
              definition: 'is_admin() OR auth.uid() = patient_id'
            }
          ],
          hasForeignKeys: true
        }
      ];

      vi.spyOn(verifier as any, 'getTables').mockResolvedValue(mockTables);
      vi.spyOn(verifier as any, 'getTablePolicies').mockResolvedValue(mockTables[0].policies);

      const result = await verifier.verifyAllPolicies();
      // Should pass but with warnings
      expect(result).toBe(true);
    });
  });
}); 