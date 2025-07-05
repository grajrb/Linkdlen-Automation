/**
 * Test Mode - Debug API Usage and Content Generation
 */
import dotenv from 'dotenv';
import { checkApiLimits, displayUsageStats, getCurrentUsage } from './api-usage-monitor';

dotenv.config();

async function testApiLimits() {
    console.log('🧪 Testing API Limits...');
    
    try {
        // Check if we have the API key
        if (!process.env.GEMINI_API_KEY) {
            console.error('❌ GEMINI_API_KEY not found in environment');
            process.exit(1);
        }
        
        console.log('✅ API Key found in environment');
        
        // Test current usage
        console.log('\n📊 Current Usage:');
        const usage = await getCurrentUsage();
        console.log(JSON.stringify(usage, null, 2));
        
        // Test API limits check
        console.log('\n🔍 Testing API Limits Check:');
        const limitCheck = await checkApiLimits(2, 1500);
        console.log('Can Proceed:', limitCheck.canProceed);
        if (!limitCheck.canProceed) {
            console.log('Reason:', limitCheck.reason);
        }
        console.log('Usage:', JSON.stringify(limitCheck.usage, null, 2));
        
        // Display full stats
        console.log('\n📈 Full Usage Stats:');
        await displayUsageStats();
        
        console.log('\n✅ API Limits test completed successfully');
        
    } catch (error) {
        console.error('❌ Error in API limits test:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    testApiLimits().catch(error => {
        console.error('Unhandled error in test:', error);
        process.exit(1);
    });
}
