/**
 * Dynamic Template Generator
 * Creates different background designs for each day
 */
import fs from 'fs/promises';

interface TemplateTheme {
    name: string;
    background: string;
    titleColor: string;
    textColor: string;
    footerColor: string;
    accent: string;
    pattern?: string;
}

const DAILY_THEMES: TemplateTheme[] = [
    {
        name: "Gradient Waves",
        background: `
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            background-image: 
                radial-gradient(circle at 25% 25%, #ffffff10 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #ffffff08 0%, transparent 50%);
        `,
        titleColor: "background: linear-gradient(135deg, #ffffff, #e0e7ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#f8fafc",
        footerColor: "#cbd5e1",
        accent: "#3b82f6"
    },
    {
        name: "Neon Dark",
        background: `
            background: linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%);
            background-image: 
                linear-gradient(45deg, #00ff9f20 25%, transparent 25%),
                linear-gradient(-45deg, #00ff9f20 25%, transparent 25%);
            background-size: 60px 60px;
        `,
        titleColor: "background: linear-gradient(135deg, #00ff9f, #00d4aa); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#e2e8f0",
        footerColor: "#94a3b8",
        accent: "#00ff9f"
    },
    {
        name: "Sunset Gradient",
        background: `
            background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 25%, #ff9ff3 75%, #54a0ff 100%);
            background-image: 
                radial-gradient(circle at 20% 80%, #ffffff15 0%, transparent 50%),
                radial-gradient(circle at 80% 20%, #ffffff10 0%, transparent 50%);
        `,
        titleColor: "color: #ffffff; text-shadow: 2px 2px 8px rgba(0,0,0,0.3);",
        textColor: "#ffffff",
        footerColor: "#f1f5f9",
        accent: "#ff6b6b"
    },
    {
        name: "Minimal Glass",
        background: `
            background: linear-gradient(135deg, #e3f2fd 0%, #bbdefb 50%, #90caf9 100%);
            background-image: 
                linear-gradient(45deg, #ffffff40 1px, transparent 1px),
                linear-gradient(-45deg, #ffffff40 1px, transparent 1px);
            background-size: 20px 20px;
        `,
        titleColor: "background: linear-gradient(135deg, #1565c0, #0d47a1); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#1e293b",
        footerColor: "#64748b",
        accent: "#2196f3"
    },
    {
        name: "Purple Matrix",
        background: `
            background: linear-gradient(135deg, #2d1b69 0%, #11998e 100%);
            background-image: 
                repeating-linear-gradient(45deg, transparent, transparent 2px, #ffffff08 2px, #ffffff08 4px),
                repeating-linear-gradient(-45deg, transparent, transparent 2px, #ffffff05 2px, #ffffff05 4px);
        `,
        titleColor: "background: linear-gradient(135deg, #a78bfa, #c084fc); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#e2e8f0",
        footerColor: "#cbd5e1",
        accent: "#8b5cf6"
    },
    {
        name: "Green Tech",
        background: `
            background: linear-gradient(135deg, #134e5e 0%, #71b280 100%);
            background-image: 
                radial-gradient(circle at 50% 50%, #ffffff10 1px, transparent 1px);
            background-size: 30px 30px;
        `,
        titleColor: "background: linear-gradient(135deg, #22d3ee, #06b6d4); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#f0fdfa",
        footerColor: "#a7f3d0",
        accent: "#10b981"
    },
    {
        name: "Orange Burst",
        background: `
            background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%);
            background-image: 
                radial-gradient(circle at 25% 25%, #ff6b6b20 0%, transparent 50%),
                radial-gradient(circle at 75% 75%, #ff9ff320 0%, transparent 50%);
        `,
        titleColor: "background: linear-gradient(135deg, #dc2626, #ea580c); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#7c2d12",
        footerColor: "#a16207",
        accent: "#f97316"
    },
    {
        name: "Cyberpunk Pink",
        background: `
            background: linear-gradient(135deg, #1a0033 0%, #330066 50%, #ff0080 100%);
            background-image: 
                linear-gradient(90deg, #ff008020 50%, transparent 50%),
                linear-gradient(0deg, #00ff8020 50%, transparent 50%);
            background-size: 50px 50px;
        `,
        titleColor: "background: linear-gradient(135deg, #ff0080, #ff4081); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#f8bbd9",
        footerColor: "#ec4899",
        accent: "#ff0080"
    },
    {
        name: "Ocean Blue",
        background: `
            background: linear-gradient(135deg, #1e3a8a 0%, #3730a3 25%, #1e40af 75%, #1d4ed8 100%);
            background-image: 
                radial-gradient(circle at 30% 30%, #60a5fa20 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, #93c5fd15 0%, transparent 50%);
        `,
        titleColor: "background: linear-gradient(135deg, #dbeafe, #bfdbfe); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#dbeafe",
        footerColor: "#93c5fd",
        accent: "#3b82f6"
    },
    {
        name: "Forest Green",
        background: `
            background: linear-gradient(135deg, #064e3b 0%, #065f46 25%, #047857 75%, #059669 100%);
            background-image: 
                linear-gradient(60deg, #10b98120 25%, transparent 25%),
                linear-gradient(120deg, #34d39915 25%, transparent 25%);
            background-size: 40px 40px;
        `,
        titleColor: "background: linear-gradient(135deg, #a7f3d0, #6ee7b7); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#d1fae5",
        footerColor: "#a7f3d0",
        accent: "#10b981"
    },
    {
        name: "Royal Purple",
        background: `
            background: linear-gradient(135deg, #581c87 0%, #7c3aed 50%, #a855f7 100%);
            background-image: 
                radial-gradient(circle at 40% 40%, #ffffff08 0%, transparent 50%),
                radial-gradient(circle at 60% 60%, #ddd6fe20 0%, transparent 50%);
        `,
        titleColor: "background: linear-gradient(135deg, #f3e8ff, #e9d5ff); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#f3e8ff",
        footerColor: "#ddd6fe",
        accent: "#a855f7"
    },
    {
        name: "Fire Red",
        background: `
            background: linear-gradient(135deg, #7f1d1d 0%, #dc2626 25%, #ef4444 75%, #f87171 100%);
            background-image: 
                linear-gradient(45deg, #fca5a520 25%, transparent 25%),
                linear-gradient(-45deg, #fca5a515 25%, transparent 25%);
            background-size: 30px 30px;
        `,
        titleColor: "background: linear-gradient(135deg, #fef2f2, #fee2e2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text;",
        textColor: "#fef2f2",
        footerColor: "#fca5a5",
        accent: "#ef4444"
    }
];

/**
 * Get theme based on day of year for consistency
 */
function getDailyTheme(): TemplateTheme {
    const now = new Date();
    const start = new Date(now.getFullYear(), 0, 0);
    const diff = now.getTime() - start.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    
    return DAILY_THEMES[dayOfYear % DAILY_THEMES.length];
}

/**
 * Generate dynamic template with today's theme - Single comprehensive image
 */
export async function generateDynamicTemplate(): Promise<void> {
    const theme = getDailyTheme();
    
    const template = `<!-- template.html - Comprehensive Educational Design with ${theme.name} theme -->
<!DOCTYPE html>
<html>
<head>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Inter', sans-serif;
            ${theme.background}
            color: ${theme.textColor};
            width: 1080px;
            height: 1080px;
            display: flex;
            flex-direction: column;
            position: relative;
            overflow: hidden;
            padding: 50px;
        }
        
        /* Animated background elements */
        body::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: 
                radial-gradient(circle at 30% 30%, ${theme.accent}10 0%, transparent 50%),
                radial-gradient(circle at 70% 70%, ${theme.accent}08 0%, transparent 50%);
            animation: rotate 30s linear infinite;
            z-index: -1;
        }
        
        @keyframes rotate {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        
        /* Header with title */
        .header {
            text-align: center;
            margin-bottom: 40px;
            z-index: 10;
        }
        
        .header h1 {
            font-size: 52px;
            font-weight: 800;
            line-height: 1.1;
            ${theme.titleColor}
            text-shadow: 0 4px 8px rgba(0,0,0,0.2);
            letter-spacing: -0.02em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            font-size: 18px;
            opacity: 0.8;
            font-weight: 500;
        }
        
        /* Main content area */
        .content-container {
            flex: 1;
            display: flex;
            flex-direction: column;
            justify-content: center;
            backdrop-filter: blur(10px);
            background: rgba(255, 255, 255, 0.05);
            border-radius: 25px;
            padding: 40px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
            position: relative;
        }
        
        /* Content sections */
        .content-section {
            margin-bottom: 30px;
        }
        
        .content-section:last-child {
            margin-bottom: 0;
        }
        
        .section-title {
            font-size: 22px;
            font-weight: 700;
            color: ${theme.accent};
            margin-bottom: 15px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .content-text {
            font-size: 20px;
            line-height: 1.4;
            font-weight: 500;
            color: ${theme.textColor};
            text-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        
        /* Key points styling */
        .key-points {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-top: 15px;
        }
        
        .key-point {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 18px;
            font-weight: 500;
            background: rgba(255, 255, 255, 0.08);
            padding: 12px 15px;
            border-radius: 12px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .key-point .icon {
            font-size: 20px;
            min-width: 24px;
        }
        
        /* Best practice box */
        .best-practice {
            background: linear-gradient(135deg, ${theme.accent}20, ${theme.accent}10);
            border: 2px solid ${theme.accent}40;
            border-radius: 15px;
            padding: 20px;
            margin-top: 20px;
        }
        
        .best-practice .title {
            font-size: 18px;
            font-weight: 700;
            color: ${theme.accent};
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .best-practice .text {
            font-size: 16px;
            font-weight: 500;
            line-height: 1.4;
        }
        
        /* Footer */
        .footer {
            position: absolute;
            bottom: 30px;
            left: 50px;
            right: 50px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 16px;
            font-weight: 600;
            color: ${theme.footerColor};
            opacity: 0.9;
        }
        
        .footer .brand {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .footer .category {
            font-size: 14px;
            padding: 6px 12px;
            background: ${theme.accent}20;
            border-radius: 20px;
            border: 1px solid ${theme.accent}30;
        }
        
        /* Decorative elements */
        .decoration {
            position: absolute;
            width: 80px;
            height: 80px;
            border: 2px solid ${theme.accent}25;
            border-radius: 50%;
            animation: pulse 4s ease-in-out infinite;
        }
        
        .decoration:nth-child(1) {
            top: 8%;
            right: 8%;
            animation-delay: 0s;
        }
        
        .decoration:nth-child(2) {
            bottom: 12%;
            left: 6%;
            animation-delay: 2s;
            transform: rotate(45deg);
        }
        
        @keyframes pulse {
            0%, 100% {
                transform: scale(1);
                opacity: 0.2;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.4;
            }
        }
        
        /* System Diagram Styles */
        .diagram-container {
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid rgba(255, 255, 255, 0.15);
            border-radius: 15px;
            padding: 20px;
            margin: 20px 0;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 300px;
        }
        
        .diagram-container svg {
            max-width: 100%;
            height: auto;
            filter: drop-shadow(0 4px 8px rgba(0,0,0,0.1));
        }
        
        .diagram-container svg text {
            fill: ${theme.textColor};
        }
        
        .diagram-container svg .diagram-title {
            fill: ${theme.accent};
            font-weight: 700;
        }
        
        .no-diagram {
            text-align: center;
            padding: 40px;
            color: ${theme.textColor};
            opacity: 0.7;
            font-style: italic;
        }
    </style>
</head>
<body>
    <div class="decoration"></div>
    <div class="decoration"></div>
    
    <div class="header">
        <h1>{{TITLE}}</h1>
        <div class="subtitle">Essential Knowledge for Modern Developers</div>
    </div>
    
    <div class="content-container">
        {{COMPREHENSIVE_CONTENT}}
    </div>
    
    <div class="footer">
        <div class="brand">
            <span>💻</span>
            <span>Tech Knowledge Daily</span>
        </div>
        <div class="category">{{CATEGORY}}</div>
    </div>
</body>
</html>`;

    await fs.writeFile('template.html', template);
    console.log(`🎨 Generated comprehensive template with "${theme.name}" theme`);
}

// Export for use in main generator
export { getDailyTheme };
