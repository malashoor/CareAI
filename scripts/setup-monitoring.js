#!/usr/bin/env node

/**
 * CareAI Notification Monitoring Setup
 * 
 * This script sets up the necessary monitoring for the notification system
 * in both Datadog and Sentry.
 * 
 * Usage:
 * 1. Set environment variables: DATADOG_API_KEY, DATADOG_APP_KEY, SENTRY_AUTH_TOKEN
 * 2. Run: node setup-monitoring.js
 */

const https = require('https');
const { execSync } = require('child_process');

// Configuration
const DATADOG_API_ENDPOINT = 'api.datadoghq.com';
const SENTRY_ORG = 'careai';
const SENTRY_PROJECT = 'careai-mobile';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m'
};

// Check required environment variables
function checkEnvVars() {
  const requiredVars = ['DATADOG_API_KEY', 'DATADOG_APP_KEY', 'SENTRY_AUTH_TOKEN'];
  let missingVars = [];
  
  requiredVars.forEach(varName => {
    if (!process.env[varName]) {
      missingVars.push(varName);
    }
  });
  
  if (missingVars.length > 0) {
    console.error(`${colors.red}Error: Missing required environment variables: ${missingVars.join(', ')}${colors.reset}`);
    console.error(`Please set them with:\n`);
    missingVars.forEach(varName => {
      console.error(`export ${varName}=your_${varName.toLowerCase()}`);
    });
    process.exit(1);
  }
}

// Helper to make API requests
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const parsedData = JSON.parse(responseData);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsedData);
          } else {
            reject({ statusCode: res.statusCode, data: parsedData });
          }
        } catch (e) {
          reject({ statusCode: res.statusCode, error: e, data: responseData });
        }
      });
    });
    
    req.on('error', (error) => {
      reject({ error });
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Setup Datadog monitors
async function setupDatadogMonitors() {
  console.log(`${colors.blue}Setting up Datadog monitors...${colors.reset}`);
  
  // Define monitors
  const monitors = [
    {
      name: 'CareAI - Notification Delivery Success Rate',
      type: 'query alert',
      query: 'sum:notification_delivered{*}.as_count() / (sum:notification_delivered{*}.as_count() + sum:notification_failed{*}.as_count() + 1) * 100 < 99',
      message: '@slack-careai-alerts Notification delivery success rate has dropped below threshold',
      tags: ['service:notifications', 'env:production', 'team:mobile'],
      options: {
        thresholds: {
          critical: 99,
          warning: 99.5
        },
        notify_no_data: true,
        new_host_delay: 300,
        include_tags: true,
        notify_audit: false,
        require_full_window: false
      }
    },
    {
      name: 'CareAI - Notification P95 Latency',
      type: 'query alert',
      query: 'percentile(last_5m):p95:delivery_latency_ms{*} > 2000',
      message: '@slack-careai-alerts Notification delivery latency P95 has exceeded 2 seconds',
      tags: ['service:notifications', 'env:production', 'team:mobile'],
      options: {
        thresholds: {
          critical: 2000,
          warning: 1500
        },
        notify_no_data: false,
        new_host_delay: 300,
        include_tags: true
      }
    },
    {
      name: 'CareAI - Critical SOS Notification Failures',
      type: 'query alert',
      query: 'sum:notification_failed{event_type:sos_triggered}.as_count() > 0',
      message: '@slack-careai-alerts URGENT: Critical SOS notification failures detected',
      tags: ['service:notifications', 'env:production', 'team:mobile', 'priority:p1'],
      options: {
        thresholds: {
          critical: 0
        },
        notify_no_data: false,
        new_host_delay: 300,
        include_tags: true,
        notify_audit: true,
        require_full_window: false
      }
    }
  ];
  
  // Create monitors in Datadog
  for (const monitor of monitors) {
    try {
      const options = {
        hostname: DATADOG_API_ENDPOINT,
        port: 443,
        path: '/api/v1/monitor',
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'DD-API-KEY': process.env.DATADOG_API_KEY,
          'DD-APPLICATION-KEY': process.env.DATADOG_APP_KEY
        }
      };
      
      const result = await makeRequest(options, monitor);
      console.log(`${colors.green}✓ Created monitor: ${monitor.name} (ID: ${result.id})${colors.reset}`);
    } catch (error) {
      console.error(`${colors.red}✗ Failed to create monitor ${monitor.name}: ${JSON.stringify(error)}${colors.reset}`);
    }
  }
  
  console.log(`${colors.green}Datadog monitors setup complete${colors.reset}`);
}

// Setup Sentry alert rules
async function setupSentryAlerts() {
  console.log(`${colors.blue}Setting up Sentry alert rules...${colors.reset}`);
  
  try {
    // Create notification delivery failure alert
    const sentryCmd = `
      npx @sentry/cli --auth-token ${process.env.SENTRY_AUTH_TOKEN} \
      alerts rules create \
      --organization ${SENTRY_ORG} \
      --project ${SENTRY_PROJECT} \
      --name "Notification Delivery Failures" \
      --environment production \
      --action-match any \
      --conditions type:error level:warning tags[event_type]:* \
      --filters "event.message:*NotificationDeliveryFailed*" \
      --triggers 5 \
      --triggers-window 5m \
      --actions slack:careai-alerts
    `;
    
    execSync(sentryCmd, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Created Sentry alert rule for notification failures${colors.reset}`);
    
    // Create SOS event alert
    const sentrySosCmd = `
      npx @sentry/cli --auth-token ${process.env.SENTRY_AUTH_TOKEN} \
      alerts rules create \
      --organization ${SENTRY_ORG} \
      --project ${SENTRY_PROJECT} \
      --name "SOS Alert Failures" \
      --environment production \
      --action-match any \
      --conditions type:error tags[event_type]:sos_triggered \
      --triggers 1 \
      --triggers-window 5m \
      --actions slack:careai-alerts email:oncall@careai.app
    `;
    
    execSync(sentrySosCmd, { stdio: 'inherit' });
    console.log(`${colors.green}✓ Created Sentry alert rule for SOS failures${colors.reset}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to setup Sentry alerts: ${error}${colors.reset}`);
  }
  
  console.log(`${colors.green}Sentry alert setup complete${colors.reset}`);
}

// Create Datadog Dashboard
async function createDatadogDashboard() {
  console.log(`${colors.blue}Creating Datadog dashboard...${colors.reset}`);
  
  // Dashboard configuration
  const dashboard = {
    title: 'CareAI Notification System',
    description: 'Real-time monitoring of the CareAI notification pipeline',
    layout_type: 'ordered',
    widgets: [
      {
        definition: {
          title: 'Notification Success Rate',
          type: 'timeseries',
          requests: [
            {
              q: 'sum:notification_delivered{*}.as_count() / (sum:notification_delivered{*}.as_count() + sum:notification_failed{*}.as_count() + 1) * 100',
              display_type: 'line',
              style: {
                palette: 'dog_classic',
                line_type: 'solid',
                line_width: 'normal'
              }
            }
          ],
          yaxis: {
            scale: 'linear',
            min: '95',
            max: '100',
            include_zero: false
          }
        },
        layout: {
          x: 0,
          y: 0,
          width: 8,
          height: 3
        }
      },
      {
        definition: {
          title: 'Notification Delivery Latency (p95)',
          type: 'timeseries',
          requests: [
            {
              q: 'percentile(last_5m):p95:delivery_latency_ms{*}',
              display_type: 'line'
            }
          ]
        },
        layout: {
          x: 8,
          y: 0,
          width: 8,
          height: 3
        }
      },
      {
        definition: {
          title: 'Notifications by Type',
          type: 'timeseries',
          requests: [
            {
              q: 'sum:notification_delivered{*} by {event_type}.as_count()',
              display_type: 'bars',
              style: {
                palette: 'cool'
              }
            }
          ]
        },
        layout: {
          x: 0,
          y: 3,
          width: 8,
          height: 3
        }
      },
      {
        definition: {
          title: 'Notification Failures by Platform',
          type: 'timeseries',
          requests: [
            {
              q: 'sum:notification_failed{*} by {platform}.as_count()',
              display_type: 'bars',
              style: {
                palette: 'warm'
              }
            }
          ]
        },
        layout: {
          x: 8,
          y: 3,
          width: 8,
          height: 3
        }
      }
    ]
  };
  
  try {
    const options = {
      hostname: DATADOG_API_ENDPOINT,
      port: 443,
      path: '/api/v1/dashboard',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'DD-API-KEY': process.env.DATADOG_API_KEY,
        'DD-APPLICATION-KEY': process.env.DATADOG_APP_KEY
      }
    };
    
    const result = await makeRequest(options, dashboard);
    console.log(`${colors.green}✓ Created Datadog dashboard: ${dashboard.title} (ID: ${result.id})${colors.reset}`);
    console.log(`Dashboard URL: https://app.datadoghq.com/dashboard/${result.id}`);
  } catch (error) {
    console.error(`${colors.red}✗ Failed to create Datadog dashboard: ${JSON.stringify(error)}${colors.reset}`);
  }
}

// Main function
async function main() {
  console.log(`${colors.yellow}🔔 CareAI Notification Monitoring Setup${colors.reset}`);
  console.log(`${colors.yellow}============================================${colors.reset}`);
  
  // Check environment variables
  checkEnvVars();
  
  // Setup monitors
  await setupDatadogMonitors();
  await setupSentryAlerts();
  await createDatadogDashboard();
  
  console.log(`\n${colors.green}✅ Setup complete!${colors.reset}`);
  console.log(`\nTo verify these integrations in your app code:`);
  console.log(`1. Ensure RUM timing is added for notification events:`);
  console.log(`   datadogRum.addTiming('notification_delivered');`);
  console.log(`   datadogRum.addTiming('notification_failed');`);
  console.log(`2. Ensure proper Sentry capture for notification failures:`);
  console.log(`   Sentry.captureMessage('NotificationDeliveryFailed', {`);
  console.log(`     level: 'warning',`);
  console.log(`     tags: { event_type, platform },`);
  console.log(`     extra: { error, payload }`);
  console.log(`   });`);
}

// Run the script
main().catch(error => {
  console.error(`${colors.red}Failed to setup monitoring: ${error}${colors.reset}`);
  process.exit(1);
}); 