import { GoogleGenerativeAI } from "@google/generative-ai";
import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';
import Parser from 'rss-parser';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Initialize RSS parser
const parser = new Parser();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Interface for article structure
interface Article {
    title: string;
    link: string;
    pubDate?: string;
    contentSnippet?: string;
}

/**
 * Fetch and filter articles from RSS feeds
 */
async function fetchAndFilterArticles(rssUrls: string[]): Promise<Article[]> {
    const allArticles: Article[] = [];
    
    console.log('Fetching articles from RSS feeds...');
    
    for (const url of rssUrls) {
        try {
            const feed = await parser.parseURL(url);
            const articles = feed.items.map(item => ({
                title: item.title || 'Untitled',
                link: item.link || '',
                pubDate: item.pubDate,
                contentSnippet: item.contentSnippet || item.content
            }));
            allArticles.push(...articles);
            console.log(`Fetched ${articles.length} articles from ${url}`);
        } catch (error) {
            console.error(`Failed to fetch from ${url}:`, error);
        }
    }
    
    // Remove duplicates by link
    const uniqueArticles = allArticles.filter((article, index, self) => 
        index === self.findIndex(a => a.link === article.link)
    );
    
    // Sort by date (newest first)
    uniqueArticles.sort((a, b) => {
        const dateA = new Date(a.pubDate || 0);
        const dateB = new Date(b.pubDate || 0);
        return dateB.getTime() - dateA.getTime();
    });
    
    // Return top 2 articles
    const topArticles = uniqueArticles.slice(0, 2);
    console.log(`Selected ${topArticles.length} articles for processing`);
    
    return topArticles;
}

/**
 * Summarize article with Google Gemini
 */
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

/**
 * Generate carousel images using Puppeteer
 */
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
        filePaths.push(path.resolve('slide-1.png'));

        // Slide 2: Summary (truncated to fit)
        const truncatedSummary = summary.length > 200 ? summary.substring(0, 200) + '...' : summary;
        const summaryHtml = htmlTemplate
            .replace('{{TITLE}}', '')
            .replace('{{SUMMARY}}', truncatedSummary);
        await page.setContent(summaryHtml);
        await page.screenshot({ path: 'slide-2.png', fullPage: false });
        filePaths.push(path.resolve('slide-2.png'));

        console.log('Carousel images generated:', filePaths);
        return filePaths;
    } finally {
        await browser.close();
    }
}

/**
 * Post carousel to LinkedIn using Puppeteer
 */
async function postCarouselToLinkedIn(postText: string, imagePaths: string[]): Promise<void> {
    console.log('Starting LinkedIn post automation...');
    
    const browser = await puppeteer.launch({ 
        headless: true, // Set to false for debugging
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    
    try {
        console.log('Navigating to LinkedIn login...');
        await page.goto('https://www.linkedin.com/login', { waitUntil: 'networkidle2' });
        
        // Login
        await page.waitForSelector('#username');
        await page.type('#username', process.env.LINKEDIN_EMAIL!);
        await page.type('#password', process.env.LINKEDIN_PASSWORD!);
        await page.click('button[type="submit"]');

        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('Login successful. Navigating to feed.');

        // Wait a moment for the page to fully load
        await new Promise(resolve => setTimeout(resolve, 3000));

        console.log('Opening post creation modal...');
        await page.waitForSelector('[data-test-id="share-box-trigger"], .share-box-feed-entry__trigger', { timeout: 10000 });
        await page.click('[data-test-id="share-box-trigger"], .share-box-feed-entry__trigger');

        // Wait for the modal to open
        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Looking for document upload option...');
        // Try different selectors for the document/media upload button
        const mediaSelectors = [
            'button[aria-label*="document"]',
            'button[aria-label*="media"]',
            '[data-test-id="media-document"]',
            '.share-creation-state__text-editor ~ button'
        ];

        let mediaButton = null;
        for (const selector of mediaSelectors) {
            try {
                mediaButton = await page.$(selector);
                if (mediaButton) {
                    console.log(`Found media button with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (mediaButton) {
            await mediaButton.click();
        } else {
            console.log('Trying alternative approach for media upload...');
            // Alternative: look for any button that might trigger file upload
            await page.waitForSelector('input[type="file"]', { timeout: 5000 });
        }

        console.log('Uploading images...');
        const fileInput = await page.waitForSelector('input[type="file"]', { timeout: 10000 });
        if (fileInput) {
            await fileInput.uploadFile(...imagePaths);
        } else {
            throw new Error('File input not found');
        }

        // Wait for upload processing
        await new Promise(resolve => setTimeout(resolve, 5000));

        // Look for and click the "Done" button
        const doneSelectors = [
            'button[data-test-id="done-button"]',
            '.share-document-viewer__done-button',
            'button:has-text("Done")',
            'button[aria-label*="Done"]'
        ];

        for (const selector of doneSelectors) {
            try {
                await page.waitForSelector(selector, { timeout: 5000 });
                await page.click(selector);
                console.log(`Clicked done button with selector: ${selector}`);
                break;
            } catch (e) {
                continue;
            }
        }

        await new Promise(resolve => setTimeout(resolve, 2000));

        console.log('Adding post text...');
        // Find the text editor
        const textSelectors = [
            '.ql-editor[data-placeholder]',
            '.ql-editor',
            '[data-test-id="share-creation-state-text-editor"]',
            '.mentions-texteditor__content'
        ];

        let textArea = null;
        for (const selector of textSelectors) {
            try {
                textArea = await page.waitForSelector(selector, { timeout: 5000 });
                if (textArea) {
                    console.log(`Found text editor with selector: ${selector}`);
                    break;
                }
            } catch (e) {
                continue;
            }
        }

        if (textArea) {
            await textArea.click();
            await textArea.type(postText);
        } else {
            throw new Error('Could not find text editor');
        }

        console.log('Submitting the post...');
        // Find and click the post button
        const postSelectors = [
            'button[data-test-id="share-actions-post-button"]',
            '.share-actions__primary-action',
            'button[aria-label*="Post"]',
            'button:has-text("Post")'
        ];

        for (const selector of postSelectors) {
            try {
                const postButton = await page.waitForSelector(selector, { timeout: 5000 });
                if (postButton) {
                    const isDisabled = await page.evaluate((btn) => (btn as HTMLButtonElement).disabled, postButton);
                    if (!isDisabled) {
                        await postButton.click();
                        console.log(`Clicked post button with selector: ${selector}`);
                        break;
                    }
                }
            } catch (e) {
                continue;
            }
        }
        
        await new Promise(resolve => setTimeout(resolve, 5000));
        console.log('Successfully posted to LinkedIn!');
        
    } catch (error) {
        console.error('Error during LinkedIn posting:', error);
        // Take a screenshot for debugging
        await page.screenshot({ path: 'debug-screenshot.png' });
        throw error;
    } finally {
        await browser.close();
    }
}

/**
 * Main function to orchestrate the content engine
 */
async function main(): Promise<void> {
    console.log('Starting FREE content engine...');
    
    // Example RSS feeds - you can customize these
    const rssFeeds = [
        'https://techcrunch.com/feed/',
        'https://www.theverge.com/rss/index.xml',
        'https://feeds.arstechnica.com/arstechnica/index',
        'https://www.wired.com/feed/rss'
    ];

    try {
        const articles = await fetchAndFilterArticles(rssFeeds);

        for (const article of articles) {
            try {
                console.log(`\n--- Processing: ${article.title} ---`);
                
                // Generate summary for image (shorter version)
                const imageSummary = (article.contentSnippet || article.title).substring(0, 150) + '...';
                const imagePaths = await generateCarouselImages(article.title, imageSummary);

                // Generate full post text with Gemini
                const postText = await summarizeArticleWithGemini(article);

                // Post to LinkedIn
                await postCarouselToLinkedIn(postText, imagePaths);

                // Cleanup generated images
                for (const imagePath of imagePaths) {
                    try {
                        await fs.unlink(imagePath);
                        console.log(`Cleaned up: ${imagePath}`);
                    } catch (cleanupError) {
                        console.warn(`Could not clean up ${imagePath}:`, cleanupError);
                    }
                }
                
                console.log(`✅ SUCCESS: Posted "${article.title}"`);
                
                // Wait between posts to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 30000)); // 30 second delay
                
            } catch (error) {
                console.error(`❌ FAILED to process "${article.title}":`, error);
                // Continue with next article
            }
        }
        
        console.log('\n🎉 Content engine completed successfully!');
        
    } catch (error) {
        console.error('❌ Fatal error in main process:', error);
        process.exit(1);
    }
}

// Run the main function
if (require.main === module) {
    main().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}
