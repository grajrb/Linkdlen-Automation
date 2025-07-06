import puppeteer from 'puppeteer';
import fs from 'fs/promises';
import path from 'path';

/**
 * Test function to generate comprehensive LinkedIn-style images like alexxubyte
 * Each image contains ALL the information in one clean, educational post
 */
async function testImageGeneration(): Promise<void> {
    console.log('🎨 Testing LinkedIn-style comprehensive image generation...');
    
    try {
        const htmlTemplate = await fs.readFile('template.html', 'utf-8');
        const browser = await puppeteer.launch({ 
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox']
        });
        const page = await browser.newPage();
        await page.setViewport({ width: 1080, height: 1080 });

        // Test Image 1: Load Balancing (Comprehensive)
        console.log('📝 Generating comprehensive post 1...');
        const comprehensiveContent1 = `
        <div class="content-section">
            <div class="section-title">📋 Definition</div>
            <div class="section-content">Distributes incoming network traffic across multiple servers to prevent overload and ensure high availability.</div>
        </div>
        
        <div class="content-section">
            <div class="section-title">🔑 Key Benefits</div>
            <ul class="bullet-points">
                <li>Prevents server overload</li>
                <li>Improves response times</li>
                <li>Increases fault tolerance</li>
                <li>Enables horizontal scaling</li>
            </ul>
        </div>
        
        <div class="content-section">
            <div class="section-title">💡 Use Case</div>
            <div class="use-case">E-commerce sites use load balancers during Black Friday to handle millions of concurrent users without crashes.</div>
        </div>
        
        <div class="content-section">
            <div class="section-title">✅ Best Practice</div>
            <div class="best-practice">Always implement health checks to automatically remove unhealthy servers from the pool.</div>
        </div>`;

        const image1Html = htmlTemplate
            .replace('{{TITLE}}', 'System Design: Load Balancing')
            .replace('{{COMPREHENSIVE_CONTENT}}', comprehensiveContent1)
            .replace('{{CATEGORY}}', 'Architecture');
        
        await page.setContent(image1Html);
        await page.screenshot({ path: 'test-comprehensive-1.png', fullPage: false });
        console.log('✅ Generated test-comprehensive-1.png');

        // Test Image 2: React Hooks (Comprehensive)
        console.log('📝 Generating comprehensive post 2...');
        const comprehensiveContent2 = `
        <div class="content-section">
            <div class="section-title">📋 Definition</div>
            <div class="section-content">Functions that let you use state and lifecycle features in functional components without writing class components.</div>
        </div>
        
        <div class="content-section">
            <div class="section-title">🔑 Key Benefits</div>
            <ul class="bullet-points">
                <li>Cleaner, more readable code</li>
                <li>Better state management</li>
                <li>Easier testing and debugging</li>
                <li>Reusable stateful logic</li>
            </ul>
        </div>
        
        <div class="content-section">
            <div class="section-title">💡 Use Case</div>
            <div class="use-case">Use useState for component state, useEffect for side effects, and custom hooks for sharing logic between components.</div>
        </div>
        
        <div class="content-section">
            <div class="section-title">✅ Best Practice</div>
            <div class="best-practice">Always include dependencies in useEffect arrays to prevent stale closures and memory leaks.</div>
        </div>`;

        const image2Html = htmlTemplate
            .replace('{{TITLE}}', 'React.js: Custom Hooks')
            .replace('{{COMPREHENSIVE_CONTENT}}', comprehensiveContent2)
            .replace('{{CATEGORY}}', 'Frontend');
            
        await page.setContent(image2Html);
        await page.screenshot({ path: 'test-comprehensive-2.png', fullPage: false });
        console.log('✅ Generated test-comprehensive-2.png');

        await browser.close();
        
        console.log('\n🎉 LinkedIn-style comprehensive image generation test completed!');
        console.log('📁 Generated files:');
        console.log('   - test-comprehensive-1.png (Load Balancing - Complete educational post)');
        console.log('   - test-comprehensive-2.png (React Hooks - Complete educational post)');
        console.log('\n💡 These images follow alexxubyte LinkedIn style:');
        console.log('   ✓ Single comprehensive image per post');
        console.log('   ✓ All information in one place');
        console.log('   ✓ Clean, professional layout');
        console.log('   ✓ LinkedIn-ready format (1080x1080)');
        console.log('   ✓ Educational and engaging content');
        
    } catch (error) {
        console.error('❌ Image generation test failed:', error);
    }
}

// Run the test
testImageGeneration();
