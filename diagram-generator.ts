/**
 * System Design Diagram Generator
 * Creates SVG-based system architecture diagrams with icons and arrows
 */

export interface DiagramElement {
    type: 'component' | 'arrow' | 'label';
    id: string;
    x: number;
    y: number;
    width?: number;
    height?: number;
    icon?: string;
    label?: string;
    color?: string;
    style?: string;
}

export interface SystemDiagram {
    title: string;
    elements: DiagramElement[];
    connections: Array<{
        from: string;
        to: string;
        label?: string;
        style?: 'solid' | 'dashed' | 'dotted';
        color?: string;
    }>;
}

// Icon definitions for common system components
const SYSTEM_ICONS = {
    client: `<path d="M3 4a1 1 0 011-1h16a1 1 0 011 1v12a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm2 1v10h14V5H5zm2 2h10v2H7V7zm0 4h6v2H7v-2z"/>`,
    server: `<path d="M4 6h16v2H4V6zm0 5h16v2H4v-2zm0 5h16v2H4v-2zm2-8h1v1H6V8zm0 5h1v1H6v-1zm0 5h1v1H6v-1z"/>`,
    database: `<path d="M12 2C8.5 2 5 3.5 5 5.5v13C5 20.5 8.5 22 12 22s7-1.5 7-3.5v-13C19 3.5 15.5 2 12 2zm0 2c2.5 0 5 1 5 1.5S14.5 7 12 7s-5-1-5-1.5S9.5 4 12 4zm0 14c-2.5 0-5-1-5-1.5v-2c1.5 1 3.5 1.5 5 1.5s3.5-.5 5-1.5v2c0 .5-2.5 1.5-5 1.5z"/>`,
    api: `<path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>`,
    loadbalancer: `<path d="M3 12h4l3-3 3 3h4m-4 0l3 3-3 3m-8-6l-3-3 3-3"/>`,
    cache: `<path d="M19.07 4.93A10 10 0 006.93 17.07 10 10 0 0019.07 4.93zM12 2a10 10 0 00-7.07 17.07A10 10 0 1012 2z"/>`,
    queue: `<path d="M3 6h18v2H3V6zm0 5h18v2H3v-2zm0 5h18v2H3v-2z"/>`,
    cdn: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>`,
    microservice: `<path d="M4 4h4v4H4V4zm6 0h4v4h-4V4zm6 0h4v4h-4V4zM4 10h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4zM4 16h4v4H4v-4zm6 0h4v4h-4v-4zm6 0h4v4h-4v-4z"/>`,
    middleware: `<path d="M12 2L2 7v10c0 5.55 3.84 9.74 9 10.93 5.16-1.19 9-5.38 9-10.93V7l-10-5z"/>`,
    network: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zM8.5 7.5a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm-7 9a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0zm7 0a1.5 1.5 0 113 0 1.5 1.5 0 01-3 0z"/>`,
    monitoring: `<path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>`,
    security: `<path d="M12 1L3 5v6c0 5.55 3.84 9.74 9 9.74s9-4.19 9-9.74V5l-9-4z"/>`,
    auth: `<path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.66 13.66 9 12 9S9 7.66 9 6V4L3 7V9C3 11.21 4.79 13 7 13V20C7 21.1 7.9 22 9 22H15C16.1 22 17 21.1 17 20V13C19.21 13 21 11.21 21 9Z"/>`,
    storage: `<path d="M2 20h20v-4H2v4zm2-3h2v2H4v-2zM2 4v4h20V4H2zm4 3H4V5h2v2zm-2 5h20v4H2v-4zm2 3h2v2H4v-2z"/>`
};

const DIAGRAM_COLORS = {
    client: '#3b82f6',      // Blue
    server: '#10b981',      // Green
    database: '#f59e0b',    // Amber
    api: '#8b5cf6',         // Purple
    loadbalancer: '#ef4444', // Red
    cache: '#06b6d4',       // Cyan
    queue: '#f97316',       // Orange
    cdn: '#84cc16',         // Lime
    microservice: '#ec4899', // Pink
    middleware: '#6366f1',   // Indigo
    network: '#64748b',     // Slate
    monitoring: '#14b8a6',  // Teal
    security: '#dc2626',    // Red
    auth: '#7c3aed',        // Violet
    storage: '#059669'      // Emerald
};

/**
 * Generate SVG for a system component with improved styling
 */
function generateComponentSVG(element: DiagramElement): string {
    const color = element.color || DIAGRAM_COLORS[element.icon as keyof typeof DIAGRAM_COLORS] || '#64748b';
    const iconPath = SYSTEM_ICONS[element.icon as keyof typeof SYSTEM_ICONS] || SYSTEM_ICONS.server;
    
    return `
        <g id="${element.id}" transform="translate(${element.x}, ${element.y + 40})">
            <!-- Component background with gradient -->
            <rect x="-28" y="-28" width="56" height="56" 
                  rx="12" fill="url(#gradient-${element.id})" 
                  stroke="${color}" stroke-width="2" class="component-bg"/>
            
            <!-- Gradient definition -->
            <defs>
                <linearGradient id="gradient-${element.id}" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style="stop-color:${color}15;stop-opacity:1" />
                    <stop offset="100%" style="stop-color:${color}08;stop-opacity:1" />
                </linearGradient>
            </defs>
            
            <!-- Icon -->
            <svg x="-14" y="-14" width="28" height="28" viewBox="0 0 24 24" fill="${color}" class="component-icon">
                ${iconPath}
            </svg>
            
            <!-- Label -->
            <text x="0" y="50" class="component-label" fill="${color}">
                ${element.label || element.id}
            </text>
        </g>
    `;
}

/**
 * Generate SVG for an arrow connection with improved styling
 */
function generateArrowSVG(from: DiagramElement, to: DiagramElement, connection: any): string {
    const color = connection.color || '#6366f1';
    const strokeDasharray = connection.style === 'dashed' ? '6,4' : 
                           connection.style === 'dotted' ? '2,3' : 'none';
    
    // Adjust positions for new component layout (y + 40)
    const fromY = from.y + 40;
    const toY = to.y + 40;
    
    // Calculate arrow path
    const dx = to.x - from.x;
    const dy = toY - fromY;
    const angle = Math.atan2(dy, dx);
    
    // Start from edge of component (30px radius for new size)
    const startX = from.x + Math.cos(angle) * 35;
    const startY = fromY + Math.sin(angle) * 35;
    
    // End at edge of component
    const endX = to.x - Math.cos(angle) * 35;
    const endY = toY - Math.sin(angle) * 35;
    
    // Arrow head points
    const arrowSize = 10;
    const arrowX1 = endX - arrowSize * Math.cos(angle - Math.PI / 6);
    const arrowY1 = endY - arrowSize * Math.sin(angle - Math.PI / 6);
    const arrowX2 = endX - arrowSize * Math.cos(angle + Math.PI / 6);
    const arrowY2 = endY - arrowSize * Math.sin(angle + Math.PI / 6);
    
    return `
        <g class="arrow-line">
            <!-- Arrow line with improved styling -->
            <line x1="${startX}" y1="${startY}" x2="${endX}" y2="${endY}" 
                  stroke="${color}" stroke-width="2.5" stroke-dasharray="${strokeDasharray}"
                  stroke-linecap="round"/>
            
            <!-- Arrow head -->
            <polygon points="${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}" 
                     fill="${color}"/>
            
            <!-- Connection label with background -->
            ${connection.label ? `
                <g>
                    <rect x="${(startX + endX) / 2 - connection.label.length * 3}" 
                          y="${(startY + endY) / 2 - 12}" 
                          width="${connection.label.length * 6}" height="16" 
                          rx="8" fill="rgba(255,255,255,0.9)" stroke="${color}" stroke-width="1"/>
                    <text x="${(startX + endX) / 2}" y="${(startY + endY) / 2 - 2}" 
                          text-anchor="middle" font-family="Inter, sans-serif" 
                          font-size="9" font-weight="600" fill="${color}">
                        ${connection.label}
                    </text>
                </g>
            ` : ''}
        </g>
    `;
}

/**
 * Generate complete system diagram SVG with improved styling
 */
export function generateSystemDiagramSVG(diagram: SystemDiagram): string {
    const components = diagram.elements.filter(e => e.type === 'component');
    const componentMap = new Map(components.map(c => [c.id, c]));
    
    // Generate component SVGs
    const componentSVGs = components.map(generateComponentSVG).join('\n');
    
    // Generate arrow SVGs
    const arrowSVGs = diagram.connections
        .map(conn => {
            const from = componentMap.get(conn.from);
            const to = componentMap.get(conn.to);
            if (!from || !to) return '';
            return generateArrowSVG(from, to, conn);
        })
        .join('\n');
    
    return `
        <svg width="420" height="320" viewBox="0 0 420 320" 
             xmlns="http://www.w3.org/2000/svg" style="background: transparent;">
            <defs>
                <style>
                    .diagram-title { 
                        font-family: Inter, sans-serif; 
                        font-size: 16px; 
                        font-weight: 700; 
                        fill: currentColor; 
                        text-anchor: middle;
                    }
                    .component-bg {
                        filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
                    }
                    .component-icon {
                        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2));
                    }
                    .component-label {
                        font-family: Inter, sans-serif; 
                        font-size: 11px; 
                        font-weight: 600;
                        text-anchor: middle;
                    }
                    .arrow-line {
                        filter: drop-shadow(0 1px 2px rgba(0,0,0,0.1));
                    }
                </style>
            </defs>
            
            <!-- Background -->
            <rect width="100%" height="100%" fill="rgba(255,255,255,0.02)" rx="12"/>
            
            <!-- Title -->
            <text x="210" y="30" class="diagram-title">
                ${diagram.title}
            </text>
            
            <!-- Arrows (behind components) -->
            ${arrowSVGs}
            
            <!-- Components (on top) -->
            ${componentSVGs}
        </svg>
    `;
}

/**
 * Generate predefined system architecture diagrams based on topic
 */
export function generateSystemDiagram(topic: string, concept: string): SystemDiagram | null {
    const topicLower = topic.toLowerCase();
    const conceptLower = concept.toLowerCase();
    
    // Microservices Architecture - Better spacing
    if (topicLower.includes('microservice') || conceptLower.includes('microservice')) {
        return {
            title: 'Microservices Architecture',
            elements: [
                { type: 'component', id: 'client', x: 80, y: 80, icon: 'client', label: 'Client' },
                { type: 'component', id: 'gateway', x: 240, y: 80, icon: 'api', label: 'API Gateway' },
                { type: 'component', id: 'auth', x: 160, y: 160, icon: 'auth', label: 'Auth Service' },
                { type: 'component', id: 'user', x: 240, y: 160, icon: 'microservice', label: 'User Service' },
                { type: 'component', id: 'order', x: 320, y: 160, icon: 'microservice', label: 'Order Service' },
                { type: 'component', id: 'db1', x: 200, y: 240, icon: 'database', label: 'User DB' },
                { type: 'component', id: 'db2', x: 280, y: 240, icon: 'database', label: 'Order DB' }
            ],
            connections: [
                { from: 'client', to: 'gateway', label: 'HTTPS' },
                { from: 'gateway', to: 'auth', label: 'validate' },
                { from: 'gateway', to: 'user', label: 'route' },
                { from: 'gateway', to: 'order', label: 'route' },
                { from: 'user', to: 'db1', label: 'query' },
                { from: 'order', to: 'db2', label: 'query' }
            ]
        };
    }
    
    // Load Balancing - Better vertical spacing
    if (conceptLower.includes('load balan') || conceptLower.includes('scaling')) {
        return {
            title: 'Load Balancing Strategy',
            elements: [
                { type: 'component', id: 'client', x: 80, y: 80, icon: 'client', label: 'Client' },
                { type: 'component', id: 'lb', x: 240, y: 80, icon: 'loadbalancer', label: 'Load Balancer' },
                { type: 'component', id: 'server1', x: 160, y: 180, icon: 'server', label: 'Server 1' },
                { type: 'component', id: 'server2', x: 240, y: 180, icon: 'server', label: 'Server 2' },
                { type: 'component', id: 'server3', x: 320, y: 180, icon: 'server', label: 'Server 3' },
                { type: 'component', id: 'db', x: 240, y: 260, icon: 'database', label: 'Database' }
            ],
            connections: [
                { from: 'client', to: 'lb', label: 'request' },
                { from: 'lb', to: 'server1', label: 'route' },
                { from: 'lb', to: 'server2', label: 'route' },
                { from: 'lb', to: 'server3', label: 'route' },
                { from: 'server1', to: 'db', label: 'query' },
                { from: 'server2', to: 'db', label: 'query' },
                { from: 'server3', to: 'db', label: 'query' }
            ]
        };
    }
    
    // Caching Strategy - Improved layout
    if (conceptLower.includes('cach') || conceptLower.includes('redis')) {
        return {
            title: 'Caching Architecture',
            elements: [
                { type: 'component', id: 'client', x: 80, y: 120, icon: 'client', label: 'Client' },
                { type: 'component', id: 'server', x: 200, y: 120, icon: 'server', label: 'Server' },
                { type: 'component', id: 'cache', x: 320, y: 80, icon: 'cache', label: 'Redis Cache' },
                { type: 'component', id: 'db', x: 320, y: 160, icon: 'database', label: 'Database' }
            ],
            connections: [
                { from: 'client', to: 'server', label: 'request' },
                { from: 'server', to: 'cache', label: 'check cache' },
                { from: 'server', to: 'db', label: 'fallback', style: 'dashed' },
                { from: 'cache', to: 'server', label: 'cached data', style: 'dashed' }
            ]
        };
    }
    
    // Message Queue - Better spacing
    if (conceptLower.includes('queue') || conceptLower.includes('async') || conceptLower.includes('message')) {
        return {
            title: 'Message Queue Pattern',
            elements: [
                { type: 'component', id: 'producer', x: 80, y: 120, icon: 'server', label: 'Producer' },
                { type: 'component', id: 'queue', x: 200, y: 120, icon: 'queue', label: 'Message Queue' },
                { type: 'component', id: 'consumer1', x: 320, y: 80, icon: 'server', label: 'Consumer 1' },
                { type: 'component', id: 'consumer2', x: 320, y: 160, icon: 'server', label: 'Consumer 2' },
                { type: 'component', id: 'db', x: 240, y: 220, icon: 'database', label: 'Database' }
            ],
            connections: [
                { from: 'producer', to: 'queue', label: 'publish' },
                { from: 'queue', to: 'consumer1', label: 'consume' },
                { from: 'queue', to: 'consumer2', label: 'consume' },
                { from: 'consumer1', to: 'db', label: 'store' },
                { from: 'consumer2', to: 'db', label: 'store' }
            ]
        };
    }
    
    // API Gateway Pattern - Fixed overlapping
    if (conceptLower.includes('api') || conceptLower.includes('gateway') || conceptLower.includes('routing')) {
        return {
            title: 'API Gateway Pattern',
            elements: [
                { type: 'component', id: 'mobile', x: 80, y: 80, icon: 'client', label: 'Mobile App' },
                { type: 'component', id: 'web', x: 80, y: 160, icon: 'client', label: 'Web App' },
                { type: 'component', id: 'gateway', x: 240, y: 120, icon: 'api', label: 'API Gateway' },
                { type: 'component', id: 'service1', x: 360, y: 80, icon: 'microservice', label: 'Service A' },
                { type: 'component', id: 'service2', x: 360, y: 160, icon: 'microservice', label: 'Service B' }
            ],
            connections: [
                { from: 'mobile', to: 'gateway', label: 'API calls' },
                { from: 'web', to: 'gateway', label: 'API calls' },
                { from: 'gateway', to: 'service1', label: 'route' },
                { from: 'gateway', to: 'service2', label: 'route' }
            ]
        };
    }
    
    // Database Sharding - Better layout
    if (conceptLower.includes('shard') || conceptLower.includes('partition') || conceptLower.includes('database')) {
        return {
            title: 'Database Sharding',
            elements: [
                { type: 'component', id: 'app', x: 120, y: 80, icon: 'server', label: 'Application' },
                { type: 'component', id: 'router', x: 240, y: 80, icon: 'middleware', label: 'Shard Router' },
                { type: 'component', id: 'shard1', x: 160, y: 180, icon: 'database', label: 'Shard 1' },
                { type: 'component', id: 'shard2', x: 240, y: 180, icon: 'database', label: 'Shard 2' },
                { type: 'component', id: 'shard3', x: 320, y: 180, icon: 'database', label: 'Shard 3' }
            ],
            connections: [
                { from: 'app', to: 'router', label: 'query' },
                { from: 'router', to: 'shard1', label: 'route by key' },
                { from: 'router', to: 'shard2', label: 'route by key' },
                { from: 'router', to: 'shard3', label: 'route by key' }
            ]
        };
    }
    
    return null;
}
