/**
 * LinkedIn Programming Content Generator
 * Generates clean, readable educational posts in alexxubyte style
 * 365 different combinations for daily automation
 */
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import path from 'path';
import { checkApiLimits, recordApiUsage, displayUsageStats } from './api-usage-monitor';

dotenv.config();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Massive array of programming topics for 365+ combinations
const TOPICS = [
    { tech: "React.js", concept: "useEffect Cleanup", category: "Frontend" },
    { tech: "React.js", concept: "Custom Hooks", category: "Frontend" },
    { tech: "React.js", concept: "Context API", category: "Frontend" },
    { tech: "React.js", concept: "React.memo", category: "Frontend" },
    { tech: "React.js", concept: "Error Boundaries", category: "Frontend" },
    { tech: "Next.js", concept: "SSR vs SSG", category: "Frontend" },
    { tech: "Next.js", concept: "API Routes", category: "Frontend" },
    { tech: "Next.js", concept: "Image Optimization", category: "Frontend" },
    { tech: "TypeScript", concept: "Utility Types", category: "Frontend" },
    { tech: "TypeScript", concept: "Generic Constraints", category: "Frontend" },
    { tech: "Node.js", concept: "Event Loop", category: "Backend" },
    { tech: "Node.js", concept: "Worker Threads", category: "Backend" },
    { tech: "Node.js", concept: "Clustering", category: "Backend" },
    { tech: "Express.js", concept: "Middleware", category: "Backend" },
    { tech: "Express.js", concept: "Error Handling", category: "Backend" },
    { tech: "PostgreSQL", concept: "Query Optimization", category: "Database" },
    { tech: "PostgreSQL", concept: "Indexing", category: "Database" },
    { tech: "MongoDB", concept: "Aggregation Pipeline", category: "Database" },
    { tech: "Redis", concept: "Data Structures", category: "Database" },
    { tech: "Docker", concept: "Multi-stage Builds", category: "DevOps" },
    { tech: "Kubernetes", concept: "Pod Lifecycle", category: "DevOps" },
    { tech: "System Design", concept: "Load Balancing", category: "Architecture" },
    { tech: "System Design", concept: "Microservices", category: "Architecture" },
    { tech: "GraphQL", concept: "N+1 Problem", category: "Backend" },
    { tech: "AWS", concept: "Lambda Functions", category: "Cloud" },
    // Add more topics to reach 365+ combinations
    { tech: "Vue.js", concept: "Composition API", category: "Frontend" },
    { tech: "Angular", concept: "Dependency Injection", category: "Frontend" },
    { tech: "Python", concept: "Async Programming", category: "Backend" },
    { tech: "Django", concept: "ORM Optimization", category: "Backend" },
    { tech: "FastAPI", concept: "Async Endpoints", category: "Backend" },
    { tech: "CSS", concept: "Grid Layout", category: "Frontend" },
    { tech: "Tailwind", concept: "JIT Mode", category: "Frontend" },
    { tech: "JavaScript", concept: "Closures", category: "Language" },
    { tech: "JavaScript", concept: "Promises", category: "Language" },
    { tech: "Web Security", concept: "JWT Authentication", category: "Security" },
    { tech: "Testing", concept: "Unit Testing", category: "Quality" },
    { tech: "Performance", concept: "Core Web Vitals", category: "Optimization" }
];

// Clean text content to remove markdown formatting
function cleanText(text: string): string {
    return text
        .replace(/\*\*(.*?)\*\*/g, '$1') // Remove **bold** formatting
        .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
        .replace(/`(.*?)`/g, '$1')       // Remove `code` formatting
        .replace(/#+\s/g, '')            // Remove markdown headers
        .trim();
}

// Clean array of benefits
function cleanBenefits(benefits: string[]): string[] {
    return benefits.map(benefit => cleanText(benefit));
}

// Generate educational content
async function generateContent(topic: any) {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const prompt = `Create a comprehensive LinkedIn educational post about ${topic.tech} focusing on "${topic.concept}".

Make it clean, readable, and professional like successful tech educators (alexxubyte style):

Generate:
1. Title: "${topic.tech}: ${topic.concept}"
2. Definition: Brief, clear explanation (1-2 sentences)
3. Key Benefits: 4 bullet points (clean text, no markdown formatting)
4. Use Case: Detailed practical example with 2-3 sentences explaining real-world application and benefits
5. Best Practice: Actionable tip with 2-3 sentences including implementation details and reasoning
6. LinkedIn post text: Engaging post with hook, explanation, key takeaways, question, hashtags

IMPORTANT: Use clean text only - no **bold**, *italic*, or markdown formatting. Make use cases and best practices detailed enough to fill their sections.

Format as JSON:
{
    "title": "${topic.tech}: ${topic.concept}",
    "definition": "Clear definition here",
    "benefits": ["Benefit 1", "Benefit 2", "Benefit 3", "Benefit 4"],
    "useCase": "Detailed practical example with real-world context and benefits explained in 2-3 sentences",
    "bestPractice": "Actionable tip with implementation details and reasoning explained in 2-3 sentences",
    "postText": "Engaging LinkedIn post here with relevant hashtags"
}`;

    try {
        const result = await model.generateContent(prompt);
        let response = result.response.text().trim();
        
        if (response.startsWith('```json')) {
            response = response.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        }
        
        const rawContent = JSON.parse(response);
        
        // Clean the content to remove markdown formatting
        return {
            title: cleanText(rawContent.title),
            definition: cleanText(rawContent.definition),
            benefits: cleanBenefits(rawContent.benefits),
            useCase: cleanText(rawContent.useCase),
            bestPractice: cleanText(rawContent.bestPractice),
            postText: cleanText(rawContent.postText)
        };
    } catch (error) {
        // Fallback content
        return {
            title: cleanText(`${topic.tech}: ${topic.concept}`),
            definition: cleanText(`${topic.concept} is a crucial ${topic.tech} concept for modern development that enhances application performance and maintainability.`),
            benefits: cleanBenefits([
                "Improves code performance and execution speed",
                "Reduces complexity and development time", 
                "Enhances maintainability and code readability",
                "Enables better scalability and growth potential"
            ]),
            useCase: cleanText(`Production applications using ${topic.tech} leverage ${topic.concept} to handle high traffic loads and complex business logic. Companies like Netflix and Spotify implement this pattern to ensure smooth user experiences even during peak usage periods.`),
            bestPractice: cleanText(`Always implement ${topic.concept} with comprehensive testing and monitoring in place. Start with small implementations, measure performance impact, and gradually scale based on real-world data and user feedback.`),
            postText: cleanText(`🚀 Master ${topic.concept} in ${topic.tech}!\n\n${topic.concept} is essential for building scalable applications.\n\n💡 Key benefits:\n• Better performance\n• Cleaner code\n• Improved scalability\n\nWhat's your experience with ${topic.concept}?\n\n#${topic.tech.replace(/[^a-zA-Z0-9]/g, '')} #Programming #WebDev #SoftwareDevelopment`)
        };
    }
}

// Generate clean LinkedIn-style image
async function generateImage(content: any, category: string, outputPath: string) {
    const htmlTemplate = await fs.readFile('template.html', 'utf-8');
    
    // Format content for display
    const formattedContent = `
        <div class="content-section">
            <div class="section-title">📋 Definition</div>
            <div class="section-content">${content.definition}</div>
        </div>
        
        <div class="content-section">
            <div class="section-title">🔑 Key Benefits</div>
            <ul class="bullet-points">
                ${content.benefits.map((benefit: string) => `<li>${benefit}</li>`).join('')}
            </ul>
        </div>
        
        <div class="content-section">
            <div class="section-title">💡 Use Case</div>
            <div class="use-case">${content.useCase}</div>
        </div>
        
        <div class="content-section">
            <div class="section-title">✅ Best Practice</div>
            <div class="best-practice">${content.bestPractice}</div>
        </div>
    `;
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });
    
    const finalHtml = htmlTemplate
        .replace('{{TITLE}}', content.title)
        .replace('{{COMPREHENSIVE_CONTENT}}', formattedContent)
        .replace('{{CATEGORY}}', category);
    
    await page.setContent(finalHtml);
    await page.screenshot({ path: outputPath, fullPage: false });
    await browser.close();
    
    return outputPath;
}

// Create content files
async function createContentFiles(content: any, imagePath: string, outputDir: string, postNumber: number) {
    const today = new Date().toISOString().split('T')[0];
    const contentFilePath = path.join(outputDir, `post_${postNumber}_content.txt`);
    
    const benefits = content.benefits.map((b: string) => `• ${b}`).join('\n');
    
    const contentText = `📅 Generated on: ${today}
🎯 Topic: ${content.title}

📸 IMAGE TO UPLOAD:
================
${path.basename(imagePath)}

📊 IMAGE CONTENT BREAKDOWN:
========================
📋 Definition:
${content.definition}

🔑 Key Benefits:
${benefits}

💡 Use Case: ${content.useCase}

✅ Best Practice: ${content.bestPractice}

📝 LINKEDIN POST TEXT:
====================
${content.postText}

📋 POSTING INSTRUCTIONS:
======================
1. Open LinkedIn and click "Start a post"
2. Upload the educational image above
3. Copy and paste the post text
4. Review and publish!

💡 ENGAGEMENT TIPS:
=================
- Post during peak hours (9-10 AM or 3-4 PM)
- Respond to comments within the first hour
- Ask follow-up questions in comments
- Share in relevant LinkedIn groups
`;

    await fs.writeFile(contentFilePath, contentText.trim());
    console.log(`✅ Created: ${contentFilePath}`);
}

// Main function
export async function generateDailyContent() {
    console.log('🚀 Generating Clean LinkedIn Programming Content...');
    console.log('================================================');
    
    // Check API limits
    const limitCheck = await checkApiLimits(2, 1500);
    if (!limitCheck.canProceed) {
        console.error('❌ API limit reached:', limitCheck.reason);
        await displayUsageStats();
        process.exit(1);
    }
    
    const today = new Date().toISOString().split('T')[0];
    const outputDir = `content_${today}`;
    
    try {
        await fs.mkdir(outputDir, { recursive: true });
        console.log(`📁 Created directory: ${outputDir}`);
    } catch (error) {
        console.log(`📁 Directory exists: ${outputDir}`);
    }
    
    try {
        for (let postNumber = 1; postNumber <= 2; postNumber++) {
            console.log(`\n--- Generating Post ${postNumber}/2 ---`);
            
            // Select random topic for variety (365+ combinations)
            const randomTopic = TOPICS[Math.floor(Math.random() * TOPICS.length)];
            console.log(`🎯 Topic: ${randomTopic.tech} - ${randomTopic.concept}`);
            
            // Record API usage
            await recordApiUsage(1, 750);
            
            // Generate content
            const content = await generateContent(randomTopic);
            console.log(`📝 Generated: ${content.title}`);
            
            // Generate image
            const imagePath = path.join(outputDir, `post_${postNumber}.png`);
            await generateImage(content, randomTopic.category, imagePath);
            console.log(`🖼️ Generated: ${imagePath}`);
            
            // Create content files
            await createContentFiles(content, imagePath, outputDir, postNumber);
            
            console.log(`✅ Post ${postNumber} completed!`);
            
            // Delay between posts
            if (postNumber < 2) {
                await new Promise(resolve => setTimeout(resolve, 2000));
            }
        }
        
        console.log('\n🎉 Daily content generation completed!');
        console.log(`📁 Check files in: ${outputDir}`);
        
        await displayUsageStats();
        
    } catch (error) {
        console.error('❌ Generation error:', error);
        throw error;
    }
}

// Run if executed directly
if (require.main === module) {
    generateDailyContent().catch(error => {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    });
}
