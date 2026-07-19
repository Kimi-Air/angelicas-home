// 装修风格预设：材质槽位颜色 + 灯光参数 + 地板纹理规格
// 五款风格仅改变材质、颜色与灯光；R27 的功能布局和家具包络保持锁定。

export type StyleKey = 'lux' | 'italian' | 'wood' | 'vintage' | 'minimal'

/** 材质槽位：场景内所有可换色材质都通过槽位引用，切换风格时即时更新 */
export type Slot =
  | 'wall' // 墙面
  | 'baseboard' // 踢脚线
  | 'frame' // 门窗框
  | 'doorLeaf' // 门扇
  | 'wood' // 家具主木色
  | 'woodLight' // 浅木色
  | 'sofa' // 沙发主体
  | 'sofaAccent' // 沙发点缀（抱枕/单椅）
  | 'fabric' // 布艺（坐垫/椅垫）
  | 'cabinet' // 橱柜/柜体
  | 'entryCabinet' // 入户旁半高鞋柜（按风格与木地板形成明确差异）
  | 'counter' // 台面/岩板
  | 'wardrobe' // 衣柜
  | 'bedding' // 床品主色
  | 'beddingAccent' // 床品点缀
  | 'tableTop' // 桌几面
  | 'studyOak' // 书房参考图指定浅木色
  | 'metal' // 黑色/深色金属
  | 'gold' // 黄铜/香槟金点缀
  | 'rattan' // 藤编元素
  | 'rug' // 地毯
  | 'appliance' // 家电/洁具
  | 'lamp' // 灯罩
  | 'plant' // 绿植
  | 'pot' // 花盆
  | 'screen' // 电视屏幕/镜面

export interface LightPreset {
  hemiSky: string
  hemiGround: string
  hemiIntensity: number
  sunColor: string
  sunIntensity: number
  pointColor: string
  pointIntensity: number
  ambient: string
  ambientIntensity: number
  /** ACES 色调映射曝光，浅色方案降低曝光以保留材质层次 */
  exposure: number
  /** 场景背景与外部地面色，不参与室内主色计数 */
  environment: string
  ground: string
  /** 灯光色温说明（UI 展示） */
  kelvin: string
}

export type SurfaceTexture = 'wood' | 'stone' | 'fabric'

export interface SurfaceFinish {
  roughness: number
  metalness?: number
  texture?: SurfaceTexture
  /** 程序纹理的次色；实际下单仍须以实物样板为准 */
  accent?: string
  repeat?: number
}

export interface GlassPreset {
  color: string
  roughness: number
  metalness: number
  opacity: number
}

export interface FloorTexSpec {
  type: 'plank' | 'marble' | 'herringbone' | 'concrete'
  base: string
  grain: string
}

export interface FloorPreset {
  wood: FloorTexSpec // 木地板块（客餐厅/卧室/通铺区）
  tile: FloorTexSpec // 瓷砖块（厨卫）
}

export interface StylePreset {
  key: StyleKey
  name: string
  desc: string
  palette: string[]
  slots: Record<Slot, string>
  finishes: Partial<Record<Slot, SurfaceFinish>>
  glass: GlassPreset
  light: LightPreset
  floor: FloorPreset
}

export const STYLES: Record<StyleKey, StylePreset> = {
  lux: {
    key: 'lux',
    name: '暖灰雅致',
    desc: '暖灰矿物面 · 烟熏橡木 · 松针绿软包 · 拉丝深镍 · 3000–3500K',
    palette: ['#e1dcd4', '#8c7662', '#40564e', '#5b5955'],
    slots: {
      wall: '#e1dcd4',
      baseboard: '#c9c2b8',
      frame: '#5b5955',
      doorLeaf: '#aaa299',
      wood: '#8c7662',
      woodLight: '#b49b7d',
      sofa: '#40564e',
      sofaAccent: '#7c8b84',
      fabric: '#8e9992',
      cabinet: '#b0a89d',
      entryCabinet: '#75837b',
      counter: '#e2ddd5',
      wardrobe: '#c6c0b7',
      bedding: '#ded8cf',
      beddingAccent: '#40564e',
      tableTop: '#a68c70',
      studyOak: '#b49b7d',
      metal: '#5b5955',
      gold: '#69645e',
      rattan: '#a78c68',
      rug: '#c9c2b6',
      appliance: '#b9bab7',
      lamp: '#eee6d7',
      plant: '#536b59',
      pot: '#67635e',
      screen: '#141517',
    },
    finishes: {
      wood: { roughness: 0.72, texture: 'wood', accent: '#655243', repeat: 2.2 },
      woodLight: { roughness: 0.76, texture: 'wood', accent: '#887054', repeat: 2.2 },
      tableTop: { roughness: 0.68, texture: 'wood', accent: '#765e49', repeat: 2.4 },
      studyOak: { roughness: 0.72, texture: 'wood', accent: '#887054', repeat: 2.4 },
      counter: { roughness: 0.5, texture: 'stone', accent: '#c8c0b4', repeat: 1.5 },
      sofa: { roughness: 0.82, texture: 'fabric', accent: '#31473f', repeat: 5 },
      cabinet: { roughness: 0.88 }, entryCabinet: { roughness: 0.92 }, wardrobe: { roughness: 0.9 },
      metal: { roughness: 0.42, metalness: 0.72 }, gold: { roughness: 0.46, metalness: 0.65 },
      appliance: { roughness: 0.38, metalness: 0.42 },
    },
    glass: { color: '#b8c0bc', roughness: 0.18, metalness: 0.06, opacity: 0.28 },
    light: {
      hemiSky: '#fff8ee',
      hemiGround: '#9f988b',
      hemiIntensity: 0.58,
      sunColor: '#fff3e3',
      sunIntensity: 1.45,
      pointColor: '#ffe6c7',
      pointIntensity: 18,
      ambient: '#f3eadc',
      ambientIntensity: 0.18,
      exposure: 0.9,
      environment: '#c8c5bc',
      ground: '#9da593',
      kelvin: '3000–3500K 高显色暖中性光',
    },
    floor: {
      wood: { type: 'plank', base: '#b39b7f', grain: '#8b735c' },
      tile: { type: 'concrete', base: '#d0c9bf', grain: '#b4ada3' },
    },
  },
  italian: {
    key: 'italian',
    name: '意式静奢',
    desc: '灰泥暖墙 · 局部烟熏胡桃 · 灰褐超哑柜 · 酒红褐点缀 · 3000K',
    palette: ['#d8d0c4', '#665040', '#9d948b', '#6a4446'],
    slots: {
      wall: '#d8d0c4',
      baseboard: '#aaa197',
      frame: '#403934',
      doorLeaf: '#8d8379',
      wood: '#665040',
      woodLight: '#80634e',
      sofa: '#655149',
      sofaAccent: '#6a4446',
      fabric: '#8a756a',
      cabinet: '#9d948b',
      entryCabinet: '#a69e96',
      counter: '#d8cbb8',
      wardrobe: '#b8b1a8',
      bedding: '#d9d0c3',
      beddingAccent: '#6a4446',
      tableTop: '#665040',
      studyOak: '#8d6c50',
      metal: '#403934',
      gold: '#665d54',
      rattan: '#957657',
      rug: '#aaa096',
      appliance: '#aaa9a5',
      lamp: '#e8dcc8',
      plant: '#4f6242',
      pot: '#4b4038',
      screen: '#0e0d0c',
    },
    finishes: {
      wood: { roughness: 0.64, texture: 'wood', accent: '#3f3027', repeat: 2 },
      woodLight: { roughness: 0.68, texture: 'wood', accent: '#554032', repeat: 2 },
      tableTop: { roughness: 0.58, texture: 'wood', accent: '#3f3027', repeat: 2.4 },
      studyOak: { roughness: 0.65, texture: 'wood', accent: '#604833', repeat: 2.2 },
      counter: { roughness: 0.46, texture: 'stone', accent: '#bda98e', repeat: 1.4 },
      sofa: { roughness: 0.72, texture: 'fabric', accent: '#4c3d37', repeat: 5 },
      cabinet: { roughness: 0.9 }, entryCabinet: { roughness: 0.93 }, wardrobe: { roughness: 0.9 },
      metal: { roughness: 0.38, metalness: 0.78 }, gold: { roughness: 0.44, metalness: 0.68 },
      appliance: { roughness: 0.36, metalness: 0.48 },
    },
    glass: { color: '#a9a6a1', roughness: 0.2, metalness: 0.08, opacity: 0.3 },
    light: {
      hemiSky: '#fff5ea',
      hemiGround: '#756a5e',
      hemiIntensity: 0.48,
      sunColor: '#fff0dc',
      sunIntensity: 1.3,
      pointColor: '#ffe2bd',
      pointIntensity: 18,
      ambient: '#eee3d6',
      ambientIntensity: 0.16,
      exposure: 0.88,
      environment: '#b9b1a6',
      ground: '#86877d',
      kelvin: '3000K 高显色暖光',
    },
    floor: {
      wood: { type: 'plank', base: '#8f735b', grain: '#6d533f' },
      tile: { type: 'marble', base: '#b9aa97', grain: '#94816c' },
    },
  },
  wood: {
    key: 'wood',
    name: '白橡自然',
    desc: '米白矿物墙 · 中性白橡木 · 亚麻织物 · 苔绿点缀 · 3500K 自然暖光',
    palette: ['#f2efe7', '#c6a06d', '#b7ad9b', '#738064'],
    slots: {
      wall: '#f2efe7',
      baseboard: '#ded8cb',
      frame: '#77746d',
      doorLeaf: '#ddd3c1',
      wood: '#c6a06d',
      woodLight: '#dec69a',
      sofa: '#b7ad9b',
      sofaAccent: '#738064',
      fabric: '#d2cabb',
      cabinet: '#e1dccf',
      entryCabinet: '#ece8de',
      counter: '#e6e1d6',
      wardrobe: '#e7e2d8',
      bedding: '#e9e4da',
      beddingAccent: '#738064',
      tableTop: '#c6a06d',
      studyOak: '#c6a06d',
      metal: '#6a6862',
      gold: '#77736a',
      rattan: '#b99364',
      rug: '#d8d0c1',
      appliance: '#d4d4d0',
      lamp: '#eee8da',
      plant: '#738064',
      pot: '#aaa293',
      screen: '#202224',
    },
    finishes: {
      wood: { roughness: 0.78, texture: 'wood', accent: '#9b7448', repeat: 2.4 },
      woodLight: { roughness: 0.8, texture: 'wood', accent: '#b28f5f', repeat: 2.4 },
      tableTop: { roughness: 0.74, texture: 'wood', accent: '#9b7448', repeat: 2.5 },
      studyOak: { roughness: 0.74, texture: 'wood', accent: '#9b7448', repeat: 2.5 },
      counter: { roughness: 0.58, texture: 'stone', accent: '#d0cabf', repeat: 1.6 },
      sofa: { roughness: 0.94, texture: 'fabric', accent: '#9e9585', repeat: 6 },
      cabinet: { roughness: 0.92 }, entryCabinet: { roughness: 0.94 }, wardrobe: { roughness: 0.93 },
      metal: { roughness: 0.52, metalness: 0.58 }, gold: { roughness: 0.55, metalness: 0.5 },
      appliance: { roughness: 0.4, metalness: 0.35 },
    },
    glass: { color: '#d0d7d4', roughness: 0.16, metalness: 0.04, opacity: 0.25 },
    light: {
      hemiSky: '#fffaf2',
      hemiGround: '#c2b8a6',
      hemiIntensity: 0.68,
      sunColor: '#fff7e8',
      sunIntensity: 1.65,
      pointColor: '#ffefd8',
      pointIntensity: 16,
      ambient: '#f5eee4',
      ambientIntensity: 0.22,
      exposure: 0.88,
      environment: '#d2d0c6',
      ground: '#a7ad98',
      kelvin: '3500K 高显色自然暖光',
    },
    floor: {
      wood: { type: 'plank', base: '#d3ba8e', grain: '#b08d60' },
      tile: { type: 'concrete', base: '#ddd8cc', grain: '#c4bcae' },
    },
  },
  vintage: {
    key: 'vintage',
    name: '奶油中古',
    desc: '象牙奶油墙 · 中等柚木直拼 · 焦糖皮革 · 橄榄绿点缀 · 2700–3000K',
    palette: ['#e9dfcf', '#926747', '#a26847', '#6c7355'],
    slots: {
      wall: '#e9dfcf',
      baseboard: '#cbbca7',
      frame: '#403731',
      doorLeaf: '#a58c72',
      wood: '#926747',
      woodLight: '#b68c61',
      sofa: '#a26847',
      sofaAccent: '#6c7355',
      fabric: '#b79575',
      cabinet: '#c9bba7',
      entryCabinet: '#ded1bf',
      counter: '#d7c6ae',
      wardrobe: '#d3c6b3',
      bedding: '#e7dac7',
      beddingAccent: '#6c7355',
      tableTop: '#926747',
      studyOak: '#a87951',
      metal: '#403731',
      gold: '#65574b',
      rattan: '#b88e5d',
      rug: '#cdbb9f',
      appliance: '#bebbb4',
      lamp: '#f2ddb8',
      plant: '#5d684b',
      pot: '#745b48',
      screen: '#191817',
    },
    finishes: {
      wood: { roughness: 0.7, texture: 'wood', accent: '#67452f', repeat: 2.1 },
      woodLight: { roughness: 0.74, texture: 'wood', accent: '#835f3d', repeat: 2.2 },
      tableTop: { roughness: 0.66, texture: 'wood', accent: '#67452f', repeat: 2.4 },
      studyOak: { roughness: 0.7, texture: 'wood', accent: '#775035', repeat: 2.3 },
      counter: { roughness: 0.56, texture: 'stone', accent: '#bda989', repeat: 1.5 },
      sofa: { roughness: 0.68, texture: 'fabric', accent: '#78482f', repeat: 5 },
      cabinet: { roughness: 0.88 }, entryCabinet: { roughness: 0.92 }, wardrobe: { roughness: 0.9 },
      rattan: { roughness: 0.92, texture: 'fabric', accent: '#89653e', repeat: 7 },
      metal: { roughness: 0.45, metalness: 0.7 }, gold: { roughness: 0.5, metalness: 0.58 },
      appliance: { roughness: 0.4, metalness: 0.38 },
    },
    glass: { color: '#b9afa1', roughness: 0.2, metalness: 0.06, opacity: 0.28 },
    light: {
      hemiSky: '#fff4e5',
      hemiGround: '#9d8e77',
      hemiIntensity: 0.52,
      sunColor: '#ffecd3',
      sunIntensity: 1.35,
      pointColor: '#ffdfb5',
      pointIntensity: 18,
      ambient: '#f4e1c8',
      ambientIntensity: 0.17,
      exposure: 0.88,
      environment: '#c8bdae',
      ground: '#96947f',
      kelvin: '2700–3000K 高显色暖光',
    },
    floor: {
      wood: { type: 'plank', base: '#a47a55', grain: '#7f5b3e' },
      tile: { type: 'marble', base: '#d7c7ae', grain: '#b9a282' },
    },
  },
  minimal: {
    key: 'minimal',
    name: '暖木灰简约',
    desc: '骨白墙面 · 蘑菇灰超哑柜 · 中性橡木 · 矿物灰绿软包 · 3500K',
    palette: ['#ece9e2', '#d2cec5', '#ad9475', '#59645f'],
    slots: {
      wall: '#ece9e2',
      baseboard: '#d6d1c7',
      frame: '#444846',
      doorLeaf: '#a9a39a',
      wood: '#9b856d',
      woodLight: '#b8a386',
      sofa: '#59645f',
      sofaAccent: '#66786c',
      fabric: '#9aa19b',
      cabinet: '#d2cec5',
      entryCabinet: '#7f8983',
      counter: '#ddd8cf',
      wardrobe: '#ddd9d1',
      bedding: '#e3ded5',
      beddingAccent: '#78898c',
      tableTop: '#9b856d',
      studyOak: '#ad9475',
      metal: '#444846',
      gold: '#5e605c',
      rattan: '#987e60',
      rug: '#c9c2b6',
      appliance: '#b7b8b5',
      lamp: '#eee7da',
      plant: '#66786c',
      pot: '#66635e',
      screen: '#101112',
    },
    finishes: {
      wood: { roughness: 0.72, texture: 'wood', accent: '#6f5e4e', repeat: 2.3 },
      woodLight: { roughness: 0.76, texture: 'wood', accent: '#8c765e', repeat: 2.3 },
      tableTop: { roughness: 0.68, texture: 'wood', accent: '#6f5e4e', repeat: 2.5 },
      studyOak: { roughness: 0.72, texture: 'wood', accent: '#806b55', repeat: 2.5 },
      counter: { roughness: 0.52, texture: 'stone', accent: '#c5beb3', repeat: 1.5 },
      sofa: { roughness: 0.8, texture: 'fabric', accent: '#414d48', repeat: 5 },
      fabric: { roughness: 0.96, texture: 'fabric', accent: '#78827b', repeat: 6 },
      rug: { roughness: 0.98, texture: 'fabric', accent: '#aca497', repeat: 7 },
      cabinet: { roughness: 0.92 }, entryCabinet: { roughness: 0.94 }, wardrobe: { roughness: 0.93 },
      metal: { roughness: 0.42, metalness: 0.72 }, gold: { roughness: 0.5, metalness: 0.58 },
      appliance: { roughness: 0.36, metalness: 0.45 },
    },
    glass: { color: '#b9c2be', roughness: 0.18, metalness: 0.05, opacity: 0.26 },
    light: {
      hemiSky: '#fffaf3',
      hemiGround: '#a9a194',
      hemiIntensity: 0.64,
      sunColor: '#fff8ee',
      sunIntensity: 1.45,
      pointColor: '#ffe9ca',
      pointIntensity: 16,
      ambient: '#f5eee3',
      ambientIntensity: 0.2,
      exposure: 0.88,
      environment: '#c9cbc2',
      ground: '#9fa797',
      kelvin: '3500K 高显色自然暖光',
    },
    floor: {
      wood: { type: 'plank', base: '#b7a68f', grain: '#8d7962' },
      tile: { type: 'concrete', base: '#cfc8bc', grain: '#b2aa9e' },
    },
  },
}

export const STYLE_ORDER: StyleKey[] = ['minimal', 'wood', 'italian', 'lux', 'vintage']

export function isStyleKey(v: string | null): v is StyleKey {
  return v === 'lux' || v === 'italian' || v === 'wood' || v === 'vintage' || v === 'minimal'
}
