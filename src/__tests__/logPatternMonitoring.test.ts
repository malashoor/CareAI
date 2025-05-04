import { logPatternMonitoring } from '../services/logPatternMonitoring';
import { performanceMonitoring } from '../services/performanceMonitoring';

describe('Log Pattern Monitoring', () => {
  beforeEach(() => {
    // Reset the monitoring service before each test
    logPatternMonitoring.stopMonitoring();
    performanceMonitoring.clearMetrics();
  });

  afterEach(() => {
    // Clean up after each test
    logPatternMonitoring.stopMonitoring();
  });

  it('should detect bundle size warnings', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('bundle.js [size] exceeds recommended limit');
    
    const metrics = performanceMonitoring.getMetrics();
    const bundleMetric = metrics.find(m => m.name === 'log_pattern_bundle size');
    
    expect(bundleMetric).toBeTruthy();
    expect(bundleMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect require cycles', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('Require cycle: components/Button -> components/Text');
    
    const metrics = performanceMonitoring.getMetrics();
    const cycleMetric = metrics.find(m => m.name === 'log_pattern_require cycle');
    
    expect(cycleMetric).toBeTruthy();
    expect(cycleMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect memory warnings', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('JS Runtime memory pressure detected');
    
    const metrics = performanceMonitoring.getMetrics();
    const memoryMetric = metrics.find(m => m.name === 'log_pattern_memory');
    
    expect(memoryMetric).toBeTruthy();
    expect(memoryMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect bridge queue issues', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('Bridge queue length exceeded threshold');
    
    const metrics = performanceMonitoring.getMetrics();
    const bridgeMetric = metrics.find(m => m.name === 'log_pattern_bridge');
    
    expect(bridgeMetric).toBeTruthy();
    expect(bridgeMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect native memory warnings', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('received memory warning');
    
    const metrics = performanceMonitoring.getMetrics();
    const nativeMemoryMetric = metrics.find(m => m.name === 'log_pattern_native memory');
    
    expect(nativeMemoryMetric).toBeTruthy();
    expect(nativeMemoryMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect frame drops', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('skipped frames detected');
    
    const metrics = performanceMonitoring.getMetrics();
    const frameMetric = metrics.find(m => m.name === 'log_pattern_frame drops');
    
    expect(frameMetric).toBeTruthy();
    expect(frameMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect bridge traffic', () => {
    logPatternMonitoring.startMonitoring();
    console.log('native_modules_bridge: high frequency calls');
    
    const metrics = performanceMonitoring.getMetrics();
    const trafficMetric = metrics.find(m => m.name === 'log_pattern_bridge traffic');
    
    expect(trafficMetric).toBeTruthy();
    expect(trafficMetric?.metadata?.severity).toBe('info');
  });

  it('should detect resource limits', () => {
    logPatternMonitoring.startMonitoring();
    console.error('resource_limit_reached: too many open connections');
    
    const metrics = performanceMonitoring.getMetrics();
    const resourceMetric = metrics.find(m => m.name === 'log_pattern_resources');
    
    expect(resourceMetric).toBeTruthy();
    expect(resourceMetric?.metadata?.severity).toBe('error');
  });

  it('should detect slow renders', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('Slow render detected in ComponentA');
    
    const metrics = performanceMonitoring.getMetrics();
    const renderMetric = metrics.find(m => m.name === 'log_pattern_render performance');
    
    expect(renderMetric).toBeTruthy();
    expect(renderMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect effect cleanup timeouts', () => {
    logPatternMonitoring.startMonitoring();
    console.warn('Effect cleanup timeout in useDataFetching');
    
    const metrics = performanceMonitoring.getMetrics();
    const effectMetric = metrics.find(m => m.name === 'log_pattern_effect cleanup');
    
    expect(effectMetric).toBeTruthy();
    expect(effectMetric?.metadata?.severity).toBe('warning');
  });

  it('should detect batch state updates', () => {
    logPatternMonitoring.startMonitoring();
    console.log('Batch state update: 5 updates in 100ms');
    
    const metrics = performanceMonitoring.getMetrics();
    const stateMetric = metrics.find(m => m.name === 'log_pattern_state updates');
    
    expect(stateMetric).toBeTruthy();
    expect(stateMetric?.metadata?.severity).toBe('info');
  });

  it('should detect screen transitions', () => {
    logPatternMonitoring.startMonitoring();
    console.log('Screen transition: Home -> Profile (150ms)');
    
    const metrics = performanceMonitoring.getMetrics();
    const navMetric = metrics.find(m => m.name === 'log_pattern_navigation');
    
    expect(navMetric).toBeTruthy();
    expect(navMetric?.metadata?.severity).toBe('info');
  });

  it('should allow adding custom patterns', () => {
    logPatternMonitoring.addPattern({
      pattern: /custom pattern/,
      category: 'Custom',
      severity: 'warning',
      description: 'Custom pattern detected'
    });

    logPatternMonitoring.startMonitoring();
    console.warn('custom pattern detected');
    
    const metrics = performanceMonitoring.getMetrics();
    const customMetric = metrics.find(m => m.name === 'log_pattern_custom');
    
    expect(customMetric).toBeTruthy();
    expect(customMetric?.metadata?.severity).toBe('warning');
  });
}); 