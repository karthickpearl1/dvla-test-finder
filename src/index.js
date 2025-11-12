import cron from 'node-cron';
import { runMonitor } from './monitor.js';
import { runCollection } from './collector.js';
import { loadConfig } from './utils/config.js';

async function main() {
  // Check for command line argument or environment variable for mode
  const mode = process.argv[2] || process.env.MODE || 'monitor';
  
  // If mode is 'collect', run collection instead of monitoring
  if (mode === 'collect') {
    try {
      const results = await runCollection();
      console.log('✅ Collection completed successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Collection failed:', error.message);
      process.exit(1);
    }
  }
  
  // If mode is 'monitor' or default, run existing monitoring
  const config = loadConfig();
  
  console.log('UK Driving Test Centre Monitor');
  console.log('================================\n');
  
  // Run immediately on start
  console.log('Running initial check...\n');
  try {
    await runMonitor();
  } catch (error) {
    console.error('Initial check failed:', error.message);
  }

  // Schedule periodic checks
  const intervalMinutes = config.monitoring.checkIntervalMinutes;
  const cronExpression = `*/${intervalMinutes} * * * *`;
  
  console.log(`\nScheduling checks every ${intervalMinutes} minutes...`);
  console.log('Press Ctrl+C to stop\n');

  cron.schedule(cronExpression, async () => {
    console.log(`\n[${new Date().toLocaleString()}] Running scheduled check...`);
    try {
      await runMonitor();
    } catch (error) {
      console.error('Scheduled check failed:', error.message);
    }
  });
}

main().catch(console.error);
