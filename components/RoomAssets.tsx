// RoomAssets - Detailed SVG Furniture & Room Elements for 2D Top-Down View

// Simple solid floor - clean background for visibility
export function WoodFloor() {
  return (
    <pattern id="woodFloor" width="100" height="100" patternUnits="userSpaceOnUse">
      <rect width="100" height="100" fill="#c9a86c" />
    </pattern>
  );
}

// Room Background Image Component
export function RoomBackground({ imageUrl = "/room-bg.jpg" }: { imageUrl?: string }) {
  return (
    <image
      href={imageUrl}
      x="0"
      y="0"
      width="700"
      height="550"
      preserveAspectRatio="xMidYMid slice"
    />
  );
}

// Element Label for educational tooltips
export function ElementLabel({ x, y, label, visible }: { x: number; y: number; label: string; visible: boolean }) {
  if (!visible) return null;

  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x="-5" y="-12" width={label.length * 8 + 10} height="20" rx="4" fill="rgba(0,0,0,0.7)" />
      <text x={label.length * 4} y="2" textAnchor="middle" fontSize="10" fill="#fff" fontWeight="bold">
        {label}
      </text>
    </g>
  );
}

// Back Wall with more dimension - warm cream walls
export function BackWall({ width = 700, height = 550 }: { width?: number; height?: number }) {
  return (
    <g>
      {/* Main back wall area */}
      <rect x="0" y="0" width={width} height="80" fill="#e8dcc8" />

      {/* Wall texture - very subtle pattern */}
      <pattern id="wallPattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <rect width="20" height="20" fill="#e8dcc8" />
        <circle cx="10" cy="10" r="0.5" fill="#d4c4a8" opacity="0.5" />
      </pattern>
      <rect x="0" y="0" width={width} height="80" fill="url(#wallPattern)" />

      {/* Wall shadow at bottom for depth */}
      <rect x="0" y="75" width={width} height="8" fill="rgba(0,0,0,0.08)" />

      {/* Baseboard on back wall */}
      <rect x="0" y="72" width={width} height="10" fill="#c9a86c" />
      <rect x="0" y="72" width={width} height="3" fill="#deb887" />

      {/* Picture frame decoration on back wall */}
      <rect x="400" y="15" width="80" height="50" fill="#8b7355" rx="2" />
      <rect x="405" y="20" width="70" height="40" fill="#f5f5dc" />
      <rect x="410" y="25" width="60" height="30" fill="#228b22" />
      <circle cx="440" cy="40" r="8" fill="#ffd700" opacity="0.8" />

      {/* Wall lamp */}
      <circle cx="320" cy="30" r="8" fill="#b87333" />
      <ellipse cx="320" cy="45" rx="12" ry="8" fill="#f5e6d3" />
    </g>
  );
}

// Side walls with depth
export function SideWalls({ width = 700, height = 550 }: { width?: number; height?: number }) {
  return (
    <g>
      {/* Left wall */}
      <rect x="0" y="75" width="30" height={height - 80} fill="#d4c4a8" />
      {/* Shadow on left wall */}
      <rect x="25" y="75" width="8" height={height - 80} fill="rgba(0,0,0,0.05)" />

      {/* Right wall */}
      <rect x={width - 30} y="75" width="30" height={height - 80} fill="#d4c4a8" />
      {/* Shadow on right wall */}
      <rect x={width - 30} y="75" width="8" height={height - 80} fill="rgba(0,0,0,0.05)" />

      {/* Left baseboard */}
      <rect x="0" y={height - 15} width="35" height="8" fill="#c9a86c" />
      <rect x="0" y={height - 15} width="35" height="3" fill="#deb887" />

      {/* Right baseboard */}
      <rect x={width - 35} y={height - 15} width="35" height="8" fill="#c9a86c" />
      <rect x={width - 35} y={height - 15} width="35" height="3" fill="#deb887" />

      {/* Corner posts */}
      <rect x="0" y="65" width="12" height="45" fill="#c9a86c" />
      <rect x={width - 12} y="65" width="12" height="45" fill="#c9a86c" />
    </g>
  );
}

// Floor with subtle wood grain
export function RealisticFloor() {
  return (
    <pattern id="realisticFloor" width="60" height="60" patternUnits="userSpaceOnUse">
      <rect width="60" height="60" fill="#c9a86c" />
      {/* Subtle plank lines */}
      <g stroke="#b8956e" strokeWidth="0.5" opacity="0.3">
        <line x1="30" y1="0" x2="30" y2="60" />
        <line x1="0" y1="30" x2="60" y2="30" />
        <line x1="15" y1="0" x2="15" y2="60" />
        <line x1="45" y1="0" x2="45" y2="60" />
      </g>
      {/* Very subtle wood grain */}
      <path d="M0 10 Q30 15 60 10 M0 50 Q30 55 60 50" stroke="#a08060" strokeWidth="0.3" fill="none" opacity="0.2" />
    </pattern>
  );
}

// Window with Curtains and Outside View
export function Window({ x, y, width = 100, height = 60 }: { x: number; y: number; width?: number; height?: number }) {
  return (
    <g>
      {/* Outside view - sky and ground */}
      <rect x={x + 8} y={y + 8} width={width - 16} height="25" fill="#87CEEB" />
      <rect x={x + 8} y={y + 25} width={width - 16} height="10" fill="#90EE90" />

      {/* Window frame */}
      <rect x={x} y={y} width={width} height={height} fill="#5c4a3d" rx="3" />
      <rect x={x + 4} y={y + 4} width={width - 8} height={height - 8} fill="#2a2a2a" />

      {/* Window cross */}
      <rect x={x + width/2 - 2} y={y + 4} width="4" height={height - 8} fill="#5c4a3d" />
      <rect x={x + 4} y={y + height/2 - 2} width={width - 8} height="4" fill="#5c4a3d" />

      {/* Glass reflection */}
      <path d={`M${x + 8} ${y + 28} L${x + width/2} ${y + 8} L${x + width/2} ${y + 20} L${x + 8} ${y + 28}`} fill="white" opacity="0.2" />

      {/* Curtains */}
      <path d={`M${x - 8} ${y - 5} Q${x + 10} ${y + 15} ${x - 8} ${y + height + 5} L${x} ${y + height/2} Z`} fill="#d4a574" />
      <path d={`M${x + width + 8} ${y - 5} Q${x + width - 10} ${y + 15} ${x + width + 8} ${y + height + 5} L${x + width} ${y + height/2} Z`} fill="#d4a574" />
    </g>
  );
}

// Cat Tree - Multi-tier tower
export function CatTree({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Base platform */}
      <ellipse cx={x + 40} cy={y + 55} rx="50" ry="25" fill="#8b7355" />
      <ellipse cx={x + 40} cy={y + 53} rx="45" ry="22" fill="#a08060" />

      {/* Center post */}
      <rect x={x + 35} y={y + 10} width="10" height="45" fill="#c9a86c" />
      <rect x={x + 35} y={y + 10} width="10" height="45" fill="url(#sisalPattern)" />

      {/* Platform 1 */}
      <ellipse cx={x + 40} cy={y + 35} rx="35" ry="15" fill="#8b7355" />
      <ellipse cx={x + 40} cy={y + 33} rx="32" ry="13" fill="#a08060" />

      {/* Top platform */}
      <ellipse cx={x + 40} cy={y + 12} rx="30" ry="12" fill="#8b7355" />
      <ellipse cx={x + 40} cy={y + 10} rx="27" ry="10" fill="#a08060" />

      {/* Rope detail */}
      <g stroke="#c9a86c" strokeWidth="2">
        {[0, 8, 16, 24, 32].map(i => (
          <line key={i} x1={x + 35 + i/2} y1={y + 10} x2={x + 35 + i/2} y2={y + 55} />
        ))}
      </g>

      {/* Hanging toy */}
      <line x1={x + 55} y1={y + 12} x2={x + 60} y2={y + 30} stroke="#ff6b6b" strokeWidth="2" />
      <circle cx={x + 60} cy={y + 33} r="5" fill="#ff6b6b" />
    </g>
  );
}

// Sisal Pattern for cat tree
export function SisalPattern() {
  return (
    <pattern id="sisalPattern" width="4" height="4" patternUnits="userSpaceOnUse">
      <rect width="4" height="4" fill="#c9a86c" />
      <path d="M0 2 L4 2 M2 0 L2 4" stroke="#b8956e" strokeWidth="0.5" />
    </pattern>
  );
}

// Food Bowl
export function FoodBowl({ x, y, fillLevel = 0, isEmpty = true }: { x: number; y: number; fillLevel?: number; isEmpty?: boolean }) {
  return (
    <g>
      {/* Bowl shadow */}
      <ellipse cx={x + 25} cy={y + 28} rx="28" ry="10" fill="rgba(0,0,0,0.15)" />

      {/* Bowl outer */}
      <ellipse cx={x + 25} cy={y + 25} rx="25" ry="10" fill="#f5f5f5" stroke="#ddd" strokeWidth="2" />

      {/* Bowl inner (food area) */}
      <ellipse cx={x + 25} cy={y + 23} rx="18" ry="7" fill="#e8d5c4" />

      {/* Food fill */}
      {!isEmpty && (
        <g>
          <ellipse cx={x + 25} cy={y + 20} rx="16" ry="5" fill="#8B4513" />
          <ellipse cx={x + 25} cy={y + 19} rx="14" ry="4" fill="#a0522d" />
          {/* Food texture */}
          {[0, 1, 2, 3, 4, 5].map(i => (
            <circle key={i} cx={x + 20 + (i % 3) * 5} cy={y + 18 + Math.floor(i/3) * 4} r="2" fill="#6b3e0a" opacity="0.5" />
          ))}
        </g>
      )}

      {/* Empty indicator */}
      {isEmpty && (
        <text x={x + 25} y={y + 24} textAnchor="middle" fontSize="12" fill="#999">🥣</text>
      )}

      {/* Bowl rim highlight */}
      <ellipse cx={x + 25} cy={y + 21} rx="18" ry="6" fill="none" stroke="#fff" strokeWidth="1" opacity="0.5" />
    </g>
  );
}

// Water Bowl
export function WaterBowl({ x, y, fillLevel = 100 }: { x: number; y: number; fillLevel?: number }) {
  const waterHeight = (fillLevel / 100) * 6;

  return (
    <g>
      {/* Bowl shadow */}
      <ellipse cx={x + 25} cy={y + 28} rx="28" ry="10" fill="rgba(0,0,0,0.15)" />

      {/* Bowl outer */}
      <ellipse cx={x + 25} cy={y + 25} rx="25" ry="10" fill="#e0e0e0" stroke="#ccc" strokeWidth="2" />

      {/* Bowl inner */}
      <ellipse cx={x + 25} cy={y + 23} rx="18" ry="7" fill="#c9d6df" />

      {/* Water */}
      {fillLevel > 0 && (
        <g>
          <ellipse cx={x + 25} cy={y + 22 - waterHeight/2} rx="16" ry={waterHeight + 3} fill="#4a90d9" />
          {/* Water surface */}
          <ellipse cx={x + 25} cy={y + 20} rx="16" ry="4" fill="#6bb3e8" />
          {/* Water shine */}
          <ellipse cx={x + 22} cy={y + 19} rx="4" ry="2" fill="white" opacity="0.4" />
        </g>
      )}

      {/* Glass rim */}
      <ellipse cx={x + 25} cy={y + 21} rx="18" ry="6" fill="none" stroke="#fff" strokeWidth="2" opacity="0.3" />
    </g>
  );
}

// Patterned Rug
export function Rug({ x, y, width = 120, height = 80, color = "#8B0000" }: { x: number; y: number; width?: number; height?: number; color?: string }) {
  return (
    <g>
      {/* Shadow */}
      <rect x={x + 4} y={y + 4} width={width} height={height} rx="5" fill="rgba(0,0,0,0.1)" />

      {/* Main rug */}
      <rect x={x} y={y} width={width} height={height} rx="5" fill={color} />

      {/* Border */}
      <rect x={x + 5} y={y + 5} width={width - 10} height={height - 10} rx="3" fill="none" stroke="#d4a574" strokeWidth="3" />

      {/* Inner pattern - diamond shapes */}
      <g fill="none" stroke="#d4a574" strokeWidth="1">
        {[0, 1, 2, 3].map(row => (
          <g key={row}>
            {[0, 1, 2].map(col => (
              <rect
                key={`${row}-${col}`}
                x={x + 20 + col * 35}
                y={y + 15 + row * 20}
                width="20"
                height="12"
                transform={`rotate(45 ${x + 30 + col * 35} ${y + 21 + row * 20})`}
                fill="rgba(212,165,116,0.3)"
              />
            ))}
          </g>
        ))}
      </g>

      {/* Center medallion */}
      <circle cx={x + width/2} cy={y + height/2} r="15" fill="rgba(212,165,116,0.4)" />
      <circle cx={x + width/2} cy={y + height/2} r="10" fill="rgba(212,165,116,0.2)" />
    </g>
  );
}

// Bookshelf with Books
export function Bookshelf({ x, y }: { x: number; y: number }) {
  const books = [
    { color: "#c41e3a", height: 25 },
    { color: "#1e90ff", height: 22 },
    { color: "#228b22", height: 28 },
    { color: "#ffd700", height: 20 },
    { color: "#9932cc", height: 26 },
    { color: "#ff6347", height: 23 },
    { color: "#4682b4", height: 27 },
    { color: "#8b4513", height: 21 },
  ];

  return (
    <g>
      {/* Shelf shadow */}
      <rect x={x + 4} y={y + 4} width="80" height="60" rx="3" fill="rgba(0,0,0,0.15)" />

      {/* Bookshelf frame */}
      <rect x={x} y={y} width="80" height="60" fill="#5c4a3d" rx="3" />
      <rect x={x + 5} y={y + 5} width="70" height="50" fill="#8b7355" rx="2" />

      {/* Shelf divisions */}
      <rect x={x + 5} y={y + 20} width="70" height="4" fill="#5c4a3d" />
      <rect x={x + 5} y={y + 40} width="70" height="4" fill="#5c4a3d" />

      {/* Books on top shelf */}
      <g transform={`translate(${x + 8}, ${y + 8})`}>
        {books.map((book, i) => (
          <rect
            key={i}
            x={i * 8}
            y={12 - book.height}
            width="6"
            height={book.height}
            fill={book.color}
            rx="1"
          />
        ))}
      </g>

      {/* Books on middle shelf */}
      <g transform={`translate(${x + 8}, ${y + 28})`}>
        {books.reverse().map((book, i) => (
          <rect
            key={i}
            x={i * 8}
            y={12 - book.height}
            width="6"
            height={book.height}
            fill={book.color}
            opacity="0.8"
            rx="1"
          />
        ))}
      </g>

      {/* Some decorative items on bottom */}
      <rect x={x + 15} y={y + 45} width="15" height="10" fill="#d4a574" rx="1" />
      <circle cx={x + 50} cy={y + 50} r="8" fill="#8b4513" />
    </g>
  );
}

// Sofa
export function Sofa({ x, y, width = 140, height = 60 }: { x: number; y: number; width?: number; height?: number }) {
  return (
    <g>
      {/* Sofa shadow */}
      <rect x={x + 4} y={y + 4} width={width} height={height} rx="10" fill="rgba(0,0,0,0.15)" />

      {/* Sofa base */}
      <rect x={x} y={y} width={width} height={height} fill="#6b4423" rx="10" />

      {/* Cushions */}
      <rect x={x + 10} y={y + 10} width={(width - 30) / 2} height={height - 20} fill="#8b5a2b" rx="5" />
      <rect x={x + 10 + (width - 30) / 2 + 10} y={y + 10} width={(width - 30) / 2} height={height - 20} fill="#8b5a2b" rx="5" />

      {/* Armrests */}
      <rect x={x} y={y} width="15" height={height} fill="#6b4423" rx="5" />
      <rect x={x + width - 15} y={y} width="15" height={height} fill="#6b4423" rx="5" />

      {/* Backrest */}
      <rect x={x + 5} y={y - 8} width={width - 10} height="15" fill="#6b4423" rx="5" />

      {/* Throw pillows */}
      <rect x={x + 25} y={y + 15} width="20" height="20" fill="#d4a574" rx="3" transform="rotate(-5, 35, 25)" />
      <rect x={x + width - 45} y={y + 15} width="20" height="20" fill="#a0522d" rx="3" transform="rotate(5, width - 35, 25)" />
    </g>
  );
}

// Dining Table with Chairs
export function DiningTable({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Table shadow */}
      <ellipse cx={x + 50} cy={y + 48} rx="55" ry="25" fill="rgba(0,0,0,0.15)" />

      {/* Table top */}
      <ellipse cx={x + 50} cy={y + 40} rx="50" ry="22" fill="#a0522d" />
      <ellipse cx={x + 50} cy={y + 38} rx="45" ry="18" fill="#8b4513" />

      {/* Table edge detail */}
      <ellipse cx={x + 50} cy={y + 38} rx="50" ry="22" fill="none" stroke="#5c3317" strokeWidth="2" />

      {/* Chairs */}
      {/* Chair 1 - top */}
      <rect x={x + 30} y={y - 15} width="40" height="20" fill="#5c3317" rx="3" />
      <rect x={x + 35} y={y - 12} width="30" height="14" fill="#8b5a2b" rx="2" />

      {/* Chair 2 - bottom */}
      <rect x={x + 30} y={y + 70} width="40" height="20" fill="#5c3317" rx="3" />
      <rect x={x + 35} y={y + 73} width="30" height="14" fill="#8b5a2b" rx="2" />

      {/* Table center decoration */}
      <circle cx={x + 50} cy={y + 38} r="8" fill="#2a2a2a" />
      <circle cx={x + 50} cy={y + 38} r="5" fill="#1a1a1a" />
    </g>
  );
}

// Decorative Vase
export function Vase({ x, y, isWobbling = false, isFallen = false }: { x: number; y: number; isWobbling?: boolean; isFallen?: boolean }) {
  const rotation = isFallen ? 90 : 0;
  const wobble = isWobbling ? { transform: `rotate(${Math.sin(Date.now() / 100) * 10}deg)` } : {};

  return (
    <g transform={`rotate(${rotation}, ${x + 20}, ${y + 30})`}>
      {/* Shadow */}
      {!isFallen && <ellipse cx={x + 20} cy={y + 55} rx="18" ry="6" fill="rgba(0,0,0,0.15)" />}

      {/* Vase body */}
      <path
        d={`M${x + 10} ${y + 50}
           Q${x + 5} ${y + 45} ${x + 5} ${y + 35}
           Q${x + 5} ${y + 20} ${x + 15} ${y + 15}
           L${x + 25} ${y + 15}
           Q${x + 35} ${y + 20} ${x + 35} ${y + 35}
           Q${x + 35} ${y + 45} ${x + 30} ${y + 50}
           Z`}
        fill="#1e3a5f"
      />

      {/* Vase neck */}
      <ellipse cx={x + 20} cy={y + 15} rx="5" ry="3" fill="#2a4a6f" />

      {/* Pattern on vase */}
      <path d={`M${x + 10} ${y + 40} Q${x + 20} ${y + 35} ${x + 30} ${y + 40}`} stroke="#ffd700" strokeWidth="2" fill="none" />
      <path d={`M${x + 12} ${y + 30} Q${x + 20} ${y + 25} ${x + 28} ${y + 30}`} stroke="#ffd700" strokeWidth="2" fill="none" />

      {/* Highlight */}
      <ellipse cx={x + 14} cy={y + 35} rx="3" ry="8" fill="rgba(255,255,255,0.2)" />

      {/* Flowers (if not fallen) */}
      {!isFallen && (
        <g>
          <line x1={x + 20} y1={y + 15} x2={x + 15} y2={y} stroke="#228b22" strokeWidth="2" />
          <line x1={x + 20} y1={y + 15} x2={x + 25} y2={y + 2} stroke="#228b22" strokeWidth="2" />
          <circle cx={x + 15} cy={y - 2} r="5" fill="#ff69b4" />
          <circle cx={x + 25} cy={y} r="4" fill="#ff1493" />
        </g>
      )}

      {/* Fallen indicator */}
      {isFallen && (
        <text x={x + 30} y={y + 40} fontSize="16">💔</text>
      )}
    </g>
  );
}

// Table Lamp
export function TableLamp({ x, y, isWobbling = false, isFallen = false }: { x: number; y: number; isWobbling?: boolean; isFallen?: boolean }) {
  const rotation = isFallen ? 90 : 0;

  return (
    <g transform={`rotate(${rotation}, ${x + 20}, ${y + 35})`}>
      {/* Shadow */}
      {!isFallen && <ellipse cx={x + 20} cy={y + 55} rx="15" ry="5" fill="rgba(0,0,0,0.15)" />}

      {/* Lamp base */}
      <ellipse cx={x + 20} cy={y + 50} rx="12" ry="5" fill="#b87333" />

      {/* Lamp pole */}
      <rect x={x + 18} y={y + 25} width="4" height="25" fill="#b87333" />

      {/* Lamp shade */}
      <path
        d={`M${x + 5} ${y + 25}
           Q${x + 20} ${y + 10} ${x + 35} ${y + 25}
           Z`}
        fill="#f5e6d3"
        stroke="#b87333"
        strokeWidth="2"
      />

      {/* Shade pattern */}
      <path
        d={`M${x + 10} ${y + 22} Q${x + 20} ${y + 15} ${x + 30} ${y + 22}`}
        stroke="#d4a574"
        strokeWidth="1"
        fill="none"
      />

      {/* Light glow (when on) */}
      <ellipse cx={x + 20} cy={y + 28} rx="15" ry="8" fill="rgba(255, 230, 150, 0.2)" />

      {/* Fallen indicator */}
      {isFallen && (
        <text x={x + 30} y={y + 40} fontSize="16">💔</text>
      )}
    </g>
  );
}

// Coffee Mug
export function CoffeeMug({ x, y, isWobbling = false, isFallen = false }: { x: number; y: number; isWobbling?: boolean; isFallen?: boolean }) {
  const rotation = isFallen ? 90 : 0;

  return (
    <g transform={`rotate(${rotation}, ${x + 15}, ${y + 20})`}>
      {/* Shadow */}
      {!isFallen && <ellipse cx={x + 15} cy={y + 32} rx="14" ry="5" fill="rgba(0,0,0,0.15)" />}

      {/* Mug body */}
      <rect x={x + 5} y={y + 12} width="20" height="20" fill="#ffffff" rx="3" stroke="#e0e0e0" strokeWidth="1" />

      {/* Mug handle */}
      <path d={`M${x + 25} ${y + 15} Q${x + 32} ${y + 15} ${x + 32} ${y + 22} Q${x + 32} ${y + 29} ${x + 25} ${y + 29}`} fill="none" stroke="#ffffff" strokeWidth="4" />
      <path d={`M${x + 25} ${y + 15} Q${x + 32} ${y + 15} ${x + 32} ${y + 22} Q${x + 32} ${y + 29} ${x + 25} ${y + 29}`} fill="none" stroke="#e0e0e0" strokeWidth="3" />

      {/* Coffee inside */}
      <ellipse cx={x + 15} cy={y + 14} rx="8" ry="3" fill="#3c2415" />
      <ellipse cx={x + 15} cy={y + 13} rx="7" ry="2" fill="#5c3a21" />

      {/* Steam */}
      {!isFallen && (
        <g>
          <path d={`M${x + 10} ${y + 5} Q${x + 8} ${y} ${x + 12} ${y - 5}`} stroke="rgba(200,200,200,0.5)" strokeWidth="2" fill="none" />
          <path d={`M${x + 15} ${y + 3} Q${x + 13} ${y - 2} ${x + 17} ${y - 7}`} stroke="rgba(200,200,200,0.5)" strokeWidth="2" fill="none" />
          <path d={`M${x + 20} ${y + 5} Q${x + 18} ${y} ${x + 22} ${y - 5}`} stroke="rgba(200,200,200,0.5)" strokeWidth="2" fill="none" />
        </g>
      )}

      {/* Fallen indicator */}
      {isFallen && (
        <text x={x + 25} y={y + 25} fontSize="16">💔</text>
      )}
    </g>
  );
}

// Plant in Pot
export function Plant({ x, y, type = "fern" }: { x: number; y: number; type?: "fern" | "cactus" | "potted" }) {
  return (
    <g>
      {/* Pot shadow */}
      <ellipse cx={x + 20} cy={y + 45} rx="22" ry="8" fill="rgba(0,0,0,0.15)" />

      {/* Pot */}
      <path d={`M${x + 5} ${y + 30} L${x + 10} ${y + 45} L${x + 30} ${y + 45} L${x + 35} ${y + 30} Z`} fill="#cd853f" stroke="#8b4513" strokeWidth="1" />
      <ellipse cx={x + 20} cy={y + 30} rx="15" ry="5" fill="#deb887" stroke="#8b4513" strokeWidth="1" />

      {/* Soil */}
      <ellipse cx={x + 20} cy={y + 30} rx="12" ry="4" fill="#3c2415" />

      {/* Plant based on type */}
      {type === "fern" && (
        <g>
          {/* Fern leaves */}
          {[0, 45, 90, 135, 180, 225, 270, 315].map((angle, i) => (
            <ellipse
              key={i}
              cx={x + 20}
              cy={y + 25}
              rx="3"
              ry="18"
              fill="#228b22"
              transform={`rotate(${angle + (i % 2) * 15}, ${x + 20}, ${y + 25})`}
            />
          ))}
          {/* Center leaves */}
          <ellipse cx={x + 20} cy={y + 15} rx="4" ry="15" fill="#2e8b2e" />
        </g>
      )}

      {type === "cactus" && (
        <g>
          {/* Main cactus body */}
          <ellipse cx={x + 20} cy={y + 18} rx="12" ry="20" fill="#2e8b57" />
          {/* Cactus arms */}
          <ellipse cx={x + 8} cy={y + 20} rx="6" ry="10" fill="#2e8b57" transform="rotate(-30, 8, 20)" />
          <ellipse cx={x + 32} cy={y + 25} rx="6" ry="8" fill="#2e8b57" transform="rotate(30, 32, 25)" />
          {/* Spines */}
          {[0, 60, 120, 180, 240, 300].map(i => (
            <line key={i} x1={x + 20} y1={y + 5} x2={x + 20 + Math.cos(i * Math.PI/180) * 15} y2={y + 5 + Math.sin(i * Math.PI/180) * 15} stroke="#1a5f3a" strokeWidth="1" />
          ))}
        </g>
      )}

      {type === "potted" && (
        <g>
          {/* Single stem */}
          <line x1={x + 20} y1={y + 30} x2={x + 20} y2={y + 10} stroke="#228b22" strokeWidth="3" />
          {/* Leaves */}
          <ellipse cx={x + 12} cy={y + 18} rx="8" ry="5" fill="#32cd32" transform="rotate(-30, 12, 18)" />
          <ellipse cx={x + 28} cy={y + 18} rx="8" ry="5" fill="#32cd32" transform="rotate(30, 28, 18)" />
          <ellipse cx={x + 20} cy={y + 8} rx="6" ry="8" fill="#3cb371" />
        </g>
      )}
    </g>
  );
}

// Toy Ball
export function ToyBall({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + 15} cy={y + 15} r="15" fill="#ff6b6b" />
      <circle cx={x + 15} cy={y + 15} r="15" fill="none" stroke="#e55555" strokeWidth="2" />
      {/* Stripe pattern */}
      <path d={`M${x + 5} ${y + 5} Q${x + 15} ${y + 15} ${x + 5} ${y + 25}`} stroke="#e55555" strokeWidth="3" fill="none" />
      <path d={`M${x + 25} ${y + 5} Q${x + 15} ${y + 15} ${x + 25} ${y + 25}`} stroke="#e55555" strokeWidth="3" fill="none" />
      {/* Shine */}
      <ellipse cx={x + 10} cy={y + 10} rx="4" ry="3" fill="white" opacity="0.4" />
    </g>
  );
}

// Yarn Ball
export function YarnBall({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x + 15} cy={y + 15} r="15" fill="#4ecdc4" />
      {/* Yarn strands */}
      {[0, 30, 60, 90, 120, 150].map((angle, i) => (
        <path
          key={i}
          d={`M${x + 15} ${y + 15} Q${x + 15 + Math.cos(angle * Math.PI/180) * 15} ${y + 15 + Math.sin(angle * Math.PI/180) * 15} ${x + 15 + Math.cos((angle + 20) * Math.PI/180) * 12} ${y + 15 + Math.sin((angle + 20) * Math.PI/180) * 12}`}
          stroke="#3dbdb4"
          strokeWidth="2"
          fill="none"
        />
      ))}
      {/* Loose thread */}
      <path d={`M${x + 25} ${y + 25} Q${x + 30} ${y + 30} ${x + 35} ${y + 28}`} stroke="#4ecdc4" strokeWidth="2" fill="none" />
    </g>
  );
}

// Cat with detailed design - More visible with outlines and distinctive collars
export function CatSprite({ emoji, x, y, state = "idle", scale = 1 }: { emoji: string; x: number; y: number; state?: string; scale?: number }) {
  const bounce = state === "playing" ? { animation: "catBounce 0.3s ease-in-out infinite" } : {};
  const pulse = state === "purring" ? { animation: "catPulse 0.5s ease-in-out infinite" } : {};

  // Color mapping for cats with distinctive collars
  const catColors: Record<string, { body: string; stripe: string; collar: string; eye: string }> = {
    "🐱": { body: "#ff9f43", stripe: "#e67e22", collar: "#e74c3c", eye: "#2d3436" },   // Orange tabby - red collar
    "🐈": { body: "#a4b0be", stripe: "#747d8c", collar: "#3498db", eye: "#f1c40f" },   // Gray - blue collar
    "😺": { body: "#fed330", stripe: "#f1c40f", collar: "#2ecc71", eye: "#2d3436" },   // Yellow - green collar
    "😸": { body: "#fd79a8", stripe: "#e84393", collar: "#9b59b6", eye: "#2d3436" },   // Pink - purple collar
    "😼": { body: "#fdcb6e", stripe: "#f39c12", collar: "#34495e", eye: "#2d3436" },   // Golden - dark collar
    "😽": { body: "#ffeaa7", stripe: "#fdcb6e", collar: "#e84393", eye: "#2d3436" },   // Cream - pink collar
  };

  const colors = catColors[emoji] || catColors["🐱"];

  return (
    <g transform={`translate(${x - 28}, ${y - 28}) scale(${scale})`}>
      {/* Strong shadow */}
      <ellipse cx="28" cy="50" rx="22" ry="8" fill="rgba(0,0,0,0.25)" />

      {/* Cat body */}
      <g style={bounce}>
        {/* Body outline */}
        <ellipse cx="28" cy="35" rx="24" ry="20" fill="rgba(0,0,0,0.1)" />
        <ellipse cx="28" cy="35" rx="22" ry="18" fill={colors.body} />

        {/* Body stripes */}
        <path d="M15 28 Q28 20 41 28" stroke={colors.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />
        <path d="M12 38 Q28 30 44 38" stroke={colors.stripe} strokeWidth="3" fill="none" strokeLinecap="round" />

        {/* Head outline */}
        <circle cx="28" cy="14" r="16" fill="rgba(0,0,0,0.1)" />
        <circle cx="28" cy="14" r="15" fill={colors.body} />

        {/* Ears */}
        <polygon points="15,4 24,14 12,14" fill={colors.body} stroke={colors.stripe} strokeWidth="1" />
        <polygon points="41,4 32,14 44,14" fill={colors.body} stroke={colors.stripe} strokeWidth="1" />
        <polygon points="17,7 22,12 14,12" fill="#ffccd5" />
        <polygon points="39,7 34,12 42,12" fill="#ffccd5" />

        {/* Eyes - large and visible */}
        <circle cx="22" cy="12" r="4" fill="#fff" />
        <circle cx="34" cy="12" r="4" fill="#fff" />
        <circle cx="22" cy="12" r="2.5" fill={colors.eye} />
        <circle cx="34" cy="12" r="2.5" fill={colors.eye} />
        <circle cx="23" cy="11" r="1" fill="#fff" />
        <circle cx="35" cy="11" r="1" fill="#fff" />

        {/* Nose */}
        <ellipse cx="28" cy="18" rx="4" ry="3" fill="#ffccd5" />

        {/* Mouth */}
        <path d="M26 21 Q28 23 30 21" stroke={colors.eye} strokeWidth="1.5" fill="none" />

        {/* Whiskers */}
        <line x1="10" y1="15" x2="18" y2="17" stroke={colors.eye} strokeWidth="1" />
        <line x1="10" y1="19" x2="18" y2="19" stroke={colors.eye} strokeWidth="1" />
        <line x1="38" y1="17" x2="46" y2="15" stroke={colors.eye} strokeWidth="1" />
        <line x1="38" y1="19" x2="46" y2="19" stroke={colors.eye} strokeWidth="1" />

        {/* Distinctive Collar */}
        <path d="M18 26 Q28 32 38 26" stroke={colors.collar} strokeWidth="4" fill="none" strokeLinecap="round" />
        <circle cx="28" cy="29" r="3" fill="#f1c40f" />
      </g>
    </g>
  );
}

// Indoor plant for window sill
export function WindowPlant({ x, y }: { x: number; y: number }) {
  return (
    <g>
      {/* Pot */}
      <path d={`M${x} ${y + 20} L${x + 5} ${y + 35} L${x + 35} ${y + 35} L${x + 40} ${y + 20} Z`} fill="#8b4513" stroke="#5c3317" strokeWidth="1" />
      <ellipse cx={x + 20} cy={y + 20} rx="20" ry="5" fill="#a0522d" stroke="#5c3317" strokeWidth="1" />

      {/* Plant leaves */}
      <ellipse cx={x + 15} cy={y + 15} rx="8" ry="15" fill="#228b22" transform="rotate(-20, 15, 15)" />
      <ellipse cx={x + 25} cy={y + 15} rx="8" ry="15" fill="#2e8b57" transform="rotate(20, 25, 15)" />
      <ellipse cx={x + 20} cy={y + 10} rx="6" ry="12" fill="#32cd32" />
    </g>
  );
}

// Export all as default object for easy importing
export const RoomElements = {
  WoodFloor,
  BackWall,
  SideWalls,
  Window,
  CatTree,
  SisalPattern,
  FoodBowl,
  WaterBowl,
  Rug,
  Bookshelf,
  Sofa,
  DiningTable,
  Vase,
  TableLamp,
  CoffeeMug,
  Plant,
  ToyBall,
  YarnBall,
  CatSprite,
  WindowPlant,
};
