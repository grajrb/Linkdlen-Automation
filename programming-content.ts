/**
 * Programming Content Generator
 * Generates 2 sets of carousel images + text files daily
 * Topics: JavaScript, TypeScript, React, Node.js, Databases, etc.
 */
import dotenv from 'dotenv';
import fs from 'fs/promises';
import { GoogleGenerativeAI } from '@google/generative-ai';
import puppeteer from 'puppeteer';
import path from 'path';
import { generateDynamicTemplate, getDailyTheme } from './template-generator';
import { checkApiLimits, recordApiUsage, displayUsageStats } from './api-usage-monitor';
import { generateSystemDiagram, generateSystemDiagramSVG } from './diagram-generator';

// Load environment variables
dotenv.config();

// Initialize Google Generative AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

interface ContentTopic {
    category: string;
    technology: string;
    concepts: string[];
    hashtags: string[];
}

const PROGRAMMING_TOPICS: ContentTopic[] = [
    {
        category: "Frontend",
        technology: "React.js",
        concepts: ["useEffect vs useLayoutEffect", "Custom Hooks Best Practices", "React.memo vs useMemo", "Context API Performance", "Error Boundaries", "Compound Components Pattern"],
        hashtags: ["#React", "#JavaScript", "#Frontend", "#WebDev", "#Programming", "#ReactHooks"]
    },
    {
        category: "Frontend",
        technology: "Next.js",
        concepts: ["SSR vs SSG vs ISR", "API Routes Security", "Image Optimization", "Middleware Implementation", "App Router Migration", "Edge Runtime"],
        hashtags: ["#NextJS", "#React", "#SSR", "#WebDev", "#FullStack", "#Performance"]
    },
    {
        category: "Frontend",
        technology: "TypeScript",
        concepts: ["Advanced Type Patterns", "Conditional Types", "Template Literal Types", "Mapped Types", "Type Guards Implementation", "Generic Constraints"],
        hashtags: ["#TypeScript", "#JavaScript", "#WebDev", "#Programming", "#TypeSafety", "#DevTools"]
    },
    {
        category: "Backend",
        technology: "Node.js",
        concepts: ["Event Loop Deep Dive", "Worker Threads", "Clustering Strategies", "Memory Management", "Stream Processing", "Performance Profiling"],
        hashtags: ["#NodeJS", "#JavaScript", "#Backend", "#Performance", "#Programming", "#ServerSide"]
    },
    {
        category: "Backend",
        technology: "Express.js",
        concepts: ["Middleware Chain Optimization", "Error Handling Strategies", "Rate Limiting Implementation", "Security Best Practices", "API Versioning", "Request Validation"],
        hashtags: ["#ExpressJS", "#NodeJS", "#Backend", "#API", "#Security", "#WebDev"]
    },
    {
        category: "Database",
        technology: "PostgreSQL",
        concepts: ["Query Optimization Techniques", "Index Strategies", "JSONB Operations", "Window Functions", "Partitioning Tables", "Connection Pooling"],
        hashtags: ["#PostgreSQL", "#Database", "#SQL", "#Performance", "#DataEngineering", "#Backend"]
    },
    {
        category: "Database",
        technology: "MongoDB",
        concepts: ["Aggregation Pipeline Optimization", "Schema Design Patterns", "Indexing Strategies", "Sharding Implementation", "Change Streams", "GridFS Usage"],
        hashtags: ["#MongoDB", "#NoSQL", "#Database", "#Performance", "#DataEngineering", "#Backend"]
    },
    {
        category: "Frontend",
        technology: "CSS & Tailwind",
        concepts: ["CSS Grid Advanced Layouts", "Custom Properties (CSS Variables)", "Container Queries", "Tailwind JIT Mode", "CSS-in-JS Performance", "Modern CSS Architecture"],
        hashtags: ["#CSS", "#TailwindCSS", "#Frontend", "#WebDesign", "#ResponsiveDesign", "#Performance"]
    },
    {
        category: "Backend",
        technology: "GraphQL",
        concepts: ["N+1 Query Problem", "DataLoader Implementation", "Schema Stitching", "Subscription Scalability", "Caching Strategies", "Security Best Practices"],
        hashtags: ["#GraphQL", "#API", "#Backend", "#Performance", "#Programming", "#DataFetching"]
    },
    {
        category: "Tools",
        technology: "Redis",
        concepts: ["Redis Data Structures", "Lua Scripting", "Pub/Sub Patterns", "Redis Clustering", "Memory Optimization", "Cache Invalidation Strategies"],
        hashtags: ["#Redis", "#Caching", "#Performance", "#Backend", "#DataStructures", "#Optimization"]
    },
    {
        category: "Architecture",
        technology: "System Design",
        concepts: ["Microservices Patterns", "Load Balancing Strategies", "Database Sharding", "Caching Layers", "Message Queues", "Circuit Breaker Pattern"],
        hashtags: ["#SystemDesign", "#Architecture", "#Scalability", "#Microservices", "#Performance", "#Engineering"]
    },
    {
        category: "DevOps",
        technology: "Docker & CI/CD",
        concepts: ["Multi-stage Builds", "Container Orchestration", "Pipeline Optimization", "Security Scanning", "Blue-Green Deployment", "Rolling Updates"],
        hashtags: ["#Docker", "#DevOps", "#CICD", "#Kubernetes", "#Deployment", "#Engineering"]
    }
];

/**
 * Generate educational content using Gemini AI with system diagram support
 */
async function generateEducationalContent(topic: ContentTopic): Promise<{title: string, comprehensiveContent: string, detailedExplanation: string, postText: string, hasDiagram: boolean, diagramSVG?: string}> {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    
    const randomConcept = topic.concepts[Math.floor(Math.random() * topic.concepts.length)];
    
    // Check if we can generate a system diagram for this concept
    const systemDiagram = generateSystemDiagram(topic.technology, randomConcept);
    const hasDiagram = systemDiagram !== null;
    const diagramSVG = hasDiagram ? generateSystemDiagramSVG(systemDiagram!) : undefined;
    
    const prompt = `
    Create comprehensive educational content about ${topic.technology} focusing on "${randomConcept}".
    ${hasDiagram ? `\nNOTE: This concept will include a system architecture diagram showing the visual flow and components.` : ''}
    
    Create:
    1. A catchy title (max 6 words) 
    2. Comprehensive content for a single educational image with EXACTLY this structure:
       📋 Definition: [One clear, concise definition line]
       
       🔑 Key Benefits:
       • [First benefit with technical focus]
       • [Second benefit about performance/scalability]  
       • [Third benefit about maintainability]
       • [Fourth benefit about best practices]
       
       💡 Use Case: [One practical real-world example]
       
       ✅ Best Practice: [One actionable best practice tip]
       
    3. Detailed explanation (100-120 words) with technical details and examples
    4. LinkedIn post text in KodeKloud style:
       - Start with an engaging hook about the concept
       - Explain why it matters with real examples
       - Include 3-4 key takeaways with emojis
       ${hasDiagram ? `- Mention the included system architecture diagram` : ''}
       - End with a learning/discussion question
       - Professional yet educational tone
       - Include hashtags: ${topic.hashtags.join(' ')}
    
    Format as JSON:
    {
        "title": "Concept Title",
        "comprehensiveContent": "Structured content with definition, key benefits, use case, and best practice in the exact format above",
        "detailedExplanation": "Technical explanation with examples",
        "postText": "Educational LinkedIn post with KodeKloud style"
    }
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = result.response.text();
        
        // Clean up the response to extract JSON
        let cleanResponse = response.trim();
        if (cleanResponse.startsWith('```json')) {
            cleanResponse = cleanResponse.replace(/```json\s*/g, '').replace(/```\s*$/g, '');
        }
        
        // Try to parse JSON, fallback if needed
        try {
            const parsedContent = JSON.parse(cleanResponse);
            return {
                ...parsedContent,
                hasDiagram,
                diagramSVG
            };
        } catch {
            // Fallback if JSON parsing fails
            return {
                title: `${topic.technology}: ${randomConcept}`,
                comprehensiveContent: `📋 Definition:\n${randomConcept} is a crucial ${topic.technology} concept for modern development\n\n🔑 Key Benefits:\n• Improves application performance significantly\n• Reduces code complexity and bugs\n• Enhances maintainability and readability\n• Enables better scalability patterns\n\n💡 Use Case: Essential for production applications handling high traffic\n\n✅ Best Practice: Always implement with proper testing and monitoring`,
                detailedExplanation: `${randomConcept} in ${topic.technology} is essential for modern development. It provides developers with powerful tools to create efficient, scalable applications. By understanding this concept, you can write cleaner code, avoid common pitfalls, and build better software solutions. This approach has been proven in production environments and is widely adopted by leading tech companies for building robust systems.`,
                postText: `🚀 Want to level up your ${topic.technology} skills?\n\nLet's talk about ${randomConcept} - a game-changing concept that every developer should master!\n\n� Why it matters:\n• Significantly improves code performance\n• Reduces debugging time and complexity\n• Makes your applications more scalable\n• Industry standard in modern development\n\nHave you implemented ${randomConcept} in your projects? What challenges did you face?\n\nDrop your experience in the comments! 👇\n\n${topic.hashtags.join(' ')}`,
                hasDiagram,
                diagramSVG
            };
        }
    } catch (error) {
        console.error('Error generating content:', error);
        throw error;
    }
}

/**
 * Generate single comprehensive educational image with optional system diagram
 */
async function generateEducationalImage(title: string, comprehensiveContent: string, category: string, outputPrefix: string, diagramSVG?: string): Promise<string> {
    console.log(`Generating educational image for: ${title}`);
    
    // Generate today's template with dynamic theme
    await generateDynamicTemplate();
    const theme = getDailyTheme();
    console.log(`🎨 Using "${theme.name}" theme for today's content`);
    
    const htmlTemplate = await fs.readFile('template.html', 'utf-8');
    
    // Parse and format the comprehensive content
    let formattedContent = formatComprehensiveContent(comprehensiveContent);
    
    // Add system diagram if available
    if (diagramSVG) {
        formattedContent += `
        <div class="content-section">
            <div class="section-title">🏗️ System Architecture</div>
            <div class="diagram-container">
                ${diagramSVG}
            </div>
        </div>`;
        console.log(`📊 Added system architecture diagram`);
    }
    
    const browser = await puppeteer.launch({ 
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1080 });

    try {
        // Create the comprehensive educational image
        const finalHtml = htmlTemplate
            .replace('{{TITLE}}', title)
            .replace('{{COMPREHENSIVE_CONTENT}}', formattedContent)
            .replace('{{CATEGORY}}', category);
            
        await page.setContent(finalHtml);
        const imagePath = `${outputPrefix}.png`;
        await page.screenshot({ path: imagePath, fullPage: false });

        console.log(`✅ Generated: ${imagePath}`);
        return imagePath;

    } finally {
        await browser.close();
    }
}

/**
 * Format comprehensive content for HTML rendering
 */
function formatComprehensiveContent(content: string): string {
    // Split content into sections and format with proper HTML structure
    const lines = content.split('\n').filter(line => line.trim());
    let formattedContent = '';
    let currentSection = '';
    
    for (const line of lines) {
        const trimmedLine = line.trim();
        
        if (trimmedLine.includes('Definition:') || trimmedLine.includes('📋')) {
            formattedContent += `
                <div class="content-section">
                    <div class="section-title">📋 Definition</div>
                    <div class="content-text">${trimmedLine.replace(/📋.*?Definition:\s*/, '').replace(/📋\s*/, '')}</div>
                </div>
            `;
        } else if (trimmedLine.includes('Key') && (trimmedLine.includes('Benefits:') || trimmedLine.includes('Points:'))) {
            currentSection = 'keypoints';
            formattedContent += `
                <div class="content-section">
                    <div class="section-title">🔑 Key Points</div>
                    <div class="key-points">
            `;
        } else if (trimmedLine.startsWith('•') && currentSection === 'keypoints') {
            const point = trimmedLine.replace('•', '').trim();
            const icon = getIconForPoint(point);
            formattedContent += `
                <div class="key-point">
                    <span class="icon">${icon}</span>
                    <span>${point}</span>
                </div>
            `;
        } else if (trimmedLine.includes('Use Case:') || trimmedLine.includes('💡')) {
            if (currentSection === 'keypoints') {
                formattedContent += '</div></div>';
                currentSection = '';
            }
            formattedContent += `
                <div class="content-section">
                    <div class="section-title">💡 Use Case</div>
                    <div class="content-text">${trimmedLine.replace(/💡.*?Use Case:\s*/, '').replace(/💡\s*/, '')}</div>
                </div>
            `;
        } else if (trimmedLine.includes('Best Practice:') || trimmedLine.includes('✅')) {
            formattedContent += `
                <div class="best-practice">
                    <div class="title">✅ Best Practice</div>
                    <div class="text">${trimmedLine.replace(/✅.*?Best Practice:\s*/, '').replace(/✅\s*/, '')}</div>
                </div>
            `;
        }
    }
    
    // Close any open sections
    if (currentSection === 'keypoints') {
        formattedContent += '</div></div>';
    }
    
    return formattedContent;
}

/**
 * Get appropriate icon for different types of points
 */
function getIconForPoint(point: string): string {
    const pointLower = point.toLowerCase();
    if (pointLower.includes('performance') || pointLower.includes('fast') || pointLower.includes('speed')) return '⚡';
    if (pointLower.includes('security') || pointLower.includes('safe') || pointLower.includes('protect')) return '🔒';
    if (pointLower.includes('scalab') || pointLower.includes('scale')) return '📈';
    if (pointLower.includes('maintain') || pointLower.includes('clean') || pointLower.includes('readable')) return '🛠️';
    if (pointLower.includes('reduce') || pointLower.includes('less') || pointLower.includes('minimize')) return '📉';
    if (pointLower.includes('improve') || pointLower.includes('better') || pointLower.includes('enhance')) return '✨';
    if (pointLower.includes('debug') || pointLower.includes('error') || pointLower.includes('bug')) return '🐛';
    if (pointLower.includes('test') || pointLower.includes('quality')) return '✅';
    return '🔹'; // Default icon
}

/**
 * Create content files for manual posting - Single image version
 */
async function createContentFiles(content: {title: string, comprehensiveContent: string, detailedExplanation: string, postText: string, hasDiagram: boolean}, imagePath: string, outputPrefix: string): Promise<void> {
    const timestamp = new Date().toISOString().split('T')[0];
    const fileName = `${outputPrefix}_content.txt`;
    
    const contentFile = `
📅 Generated on: ${timestamp}
🎯 Topic: ${content.title}
${content.hasDiagram ? '📊 Includes: System Architecture Diagram' : ''}

📸 IMAGE TO UPLOAD:
================
${imagePath}

📊 IMAGE CONTENT BREAKDOWN:
========================
${content.comprehensiveContent.replace(/\n/g, '\n')}
${content.hasDiagram ? '\n🏗️ SYSTEM DIAGRAM: Interactive architecture diagram showing component relationships' : ''}

🔍 DETAILED EXPLANATION:
======================
${content.detailedExplanation}

📝 LINKEDIN POST TEXT:
====================
${content.postText}

📋 POSTING INSTRUCTIONS:
======================
1. Open LinkedIn and click "Start a post"
2. Upload the educational image above
${content.hasDiagram ? '   (Image includes system architecture diagram)' : ''}
3. Copy and paste the post text
4. Review and publish!

💡 ENGAGEMENT TIPS:
=================
- Post during business hours (9 AM - 5 PM)
- Engage with comments within first hour
- Ask follow-up questions in comments
- Share personal experiences related to the topic
- Tag relevant people in your network

🎨 VISUAL STYLE:
==============
Today's theme: Professional educational design
Color scheme: Optimized for LinkedIn engagement
Layout: KodeKloud-inspired comprehensive format
${content.hasDiagram ? 'Features: System architecture diagrams with icons and arrows' : ''}

════════════════════════════════════════
Generated by Programming Content Engine
════════════════════════════════════════
`;

    await fs.writeFile(fileName, contentFile);
    console.log(`✅ Created content file: ${fileName}`);
}

/**
 * Main function to generate daily programming content
 */
async function generateDailyContent(): Promise<void> {
    console.log('🚀 Generating Daily Programming Content...');
    console.log('=========================================');
    
    // Check API usage limits first
    const limitCheck = await checkApiLimits(2, 1500);
    if (!limitCheck.canProceed) {
        console.error('❌ Cannot proceed:', limitCheck.reason);
        await displayUsageStats();
        process.exit(1);
    }
    
    const timestamp = new Date().toISOString().split('T')[0];
    const theme = getDailyTheme();
    console.log(`🎨 Today's Visual Theme: "${theme.name}"`);
    console.log(`📅 Content Date: ${timestamp}`);
    
    // Display current usage stats
    await displayUsageStats();
    
    try {
        // Create output directory for today
        const outputDir = `content_${timestamp}`;
        try {
            await fs.mkdir(outputDir, { recursive: true });
        } catch (error) {
            // Directory might already exist
        }
        
        // Generate 2 different pieces of content
        for (let i = 1; i <= 2; i++) {
            console.log(`\n📝 Generating Content Set ${i}/2...`);
            
            // Pick a random topic
            const randomTopic = PROGRAMMING_TOPICS[Math.floor(Math.random() * PROGRAMMING_TOPICS.length)];
            console.log(`🎯 Topic: ${randomTopic.technology} (${randomTopic.category})`);
            
            // Generate AI content (this uses 1 API call)
            const content = await generateEducationalContent(randomTopic);
            
            // Record API usage (1 request, ~750 tokens average)
            await recordApiUsage(1, 750);
            
            // Generate single comprehensive educational image with optional diagram
            const outputPrefix = path.join(outputDir, `post_${i}`);
            const imagePath = await generateEducationalImage(
                content.title, 
                content.comprehensiveContent,
                randomTopic.category,
                outputPrefix,
                content.diagramSVG
            );
            
            if (content.hasDiagram) {
                console.log(`📊 Added system architecture diagram for ${content.title}`);
            }
            
            // Create content file with instructions
            await createContentFiles(content, imagePath, outputPrefix);
            
            console.log(`✅ Content Set ${i} completed!`);
        }
        
        console.log('\n🎉 Daily content generation completed!');
        console.log(`📁 Check the '${outputDir}' folder for your content`);
        console.log('\n📋 WHAT YOU GOT:');
        console.log('• 2 comprehensive educational images (KodeKloud style)');
        console.log('• 2 text files with posting instructions');
        console.log('• Single-image posts ready for LinkedIn');
        console.log('• Professional design with icons and structured content');
        console.log('• System architecture diagrams (when applicable)');
        console.log('• Small icons with arrows showing component interactions');
        
        // Show final usage stats
        console.log('\n' + '='.repeat(50));
        await displayUsageStats();
        
    } catch (error) {
        console.error('❌ Error generating daily content:', error);
        process.exit(1);
    }
}

// Run the content generation
if (require.main === module) {
    generateDailyContent().catch(error => {
        console.error('Unhandled error:', error);
        process.exit(1);
    });
}
