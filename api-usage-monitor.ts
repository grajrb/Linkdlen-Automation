/**
 * API Usage Monitor for Gemini Free Tier
 * Tracks daily usage to stay within limits
 */
import fs from 'fs/promises';
import path from 'path';

interface UsageStats {
    date: string;
    requestCount: number;
    estimatedTokens: number;
    totalCosts: number;
}

interface DailyLimits {
    maxRequestsPerDay: number;
    maxTokensPerDay: number;
    maxRequestsPerMinute: number;
}

const GEMINI_FREE_LIMITS: DailyLimits = {
    maxRequestsPerDay: 1500,
    maxTokensPerDay: 1000000,
    maxRequestsPerMinute: 15
};

const USAGE_FILE = 'api-usage.json';

/**
 * Load today's usage stats
 */
async function loadTodayUsage(): Promise<UsageStats> {
    const today = new Date().toISOString().split('T')[0];
    
    try {
        const data = await fs.readFile(USAGE_FILE, 'utf-8');
        const allStats: UsageStats[] = JSON.parse(data);
        const todayStats = allStats.find(stat => stat.date === today);
        
        if (todayStats) {
            return todayStats;
        }
    } catch (error) {
        // File doesn't exist or is invalid
    }
    
    return {
        date: today,
        requestCount: 0,
        estimatedTokens: 0,
        totalCosts: 0
    };
}

/**
 * Save usage stats
 */
async function saveUsageStats(stats: UsageStats): Promise<void> {
    try {
        let allStats: UsageStats[] = [];
        
        try {
            const data = await fs.readFile(USAGE_FILE, 'utf-8');
            allStats = JSON.parse(data);
        } catch (error) {
            // File doesn't exist, start fresh
        }
        
        // Update or add today's stats
        const existingIndex = allStats.findIndex(stat => stat.date === stats.date);
        if (existingIndex >= 0) {
            allStats[existingIndex] = stats;
        } else {
            allStats.push(stats);
        }
        
        // Keep only last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        allStats = allStats.filter(stat => new Date(stat.date) >= thirtyDaysAgo);
        
        await fs.writeFile(USAGE_FILE, JSON.stringify(allStats, null, 2));
    } catch (error) {
        console.warn('Could not save usage stats:', error);
    }
}

/**
 * Check if we can make API requests without exceeding limits
 */
export async function checkApiLimits(requestsToMake: number = 2, estimatedTokens: number = 1500): Promise<{canProceed: boolean, reason?: string, usage: UsageStats}> {
    const usage = await loadTodayUsage();
    
    // Check daily request limit
    if (usage.requestCount + requestsToMake > GEMINI_FREE_LIMITS.maxRequestsPerDay) {
        return {
            canProceed: false,
            reason: `Would exceed daily request limit (${usage.requestCount + requestsToMake}/${GEMINI_FREE_LIMITS.maxRequestsPerDay})`,
            usage
        };
    }
    
    // Check daily token limit
    if (usage.estimatedTokens + estimatedTokens > GEMINI_FREE_LIMITS.maxTokensPerDay) {
        return {
            canProceed: false,
            reason: `Would exceed daily token limit (${usage.estimatedTokens + estimatedTokens}/${GEMINI_FREE_LIMITS.maxTokensPerDay})`,
            usage
        };
    }
    
    return { canProceed: true, usage };
}

/**
 * Record API usage after making requests
 */
export async function recordApiUsage(requestCount: number, estimatedTokens: number): Promise<void> {
    const usage = await loadTodayUsage();
    usage.requestCount += requestCount;
    usage.estimatedTokens += estimatedTokens;
    await saveUsageStats(usage);
}

/**
 * Display usage statistics
 */
export async function displayUsageStats(): Promise<void> {
    const usage = await loadTodayUsage();
    const requestPercent = (usage.requestCount / GEMINI_FREE_LIMITS.maxRequestsPerDay) * 100;
    const tokenPercent = (usage.estimatedTokens / GEMINI_FREE_LIMITS.maxTokensPerDay) * 100;
    
    console.log('\n📊 GEMINI API USAGE (FREE TIER)');
    console.log('================================');
    console.log(`📅 Date: ${usage.date}`);
    console.log(`🔢 Requests: ${usage.requestCount}/${GEMINI_FREE_LIMITS.maxRequestsPerDay} (${requestPercent.toFixed(1)}%)`);
    console.log(`🔤 Tokens: ${usage.estimatedTokens.toLocaleString()}/${GEMINI_FREE_LIMITS.maxTokensPerDay.toLocaleString()} (${tokenPercent.toFixed(1)}%)`);
    console.log(`💰 Cost: $0.00 (FREE TIER)`);
    
    // Show remaining capacity
    const remainingRequests = GEMINI_FREE_LIMITS.maxRequestsPerDay - usage.requestCount;
    const remainingTokens = GEMINI_FREE_LIMITS.maxTokensPerDay - usage.estimatedTokens;
    
    console.log('\n📈 REMAINING CAPACITY:');
    console.log(`🔢 Requests: ${remainingRequests.toLocaleString()}`);
    console.log(`🔤 Tokens: ${remainingTokens.toLocaleString()}`);
    
    // Estimate how many more content generations possible
    const estimatedRuns = Math.min(
        Math.floor(remainingRequests / 2),
        Math.floor(remainingTokens / 1500)
    );
    console.log(`🚀 Estimated runs possible today: ${estimatedRuns}`);
    
    // Warning if getting close to limits
    if (requestPercent > 80 || tokenPercent > 80) {
        console.log('\n⚠️  WARNING: Approaching daily limits!');
    } else if (requestPercent > 50 || tokenPercent > 50) {
        console.log('\n💡 INFO: Over 50% of daily limits used');
    } else {
        console.log('\n✅ GOOD: Well within daily limits');
    }
}

/**
 * Get usage summary for the last 7 days
 */
export async function getWeeklyUsage(): Promise<void> {
    try {
        const data = await fs.readFile(USAGE_FILE, 'utf-8');
        const allStats: UsageStats[] = JSON.parse(data);
        
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const weeklyStats = allStats.filter(stat => new Date(stat.date) >= sevenDaysAgo);
        
        if (weeklyStats.length === 0) {
            console.log('\n📅 No usage data for the last 7 days');
            return;
        }
        
        const totalRequests = weeklyStats.reduce((sum, stat) => sum + stat.requestCount, 0);
        const totalTokens = weeklyStats.reduce((sum, stat) => sum + stat.estimatedTokens, 0);
        const avgRequestsPerDay = totalRequests / weeklyStats.length;
        const avgTokensPerDay = totalTokens / weeklyStats.length;
        
        console.log('\n📅 WEEKLY USAGE SUMMARY (Last 7 Days)');
        console.log('======================================');
        console.log(`🔢 Total Requests: ${totalRequests}`);
        console.log(`🔤 Total Tokens: ${totalTokens.toLocaleString()}`);
        console.log(`📊 Avg Requests/Day: ${avgRequestsPerDay.toFixed(1)}`);
        console.log(`📊 Avg Tokens/Day: ${avgTokensPerDay.toLocaleString()}`);
        console.log(`💰 Total Cost: $0.00 (FREE TIER)`);
        
    } catch (error) {
        console.log('\n📅 No weekly usage data available yet');
    }
}

/**
 * Get current usage statistics for GitHub Actions
 */
export async function getCurrentUsage(): Promise<{
    dailyRequests: number;
    dailyTokens: number;
    date: string;
    usagePercentage: number;
}> {
    const usage = await loadTodayUsage();
    return {
        dailyRequests: usage.requestCount,
        dailyTokens: usage.estimatedTokens,
        date: usage.date,
        usagePercentage: Math.round((usage.requestCount / GEMINI_FREE_LIMITS.maxRequestsPerDay) * 100)
    };
}
