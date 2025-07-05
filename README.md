# 🚀 LinkedIn Content Automation Engine

An intelligent content generation system that creates 2 daily LinkedIn posts with:
- **System Design Diagrams** with icons and arrows (like KodeKloud style)
- **Educational Programming Content** covering latest tech topics
- **Dynamic Visual Themes** that change daily
- **AI-Powered Content** using Google Gemini 2.5 Pro

## 📊 Current API Usage Status

![API Usage](https://img.shields.io/badge/Daily%20Requests-0%2F50-green)
![Token Usage](https://img.shields.io/badge/Daily%20Tokens-0%2F32%2C000-green)
![Status](https://img.shields.io/badge/Status-Active-brightgreen)

**Last Updated:** Never

## ✨ Features

- 🎨 **System Architecture Diagrams** - Interactive diagrams with server, client, API, middleware icons
- 📚 **Educational Content** - React, Node.js, TypeScript, System Design topics
- 🌈 **Dynamic Themes** - 12+ professional themes that rotate daily
- 📱 **LinkedIn-Ready** - Single comprehensive images optimized for LinkedIn
- 📊 **Usage Monitoring** - Real-time API usage tracking
- ⚡ **Automated** - Runs daily via GitHub Actions

## 🚀 Quick Start

1. **Clone & Install:**
   ```bash
   git clone https://github.com/grajrb/Linkdlen-Automation.git
   cd Linkdlen-Automation
   npm install
   ```

2. **Configure Environment:**
   ```bash
   cp .env.example .env
   # Add your GEMINI_API_KEY from Google AI Studio
   ```

3. **Generate Content:**
   ```bash
   npm run generate
   ```

## 🔧 GitHub Actions Setup

### 1. Repository Secrets
Add these secrets in `Settings > Secrets and variables > Actions`:

| Secret Name | Description | How to Get |
|-------------|-------------|------------|
| `GEMINI_API_KEY` | Google Gemini API Key | [Get from Google AI Studio](https://aistudio.google.com/app/apikey) |

### 2. Monitoring API Usage

You can monitor your API usage directly from GitHub:

#### 📈 In GitHub Actions
- Go to `Actions` tab
- Check the latest run logs
- View usage stats in the workflow output

#### 📊 In Repository
- Check the badges at the top of this README
- API usage is automatically updated after each run
- View detailed reports in the `Actions` artifacts

#### 🚨 Alerts
- Automatic GitHub issues are created when API limits are reached
- Workflow status shows red/green based on API availability
- Email notifications for failed runs (configure in Settings)

### 3. Schedule Configuration

The workflow runs:
- **Daily at 8:00 AM UTC** (automatic)
- **Manual trigger** available in Actions tab
- **On push** to main branch (for testing)

To change the schedule, edit `.github/workflows/daily-content-generation.yml`:
```yaml
schedule:
  - cron: '0 8 * * *'  # Change time here (UTC)
```

## 📁 Output Structure

Each run creates a `content_YYYY-MM-DD` folder with:
```
content_2025-07-05/
├── post_1.png              # System design diagram image
├── post_1_content.txt       # LinkedIn post text + instructions
├── post_2.png              # Educational content image  
└── post_2_content.txt       # LinkedIn post text + instructions
```

## 🎨 Sample Outputs

### System Design Diagrams Include:
- **Microservices Architecture** with API Gateway, services, databases
- **Load Balancing** with multiple servers and routing
- **Caching Strategies** with Redis and database fallbacks
- **Message Queues** with producer/consumer patterns
- **Database Sharding** with shard routing logic

### Educational Topics Cover:
- React.js, Next.js, TypeScript
- Node.js, Express.js, GraphQL
- PostgreSQL, MongoDB, Redis
- System Design, DevOps, Docker

## 🔍 Monitoring & Alerts

### Real-time Monitoring
```bash
# Check current usage
npx ts-node -e "import('./api-usage-monitor').then(m => m.displayUsageStats())"

# View usage history
cat api-usage.json
```

### GitHub Integration
- **Commit Status**: Shows API usage percentage
- **Issues**: Auto-created when limits reached
- **Artifacts**: Download generated content
- **README Badges**: Live usage indicators

## 🛠️ Customization

### Add New Topics
Edit `PROGRAMMING_TOPICS` in `programming-content.ts`:
```typescript
{
    category: "Your Category",
    technology: "Your Technology", 
    concepts: ["Concept 1", "Concept 2"],
    hashtags: ["#YourTag", "#Technology"]
}
```

### Modify Themes
Edit `DAILY_THEMES` in `template-generator.ts` to add new visual themes.

### Adjust API Limits
Modify limits in `api-usage-monitor.ts` if you have a paid plan.

## 📊 API Usage Guidelines

**Gemini Free Tier Limits:**
- 50 requests per day
- 32,000 tokens per day
- 15 requests per minute

**This App Usage:**
- 2 requests per day (well within limits)
- ~1,500 tokens per day (5% of limit)
- Automatic monitoring and alerts

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test locally with `npm run generate`
5. Submit a pull request

## 📜 License

MIT License - feel free to use for your own LinkedIn automation!

---

**⭐ Star this repo if it helps you create amazing LinkedIn content!**
- Consider using LinkedIn's official API for production use

## Troubleshooting

- Check GitHub Actions logs for errors
- Debug screenshots are saved on failure
- Ensure Gemini API key has sufficient quota

