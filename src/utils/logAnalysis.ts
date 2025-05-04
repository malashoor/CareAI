import { performanceMonitoring } from '../services/performanceMonitoring';

interface LogAnalysisResult {
  category: string;
  count: number;
  severity: 'warning' | 'error' | 'info';
  lastOccurrence: number;
  examples: string[];
}

export function analyzeLogPatterns(): LogAnalysisResult[] {
  const metrics = performanceMonitoring.getMetrics();
  const patternMetrics = metrics.filter(m => m.name.startsWith('log_pattern_'));
  
  const results: { [key: string]: LogAnalysisResult } = {};

  patternMetrics.forEach(metric => {
    const category = metric.name.replace('log_pattern_', '');
    const severity = metric.metadata?.severity as 'warning' | 'error' | 'info';
    
    if (!results[category]) {
      results[category] = {
        category,
        count: 0,
        severity,
        lastOccurrence: 0,
        examples: []
      };
    }

    results[category].count++;
    results[category].lastOccurrence = Math.max(
      results[category].lastOccurrence,
      metric.timestamp
    );

    if (metric.metadata?.message && !results[category].examples.includes(metric.metadata.message)) {
      results[category].examples.push(metric.metadata.message);
    }
  });

  return Object.values(results).sort((a, b) => b.count - a.count);
}

export function getLogPatternSummary(): string {
  const analysis = analyzeLogPatterns();
  const now = Date.now();
  
  const summary = analysis.map(result => {
    const timeAgo = Math.floor((now - result.lastOccurrence) / 1000);
    const timeStr = timeAgo < 60 
      ? `${timeAgo}s ago`
      : timeAgo < 3600
        ? `${Math.floor(timeAgo / 60)}m ago`
        : `${Math.floor(timeAgo / 3600)}h ago`;

    return `${result.category} (${result.count} occurrences, last ${timeStr}):
    Severity: ${result.severity}
    Latest example: ${result.examples[0] || 'N/A'}`;
  }).join('\n\n');

  return summary;
}

export function getCriticalLogPatterns(): LogAnalysisResult[] {
  const analysis = analyzeLogPatterns();
  return analysis.filter(result => 
    result.severity === 'error' || 
    (result.severity === 'warning' && result.count > 5)
  );
} 