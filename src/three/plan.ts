// R35 权威户型模型（方案比例，单位：米）
// 坐标系：x 向东/右，z 向南/下，y 向上。
// 仅相对位置已确认；墙厚、洞口、设备与定制柜尺寸均须完成面复尺后深化。

export const WALL_H = 2.8
export const EXT_T = 0.24
export const INT_T = 0.12

export type OpeningKind = 'door' | 'entry' | 'window' | 'pass' | 'sliding' | 'bay'

export interface Opening {
  start: number
  width: number
  sill: number
  top: number
  kind: OpeningKind
  bayDepth?: number
  bayFront?: number
  baySide?: 'solid-full-height' | 'glazed'
  panels?: number
}

export interface WallDef {
  x1: number
  z1: number
  x2: number
  z2: number
  t: number
  openings?: Opening[]
  railing?: boolean
}

export interface FloorRect {
  x1: number
  z1: number
  x2: number
  z2: number
  slot: 'wood' | 'tile'
}

export interface BayPlatform {
  id: string
  points: Array<[number, number]>
  slot: 'wood' | 'tile'
  sillHeight: number
}

export const BAY_WINDOW_RULES = {
  sillHeight: 0.45,
  maxProjectionReference: 0.7,
  guardHeightFromPlatform: 0.9,
  treatedAsFloor: false,
} as const

export const PASSAGE_PARTITION = {
  x: 7.5,
  startZ: 3.4,
  endZ: 4.9,
} as const

// R34 / C69：原始户型图的两处外轮廓错台。
// 储物间西侧相对下方厨房外墙向西外挑；主卧南侧相对客厅—阳台界面向南延伸。
// 0.52 m 与 0.57 m 为依据原图分段尺寸和图面比例建立的模型参考值，须现场复尺。
export const STRUCTURAL_PROJECTIONS = {
  storage: {
    westX: 3.08,
    alignedWallX: 3.6,
    eastX: 4.55,
    northZ: 0,
    southZ: 1.15,
    westProjection: 0.52,
  },
  master: {
    northZ: 8.1,
    livingInterfaceZ: 12.2,
    southZ: 12.77,
    southProjection: 0.57,
  },
} as const

export const BEDROOM_FOOTPRINTS = {
  secondary: { x1: 0, x2: 3.6, z1: 7.3, z2: 12.2, sourceArea: 17.4 },
  master: { x1: 7.65, x2: 12.4, z1: STRUCTURAL_PROJECTIONS.master.northZ, z2: STRUCTURAL_PROJECTIONS.master.southZ, sourceArea: 19.6 },
} as const

// R35 / C70：主卧北侧从主卫分隔墙到东侧外墙返段在平面上是一条连续直墙。
// 旧模型将 x=11.2 m 两侧拆成不同厚度的共线墙段，顶视产生台阶状“毛边”。
// 当前以一段连续墙表达；墙厚仍是方案参考，须由结构图与完成面复尺确认。
export const MASTER_NORTH_WALL = {
  startX: 9,
  endX: BEDROOM_FOOTPRINTS.master.x2,
  z: STRUCTURAL_PROJECTIONS.master.northZ,
  thickness: EXT_T,
} as const

export const LAUNDRY_SINK_WINDOW = {
  wallX: 7.65,
  wallStartZ: STRUCTURAL_PROJECTIONS.master.southZ,
  start: 0.33,
  width: 0.8,
  sill: 1.05,
  top: 2.2,
  centerZ: 13.5,
} as const

// 生活阳台正面大窗：作为侧窗墙体收口与窗台/窗顶高度的参照。
export const LIVING_BALCONY_FRONT_WINDOW = {
  wallStartX: 3.6,
  wallEndX: 7.65,
  z: 14.3,
  start: 0.3,
  width: 3.45,
  sill: 0.15,
  top: 2.5,
} as const

// R39 / C76：西侧大窗参考正面窗，保留左右墙垛、下部窗台墙和上部过梁。
// 安全玻璃、开启扇、栏护、防水及真实洞口仍须以原建筑和现场复核。
export const LIVING_BALCONY_WEST_WINDOW = {
  wallX: 3.6,
  startZ: 12.2,
  endZ: 14.3,
  start: 0.15,
  width: 1.8,
  sill: LIVING_BALCONY_FRONT_WINDOW.sill,
  top: LIVING_BALCONY_FRONT_WINDOW.top,
} as const

export interface RoomLabel {
  name: string
  area: string
  x: number
  z: number
}

export const WALLS: WallDef[] = [
  // 北侧外墙：储物间 / 厨房窗与书房飘窗。
  {
    x1: STRUCTURAL_PROJECTIONS.storage.westX, z1: 0, x2: 7.5, z2: 0, t: EXT_T,
    openings: [{ start: 4.75 - STRUCTURAL_PROJECTIONS.storage.westX, width: 2.35, sill: 0.9, top: 2.3, kind: 'window' }],
  },
  {
    x1: 7.5, z1: 0, x2: 11.2, z2: 0, t: EXT_T,
    openings: [{ start: 0.6, width: 2.5, sill: BAY_WINDOW_RULES.sillHeight, top: 2.4, kind: 'bay', bayDepth: 0.6, bayFront: 1.8, baySide: 'solid-full-height' }],
  },

  // 东侧外墙。
  { x1: 11.2, z1: 0, x2: 11.2, z2: 4.0, t: EXT_T },
  { x1: 11.2, z1: 4.0, x2: 11.2, z2: 6.3, t: EXT_T, openings: [{ start: 0.7, width: 0.6, sill: 1.5, top: 2.1, kind: 'window' }] },
  { x1: 11.2, z1: 6.3, x2: 11.2, z2: 8.1, t: EXT_T, openings: [{ start: 0.5, width: 0.6, sill: 1.5, top: 2.1, kind: 'window' }] },
  // 原图右侧外轮廓在主卫以下向东外扩，主卧并非与书房/客卫共用同一直线外墙。
  {
    x1: MASTER_NORTH_WALL.startX,
    z1: MASTER_NORTH_WALL.z,
    x2: MASTER_NORTH_WALL.endX,
    z2: MASTER_NORTH_WALL.z,
    t: MASTER_NORTH_WALL.thickness,
  },
  { x1: 12.4, z1: 8.1, x2: 12.4, z2: STRUCTURAL_PROJECTIONS.master.southZ, t: EXT_T },

  // 南侧外墙与三处原建筑飘窗。
  { x1: 7.65, z1: STRUCTURAL_PROJECTIONS.master.southZ, x2: 12.4, z2: STRUCTURAL_PROJECTIONS.master.southZ, t: EXT_T, openings: [{ start: 0.96, width: 2.5, sill: BAY_WINDOW_RULES.sillHeight, top: 2.4, kind: 'bay', bayDepth: 0.7, bayFront: 2.0, baySide: 'solid-full-height' }] },
  {
    x1: LIVING_BALCONY_FRONT_WINDOW.wallStartX,
    z1: LIVING_BALCONY_FRONT_WINDOW.z,
    x2: LIVING_BALCONY_FRONT_WINDOW.wallEndX,
    z2: LIVING_BALCONY_FRONT_WINDOW.z,
    t: EXT_T,
    openings: [{
      start: LIVING_BALCONY_FRONT_WINDOW.start,
      width: LIVING_BALCONY_FRONT_WINDOW.width,
      sill: LIVING_BALCONY_FRONT_WINDOW.sill,
      top: LIVING_BALCONY_FRONT_WINDOW.top,
      kind: 'window',
    }],
  },
  {
    x1: LIVING_BALCONY_WEST_WINDOW.wallX,
    z1: LIVING_BALCONY_WEST_WINDOW.startZ,
    x2: LIVING_BALCONY_WEST_WINDOW.wallX,
    z2: LIVING_BALCONY_WEST_WINDOW.endZ,
    t: EXT_T,
    openings: [{
      start: LIVING_BALCONY_WEST_WINDOW.start,
      width: LIVING_BALCONY_WEST_WINDOW.width,
      sill: LIVING_BALCONY_WEST_WINDOW.sill,
      top: LIVING_BALCONY_WEST_WINDOW.top,
      kind: 'window',
    }],
  },
  {
    x1: 7.65, z1: STRUCTURAL_PROJECTIONS.master.southZ, x2: 7.65, z2: 14.3, t: EXT_T,
    openings: [{ start: LAUNDRY_SINK_WINDOW.start, width: LAUNDRY_SINK_WINDOW.width, sill: LAUNDRY_SINK_WINDOW.sill, top: LAUNDRY_SINK_WINDOW.top, kind: 'window' }],
  },
  { x1: 0, z1: 12.2, x2: 3.6, z2: 12.2, t: EXT_T, openings: [{ start: 0.65, width: 1.9, sill: BAY_WINDOW_RULES.sillHeight, top: 2.4, kind: 'bay', bayDepth: 0.55, bayFront: 1.6, baySide: 'solid-full-height' }] },

  // 西侧外墙与入户段。
  { x1: 0, z1: 7.3, x2: 0, z2: 12.2, t: EXT_T },
  { x1: 0, z1: 7.3, x2: 3.6, z2: 7.3, t: EXT_T },
  // 储物间向西外挑，南侧以错台回接厨房西墙。
  { x1: STRUCTURAL_PROJECTIONS.storage.westX, z1: 0, x2: STRUCTURAL_PROJECTIONS.storage.westX, z2: STRUCTURAL_PROJECTIONS.storage.southZ, t: EXT_T },
  { x1: STRUCTURAL_PROJECTIONS.storage.westX, z1: STRUCTURAL_PROJECTIONS.storage.southZ, x2: STRUCTURAL_PROJECTIONS.storage.alignedWallX, z2: STRUCTURAL_PROJECTIONS.storage.southZ, t: EXT_T },
  { x1: 3.6, z1: STRUCTURAL_PROJECTIONS.storage.southZ, x2: 3.6, z2: 3.4, t: EXT_T },
  { x1: 3.6, z1: 3.4, x2: 3.6, z2: 5.9, t: EXT_T, openings: [{ start: 0.2, width: 1.0, sill: 0, top: 2.2, kind: 'entry' }] },
  // R09：该段无窗，为连续玄关柜提供完整实墙界面。
  { x1: 3.6, z1: 5.9, x2: 3.6, z2: 7.3, t: EXT_T },
  // 储物间：占原阳台 B 左段，入口朝厨房。
  { x1: 4.55, z1: 0, x2: 4.55, z2: 1.15, t: INT_T, openings: [{ start: 0.3, width: 0.8, sill: 0, top: 2.1, kind: 'door' }] },
  { x1: STRUCTURAL_PROJECTIONS.storage.alignedWallX, z1: 1.15, x2: 4.55, z2: 1.15, t: INT_T },

  // 厨房：南侧为三扇玻璃门，右侧短墙按业主指令拆除。
  { x1: 7.5, z1: 0, x2: 7.5, z2: 3.4, t: INT_T },
  {
    x1: 3.6, z1: 3.4, x2: 7.5, z2: 3.4, t: INT_T,
    openings: [{ start: 0.12, width: 3.66, sill: 0, top: 2.35, kind: 'sliding', panels: 3 }],
  },

  // R13：恢复原始户型中厨房/书房分界墙向过道延伸的短墙。
  { x1: PASSAGE_PARTITION.x, z1: PASSAGE_PARTITION.startZ, x2: PASSAGE_PARTITION.x, z2: PASSAGE_PARTITION.endZ, t: INT_T },

  // 书房与两卫。
  { x1: 7.5, z1: 4.0, x2: 11.2, z2: 4.0, t: INT_T, openings: [{ start: 0.2, width: 0.8, sill: 0, top: 2.1, kind: 'door' }] },
  { x1: 9.0, z1: 4.0, x2: 9.0, z2: 6.3, t: INT_T, openings: [{ start: 1.5, width: 0.8, sill: 0, top: 2.1, kind: 'door' }] },
  { x1: 9.0, z1: 6.3, x2: 11.2, z2: 6.3, t: INT_T },
  { x1: 9.0, z1: 6.3, x2: 9.0, z2: 8.1, t: INT_T, openings: [{ start: 1.0, width: 0.8, sill: 0, top: 2.1, kind: 'door' }] },
  // 主卧入口、客厅东界与次卧入口门。
  { x1: 7.65, z1: 7.3, x2: 9.0, z2: 7.3, t: INT_T, openings: [{ start: 0.1, width: 0.85, sill: 0, top: 2.1, kind: 'door' }] },
  { x1: 7.65, z1: 7.3, x2: 7.65, z2: STRUCTURAL_PROJECTIONS.master.southZ, t: INT_T },
  { x1: 3.6, z1: 7.3, x2: 3.6, z2: 12.2, t: INT_T, openings: [{ start: 0.3, width: 0.8, sill: 0, top: 2.1, kind: 'door' }] },

  // R23 / C58：客厅与生活阳台之间保留左侧无梁开放口；
  // 右端以通高承重墙段遮挡洗衣机，而不是用一个角点小墙垛代替。
  { x1: 6.77, z1: 12.2, x2: 7.65, z2: 12.2, t: EXT_T },
]

export const FLOORS: FloorRect[] = [
  { x1: STRUCTURAL_PROJECTIONS.storage.westX, z1: 0, x2: 4.55, z2: 1.15, slot: 'tile' },
  { x1: 4.55, z1: 0, x2: 7.5, z2: 1.15, slot: 'tile' },
  { x1: 3.6, z1: 1.15, x2: 7.5, z2: 3.4, slot: 'tile' },
  { x1: 3.6, z1: 3.4, x2: 7.65, z2: 12.2, slot: 'wood' },
  { x1: 3.6, z1: 12.2, x2: 7.65, z2: 14.3, slot: 'tile' },
  { x1: 7.65, z1: 4.0, x2: 9.0, z2: 8.1, slot: 'wood' },
  { x1: 7.5, z1: 0, x2: 11.2, z2: 4.0, slot: 'wood' },
  { x1: 9.0, z1: 4.0, x2: 11.2, z2: 6.3, slot: 'tile' },
  { x1: 9.0, z1: 6.3, x2: 11.2, z2: 8.1, slot: 'tile' },
  { x1: BEDROOM_FOOTPRINTS.master.x1, z1: BEDROOM_FOOTPRINTS.master.z1, x2: BEDROOM_FOOTPRINTS.master.x2, z2: BEDROOM_FOOTPRINTS.master.z2, slot: 'wood' },
  { x1: 0, z1: 7.3, x2: 3.6, z2: 12.2, slot: 'wood' },
]

export const BAY_PLATFORMS: BayPlatform[] = [
  { id: 'study', points: [[8.1, 0], [10.6, 0], [10.35, -0.6], [8.55, -0.6]], slot: 'wood', sillHeight: BAY_WINDOW_RULES.sillHeight },
  { id: 'master', points: [[8.61, STRUCTURAL_PROJECTIONS.master.southZ], [11.11, STRUCTURAL_PROJECTIONS.master.southZ], [10.86, STRUCTURAL_PROJECTIONS.master.southZ + 0.7], [8.86, STRUCTURAL_PROJECTIONS.master.southZ + 0.7]], slot: 'wood', sillHeight: BAY_WINDOW_RULES.sillHeight },
  { id: 'secondary', points: [[0.65, 12.2], [2.55, 12.2], [2.4, 12.75], [0.8, 12.75]], slot: 'wood', sillHeight: BAY_WINDOW_RULES.sillHeight },
]

export const COLUMNS: Array<{ x: number; z: number; size: number; role: string; alignEntity?: string }> = []

export const LIVING_BALCONY_INTERFACE = {
  startX: 3.6,
  loadBearingWallStartX: 6.77,
  loadBearingWallEndX: 7.65,
  loadBearingWallThickness: EXT_T,
  loadBearingWallReferenceWidth: 0.88,
  z: 12.2,
  leftPier: false,
  topBeam: false,
  washerScreenWall: true,
} as const

export const ROOM_LABELS: RoomLabel[] = [
  { name: '储物间', area: '原阳台 B 左段', x: 3.82, z: 0.58 },
  { name: '厨房', area: '6.6㎡', x: 5.65, z: 2.15 },
  { name: '餐厅', area: '开放留白', x: 5.7, z: 4.8 },
  { name: '客厅', area: '36.0㎡', x: 5.65, z: 9.2 },
  { name: '生活阳台', area: '8.6㎡', x: 5.35, z: 13.35 },
  { name: '次卧', area: '17.4㎡', x: 1.8, z: 9.9 },
  { name: '主卧', area: '19.6㎡', x: 10.15, z: 10.55 },
  { name: '书房', area: '12.6㎡', x: 9.35, z: 2.05 },
  { name: '主卫', area: '4.7㎡', x: 10.1, z: 7.2 },
  { name: '客卫', area: '4.0㎡', x: 10.1, z: 5.1 },
  { name: '过道', area: '4.1㎡', x: 8.3, z: 5.5 },
]

export const WALK_RECTS: Array<[number, number, number, number]> = FLOORS.map(
  (f): [number, number, number, number] => [f.x1, f.z1, f.x2, f.z2],
)

export const ROOM_AREAS = [
  { name: '客厅 · 餐厅', area: '36.0㎡' },
  { name: '生活阳台 A', area: '8.6㎡' },
  { name: '厨房', area: '6.6㎡' },
  { name: '储物间（原阳台 B 左段）', area: '待复尺' },
  { name: '次卧', area: '17.4㎡' },
  { name: '主卧', area: '19.6㎡' },
  { name: '书房', area: '12.6㎡' },
  { name: '主卫 / 客卫', area: '4.7 / 4.0㎡' },
  { name: '过道', area: '4.1㎡' },
]

export const CENTER = { x: 6.2, z: 6.85 }
