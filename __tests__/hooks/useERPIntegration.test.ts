import { renderHook, act } from '@testing-library/react-hooks';
import { useERPIntegration } from '../../src/hooks/useERPIntegration';
import { supabase } from '../../src/lib/supabase';

// Mock Supabase client
jest.mock('../../src/lib/supabase', () => ({
  supabase: {
    from: jest.fn(() => ({
      select: jest.fn(),
      insert: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    })),
    rpc: jest.fn(),
  },
}));

describe('useERPIntegration', () => {
  const mockUserId = 'test-user-id';
  const mockERPData = {
    id: '1',
    user_id: mockUserId,
    provider: 'epic',
    access_token: 'test-token',
    refresh_token: 'test-refresh',
    expires_at: new Date().toISOString(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('initializes with default values', () => {
    const { result } = renderHook(() => useERPIntegration(mockUserId));
    
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.connected).toBe(false);
    expect(result.current.provider).toBeNull();
  });

  it('connects to ERP system successfully', async () => {
    const mockResponse = { data: mockERPData, error: null };
    (supabase.from as jest.Mock).mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue(mockResponse),
    }));

    const { result } = renderHook(() => useERPIntegration(mockUserId));

    await act(async () => {
      await result.current.connect('epic', 'test-code');
    });

    expect(result.current.connected).toBe(true);
    expect(result.current.provider).toBe('epic');
    expect(result.current.error).toBeNull();
  });

  it('handles connection errors gracefully', async () => {
    const mockError = { message: 'Connection failed' };
    (supabase.from as jest.Mock).mockImplementation(() => ({
      insert: jest.fn().mockResolvedValue({ data: null, error: mockError }),
    }));

    const { result } = renderHook(() => useERPIntegration(mockUserId));

    await act(async () => {
      await result.current.connect('epic', 'test-code');
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.error).toBe(mockError.message);
  });

  it('disconnects from ERP system', async () => {
    const mockResponse = { data: null, error: null };
    (supabase.from as jest.Mock).mockImplementation(() => ({
      delete: jest.fn().mockResolvedValue(mockResponse),
    }));

    const { result } = renderHook(() => useERPIntegration(mockUserId));

    await act(async () => {
      await result.current.disconnect();
    });

    expect(result.current.connected).toBe(false);
    expect(result.current.provider).toBeNull();
  });

  it('refreshes access token automatically', async () => {
    const mockRefreshResponse = {
      data: { ...mockERPData, access_token: 'new-token' },
      error: null,
    };
    (supabase.rpc as jest.Mock).mockResolvedValue(mockRefreshResponse);

    const { result } = renderHook(() => useERPIntegration(mockUserId));

    await act(async () => {
      await result.current.refreshToken();
    });

    expect(supabase.rpc).toHaveBeenCalledWith('refresh_erp_token', {
      user_id: mockUserId,
    });
    expect(result.current.error).toBeNull();
  });

  it('syncs data with ERP system', async () => {
    const mockSyncResponse = { data: { synced: true }, error: null };
    (supabase.rpc as jest.Mock).mockResolvedValue(mockSyncResponse);

    const { result } = renderHook(() => useERPIntegration(mockUserId));

    await act(async () => {
      await result.current.syncData();
    });

    expect(supabase.rpc).toHaveBeenCalledWith('sync_erp_data', {
      user_id: mockUserId,
    });
    expect(result.current.error).toBeNull();
  });

  it('handles sync errors appropriately', async () => {
    const mockError = { message: 'Sync failed' };
    (supabase.rpc as jest.Mock).mockResolvedValue({ data: null, error: mockError });

    const { result } = renderHook(() => useERPIntegration(mockUserId));

    await act(async () => {
      await result.current.syncData();
    });

    expect(result.current.error).toBe(mockError.message);
  });
}); 