import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Test function to generate carousel images
 */
async function testImageGeneration(): Promise<void> {
    console.log('Testing image generation...');
    
    try {
        const htmlTemplate = await fs.readFile('template.html', 'utf-8');
        const browser = await puppeteer.launch({ 
            headless: "new",
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1080 });

        // Test Slide 1: Title only
        const testTitle = "The Future of AI: What Every Developer Needs to Know";
        const titleHtml = htmlTemplate
            .replace('{{TITLE}}', testTitle)
            .replace('{{SUMMARY}}', '');
        
        await page.setContent(titleHtml);
        await page.screenshot({ path: 'test-slide-1.png', fullPage: false });
        console.log('✅ Generated test-slide-1.png');

        // Test Slide 2: Summary
        const testSummary = "Artificial Intelligence is rapidly transforming the software development landscape. From automated code generation to intelligent debugging tools, AI is becoming an essential part of every developer's toolkit.";
        const summaryHtml = htmlTemplate
            .replace('{{TITLE}}', '')
            .replace('{{SUMMARY}}', testSummary);
            
        await page.setContent(summaryHtml);
        await page.screenshot({ path: 'test-slide-2.png', fullPage: false });
        console.log('✅ Generated test-slide-2.png');

        await browser.close();
        console.log('🎉 Image generation test completed successfully!');
        console.log('📁 Check the following files in your project directory:');
        console.log('   - test-slide-1.png');
        console.log('   - test-slide-2.png');
        
    } catch (error) {
        console.error('❌ Image generation test failed:', error);
    }
}

// Run the test
testImageGeneration();
