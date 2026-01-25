// RoomAssets - Cohesive Isometric Room Design with Depth Integration

// Depth-aware floor with subtle perspective
export function RoomFloor() {
  return (
    <defs>
      {/* Warm wooden floor with depth gradient */}
      <linearGradient id="floorGradient" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stopColor="#d4a86a" stopOpacity="1" />
        <stop offset="50%" stopColor="#c9a86c" stopOpacity="1" />
        <stop offset="100%" stopColor="#b8956e" stopOpacity="1" />
      </linearGradient>

      {/* Subtle floor texture */}
      <pattern id="floorPlanks" width="80" height="120" patternUnits="userSpaceOnUse">
        <rect width="80" height="120" fill="url(#floorGradient)" />
        <g stroke="#a08060" strokeWidth="0.5" opacity="0.4">
          <line x1="40" y1="0" x2="40" y2="120" />
          <line x1="0" y1="60" x2="80" y2="60" />
          <path d="M0 10 Q40 15 80 10" strokeWidth="0.3" fill="none" />
          <path d="M0 90 Q40 95 80 90" strokeWidth="0.3" fill="none" />
        </g>
      </pattern>

      {/* Perspective floor shadow gradient */}
      <radialGradient id="floorShadow" cx="50%" cy="100%" r="100%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.15" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>
    </defs>
  );
}

// Back wall with atmospheric perspective
export function BackWall({ width = 700 }: { width?: number }) {
  return (
    <g>
      {/* Main wall with subtle gradient for depth */}
      <rect x="0" y="0" width={width} height="85" fill="#e8dcc8" />

      {/* Wall texture - very subtle plaster look */}
      <rect x="0" y="0" width={width} height="85" fill="#e0d4bc" opacity="0.3" />

      {/* Subtle perspective lines for depth */}
      <g stroke="#d4c4a8" strokeWidth="0.5" opacity="0.4">
        {[100, 200, 300, 400, 500, 600].map(x => (
          <line key={x} x1={x} y1="0" x2={x - 30} y2="85" />
        ))}
      </g>

      {/* Wall shadow at bottom for wall-floor junction */}
      <rect x="0" y="80" width={width} height="6" fill="#000" opacity="0.08" />

      {/* Baseboard */}
      <rect x="0" y="80" width={width} height="12" fill="#c9a86c" />
      <rect x="0" y="80" width={width} height="4" fill="#deb887" />

      {/* Decorative picture frame with depth */}
      <g transform="translate(380, 12)">
        {/* Frame shadow */}
        <rect x="3" y="3" width="100" height="65" fill="#000" opacity="0.15" rx="2" />
        {/* Frame outer */}
        <rect x="0" y="0" width="100" height="65" fill="#8b7355" rx="3" />
        {/* Frame inner */}
        <rect x="5" y="5" width="90" height="55" fill="#f5f5dc" rx="2" />
        {/* Picture content */}
        <rect x="8" y="8" width="84" height="49" fill="#87CEEB" rx="1" />
        {/* Simple landscape */}
        <rect x="8" y="40" width="84" height="17" fill="#90EE90" rx="1" />
        <circle cx="75" cy="25" r="10" fill="#FFD700" opacity="0.8" />
        {/* Glass reflection */}
        <path d="M8 8 L50 8 L8 50 Z" fill="#fff" opacity="0.15" />
      </g>

      {/* Wall lamp with warm glow */}
      <g transform="translate(280, 25)">
        {/* Lamp glow on wall */}
        <ellipse cx="15" cy="30" rx="25" ry="20" fill="#ffe4b5" opacity="0.2" />
        {/* Wall mount */}
        <rect x="12" y="0" width="6" height="12" fill="#b87333" />
        {/* Lamp shade */}
        <ellipse cx="15" cy="15" rx="14" ry="10" fill="#f5e6d3" />
        <ellipse cx="15" cy="18" rx="10" ry="6" fill="#fff8dc" opacity="0.5" />
        {/* Light bulb hint */}
        <circle cx="15" cy="20" r="4" fill="#fffacd" opacity="0.6" />
      </g>
    </g>
  );
}

// Side walls with proper perspective
export function SideWalls({ width = 700, height = 550 }: { width?: number; height?: number }) {
  return (
    <g>
      {/* Left wall */}
      <polygon
        points={`0,85 35,85 35,${height - 20} 0,${height - 35}`}
        fill="#d4c4a8"
      />
      {/* Left wall shadow */}
      <polygon
        points={`32,85 35,85 35,${height - 20} 32,${height - 23}`}
        fill="#000"
        opacity="0.06"
      />

      {/* Right wall */}
      <polygon
        points={`${width - 35},85 ${width},85 ${width},${height - 35} ${width - 35},${height - 20}`}
        fill="#d4c4a8"
      />
      {/* Right wall shadow */}
      <polygon
        points={`${width - 32},85 ${width - 35},85 ${width - 35},${height - 20} ${width - 32},${height - 23}`}
        fill="#000"
        opacity="0.06"
      />

      {/* Left baseboard */}
      <polygon
        points={`0,${height - 35} 5,${height - 30} 5,${height - 15} 0,${height - 20}`}
        fill="#c9a86c"
      />
      <polygon
        points={`0,${height - 35} 5,${height - 32} 5,${height - 17} 0,${height - 20}`}
        fill="#deb887"
      />

      {/* Right baseboard */}
      <polygon
        points={`${width},${height - 35} ${width - 5},${height - 30} ${width - 5},${height - 15} ${width},${height - 20}`}
        fill="#c9a86c"
      />
      <polygon
        points={`${width},${height - 35} ${width - 5},${height - 32} ${width - 5},${height - 17} ${width},${height - 20}`}
        fill="#deb887"
      />

      {/* Corner posts */}
      <polygon
        points={`0,75 12,80 12,${height - 30} 0,${height - 35}`}
        fill="#c9a86c"
      />
      <polygon
        points={`${width},75 ${width - 12},80 ${width - 12},${height - 30} ${width},${height - 35}`}
        fill="#c9a86c"
      />
    </g>
  );
}

// Window with outside view and depth
export function Window({ x, y, width = 120, height = 70 }: { x: number; y: number; width?: number; height?: number }) {
  return (
    <g>
      {/* Window frame shadow */}
      <rect x={x + 3} y={y + 3} width={width} height={height} fill="#000" opacity="0.2" rx="4" />

      {/* Outside view through window */}
      <rect x={x + 6} y={y + 6} width={width - 12} height={height - 12} fill="#87CEEB" rx="2" />

      {/* Sky gradient */}
      <rect x={x + 6} y={y + 6} width={width - 12} height={(height - 12) / 2} fill="#b0e0e6" rx="2" />

      {/* Ground/grass visible */}
      <rect x={x + 6} y={y + (height - 12) / 2 + 2} width={width - 12} height={(height - 12) / 2 - 2} fill="#90EE90" rx="2" />

      {/* Simple cloud */}
      <ellipse cx={x + width * 0.3} cy={y + 22} rx="15" ry="8" fill="#fff" opacity="0.8" />
      <ellipse cx={x + width * 0.4} cy={y + 20} rx="12" ry="6" fill="#fff" opacity="0.8" />

      {/* Sun */}
      <circle cx={x + width * 0.75} cy={y + 25} r="8" fill="#FFD700" opacity="0.9" />

      {/* Window frame */}
      <rect x={x} y={y} width={width} height={height} fill="#5c4a3d" rx="4" />
      <rect x={x + 4} y={y + 4} width={width - 8} height={height - 8} fill="#2a2a2a" rx="2" />

      {/* Window cross */}
      <rect x={x + width/2 - 2} y={y + 4} width="4" height={height - 8} fill="#5c4a3d" />
      <rect x={x + 4} y={y + height/2 - 2} width={width - 8} height="4" fill="#5c4a3d" />

      {/* Glass reflection */}
      <path
        d={`M${x + 8} ${y + height/2 + 5} L${x + width/2} ${y + 10} L${x + width/2} ${y + 25} Z`}
        fill="#fff"
        opacity="0.15"
      />

      {/* Window sill */}
      <rect x={x - 5} y={y + height - 2} width={width + 10} height="8" fill="#8b7355" rx="2" />
      <rect x={x - 5} y={y + height - 2} width={width + 10} height="3" fill="#a08060" rx="2" />

      {/* Curtains */}
      <path
        d={`M${x - 8} ${y - 5} Q${x + 10} ${y + 20} ${x - 8} ${y + height + 5} L${x + 5} ${y + height/2} Z`}
        fill="#d4a574"
      />
      <path
        d={`M${x + width + 8} ${y - 5} Q${x + width - 10} ${y + 20} ${x + width + 8} ${y + height + 5} L${x + width - 5} ${y + height/2} Z`}
        fill="#d4a574"
      />
    </g>
  );
}

// Sisal pattern for cat tree
export function SisalPattern() {
  return (
    <pattern id="sisalPattern" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="#c9a86c" />
      <path d="M0 2 L4 2 M2 0 L2 4" stroke="#b8956e" strokeWidth="0.5" />
    </pattern>
  );
}

// Cat Tree - Multi-tier tower with depth
export function CatTree({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Shadow on floor */}
      <ellipse cx={x + 45} cy={y + 110} rx="55" ry="15" fill="#000" opacity="0.15" />

      {/* Base platform - lower layer */}
      <ellipse cx={x + 45} cy={y + 105} rx="52" ry="22" fill="#8b7355" />
      <ellipse cx={x + 45} cy={y + 100} rx="48" ry="20" fill="#a08060" />

      {/* Center post with sisal */}
      <rect x={x + 38} y={y + 20} width="14" height="85" fill="#c9a86c" />
      <rect x={x + 38} y={y + 20} width="14" height="85" fill="url(#sisalPattern)" />

      {/* Platform 1 */}
      <ellipse cx={x + 45} cy={y + 75} rx="38" ry="16" fill="#8b7355" />
      <ellipse cx={x + 45} cy={y + 72} rx="35" ry="14" fill="#a08060" />

      {/* Platform 2 */}
      <ellipse cx={x + 45} cy={y + 48} rx="32" ry="14" fill="#8b7355" />
      <ellipse cx={x + 45} cy={y + 45} rx="29" ry="12" fill="#a08060" />

      {/* Top platform */}
      <ellipse cx={x + 45} cy={y + 22} rx="28" ry="12" fill="#8b7355" />
      <ellipse cx={x + 45} cy={y + 19} rx="25" ry="10" fill="#a08060" />

      {/* Rope detail - front */}
      <g stroke="#c9a86c" strokeWidth="2" strokeLinecap="round">
        {[0, 5, 10, 15, 20, 25, 30].map(i => (
          <line key={i} x1={x + 39 + i} y1={y + 22} x2={x + 39 + i} y2={y + 100} />
        ))}
      </g>

      {/* Hanging toy */}
      <g>
        <line x1={x + 60} y1={y + 22} x2={x + 68} y2={y + 45} stroke="#ff6b6b" strokeWidth="2" />
        <circle cx={x + 70} cy={y + 48} r="6" fill="#ff6b6b" />
        <circle cx={x + 68} cy={y + 46} r="2" fill="#fff" opacity="0.4" />
      </g>

      {/* Perch edges for depth */}
      <ellipse cx={x + 45} cy={y + 100} rx="48" ry="20" fill="none" stroke="#7a6548" strokeWidth="1" />
      <ellipse cx={x + 45} cy={y + 72} rx="35" ry="14" fill="none" stroke="#7a6548" strokeWidth="1" />
      <ellipse cx={x + 45} cy={y + 45} rx="29" ry="12" fill="none" stroke="#7a6548" strokeWidth="1" />
      <ellipse cx={x + 45} cy={y + 19} rx="25" ry="10" fill="none" stroke="#7a6548" strokeWidth="1" />
    </g>
  );
}

// Food Bowl with depth
export function FoodBowl({ x, y, fillLevel = 0, isEmpty = true }: { x: number; y: number; fillLevel?: number; isEmpty?: boolean }) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx={x + 28} cy={y + 33} rx="30" ry="10" fill="#000" opacity="0.15" />

      {/* Bowl outer */}
      <ellipse cx={x + 28} cy={y + 28} rx="28" ry="11" fill="#f5f5f5" stroke="#ddd" strokeWidth="1" />
      <ellipse cx={x + 28} cy={y + 26} rx="25" ry="9" fill="#e8e8e8" />

      {/* Bowl inner */}
      <ellipse cx={x + 28} cy={y + 24} rx="20" ry="8" fill="#e8d5c4" />

      {/* Food fill */}
      {!isEmpty && fillLevel > 0 && (
        <g>
          <ellipse cx={x + 28} cy={y + 21} rx="18" ry="6" fill="#8B4513" />
          <ellipse cx={x + 28} cy={y + 20} rx="16" ry="5" fill="#a0522d" />
          {/* Food texture */}
          {[0, 1, 2, 3, 4].map(i => (
            <circle
              key={i}
              cx={x + 22 + (i % 3) * 6}
              cy={y + 18 + Math.floor(i/3) * 5}
              r="2.5"
              fill="#6b3e0a"
              opacity="0.4"
            />
          ))}
        </g>
      )}

      {/* Bowl rim highlight */}
      <ellipse cx={x + 28} cy={y + 22} rx="18" ry="6" fill="none" stroke="#fff" strokeWidth="1" opacity="0.4" />
    </g>
  );
}

// Water Bowl with depth
export function WaterBowl({ x, y, fillLevel = 100 }: { x: number; y: number; fillLevel?: number }) {
  const waterHeight = (fillLevel / 100) * 7;

  return (
    <g>
      {/* Shadow */}
      <ellipse cx={x + 28} cy={y + 33} rx="30" ry="10" fill="#000" opacity="0.15" />

      {/* Bowl outer */}
      <ellipse cx={x + 28} cy={y + 28} rx="28" ry="11" fill="#e0e0e0" stroke="#ccc" strokeWidth="1" />
      <ellipse cx={x + 28} cy={y + 26} rx="25" ry="9" fill="#d8d8d8" />

      {/* Bowl inner */}
      <ellipse cx={x + 28} cy={y + 24} rx="20" ry="8" fill="#c9d6df" />

      {/* Water */}
      {fillLevel > 0 && (
        <g>
          <ellipse cx={x + 28} cy={y + 23 - waterHeight/2} rx="18" ry={waterHeight + 4} fill="#4a90d9" />
          {/* Water surface */}
          <ellipse cx={x + 28} cy={y + 20} rx="17" ry="5" fill="#6bb3e8" />
          {/* Water shine */}
          <ellipse cx={x + 24} cy={y + 19} rx="5" ry="2.5" fill="#fff" opacity="0.35" />
        </g>
      )}

      {/* Glass rim highlight */}
      <ellipse cx={x + 28} cy={y + 22} rx="18" ry="6" fill="none" stroke="#fff" strokeWidth="2" opacity="0.25" />
    </g>
  );
}

// Patterned Rug with depth
export function Rug({ x, y, width = 160, height = 110, color = "#8B0000" }: { x: number; y: number; width?: number; height?: number; color?: string }) {
  return (
    <g>
      {/* Rug shadow */}
      <rect x={x + 5} y={y + 5} width={width} height={height} rx="8" fill="#000" opacity="0.12" />

      {/* Main rug body */}
      <rect x={x} y={y} width={width} height={height} rx="8" fill={color} />

      {/* Rug texture overlay */}
      <rect x={x} y={y} width={width} height={height} rx="8" fill="url(#rugTexture)" opacity="0.3" />

      {/* Border */}
      <rect x={x + 8} y={y + 8} width={width - 16} height={height - 16} rx="5" fill="none" stroke="#d4a574" strokeWidth="4" />

      {/* Inner decorative border */}
      <rect x={x + 15} y={y + 15} width={width - 30} height={height - 30} rx="3" fill="none" stroke="#d4a574" strokeWidth="2" opacity="0.6" />

      {/* Diamond pattern */}
      <g fill="none" stroke="#d4a574" strokeWidth="1.5" opacity="0.4">
        {[-1, 0, 1, 2].map(row => (
          <g key={row} transform={`translate(${x + 35}, ${y + 25 + row * 30})`}>
            {[0, 1, 2, 3, 4].map(col => (
              <rect
                key={col}
                x={col * 25}
                y="0"
                width="18"
                height="10"
                transform="rotate(45, 9, 5)"
                fill="rgba(212,165,116,0.2)"
              />
            ))}
          </g>
        ))}
      </g>

      {/* Center medallion */}
      <circle cx={x + width/2} cy={y + height/2} r="20" fill="rgba(212,165,116,0.3)" />
      <circle cx={x + width/2} cy={y + height/2} r="14" fill="rgba(212,165,116,0.2)" />
      <circle cx={x + width/2} cy={y + height/2} r="6" fill="rgba(212,165,116,0.1)" />
    </g>
  );
}

// Rug texture pattern
export function RugTexture() {
  return (
    <pattern id="rugTexture" width="8" height="8" patternUnits="userSpaceOnUse">
      <rect width="8" height="8" fill="#000" opacity="0.05" />
      <circle cx="4" cy="4" r="1" fill="#fff" opacity="0.03" />
    </pattern>
  );
}

// Bookshelf with depth
export function Bookshelf({ x, y }: { x: number; y: number }) {
  const books = [
    { color: "#c41e3a", height: 28 },
    { color: "#1e90ff", height: 24 },
    { color: "#228b22", height: 30 },
    { color: "#ffd700", height: 22 },
    { color: "#9932cc", height: 27 },
    { color: "#ff6347", height: 25 },
    { color: "#4682b4", height: 29 },
    { color: "#8b4513", height: 23 },
  ];

  return (
    <g>
      {/* Shadow */}
      <rect x={x + 5} y={y + 5} width="95" height="75" rx="4" fill="#000" opacity="0.15" />

      {/* Bookshelf frame */}
      <rect x={x} y={y} width="95" height="75" fill="#5c4a3d" rx="4" />
      <rect x={x + 6} y={y + 6} width="83" height="63" fill="#8b7355" rx="2" />

      {/* Shelf divisions */}
      <rect x={x + 6} y={y + 26} width="83" height="5" fill="#5c4a3d" />
      <rect x={x + 6} y={y + 50} width="83" height="5" fill="#5c4a3d" />

      {/* Back of shelves */}
      <rect x={x + 8} y={y + 8} width="79" height="16" fill="#6b5a45" opacity="0.5" />
      <rect x={x + 8} y={y + 33} width="79" height="14" fill="#6b5a45" opacity="0.5" />
      <rect x={x + 8} y={y + 57} width="79" height="12" fill="#6b5a45" opacity="0.5" />

      {/* Books on top shelf */}
      <g transform={`translate(${x + 10}, ${y + 9})`}>
        {books.map((book, i) => (
          <rect
            key={i}
            x={i * 9}
            y={14 - book.height}
            width="7"
            height={book.height}
            fill={book.color}
            rx="1"
          />
        ))}
      </g>

      {/* Books on middle shelf */}
      <g transform={`translate(${x + 10}, ${y + 35})`}>
        {books.reverse().map((book, i) => (
          <rect
            key={i}
            x={i * 9}
            y={12 - book.height}
            width="7"
            height={book.height}
            fill={book.color}
            opacity="0.85"
            rx="1"
          />
        ))}
      </g>

      {/* Bottom shelf items */}
      <rect x={x + 15} y={y + 56} width="18" height="12" fill="#d4a574" rx="1" />
      <ellipse cx={x + 55} cy={y + 62} r="10" fill="#8b4513" />
    </g>
  );
}

// Sofa with depth
export function Sofa({ x, y, width = 170, height = 80 }: { x: number; y: number; width?: number; height?: number }) {
  return (
    <g>
      {/* Shadow */}
      <rect x={x + 6} y={y + 6} width={width} height={height} rx="12" fill="#000" opacity="0.15" />

      {/* Sofa base */}
      <rect x={x} y={y} width={width} height={height} fill="#6b4423" rx="10" />

      {/* Cushions */}
      <rect x={x + 12} y={y + 12} width={(width - 34) / 2} height={height - 24} fill="#8b5a2b" rx="6" />
      <rect x={x + 12 + (width - 34) / 2 + 12} y={y + 12} width={(width - 34) / 2} height={height - 24} fill="#8b5a2b" rx="6" />

      {/* Cushion details */}
      <rect x={x + 15} y={y + 15} width={(width - 40) / 2 - 5} height={height - 30} fill="#9c6a3a" rx="4" opacity="0.5" />
      <rect x={x + 15 + (width - 34) / 2 + 12} y={y + 15} width={(width - 40) / 2 - 5} height={height - 30} fill="#9c6a3a" rx="4" opacity="0.5" />

      {/* Armrests */}
      <rect x={x} y={y} width="18" height={height} fill="#6b4423" rx="6" />
      <rect x={x + width - 18} y={y} width="18" height={height} fill="#6b4423" rx="6" />

      {/* Armrest highlights */}
      <rect x={x + 3} y={y + 5} width="4" height={height - 10} fill="#7d5430" rx="2" opacity="0.5" />
      <rect x={x + width - 7} y={y + 5} width="4" height={height - 10} fill="#7d5430" rx="2" opacity="0.5" />

      {/* Backrest */}
      <rect x={x + 6} y={y - 10} width={width - 12} height="18" fill="#6b4423" rx="6" />

      {/* Backrest highlight */}
      <rect x={x + 10} y={y - 8} width={width - 20} height="5" fill="#7d5430" opacity="0.4" />

      {/* Throw pillows */}
      <rect x={x + 28} y={y + 18} width="22" height="22" fill="#d4a574" rx="4" transform="rotate(-6, 39, 29)" />
      <rect x={x + width - 50} y={y + 18} width="22" height="22" fill="#a0522d" rx="4" transform="rotate(6, width - 39, 29)" />
    </g>
  );
}

// Coffee Table
export function CoffeeTable({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx={x + 55} cy={y + 55} rx="60" ry="25" fill="#000" opacity="0.15" />

      {/* Table top - lower layer */}
      <ellipse cx={x + 55} cy={y + 50} rx="55" ry="22" fill="#5c3317" />

      {/* Table top */}
      <ellipse cx={x + 55} cy={y + 48} rx="52" ry="20" fill="#8b4513" />
      <ellipse cx={x + 55} cy={y + 46} rx="48" ry="17" fill="#a0522d" />

      {/* Table edge */}
      <ellipse cx={x + 55} cy={y + 48} rx="55" ry="22" fill="none" stroke="#5c3317" strokeWidth="3" />

      {/* Center decoration */}
      <circle cx={x + 55} cy={y + 45} r="10" fill="#2a2a2a" />
      <circle cx={x + 55} cy={y + 45} r="6" fill="#1a1a1a" />

      {/* Table legs hints */}
      <ellipse cx={x + 20} cy={y + 55} rx="8" ry="4" fill="#5c3317" opacity="0.6" />
      <ellipse cx={x + 90} cy={y + 55} rx="8" ry="4" fill="#5c3317" opacity="0.6" />
    </g>
  );
}

// Vase with depth
export function Vase({ x, y, isWobbling = false, isFallen = false }: { x: number; y: number; isWobbling?: boolean; isFallen?: boolean }) {
  const wobbleTransform = isWobbling
    ? `rotate(8, ${x + 22}, ${y + 35})`
    : '';

  return (
    <g transform={wobbleTransform}>
      {/* Shadow (only when upright) */}
      {!isFallen && <ellipse cx={x + 22} cy={y + 62} rx="20" ry="7" fill="#000" opacity="0.15" />}

      {/* Vase body */}
      <path
        d={`M${x + 8} ${y + 55}
           Q${x + 2} ${y + 48} ${x + 2} ${y + 36}
           Q${x + 2} ${y + 18} ${x + 14} ${y + 12}
           L${x + 30} ${y + 12}
           Q${x + 42} ${y + 18} ${x + 42} ${y + 36}
           Q${x + 42} ${y + 48} ${x + 36} ${y + 55}
           Z`}
        fill="#1e3a5f"
      />

      {/* Vase highlight */}
      <path
        d={`M${x + 12} ${y + 50}
           Q${x + 8} ${y + 40} ${x + 10} ${y + 25}
           Q${x + 12} ${y + 18} ${x + 16} ${y + 15}`}
        stroke="#3a5a8f"
        strokeWidth="3"
        fill="none"
        opacity="0.6"
      />

      {/* Vase neck */}
      <ellipse cx={x + 22} cy={y + 12} rx="8" ry="4" fill="#2a4a6f" />
      <ellipse cx={x + 22} cy={y + 11} rx="6" ry="3" fill="#3a6a9f" opacity="0.4" />

      {/* Pattern on vase */}
      <path d={`M${x + 10} ${y + 42} Q${x + 22} ${y + 36} ${x + 34} ${y + 42}`} stroke="#ffd700" strokeWidth="2" fill="none" />
      <path d={`M${x + 12} ${y + 30} Q${x + 22} ${y + 24} ${x + 32} ${y + 30}`} stroke="#ffd700" strokeWidth="2" fill="none" />

      {/* Flowers */}
      {!isFallen && (
        <g>
          <line x1={x + 22} y1={y + 12} x2={x + 14} y2={y - 8} stroke="#228b22" strokeWidth="2.5" />
          <line x1={x + 22} y1={y + 12} x2={x + 30} y2={y - 5} stroke="#228b22" strokeWidth="2.5" />
          <line x1={x + 22} y1={y + 12} x2={x + 22} y2={y - 12} stroke="#228b22" strokeWidth="2.5" />
          <circle cx={x + 14} cy={y - 10} r="6" fill="#ff69b4" />
          <circle cx={x + 30} cy={y - 7} r="5" fill="#ff1493" />
          <circle cx={x + 22} cy={y - 14} r="5" fill="#ffb6c1" />
        </g>
      )}

      {/* Fallen indicator */}
      {isFallen && (
        <g transform={`translate(${x + 30}, ${y + 40})`}>
          <text fontSize="18">💔</text>
        </g>
      )}
    </g>
  );
}

// Table Lamp
export function TableLamp({ x, y, isWobbling = false, isFallen = false }: { x: number; y: number; isWobbling?: boolean; isFallen?: boolean }) {
  const wobbleTransform = isWobbling
    ? `rotate(8, ${x + 22}, ${y + 40})`
    : '';

  return (
    <g transform={wobbleTransform}>
      {/* Shadow */}
      {!isFallen && <ellipse cx={x + 22} cy={y + 62} rx="18" ry="6" fill="#000" opacity="0.15" />}

      {/* Lamp base */}
      <ellipse cx={x + 22} cy={y + 58} rx="14" ry="6" fill="#b87333" />
      <ellipse cx={x + 22} cy={y + 56} rx="12" ry="5" fill="#cd853f" />

      {/* Lamp pole */}
      <rect x={x + 19} y={y + 28} width="6" height="30" fill="#b87333" />
      <rect x={x + 19} y={y + 28} width="3" height="30" fill="#cd853f" opacity="0.5" />

      {/* Lamp shade */}
      <path
        d={`M${x + 4} ${y + 28}
           Q${x + 22} ${y + 8} ${x + 40} ${y + 28}
           Z`}
        fill="#f5e6d3"
        stroke="#b87333"
        strokeWidth="2"
      />

      {/* Shade inner glow */}
      <path
        d={`M${x + 8} ${y + 25}
           Q${x + 22} ${y + 14} ${x + 36} ${y + 25}
           Z`}
        fill="#fff8dc"
        opacity="0.5"
      />

      {/* Light glow on table */}
      {!isFallen && (
        <ellipse cx={x + 22} cy={y + 62} rx="25" ry="8" fill="#ffe4b5" opacity="0.15" />
      )}

      {/* Fallen indicator */}
      {isFallen && (
        <g transform={`translate(${x + 35}, ${y + 45})`}>
          <text fontSize="18">💔</text>
        </g>
      )}
    </g>
  );
}

// Coffee Mug
export function CoffeeMug({ x, y, isWobbling = false, isFallen = false }: { x: number; y: number; isWobbling?: boolean; isFallen?: boolean }) {
  const wobbleTransform = isWobbling
    ? `rotate(10, ${x + 18}, ${y + 25})`
    : '';

  return (
    <g transform={wobbleTransform}>
      {/* Shadow */}
      {!isFallen && <ellipse cx={x + 18} cy={y + 38} rx="16" ry="6" fill="#000" opacity="0.15" />}

      {/* Mug body */}
      <rect x={x + 6} y={y + 14} width="24" height="24" fill="#fff" rx="4" stroke="#e0e0e0" strokeWidth="1" />

      {/* Mug handle */}
      <path
        d={`M${x + 30} ${y + 18} Q${x + 38} ${y + 18} ${x + 38} ${y + 26} Q${x + 38} ${y + 34} ${x + 30} ${y + 34}`}
        fill="none"
        stroke="#fff"
        strokeWidth="5"
      />
      <path
        d={`M${x + 30} ${y + 18} Q${x + 38} ${y + 18} ${x + 38} ${y + 26} Q${x + 38} ${y + 34} ${x + 30} ${y + 34}`}
        fill="none"
        stroke="#e0e0e0"
        strokeWidth="4"
      />

      {/* Coffee inside */}
      <ellipse cx={x + 18} cy={y + 16} rx="10" ry="4" fill="#3c2415" />
      <ellipse cx={x + 18} cy={y + 15} rx="8" ry="3" fill="#5c3a21" />

      {/* Steam */}
      {!isFallen && (
        <g opacity="0.6">
          <path
            d={`M${x + 12} ${y + 6} Q${x + 10} ${y} ${x + 14} ${y - 6}`}
            stroke="rgba(200,200,200,0.6)"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d={`M${x + 18} ${y + 4} Q${x + 16} ${y - 2} ${x + 20} ${y - 8}`}
            stroke="rgba(200,200,200,0.6)"
            strokeWidth="2.5"
            fill="none"
          />
          <path
            d={`M${x + 24} ${y + 6} Q${x + 22} ${y} ${x + 26} ${y - 6}`}
            stroke="rgba(200,200,200,0.6)"
            strokeWidth="2.5"
            fill="none"
          />
        </g>
      )}

      {/* Fallen indicator */}
      {isFallen && (
        <g transform={`translate(${x + 30}, ${y + 30})`}>
          <text fontSize="18">💔</text>
        </g>
      )}
    </g>
  );
}

// Plant
export function Plant({ x, y, type = "fern" }: { x: number; y: number; type?: "fern" | "cactus" | "potted" }) {
  return (
    <g>
      {/* Shadow */}
      <ellipse cx={x + 25} cy={y + 52} rx="25" ry="9" fill="#000" opacity="0.15" />

      {/* Pot */}
      <path
        d={`M${x + 8} ${y + 35} L${x + 14} ${y + 52} L${x + 36} ${y + 52} L${x + 42} ${y + 35} Z`}
        fill="#cd853f"
        stroke="#8b4513"
        strokeWidth="1"
      />
      <ellipse cx={x + 25} cy={y + 35} rx="17" ry="6" fill="#deb887" stroke="#8b4513" strokeWidth="1" />

      {/* Soil */}
      <ellipse cx={x + 25} cy={y + 35} rx="14" ry="5" fill="#3c2415" />

      {/* Plant based on type */}
      {type === "fern" && (
        <g>
          {/* Fern leaves - multiple layers for depth */}
          {[0, 40, 80, 120, 160, 200, 240, 280].map((angle, i) => (
            <ellipse
              key={i}
              cx={x + 25}
              cy={y + 30}
              rx="4"
              ry="22"
              fill="#228b22"
              transform={`rotate(${angle + (i % 2) * 10}, ${x + 25}, ${y + 30})`}
            />
          ))}
          {/* Inner leaves */}
          <ellipse cx={x + 25} cy={y + 25} rx="5" ry="18" fill="#2e8b2e" />
          <ellipse cx={x + 25} cy={y + 20} rx="3" ry="12" fill="#32cd32" />
        </g>
      )}

      {type === "cactus" && (
        <g>
          {/* Main cactus body */}
          <ellipse cx={x + 25} cy={y + 22} rx="14" ry="24" fill="#2e8b57" />
          {/* Cactus arms */}
          <ellipse cx={x + 10} cy={y + 26} rx="7" ry="12" fill="#2e8b57" transform="rotate(-25, 10, 26)" />
          <ellipse cx={x + 40} cy={y + 32} rx="7" ry="10" fill="#2e8b57" transform="rotate(25, 40, 32)" />
          {/* Spines */}
          {[0, 60, 120, 180, 240, 300].map(i => (
            <line
              key={i}
              x1={x + 25}
              y1={y + 5}
              x2={x + 25 + Math.cos(i * Math.PI/180) * 18}
              y2={y + 5 + Math.sin(i * Math.PI/180) * 18}
              stroke="#1a5f3a"
              strokeWidth="1"
            />
          ))}
        </g>
      )}

      {type === "potted" && (
        <g>
          {/* Single stem */}
          <line x1={x + 25} y1={y + 35} x2={x + 25} y2={y + 10} stroke="#228b22" strokeWidth="4" />
          {/* Leaves */}
          <ellipse cx={x + 14} cy={y + 20} rx="10" ry="6" fill="#32cd32" transform="rotate(-35, 14, 20)" />
          <ellipse cx={x + 36} cy={y + 20} rx="10" ry="6" fill="#32cd32" transform="rotate(35, 36, 20)" />
          <ellipse cx={x + 25} cy={y + 8} rx="7" ry="10" fill="#3cb371" />
        </g>
      )}
    </g>
  );
}

// Toy Ball
export function ToyBall({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + 18} cy={y + 18} r="18" fill="#ff6b6b" />
      <circle cx={x + 18} cy={y + 18} r="18" fill="none" stroke="#e55555" strokeWidth="2" />
      {/* Stripe pattern */}
      <path
        d={`M${x + 6} ${y + 6} Q${x + 18} ${y + 18} ${x + 6} ${y + 30}`}
        stroke="#e55555"
        strokeWidth="4"
        fill="none"
      />
      <path
        d={`M${x + 30} ${y + 6} Q${x + 18} ${y + 18} ${x + 30} ${y + 30}`}
        stroke="#e55555"
        strokeWidth="4"
        fill="none"
      />
      {/* Shine */}
      <ellipse cx={x + 12} cy={y + 12} rx="5" ry="4" fill="#fff" opacity="0.4" />
    </g>
  );
}

// Yarn Ball
export function YarnBall({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + 18} cy={y + 18} r="18" fill="#4ecdc4" />
      {/* Yarn strands */}
      {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
        <path
          key={i}
          d={`M${x + 18} ${y + 18} Q${x + 18 + Math.cos(angle * Math.PI/180) * 18} ${y + 18 + Math.sin(angle * Math.PI/180) * 18} ${x + 18 + Math.cos((angle + 25) * Math.PI/180) * 14} ${y + 18 + Math.sin((angle + 25) * Math.PI/180) * 14}`}
          stroke="#3dbdb4"
          strokeWidth="2.5"
          fill="none"
        />
      ))}
      {/* Loose thread */}
      <path
        d={`M${x + 30} ${y + 30} Q${x + 38} ${y + 38} ${x + 42} ${y + 34}`}
        stroke="#4ecdc4"
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
      />
      {/* Shine */}
      <ellipse cx={x + 12} cy={y + 12} rx="5" ry="4" fill="#fff" opacity="0.3" />
    </g>
  );
}

// Cat with detailed design
export function CatSprite({ emoji, x, y, state = "idle", scale = 1 }: { emoji: string; x: number; y: number; state?: string; scale?: number }) {
  const bounce = state === "playing" ? { animation: "catBounce 0.3s ease-in-out infinite" } : {};
  const pulse = state === "purring" ? { animation: "catPulse 0.5s ease-in-out infinite" } : {};
  const animationStyle = { ...bounce, ...pulse };

  // Color mapping for cats
  const catColors: Record<string, { body: string; stripe: string; collar: string; eye: string }> = {
    "🐱": { body: "#ff9f43", stripe: "#e67e22", collar: "#e74c3c", eye: "#2d3436" },
    "🐈": { body: "#a4b0be", stripe: "#747d8c", collar: "#3498db", eye: "#f1c40f" },
    "😺": { body: "#fed330", stripe: "#f1c40f", collar: "#2ecc71", eye: "#2d3436" },
    "😸": { body: "#fd79a8", stripe: "#e84393", collar: "#9b59b6", eye: "#2d3436" },
    "😼": { body: "#fdcb6e", stripe: "#f39c12", collar: "#34495e", eye: "#2d3436" },
    "😽": { body: "#ffeaa7", stripe: "#fdcb6e", collar: "#e84393", eye: "#2d3436" },
  };

  const colors = catColors[emoji] || catColors["🐱"];

  return (
    <g transform={`translate(${x - 30}, ${y - 30}) scale(${scale})`}>
      {/* Shadow */}
      <ellipse cx="30" cy="55" rx="25" ry="10" fill="#000" opacity="0.2" />

      {/* Cat body */}
      <g style={animationStyle}>
        {/* Body outline */}
        <ellipse cx="30" cy="38" rx="26" ry="22" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="30" cy="38" rx="24" ry="20" fill={colors.body} />

        {/* Body stripes */}
        <path d="M15 30 Q30 22 45 30" stroke={colors.stripe} strokeWidth="4" fill="none" strokeLinecap="round" />
        <path d="M12 42 Q30 34 48 42" stroke={colors.stripe} strokeWidth="4" fill="none" strokeLinecap="round" />

        {/* Head */}
        <circle cx="30" cy="16" r="18" fill="rgba(0,0,0,0.1)" />
        <circle cx="30" cy="16" r="17" fill={colors.body} />

        {/* Ears */}
        <polygon points="15,4 26,14 12,14" fill={colors.body} stroke={colors.stripe} strokeWidth="1.5" />
        <polygon points="45,4 34,14 48,14" fill={colors.body} stroke={colors.stripe} strokeWidth="1.5" />
        <polygon points="17,7 23,12 14,12" fill="#ffccd5" />
        <polygon points="43,7 37,12 46,12" fill="#ffccd5" />

        {/* Eyes */}
        <circle cx="23" cy="14" r="5" fill="#fff" />
        <circle cx="37" cy="14" r="5" fill="#fff" />
        <circle cx="23" cy="14" r="3" fill={colors.eye} />
        <circle cx="37" cy="14" r="3" fill={colors.eye} />
        <circle cx="24" cy="13" r="1.2" fill="#fff" />
        <circle cx="38" cy="13" r="1.2" fill="#fff" />

        {/* Nose */}
        <ellipse cx="30" cy="20" rx="5" ry="4" fill="#ffccd5" />

        {/* Mouth */}
        <path d="M27 23 Q30 26 33 23" stroke={colors.eye} strokeWidth="2" fill="none" />

        {/* Whiskers */}
        <line x1="8" y1="17" x2="18" y2="19" stroke={colors.eye} strokeWidth="1.2" />
        <line x1="8" y1="22" x2="18" y2="22" stroke={colors.eye} strokeWidth="1.2" />
        <line x1="42" y1="19" x2="52" y2="17" stroke={colors.eye} strokeWidth="1.2" />
        <line x1="42" y1="22" x2="52" y2="22" stroke={colors.eye} strokeWidth="1.2" />

        {/* Collar */}
        <path d="M18 30 Q30 36 42 30" stroke={colors.collar} strokeWidth="5" fill="none" strokeLinecap="round" />
        <circle cx="30" cy="33" r="4" fill="#f1c40f" />
      </g>
    </g>
  );
}

// Element Label
export function ElementLabel({ x, y, label, visible }: { x: number; y: number; label: string; visible: boolean }) {
  if (!visible) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-6" y="-14" width={label.length * 9 + 12} height="22" rx="6" fill="rgba(0,0,0,0.8)" />
      <text x={(label.length * 9 + 12) / 2 - 3} y="2" textAnchor="middle" fontSize="11" fill="#fff" fontWeight="bold">
        {label}
      </text>
    </g>
  );
}

// Atmospheric lighting overlay
export function RoomLighting() {
  return (
    <defs>
      {/* Warm ambient light from window */}
      <radialGradient id="windowLight" cx="15%" cy="30%" r="60%">
        <stop offset="0%" stopColor="#fff8e7" stopOpacity="0.08" />
        <stop offset="50%" stopColor="#ffe4b5" stopOpacity="0.03" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>

      {/* Room corner shadows */}
      <radialGradient id="cornerShadow" cx="100%" cy="100%" r="100%">
        <stop offset="0%" stopColor="#000" stopOpacity="0.2" />
        <stop offset="70%" stopColor="#000" stopOpacity="0.05" />
        <stop offset="100%" stopColor="#000" stopOpacity="0" />
      </radialGradient>

      {/* Vignette effect */}
      <radialGradient id="vignette" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stopColor="#000" stopOpacity="0" />
        <stop offset="100%" stopColor="#000" stopOpacity="0.3" />
      </radialGradient>
    </defs>
  );
}

// Export all components
export const RoomElements = {
  RoomFloor,
  BackWall,
  SideWalls,
  Window,
  CatTree,
  SisalPattern,
  FoodBowl,
  WaterBowl,
  Rug,
  RugTexture,
  Bookshelf,
  Sofa,
  CoffeeTable,
  Vase,
  TableLamp,
  CoffeeMug,
  Plant,
  ToyBall,
  YarnBall,
  CatSprite,
  ElementLabel,
  RoomLighting,
};
