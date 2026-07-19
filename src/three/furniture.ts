// R37 家具与定制系统：保留既有布局，并落实方镜与玄关柜差异化 CMF。
// 所有尺寸为方案参考值，不能代替完成面复尺与定制深化。
import * as THREE from 'three'
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js'
import type { MaterialRegistry } from './builder'
import { STYLE_ORDER, type Slot, type StyleKey } from './styles'
import { STRUCTURAL_PROJECTIONS } from './plan'

interface Ctx {
  reg: MaterialRegistry
  group: THREE.Group
  glass: THREE.MeshStandardMaterial
}

export interface FurnitureBuild {
  group: THREE.Group
  styleGroups: Record<StyleKey, THREE.Group>
}

function material(ctx: Ctx, slot: Slot) {
  return ctx.reg.get(slot)!
}

function rb(
  ctx: Ctx,
  slot: Slot,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  radius = 0.025,
  ry = 0,
  entityId?: string,
) {
  const geo = new RoundedBoxGeometry(w, h, d, 2, Math.min(radius, w / 2.2, h / 2.2, d / 2.2))
  const mesh = new THREE.Mesh(geo, material(ctx, slot))
  mesh.position.set(x, y, z)
  mesh.rotation.y = ry
  mesh.castShadow = true
  mesh.receiveShadow = true
  if (entityId) mesh.userData = { entityId, revision: 'R37', status: 'confirmed' }
  ctx.group.add(mesh)
  return mesh
}

function glassRb(
  ctx: Ctx,
  w: number,
  h: number,
  d: number,
  x: number,
  y: number,
  z: number,
  entityId: string,
) {
  const geo = new RoundedBoxGeometry(w, h, d, 2, Math.min(0.008, w / 2.2, h / 2.2, d / 2.2))
  const mesh = new THREE.Mesh(geo, ctx.glass)
  mesh.position.set(x, y, z)
  mesh.castShadow = false
  mesh.receiveShadow = true
  mesh.userData = { entityId, revision: 'R37', status: 'confirmed' }
  ctx.group.add(mesh)
  return mesh
}

function cyl(
  ctx: Ctx,
  slot: Slot,
  radius: number,
  h: number,
  x: number,
  y: number,
  z: number,
  entityId?: string,
) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, h, 24), material(ctx, slot))
  mesh.position.set(x, y, z)
  mesh.castShadow = true
  mesh.receiveShadow = true
  if (entityId) mesh.userData = { entityId, revision: 'R37', status: 'confirmed' }
  ctx.group.add(mesh)
  return mesh
}

function buildCounter(
  ctx: Ctx,
  id: string,
  x: number,
  z: number,
  w: number,
  d: number,
) {
  rb(ctx, 'cabinet', w, 0.82, d, x, 0.41, z, 0.02, 0, id)
  rb(ctx, 'counter', w + 0.04, 0.05, d + 0.04, x, 0.845, z, 0.01, 0, id)
}

export const KITCHEN_APPLIANCE_LAYOUT = {
  rightRun: { centerX: 7.12, startZ: 0.255, endZ: 1.705, depth: 0.58, counterCenterY: 0.845, counterThickness: 0.05 },
  dishwasher: { centerX: 7.12, centerZ: 1.03, width: 0.6, depth: 0.54, height: 0.78 },
  microwave: { centerX: 7.08, centerZ: 1.03, width: 0.5, depth: 0.42, height: 0.32, bottomY: 0.89 },
  fridge: {
    centerX: 7.1,
    centerZ: 2.43,
    width: 1.28,
    depth: 0.64,
    height: 1.86,
    northClearance: 0.085,
    southClearance: 0.33,
    doorCount: 2,
  },
} as const

export const STORAGE_LAYOUT = {
  westWallX: STRUCTURAL_PROJECTIONS.storage.westX,
  eastWallX: STRUCTURAL_PROJECTIONS.storage.eastX,
  roomWidth: STRUCTURAL_PROJECTIONS.storage.eastX - STRUCTURAL_PROJECTIONS.storage.westX,
  roomDepth: 1.15,
  shelfDepth: 0.28,
  shelfLength: 0.82,
  standingClearance: STRUCTURAL_PROJECTIONS.storage.eastX - STRUCTURAL_PROJECTIONS.storage.westX - 0.28,
  bottomOpenHeight: 0.72,
} as const

function uNotchedTop(
  ctx: Ctx,
  length: number,
  depth: number,
  thickness: number,
  wallX: number,
  height: number,
  centerZ: number,
  notchWidth: number,
  notchDepth: number,
  entityId: string,
) {
  // 局部 Shape 的 X 对应世界 Z，Y 对应世界 X；东侧前沿为朝向使用者的柔和 U 型内弧。
  const halfLength = length / 2
  const halfNotch = notchWidth / 2
  const shape = new THREE.Shape()
  shape.moveTo(-halfLength, 0)
  shape.lineTo(halfLength, 0)
  shape.lineTo(halfLength, depth)
  shape.lineTo(halfNotch, depth)
  shape.quadraticCurveTo(halfNotch * 0.48, depth - notchDepth, 0, depth - notchDepth)
  shape.quadraticCurveTo(-halfNotch * 0.48, depth - notchDepth, -halfNotch, depth)
  shape.lineTo(-halfLength, depth)
  shape.closePath()
  const geo = new THREE.ExtrudeGeometry(shape, { depth: thickness, bevelEnabled: false, curveSegments: 20 })
  geo.applyMatrix4(new THREE.Matrix4().set(
    0, 1, 0, 0,
    0, 0, 1, 0,
    1, 0, 0, 0,
    0, 0, 0, 1,
  ))
  const mesh = new THREE.Mesh(geo, material(ctx, 'tableTop'))
  mesh.position.set(wallX, height - thickness / 2, centerZ)
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData = { entityId, revision: 'R35', status: 'confirmed' }
  ctx.group.add(mesh)
  return mesh
}

function buildKitchen(ctx: Ctx) {
  // 北侧清洗台；避开左侧储物间。
  buildCounter(ctx, 'C06-sink-counter', 5.92, 0.42, 2.55, 0.58)
  rb(ctx, 'metal', 0.62, 0.1, 0.4, 5.65, 0.89, 0.42, 0.04, 0, 'C06-sink')
  cyl(ctx, 'metal', 0.018, 0.28, 5.65, 1.02, 0.23, 'C06-faucet')

  // 左侧：上段双灶，下段连续切配。
  buildCounter(ctx, 'C07-C08-left-counter', 3.98, 2.13, 0.58, 1.9)
  for (const z of [1.72, 2.12]) {
    const hob = cyl(ctx, 'screen', 0.17, 0.025, 3.98, 0.89, z, 'C07-double-hob')
    hob.rotation.z = Math.PI / 2
  }
  rb(ctx, 'cabinet', 0.34, 0.72, 0.9, 3.82, 1.98, 1.92, 0.02, 0, 'C07-upper-cabinet')

  // R25 / C60：红框处是右侧连续案台的一段，台下洗碗机、台上微波炉。
  // 洗碗机按 600 mm 模块作方案表达，前后剩余段仍为普通地柜；尺寸须以最终机型复核。
  const run = KITCHEN_APPLIANCE_LAYOUT.rightRun
  const dishwasher = KITCHEN_APPLIANCE_LAYOUT.dishwasher
  const microwave = KITCHEN_APPLIANCE_LAYOUT.microwave
  const dishwasherStartZ = dishwasher.centerZ - dishwasher.width / 2
  const dishwasherEndZ = dishwasher.centerZ + dishwasher.width / 2
  const northCabinetLength = dishwasherStartZ - run.startZ
  const southCabinetLength = run.endZ - dishwasherEndZ
  rb(ctx, 'cabinet', run.depth, 0.82, northCabinetLength, run.centerX, 0.41, run.startZ + northCabinetLength / 2, 0.02, 0, 'C10-right-counter-base')
  rb(ctx, 'cabinet', run.depth, 0.82, southCabinetLength, run.centerX, 0.41, dishwasherEndZ + southCabinetLength / 2, 0.02, 0, 'C10-right-counter-base')
  rb(ctx, 'counter', run.depth + 0.04, run.counterThickness, run.endZ - run.startZ + 0.04, run.centerX, run.counterCenterY, (run.startZ + run.endZ) / 2, 0.01, 0, 'C60-kitchen-countertop-extension')

  rb(ctx, 'appliance', dishwasher.depth, dishwasher.height, dishwasher.width - 0.02, dishwasher.centerX, dishwasher.height / 2, dishwasher.centerZ, 0.018, 0, 'C60-kitchen-dishwasher')
  const dishwasherFrontX = dishwasher.centerX - dishwasher.depth / 2 - 0.008
  rb(ctx, 'screen', 0.018, 0.055, dishwasher.width - 0.1, dishwasherFrontX, 0.725, dishwasher.centerZ, 0.006, 0, 'C60-kitchen-dishwasher-control')
  rb(ctx, 'metal', 0.025, 0.025, dishwasher.width - 0.14, dishwasherFrontX - 0.012, 0.66, dishwasher.centerZ, 0.005, 0, 'C60-kitchen-dishwasher-handle')

  const microwaveCenterY = microwave.bottomY + microwave.height / 2
  rb(ctx, 'appliance', microwave.depth, microwave.height, microwave.width, microwave.centerX, microwaveCenterY, microwave.centerZ, 0.025, 0, 'C60-kitchen-microwave')
  const microwaveFrontX = microwave.centerX - microwave.depth / 2 - 0.008
  rb(ctx, 'screen', 0.018, microwave.height - 0.09, microwave.width - 0.16, microwaveFrontX, microwaveCenterY, microwave.centerZ - 0.035, 0.012, 0, 'C60-kitchen-microwave-door')
  rb(ctx, 'metal', 0.024, microwave.height - 0.12, 0.025, microwaveFrontX - 0.012, microwaveCenterY, microwave.centerZ + microwave.width / 2 - 0.075, 0.006, 0, 'C60-kitchen-microwave-handle')

  // R32 / C67：原单门窄冰箱替换为双开门冰箱，并向北扩展填满红框左侧空位。
  // 宽度、散热与门扇包络均为方案参考，最终须以实际机型说明书和完成面复尺替换。
  const fridge = KITCHEN_APPLIANCE_LAYOUT.fridge
  const fridgeFrontX = fridge.centerX - fridge.depth / 2 - 0.008
  const fridgeDoorWidth = (fridge.width - 0.025) / 2
  rb(ctx, 'appliance', fridge.depth, fridge.height, fridge.width, fridge.centerX, fridge.height / 2, fridge.centerZ, 0.035, 0, 'C67-double-door-fridge')
  for (const side of [-1, 1]) {
    const doorCenterZ = fridge.centerZ + side * (fridgeDoorWidth / 2 + 0.006)
    rb(ctx, 'appliance', 0.026, fridge.height - 0.06, fridgeDoorWidth, fridgeFrontX, fridge.height / 2, doorCenterZ, 0.014, 0, 'C67-double-door-fridge-door')
    rb(ctx, 'metal', 0.026, 0.72, 0.025, fridgeFrontX - 0.018, 1.13, fridge.centerZ + side * 0.055, 0.006, 0, 'C67-double-door-fridge-handle')
  }
  rb(ctx, 'metal', 0.028, fridge.height - 0.12, 0.012, fridgeFrontX - 0.01, fridge.height / 2, fridge.centerZ, 0.004, 0, 'C67-double-door-fridge-center-seam')

  // R33 / C68：保留独立储物间与原墙面方向，把不可进入的标准深柜改为浅层收纳。
  // 下部以留空示意行李箱、推车或清洁设备直接推进；层板和门型仍须按物品清单深化。
  const storage = STORAGE_LAYOUT
  const storageWallFaceX = storage.westWallX + 0.06
  const storageCenterX = storageWallFaceX + storage.shelfDepth / 2
  const upperHeight = 2.35 - storage.bottomOpenHeight
  rb(ctx, 'wardrobe', storage.shelfDepth, upperHeight, storage.shelfLength, storageCenterX, storage.bottomOpenHeight + upperHeight / 2, 0.55, 0.02, 0, 'C68-storage-shallow-upper')
  rb(ctx, 'wardrobe', storage.shelfDepth, 0.055, storage.shelfLength, storageCenterX, storage.bottomOpenHeight, 0.55, 0.012, 0, 'C68-storage-open-bay-header')
}

export const ENTRY_CABINET_RUN = {
  wallStart: 4.67,
  wallEnd: 7.09,
  length: 2.42,
  depth: 0.38,
  height: 0.98,
  bottomOpenHeight: 0.18,
  wallFaceX: 3.66,
} as const

export const OPPOSITE_ENTRY_CABINET_RUN = {
  wallStart: 3.4,
  wallEnd: 4.9,
  length: 1.5,
  leftColumnWidth: 0.9,
  rightGlassColumnWidth: 0.6,
  depth: 0.48,
  lowerHeight: 0.72,
  middleHeight: 1.1,
  upperHeight: 0.96,
  totalHeight: 2.78,
  ceilingShadowGap: 0.02,
  exposedGlassSide: 'wallEnd',
} as const

const LIVING_MEDIA_CENTER_Z = 10.12

export const LIVING_LAYOUT = {
  sofaCenterZ: LIVING_MEDIA_CENTER_Z,
  tvCenterZ: LIVING_MEDIA_CENTER_Z,
  previousCenterZ: 9.78,
  centerShiftZ: 0.34,
  sofaMainLength: 3,
  sofaMainDepth: 0.96,
  sofaBackX: 7.51,
  chaiseSide: 'balcony',
  chaiseCenterZ: 11.27,
  chaiseFrontX: 5.92,
  chaiseProjectionX: 1.59,
  chaiseToTvClearanceX: 2.21,
  balconyClearanceZ: 0.58,
  tvWidth: 1.9,
  tvHeight: 1.07,
  tvThickness: 0.075,
  tvCenterY: 1.2,
} as const

function buildEntryCabinet(ctx: Ctx) {
  // R33 / C68：保留半高长柜与上部留白，收浅柜体、降低落物面，并留常穿鞋位。
  const z = (ENTRY_CABINET_RUN.wallStart + ENTRY_CABINET_RUN.wallEnd) / 2
  const x = ENTRY_CABINET_RUN.wallFaceX + ENTRY_CABINET_RUN.depth / 2
  const bodyHeight = ENTRY_CABINET_RUN.height - ENTRY_CABINET_RUN.bottomOpenHeight
  rb(ctx, 'entryCabinet', ENTRY_CABINET_RUN.depth, bodyHeight, ENTRY_CABINET_RUN.length, x, ENTRY_CABINET_RUN.bottomOpenHeight + bodyHeight / 2, z, 0.02, 0, 'C73-entry-half-height-shoe-cabinet-cmf')
  rb(ctx, 'counter', ENTRY_CABINET_RUN.depth + 0.03, 0.04, ENTRY_CABINET_RUN.length + 0.03, x + 0.01, ENTRY_CABINET_RUN.height + 0.02, z, 0.01, 0, 'C52-entry-shoe-cabinet-top')
}

function buildOppositeEntryCabinet(ctx: Ctx) {
  // R20 / C55：面向柜体时，左列中段开放，右列整列为玻璃展示柜。
  const run = OPPOSITE_ENTRY_CABINET_RUN
  const x = 7.2
  const leftZ = run.wallStart + run.leftColumnWidth / 2
  const rightZ = run.wallEnd - run.rightGlassColumnWidth / 2
  const middleY = run.lowerHeight + run.middleHeight / 2
  const upperY = run.lowerHeight + run.middleHeight + run.upperHeight / 2

  // 左列：下、上封闭收纳，中段为完整开放龛。
  rb(ctx, 'cabinet', run.depth, run.lowerHeight, run.leftColumnWidth, x, run.lowerHeight / 2, leftZ, 0.02, 0, 'C55-opposite-left-lower-storage')
  rb(ctx, 'woodLight', 0.1, run.middleHeight, run.leftColumnWidth, 7.41, middleY, leftZ, 0.01, 0, 'C55-opposite-left-open-niche')
  rb(ctx, 'woodLight', run.depth, 0.04, run.leftColumnWidth, x, run.lowerHeight + 0.02, leftZ, 0.01, 0, 'C55-opposite-left-open-niche')
  rb(ctx, 'cabinet', run.depth, run.upperHeight, run.leftColumnWidth, x, upperY, leftZ, 0.02, 0, 'C55-opposite-left-upper-storage')
  rb(ctx, 'lamp', 0.025, 0.025, run.leftColumnWidth - 0.16, 6.96, run.lowerHeight + run.middleHeight - 0.03, leftZ, 0.005, 0, 'C55-opposite-niche-task-light')

  // 右列：通高玻璃门、细框与可见层板，保持原柜深和通道包络不变。
  rb(ctx, 'cabinet', 0.08, run.totalHeight, run.rightGlassColumnWidth, 7.4, run.totalHeight / 2, rightZ, 0.01, 0, 'C55-opposite-right-glass-cabinet')
  for (const shelfY of [0.55, 1.1, 1.65, 2.2]) {
    rb(ctx, 'woodLight', run.depth - 0.1, 0.025, run.rightGlassColumnWidth - 0.08, x, shelfY, rightZ, 0.008, 0, 'C55-opposite-right-glass-shelf')
  }
  const frontX = x - run.depth / 2 - 0.012
  glassRb(ctx, 0.024, run.totalHeight - 0.12, run.rightGlassColumnWidth - 0.08, frontX, run.totalHeight / 2, rightZ, 'C55-opposite-right-glass-door')
  for (const edgeZ of [run.wallEnd - run.rightGlassColumnWidth, run.wallEnd]) {
    rb(ctx, 'frame', 0.035, run.totalHeight, 0.035, frontX - 0.008, run.totalHeight / 2, edgeZ, 0.006, 0, 'C55-opposite-right-glass-frame')
  }
  for (const edgeY of [0.035, run.totalHeight - 0.035]) {
    rb(ctx, 'frame', 0.035, 0.07, run.rightGlassColumnWidth, frontX - 0.008, edgeY, rightZ, 0.006, 0, 'C55-opposite-right-glass-frame')
  }

  // R22 / C57：补齐红框所示外露端侧玻璃，形成正面＋侧面的转角玻璃展示列。
  const sideZ = run.wallEnd + 0.012
  const sideGlassWidth = run.depth - 0.08
  glassRb(ctx, sideGlassWidth, run.totalHeight - 0.12, 0.024, x, run.totalHeight / 2, sideZ, 'C57-opposite-right-exposed-side-glass')
  rb(ctx, 'frame', 0.035, run.totalHeight, 0.035, x + run.depth / 2 - 0.02, run.totalHeight / 2, sideZ + 0.008, 0.006, 0, 'C57-opposite-right-side-glass-frame')
  for (const edgeY of [0.035, run.totalHeight - 0.035]) {
    rb(ctx, 'frame', sideGlassWidth + 0.05, 0.07, 0.035, x, edgeY, sideZ + 0.008, 0.006, 0, 'C57-opposite-right-side-glass-frame')
  }
}

function buildWallMountedTv(ctx: Ctx) {
  // R27 / C62：电视随沙发共同向阳台侧平移，中心线继续严格一致。
  rb(ctx, 'screen', LIVING_LAYOUT.tvThickness, LIVING_LAYOUT.tvHeight, LIVING_LAYOUT.tvWidth, 3.71, LIVING_LAYOUT.tvCenterY, LIVING_LAYOUT.tvCenterZ, 0.015, 0, 'C53-large-wall-mounted-tv')
}

function buildSofa(ctx: Ctx) {
  // R27 / C62：按参考图转译为四座深灰皮质 L 型沙发；贵妃模块位于阳台侧。
  // 整体向 +z 平移 0.34 m，主沙发中心与壁挂电视继续共线；中央仍不设茶几。
  const id = 'C62-l-shaped-leather-sofa'
  const centerZ = LIVING_LAYOUT.sofaCenterZ
  const halfLength = LIVING_LAYOUT.sofaMainLength / 2
  const seatCenters = [-1.08, -0.36, 0.36, 1.08].map((offset) => centerZ + offset)

  // 主框架、低背基座与两侧包覆扶手。
  rb(ctx, 'sofa', LIVING_LAYOUT.sofaMainDepth, 0.28, LIVING_LAYOUT.sofaMainLength, 7.03, 0.29, centerZ, 0.07, 0, id)
  rb(ctx, 'sofa', 0.24, 0.56, LIVING_LAYOUT.sofaMainLength - 0.18, 7.39, 0.61, centerZ, 0.065, 0, id)
  for (const z of [centerZ - halfLength + 0.09, centerZ + halfLength - 0.09]) {
    rb(ctx, 'sofa', 0.82, 0.56, 0.18, 7.03, 0.5, z, 0.07, 0, id)
  }

  // 参考图的四组独立坐垫与饱满靠背，不再使用亮色抱枕。
  for (const z of seatCenters) {
    rb(ctx, 'sofa', 0.62, 0.14, 0.66, 6.87, 0.51, z, 0.055, 0, id)
    rb(ctx, 'sofa', 0.19, 0.43, 0.66, 7.23, 0.78, z, 0.06, 0, id)
  }

  // 阳台侧模块化贵妃位与主座齐平，形成清晰 L 形；模块边界保留以便成品选型调整。
  rb(ctx, 'sofa', 0.66, 0.28, 0.72, 6.25, 0.29, LIVING_LAYOUT.chaiseCenterZ, 0.065, 0, 'C62-chaise-module')
  rb(ctx, 'sofa', 0.68, 0.16, 0.66, 6.26, 0.5, LIVING_LAYOUT.chaiseCenterZ, 0.06, 0, 'C62-chaise-module')

  // 细黑金属脚呼应参考图，并让沙发底部保持可清洁离地。
  for (const [x, z] of [
    [6.66, centerZ - 1.3], [7.34, centerZ - 1.3],
    [6.66, centerZ + 1.3], [7.34, centerZ + 1.3],
    [5.99, LIVING_LAYOUT.chaiseCenterZ - 0.27], [5.99, LIVING_LAYOUT.chaiseCenterZ + 0.27],
  ] as const) {
    cyl(ctx, 'metal', 0.025, 0.15, x, 0.075, z, id)
  }
}

function buildBed(
  ctx: Ctx,
  id: string,
  headX: number,
  z: number,
  width: number,
  length: number,
  direction: 1 | -1,
) {
  const centerX = headX + direction * (length / 2 + 0.06)
  rb(ctx, 'wardrobe', 0.11, 1.05, width + 0.18, headX, 0.62, z, 0.03, 0, `${id}-headboard`)
  rb(ctx, 'wood', length, 0.3, width, centerX, 0.15, z, 0.025, 0, id)
  rb(ctx, 'bedding', length - 0.08, 0.22, width - 0.06, centerX, 0.41, z, 0.05, 0, id)
  rb(ctx, 'beddingAccent', length * 0.48, 0.08, width - 0.08, centerX + direction * length * 0.2, 0.56, z, 0.03, 0, id)
}

function buildWardrobe(ctx: Ctx, id: string, x: number, z: number, w: number, d: number) {
  rb(ctx, 'wardrobe', w, 2.42, d, x, 1.21, z, 0.02, 0, id)
  // 同色细缝替代重复把手与金色线条。
  rb(ctx, 'wood', 0.018, 2.18, 0.025, x, 1.18, z + d / 2 + 0.012, 0.005, 0, id)
}

export const BAY_DESK_LAYOUT = {
  study: {
    side: 'right',
    share: 0.5,
    shape: 'L',
    continuous: true,
    userEdge: 'U-curve',
    entityId: 'C63-study-extended-integrated-desk',
  },
} as const

export const STUDY_LAYOUT = {
  bayDesk: { startX: 9.35, endX: 10.55, centerZ: -0.22, depth: 0.52, height: 0.75 },
  wallReturn: { centerX: 10.83, startZ: -0.05, endZ: 2.18, width: 0.58, height: 0.75 },
  integratedTop: {
    thickness: 0.065,
    backZ: -0.48,
    frontZ: 0.04,
    outerRightX: 11.12,
    innerRightX: 10.54,
    endZ: 2.18,
    userCurve: {
      startX: 9.62,
      startZ: 0.04,
      control1X: 10.02,
      control1Z: 0.04,
      control2X: 10.54,
      control2Z: 0.42,
      endX: 10.54,
      endZ: 0.84,
      radiusReference: 0.45,
    },
  },
  kneeSpace: { width: 1.05, chairCenterX: 9.9 },
  chair: { centerZ: 0.68, rearEdgeZ: 1.06 },
  wardrobe: { x: 9.92, z: 3.65, width: 2.05, depth: 0.55 },
  baseCabinet: { centerX: 10.83, startZ: 1.38, endZ: 2.18, depth: 0.5, height: 0.71 },
  openShelf: {
    depth: 0.28,
    wallX: 11.2,
    startZ: 0.28,
    endZ: 2.18,
    levels: 3,
    bottomY: 1.35,
    levelClearHeight: 0.32,
    shelfThickness: 0.035,
  },
} as const

export const MASTER_LAYOUT = {
  wardrobeMain: { startX: 9.0, endX: 12.4, wallZ: 8.1, depth: 0.58 },
  wardrobeReturn: { wallX: 12.4, startZ: 8.1, endZ: 9.12, depth: 0.58 },
  previousBedCenterZ: 10.34,
  bedShiftZ: 0.4,
  bedCenterZ: 10.74,
  nightstandSize: 0.42,
  upperNightstandCenterZ: 9.58,
  lowerNightstandCenterZ: 11.9,
  upperNightstandStartZ: 9.37,
  wardrobeToNightstandClearance: 0.25,
  bedWidth: 1.8,
  nightstandCount: 2,
  vanityActsAsNightstand: false,
  chair: true,
  lowerRightCabinet: false,
} as const

export const SECONDARY_LAYOUT = {
  // 北墙长柜延续原衣柜位置并向西墙收口；短返落在无门西墙，避开东侧内开门。
  wardrobeMain: { startX: 0, endX: 2.6, wallZ: 7.3, depth: 0.58 },
  wardrobeReturn: { wallX: 0, startZ: 7.3, endZ: 8.26, depth: 0.58 },
  cornerAccess: 'main-run-priority',
  returnFunction: 'secondary-clean-clothes-and-long-hang',
  luggageBay: true,
  nightstandClearance: 0.45,
  doorSwingClearance: 0.38,
  bedHeadX: 0.08,
  bedCenterZ: 10.02,
  nightstandCentersZ: [8.92, 11.12],
  nightstandCount: 2,
  headboardInstallationGap: 0.025,
} as const

export const MASTER_DRESSING_LAYOUT = {
  side: 'visual-right',
  shape: 'L-with-user-facing-U-curve',
  continuousL: true,
  windowRun: { startX: 7.78, endX: 9.78, centerZ: 11.83 + STRUCTURAL_PROJECTIONS.master.southProjection, depth: 0.5, height: 0.75 },
  bayExtension: { startX: 8.7, endX: 9.78, centerZ: 12.3 + STRUCTURAL_PROJECTIONS.master.southProjection, depth: 0.44, height: 0.75, share: 0.5 },
  vanityReturn: {
    wallInnerX: 7.71,
    startZ: 10.48 + STRUCTURAL_PROJECTIONS.master.southProjection,
    endZ: 12.08 + STRUCTURAL_PROJECTIONS.master.southProjection,
    depth: 0.52,
    height: 0.75,
    kneeClearHeight: 0.62,
    userFacingNotchWidth: 0.66,
    userFacingNotchDepth: 0.12,
  },
  baySeat: { startX: 9.96, endX: 10.93, centerZ: 12.5 + STRUCTURAL_PROJECTIONS.master.southProjection, depth: 0.46, seatHeight: 0.465, cushionThickness: 0.03, finalTopY: 0.48 },
  cornerShelfL: {
    location: 'seated-user-left-south-wall-corner',
    seatedSide: 'left',
    shape: 'low-three-tier-L',
    levels: 3,
    bottom: 0.8,
    top: 1.7,
    shelfThickness: 0.035,
    westLeg: {
      backX: 7.71,
      depth: 0.22,
      startZ: 11.72 + STRUCTURAL_PROJECTIONS.master.southProjection,
      endZ: 12.14 + STRUCTURAL_PROJECTIONS.master.southProjection,
    },
    southLeg: {
      backZ: STRUCTURAL_PROJECTIONS.master.southZ - 0.12,
      depth: 0.22,
      startX: 7.71,
      endX: 8.48,
    },
  },
  mirror: { shape: 'square', width: 0.56, height: 0.56, frameWidth: 0.035, centerY: 1.2, centerZ: 11.36 + STRUCTURAL_PROJECTIONS.master.southProjection },
  stool: { centerX: 8.48, centerZ: 11.36 + STRUCTURAL_PROJECTIONS.master.southProjection, radius: 0.2, height: 0.44, tuckable: true },
  outlet: { centerY: 0.98, centerZ: 11.74 + STRUCTURAL_PROJECTIONS.master.southProjection, serviceable: true },
} as const

function buildErgonomicChair(ctx: Ctx, x: number, z: number) {
  const id = 'C54-ergonomic-chair'
  rb(ctx, 'fabric', 0.52, 0.1, 0.48, x, 0.49, z, 0.055, 0, id)
  rb(ctx, 'fabric', 0.5, 0.62, 0.09, x, 0.79, z + 0.27, 0.045, 0, id)
  rb(ctx, 'sofa', 0.06, 0.24, 0.36, x - 0.31, 0.61, z + 0.01, 0.025, 0, id)
  rb(ctx, 'sofa', 0.06, 0.24, 0.36, x + 0.31, 0.61, z + 0.01, 0.025, 0, id)
  cyl(ctx, 'metal', 0.045, 0.36, x, 0.25, z + 0.03, id)
  cyl(ctx, 'metal', 0.12, 0.06, x, 0.1, z + 0.03, id)
  for (let i = 0; i < 5; i += 1) {
    const angle = i * Math.PI * 2 / 5
    const armX = x + Math.sin(angle) * 0.17
    const armZ = z + 0.03 + Math.cos(angle) * 0.17
    rb(ctx, 'metal', 0.06, 0.035, 0.36, armX, 0.1, armZ, 0.015, angle, id)
    cyl(ctx, 'metal', 0.035, 0.055, x + Math.sin(angle) * 0.34, 0.055, z + 0.03 + Math.cos(angle) * 0.34, id)
  }
}

function buildStudyOpenShelf(ctx: Ctx) {
  const shelf = STUDY_LAYOUT.openShelf
  const x = shelf.wallX - shelf.depth / 2 - 0.12
  const width = shelf.endZ - shelf.startZ
  const centerZ = (shelf.startZ + shelf.endZ) / 2
  const stepY = shelf.levelClearHeight + shelf.shelfThickness
  const topY = shelf.bottomY + shelf.levels * stepY
  const sideHeight = topY - shelf.bottomY + shelf.shelfThickness
  const sideCenterY = (shelf.bottomY + topY) / 2
  const sideId = 'C63-study-three-tier-wall-shelf-side'
  const shelfId = 'C63-study-three-tier-wall-shelf'

  // 三个净层由四块水平板界定；R33 抬高底板，为显示器与台灯保留完整工作带。
  rb(ctx, 'studyOak', shelf.depth, sideHeight, shelf.shelfThickness, x, sideCenterY, shelf.startZ, 0.01, 0, sideId)
  rb(ctx, 'studyOak', shelf.depth, sideHeight, shelf.shelfThickness, x, sideCenterY, shelf.endZ, 0.01, 0, sideId)
  for (let level = 0; level <= shelf.levels; level += 1) {
    const y = shelf.bottomY + level * stepY
    rb(ctx, 'studyOak', shelf.depth, shelf.shelfThickness, width, x, y, centerZ, 0.01, 0, shelfId)
  }
}

function buildIntegratedStudyTop(ctx: Ctx) {
  const bayDesk = STUDY_LAYOUT.bayDesk
  const top = STUDY_LAYOUT.integratedTop
  const curve = top.userCurve
  const shape = new THREE.Shape()

  // 单一闭合轮廓覆盖半幅飘窗桌、右侧连接段和右墙返台；内侧连续曲线环抱坐席。
  shape.moveTo(bayDesk.startX, top.backZ)
  shape.lineTo(top.outerRightX, top.backZ)
  shape.lineTo(top.outerRightX, top.endZ)
  shape.lineTo(top.innerRightX, top.endZ)
  shape.lineTo(curve.endX, curve.endZ)
  shape.bezierCurveTo(
    curve.control2X,
    curve.control2Z,
    curve.control1X,
    curve.control1Z,
    curve.startX,
    curve.startZ,
  )
  shape.lineTo(bayDesk.startX, top.frontZ)
  shape.closePath()

  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth: top.thickness,
    steps: 1,
    curveSegments: 32,
    bevelEnabled: true,
    bevelThickness: 0.008,
    bevelSize: 0.008,
    bevelSegments: 2,
  })
  geometry.rotateX(Math.PI / 2)
  const mesh = new THREE.Mesh(geometry, material(ctx, 'studyOak'))
  mesh.position.y = bayDesk.height + top.thickness / 2
  mesh.castShadow = true
  mesh.receiveShadow = true
  mesh.userData = { entityId: BAY_DESK_LAYOUT.study.entityId, revision: 'R35', status: 'confirmed' }
  ctx.group.add(mesh)
}

function buildStudy(ctx: Ctx) {
  // R28 / C63：保留半幅飘窗与 U 型内弧，把右墙返台延伸至端柜，并用低矮三层书架贯通上方。
  const bayDesk = STUDY_LAYOUT.bayDesk
  const bayDeskCenterX = (bayDesk.startX + bayDesk.endX) / 2
  buildIntegratedStudyTop(ctx)

  // 左端独立支撑；延伸段末端由落地封闭柜承托，中段保持完整腿部净空。
  rb(ctx, 'studyOak', 0.055, 0.71, 0.44, 9.39, 0.355, bayDesk.centerZ, 0.01, 0, BAY_DESK_LAYOUT.study.entityId)
  const baseCabinet = STUDY_LAYOUT.baseCabinet
  const cabinetCenterZ = (baseCabinet.startZ + baseCabinet.endZ) / 2
  const cabinetWidth = baseCabinet.endZ - baseCabinet.startZ
  rb(ctx, 'cabinet', baseCabinet.depth, baseCabinet.height, cabinetWidth, baseCabinet.centerX, baseCabinet.height / 2, cabinetCenterZ, 0.018, 0, 'C63-study-desk-base-cabinet')
  for (const offset of [-cabinetWidth / 4, cabinetWidth / 4]) {
    rb(ctx, 'studyOak', 0.025, 0.62, cabinetWidth / 2 - 0.025, baseCabinet.centerX - baseCabinet.depth / 2 - 0.01, 0.35, cabinetCenterZ + offset, 0.01, 0, 'C63-study-desk-base-cabinet-door')
  }

  // 低矮笔记本减少遮窗；短线槽位于右半桌后沿，保持可拆检修。
  rb(ctx, 'metal', 0.5, 0.025, 0.32, STUDY_LAYOUT.kneeSpace.chairCenterX, 0.79, -0.08, 0.008, 0, 'C54-laptop')
  rb(ctx, 'screen', 0.5, 0.32, 0.025, STUDY_LAYOUT.kneeSpace.chairCenterX, 0.98, -0.2, 0.008, 0, 'C54-laptop')
  rb(ctx, 'metal', 0.92, 0.07, 0.08, bayDeskCenterX, 0.62, 0.01, 0.012, 0, 'C54-desk-cable-tray')

  buildErgonomicChair(ctx, STUDY_LAYOUT.kneeSpace.chairCenterX, STUDY_LAYOUT.chair.centerZ)
  buildStudyOpenShelf(ctx)
  buildWardrobe(
    ctx,
    'C17-study-wardrobe',
    STUDY_LAYOUT.wardrobe.x,
    STUDY_LAYOUT.wardrobe.z,
    STUDY_LAYOUT.wardrobe.width,
    STUDY_LAYOUT.wardrobe.depth,
  )
}

function buildSecondaryBedroom(ctx: Ctx) {
  const main = SECONDARY_LAYOUT.wardrobeMain
  const turn = SECONDARY_LAYOUT.wardrobeReturn
  buildWardrobe(
    ctx,
    'C65-secondary-wardrobe-main',
    (main.startX + main.endX) / 2,
    main.wallZ + main.depth / 2,
    main.endX - main.startX,
    main.depth,
  )
  rb(
    ctx,
    'wardrobe',
    turn.depth,
    2.42,
    turn.endZ - turn.startZ,
    turn.wallX + turn.depth / 2,
    1.21,
    (turn.startZ + turn.endZ) / 2,
    0.02,
    0,
    'C65-secondary-wardrobe-return',
  )
  // 西墙短返面向房间的一侧仅保留一道同色竖缝，避免转角形成零碎把手与装饰线。
  rb(
    ctx,
    'wood',
    0.025,
    2.18,
    0.018,
    turn.wallX + turn.depth + 0.012,
    1.18,
    (turn.startZ + turn.endZ) / 2,
    0.005,
    0,
    'C65-secondary-wardrobe-return',
  )
  buildBed(ctx, 'C15-secondary-bed', SECONDARY_LAYOUT.bedHeadX, SECONDARY_LAYOUT.bedCenterZ, 1.5, 1.92, 1)
  rb(ctx, 'wood', 0.42, 0.42, 0.42, 0.36, 0.21, SECONDARY_LAYOUT.nightstandCentersZ[0], 0.025, 0, 'C70-secondary-nightstand-upper')
  rb(ctx, 'wood', 0.42, 0.42, 0.42, 0.36, 0.21, SECONDARY_LAYOUT.nightstandCentersZ[1], 0.025, 0, 'C70-secondary-nightstand-lower')
}

function buildMasterDressingSuite(ctx: Ctx) {
  const layout = MASTER_DRESSING_LAYOUT
  const seat = layout.baySeat
  const shelfL = layout.cornerShelfL
  const windowRun = layout.windowRun
  const bayExtension = layout.bayExtension
  const vanity = layout.vanityReturn
  const vanityLength = vanity.endZ - vanity.startZ
  const vanityCenterZ = (vanity.startZ + vanity.endZ) / 2

  // C61：坐榻镜像到视觉左侧；视觉右侧改为连续桌面，并与西墙梳妆位接成 L。
  rb(
    ctx,
    'fabric',
    seat.endX - seat.startX,
    seat.cushionThickness,
    seat.depth,
    (seat.startX + seat.endX) / 2,
    seat.seatHeight,
    seat.centerZ,
    0.035,
    0,
    'C61-master-bay-seat',
  )

  rb(ctx, 'tableTop', windowRun.endX - windowRun.startX, 0.055, windowRun.depth, (windowRun.startX + windowRun.endX) / 2, windowRun.height, windowRun.centerZ, 0.018, 0, 'C61-master-window-desk-run')
  rb(ctx, 'tableTop', bayExtension.endX - bayExtension.startX, 0.055, bayExtension.depth, (bayExtension.startX + bayExtension.endX) / 2, bayExtension.height, bayExtension.centerZ, 0.018, 0, 'C61-master-half-bay-extension')
  rb(ctx, 'woodLight', 0.055, 0.7, windowRun.depth - 0.06, windowRun.endX - 0.04, 0.35, windowRun.centerZ, 0.01, 0, 'C61-master-window-desk-support')

  // R35 / C70：展示柜由单面通高窄格改为沿西墙与南墙转角展开的低矮三层 L 柜。
  // 四块水平板界定三个净层；转角重叠形成连续包络，不以碎格或额外高柜填满窗边。
  const shelfId = 'C70-master-three-tier-l-corner-cabinet'
  const shelfStepY = (shelfL.top - shelfL.bottom) / shelfL.levels
  const westLegCenterX = shelfL.westLeg.backX + shelfL.westLeg.depth / 2
  const westLegCenterZ = (shelfL.westLeg.startZ + shelfL.westLeg.endZ) / 2
  const westLegWidth = shelfL.westLeg.endZ - shelfL.westLeg.startZ
  const southLegCenterX = (shelfL.southLeg.startX + shelfL.southLeg.endX) / 2
  const southLegLength = shelfL.southLeg.endX - shelfL.southLeg.startX
  const southLegCenterZ = shelfL.southLeg.backZ - shelfL.southLeg.depth / 2
  for (let level = 0; level <= shelfL.levels; level += 1) {
    const y = shelfL.bottom + shelfStepY * level
    rb(ctx, 'woodLight', shelfL.westLeg.depth, shelfL.shelfThickness, westLegWidth, westLegCenterX, y, westLegCenterZ, 0.008, 0, shelfId)
    rb(ctx, 'woodLight', southLegLength, shelfL.shelfThickness, shelfL.southLeg.depth, southLegCenterX, y, southLegCenterZ, 0.008, 0, shelfId)
  }
  const shelfBodyHeight = shelfL.top - shelfL.bottom
  const shelfCenterY = shelfL.bottom + shelfBodyHeight / 2
  rb(ctx, 'woodLight', shelfL.westLeg.depth, shelfBodyHeight, shelfL.shelfThickness, westLegCenterX, shelfCenterY, shelfL.westLeg.startZ, 0.008, 0, shelfId)
  rb(ctx, 'woodLight', shelfL.shelfThickness, shelfBodyHeight, shelfL.southLeg.depth, shelfL.southLeg.endX, shelfCenterY, southLegCenterZ, 0.008, 0, shelfId)
  rb(ctx, 'woodLight', shelfL.shelfThickness, shelfBodyHeight, shelfL.shelfThickness, shelfL.westLeg.backX, shelfCenterY, shelfL.southLeg.backZ, 0.008, 0, shelfId)
  rb(ctx, 'lamp', shelfL.westLeg.depth - 0.06, 0.018, westLegWidth - 0.08, westLegCenterX, shelfL.top - shelfStepY - 0.025, westLegCenterZ, 0.004, 0, 'C70-master-corner-cabinet-task-light')
  rb(ctx, 'lamp', southLegLength - 0.1, 0.018, 0.018, southLegCenterX, shelfL.top - shelfStepY - 0.025, southLegCenterZ - shelfL.southLeg.depth / 2 + 0.025, 0.004, 0, 'C70-master-corner-cabinet-task-light')

  // 梳妆位沿视觉右侧实墙悬浮，朝使用者的前缘采用 U 型内弧；圆凳可完全推入桌下。
  uNotchedTop(ctx, vanityLength, vanity.depth, 0.055, vanity.wallInnerX, vanity.height, vanityCenterZ, vanity.userFacingNotchWidth, vanity.userFacingNotchDepth, 'C61-master-u-curve-floating-vanity')
  rb(ctx, 'woodLight', vanity.depth - 0.12, 0.1, 0.32, vanity.wallInnerX + (vanity.depth - 0.12) / 2, 0.67, vanity.endZ - 0.2, 0.018, 0, 'C61-master-vanity-drawer')
  rb(ctx, 'lamp', 0.025, 0.025, vanityLength - 0.14, vanity.wallInnerX + 0.025, vanity.kneeClearHeight, vanityCenterZ, 0.004, 0, 'C61-master-vanity-task-light')

  const mirrorFrameOuter = layout.mirror.width + layout.mirror.frameWidth * 2
  rb(ctx, 'metal', 0.035, mirrorFrameOuter, mirrorFrameOuter, vanity.wallInnerX + 0.03, layout.mirror.centerY, layout.mirror.centerZ, 0.006, 0, 'C72-master-square-mirror-frame')
  rb(ctx, 'screen', 0.018, layout.mirror.height, layout.mirror.width, vanity.wallInnerX + 0.052, layout.mirror.centerY, layout.mirror.centerZ, 0.004, 0, 'C72-master-square-mirror')

  cyl(ctx, 'fabric', layout.stool.radius, layout.stool.height, layout.stool.centerX, layout.stool.height / 2, layout.stool.centerZ, 'C61-master-tuckable-stool')
  rb(ctx, 'screen', 0.025, 0.13, 0.12, vanity.wallInnerX + 0.01, layout.outlet.centerY, layout.outlet.centerZ, 0.004, 0, 'C61-master-serviceable-outlet')
}

function buildMasterBedroom(ctx: Ctx) {
  // 上侧横柜只覆盖完整实墙；右侧短返与墙角对齐，入口不再有外凸柜段。
  const main = MASTER_LAYOUT.wardrobeMain
  const turn = MASTER_LAYOUT.wardrobeReturn
  buildWardrobe(
    ctx,
    'C33-master-wardrobe-main',
    (main.startX + main.endX) / 2,
    main.wallZ + main.depth / 2,
    main.endX - main.startX,
    main.depth,
  )
  rb(
    ctx,
    'wardrobe',
    turn.depth,
    2.42,
    turn.endZ - turn.startZ,
    turn.wallX - turn.depth / 2,
    1.21,
    (turn.startZ + turn.endZ) / 2,
    0.02,
    0,
    'C34-master-wardrobe-return',
  )

  // R35 / C70：利用主卧新增纵深，将 1.8 m 床与双床头柜整体南移，并延长衣柜短返。
  buildBed(ctx, 'C35-master-bed', 12.18, MASTER_LAYOUT.bedCenterZ, MASTER_LAYOUT.bedWidth, 2.0, -1)
  rb(ctx, 'wood', MASTER_LAYOUT.nightstandSize, 0.42, MASTER_LAYOUT.nightstandSize, 11.94, 0.21, MASTER_LAYOUT.upperNightstandCenterZ, 0.025, 0, 'C35-nightstand-upper')
  rb(ctx, 'wood', MASTER_LAYOUT.nightstandSize, 0.42, MASTER_LAYOUT.nightstandSize, 11.94, 0.21, MASTER_LAYOUT.lowerNightstandCenterZ, 0.025, 0, 'C35-nightstand-lower')

  buildMasterDressingSuite(ctx)
}

export const LAUNDRY_LAYOUT = {
  wallX: 7.65,
  wallThickness: 0.24,
  washerWidth: 0.64,
  washerDepth: 0.68,
  washerCenterX: 7.21,
  washerZ: 12.68,
  upperCabinetClosedHeight: 0.9,
  openShelfHeight: 0.5,
} as const

function buildLaundry(ctx: Ctx) {
  // 阳台 A 右侧：洗衣机与承重墙完成面齐平，靠下仍为洗衣台。
  const wallInnerX = LAUNDRY_LAYOUT.wallX - LAUNDRY_LAYOUT.wallThickness / 2
  const unitX = wallInnerX - LAUNDRY_LAYOUT.washerWidth / 2
  rb(
    ctx,
    'appliance',
    LAUNDRY_LAYOUT.washerWidth,
    0.88,
    LAUNDRY_LAYOUT.washerDepth,
    unitX,
    0.44,
    LAUNDRY_LAYOUT.washerZ,
    0.035,
    0,
    'C38-washer-aligned',
  )
  const drum = cyl(ctx, 'screen', 0.21, 0.035, unitX - LAUNDRY_LAYOUT.washerWidth / 2 - 0.01, 0.43, LAUNDRY_LAYOUT.washerZ, 'C38-washer-aligned')
  drum.rotation.z = Math.PI / 2

  // 参考图转译：上部为连续封闭柜，下部仅保留一层开放置物区。
  rb(ctx, 'cabinet', 0.36, LAUNDRY_LAYOUT.upperCabinetClosedHeight, 0.72, 7.35, 2.23, LAUNDRY_LAYOUT.washerZ, 0.02, 0, 'C39-laundry-upper-cabinet')
  rb(ctx, 'woodLight', 0.035, LAUNDRY_LAYOUT.openShelfHeight, 0.72, 7.49, 1.49, LAUNDRY_LAYOUT.washerZ, 0.01, 0, 'C39-laundry-open-shelf')
  rb(ctx, 'woodLight', 0.34, 0.04, 0.72, 7.35, 1.23, LAUNDRY_LAYOUT.washerZ, 0.01, 0, 'C39-laundry-open-shelf')

  buildCounter(ctx, 'C13-laundry-sink', unitX, 13.5, 0.64, 0.68)
  rb(ctx, 'appliance', 0.42, 0.09, 0.4, unitX, 0.89, 13.5, 0.04, 0, 'C13-laundry-sink')
}

export function buildFurniture(reg: MaterialRegistry, glass: THREE.MeshStandardMaterial): FurnitureBuild {
  const group = new THREE.Group()
  const shared = new THREE.Group()
  shared.name = 'R37-fixed-functional-layout'
  group.add(shared)
  const ctx: Ctx = { reg, group: shared, glass }

  buildKitchen(ctx)
  buildEntryCabinet(ctx)
  buildOppositeEntryCabinet(ctx)
  buildWallMountedTv(ctx)
  buildSofa(ctx)
  buildStudy(ctx)
  buildSecondaryBedroom(ctx)
  buildMasterBedroom(ctx)
  buildLaundry(ctx)

  // 保留接口兼容 Viewer；这些组不再改变家具数量或位置。
  const styleGroups = {} as Record<StyleKey, THREE.Group>
  for (const key of STYLE_ORDER) {
    const styleGroup = new THREE.Group()
    styleGroup.name = `style-${key}-no-topology-change`
    group.add(styleGroup)
    styleGroups[key] = styleGroup
  }

  return { group, styleGroups }
}
