/**
 * Test Mode - Run content generation without LinkedIn posting
 */
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import Parser from 'rss-parser';
import puppeteer from 'puppeteer';

// Load environment variables
dotenv.config();

// Initialize RSS parser and Gemini
const parser = new Parser();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface Article {
    title: string;
    link: string;
    pubDate?: string;
    contentSnippet?: string;
}

async function fetchAndFilterArticles(rssUrls: string[]): Promise<Article[]> {
    console.log('Fetching articles from RSS feeds...');
    const allArticles: Article[] = [];

    for (const url of rssUrls) {
        try {
            const feed = await parser.parseURL(url);
            const articles = feed.items.map(item => ({
                title: item.title || 'No title',
                link: item.link || '',
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet || item.content?.substring(0, 200)
            }));
            allArticles.push(...articles);
            console.log(`Fetched ${articles.length} articles from ${url}`);
        } catch (error) {
            console.error(`Failed to fetch from ${url}:`, error);
        }
    }

    const uniqueArticles = allArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.link === article.link)
    );
    
    uniqueArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0).getTime();
        const dateB = new Date(b.pubDate || 0).getTime();
        return dateB - dateA;
    });
    
    const topArticles = uniqueArticles.slice(0, 2);
    console.log(`Selected ${topArticles.length} articles for processing`);
    
    return topArticles;
}

async function summarizeArticleWithGemini(article: Article): Promise<string> {
    console.log(`Generating summary for: ${article.title}`);
    
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
    You are a tech thought leader. Summarize the article "${article.title}" for a professional LinkedIn post.
    - Start with a compelling hook (1 sentence).
    - Explain the main takeaway (2-3 sentences).
    - End with a thought-provoking question.
    - Provide 4 relevant hashtags.
    Do not use markdown formatting.
    Keep the tone professional but engaging.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response;
        const summary = response.text();

        return `${summary}\n\nOriginal article: ${article.link}`;
    } catch (error) {
        console.error('Error generating summary with Gemini:', error);
        throw error;
    }
}

async function generateCarouselImages(title: string, summary: string): Promise<string[]> {
    console.log('Generating carousel images...');
    
    const htmlTemplate = await fs.readFile('template.html', 'utf-8');
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });

    const filePaths: string[] = [];

    try {
        // Slide 1: Title only
        const titleHtml = htmlTemplate
            .replace('{{TITLE}}', title)
            .replace('{{SUMMARY}}', '');
        await page.setContent(titleHtml);
        await page.screenshot({ path: 'slide-1.png', fullPage: false });
        filePaths.push('slide-1.png');

        // Slide 2: Summary
        const summaryHtml = htmlTemplate
            .replace('{{TITLE}}', '')
            .replace('{{SUMMARY}}', summary.length > 300 ? summary.substring(0, 300) + '...' : summary);
        await page.setContent(summaryHtml);
        await page.screenshot({ path: 'slide-2.png', fullPage: false });
        filePaths.push('slide-2.png');

        console.log('Carousel images generated:', filePaths);
        return filePaths;

    } finally {
        await browser.close();
    }
}

async function testMode(): Promise<void> {
    console.log('🧪 Running in TEST MODE - No LinkedIn posting');
    console.log('=====================================================');
    
    const rssFeeds = [
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
        'https://feeds.arstechnica.com/arstechnica/index'
    ];

    try {
        const articles = await fetchAndFilterArticles(rssFeeds);

        for (let i = 0; i < articles.length; i++) {
            const article = articles[i];
            console.log(`\n--- Processing Article ${i + 1}: ${article.title} ---`);
            
            try {
                // Generate summary for image (shorter version)
                const imageSummary = (article.contentSnippet || article.title).substring(0, 150) + '...';
                const imagePaths = await generateCarouselImages(article.title, imageSummary);

                // Generate full post text with Gemini
                const postText = await summarizeArticleWithGemini(article);

                console.log('\n🎯 GENERATED CONTENT:');
                console.log('====================');
                console.log(postText);
                console.log('\n📸 IMAGES CREATED:');
                console.log('=================');
                imagePaths.forEach(path => console.log(`✅ ${path}`));
                
                console.log(`\n✅ SUCCESS: Content ready for "${article.title}"`);
                console.log('💡 TIP: You can now manually post this to LinkedIn!');
                console.log('─'.repeat(60));
                
            } catch (error) {
                console.error(`❌ FAILED to process "${article.title}":`, error);
            }
        }
        
        console.log('\n🎉 Test mode completed successfully!');
        console.log('📋 NEXT STEPS:');
        console.log('1. Check the generated slide-1.png and slide-2.png files');
        console.log('2. Copy the generated content above');
        console.log('3. Manually post to LinkedIn for safety');
        
    } catch (error) {
        console.error('❌ Fatal error in test mode:', error);
        process.exit(1);
    }
}

// Run test mode
testMode().catch(error => {
    console.error('Unhandled error:', error);
    process.exit(1);
});
