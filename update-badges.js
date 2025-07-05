#!/usr/bin/env node
/**
 * Update README badges with current API usage
 */
const fs = require('fs/promises');
const path = require('path');

async function updateReadmeBadges() {
    try {
        // Load usage data
        let usage = { dailyRequests: 0, dailyTokens: 0 };
        try {
            const data = await fs.readFile('api-usage.json', 'utf-8');
            const allStats = JSON.parse(data);
            const today = new Date().toISOString().split('T')[0];
            const todayStats = allStats.find(stat => stat.date === today);
            if (todayStats) {
                usage.dailyRequests = todayStats.requestCount;
                usage.dailyTokens = todayStats.estimatedTokens;
            }
        } catch (e) {
            console.log('No usage data found, using defaults');
        }

        // Read README
        const readme = await fs.readFile('README.md', 'utf-8');

        // Update badges
        const requestsColor = usage.dailyRequests > 40 ? 'red' : usage.dailyRequests > 25 ? 'yellow' : 'green';
        const tokensColor = usage.dailyTokens > 25000 ? 'red' : usage.dailyTokens > 16000 ? 'yellow' : 'green';
        const statusColor = (usage.dailyRequests >= 50 || usage.dailyTokens >= 32000) ? 'red' : 'brightgreen';
        const status = (usage.dailyRequests >= 50 || usage.dailyTokens >= 32000) ? 'Limited' : 'Active';

        let updatedReadme = readme
            .replace(/!\[API Usage\]\(https:\/\/img\.shields\.io\/badge\/Daily%20Requests-.*?\)/g, 
                `![API Usage](https://img.shields.io/badge/Daily%20Requests-${usage.dailyRequests}%2F50-${requestsColor})`)
            .replace(/!\[Token Usage\]\(https:\/\/img\.shields\.io\/badge\/Daily%20Tokens-.*?\)/g,
                `![Token Usage](https://img.shields.io/badge/Daily%20Tokens-${usage.dailyTokens}%2F32%2C000-${tokensColor})`)
            .replace(/!\[Status\]\(https:\/\/img\.shields\.io\/badge\/Status-.*?\)/g,
                `![Status](https://img.shields.io/badge/Status-${status}-${statusColor})`)
            .replace(/\*\*Last Updated:\*\* .*/g, `**Last Updated:** ${new Date().toISOString()}`);

        // Write back
        await fs.writeFile('README.md', updatedReadme);
        console.log('✅ README badges updated successfully');

    } catch (error) {
        console.error('❌ Error updating README badges:', error);
        process.exit(1);
    }
}

if (require.main === module) {
    updateReadmeBadges();
}

module.exports = { updateReadmeBadges };
