// 建筑构建：地板 / 墙体（含门洞窗洞）/ 凸窗 / 护栏 / 门窗
import * as THREE from 'three'
import { BAY_PLATFORMS, BAY_WINDOW_RULES, CENTER, COLUMNS, FLOORS, WALL_H, WALLS, type Opening, type WallDef } from './plan'
import { STYLES, type FloorTexSpec, type Slot, type StyleKey, type StylePreset } from './styles'
import {
  makeConcreteTexture,
  makeFabricSurfaceTexture,
  makeHerringboneTexture,
  makeMarbleTexture,
  makeStoneSurfaceTexture,
  makeWoodSurfaceTexture,
  makeWoodTexture,
} from './textures'

export type MaterialRegistry = Map<Slot, THREE.MeshStandardMaterial>

const SLOTS: Slot[] = [
  'wall', 'baseboard', 'frame', 'doorLeaf', 'wood', 'woodLight', 'sofa', 'sofaAccent',
  'fabric', 'cabinet', 'entryCabinet', 'counter', 'wardrobe', 'bedding', 'beddingAccent', 'tableTop', 'studyOak',
  'metal', 'gold', 'rattan', 'rug', 'appliance', 'lamp', 'plant', 'pot', 'screen',
]

export function createRegistry(preset: StylePreset): MaterialRegistry {
  const reg: MaterialRegistry = new Map()
  for (const s of SLOTS) {
    const m = new THREE.MeshStandardMaterial()
    applySurfacePreset(m, s, preset)
    reg.set(s, m)
  }
  return reg
}

export function applyPresetToRegistry(reg: MaterialRegistry, preset: StylePreset) {
  for (const s of SLOTS) {
    applySurfacePreset(reg.get(s)!, s, preset)
  }
}

function baseFinish(slot: Slot) {
  if (slot === 'wall') return { roughness: 0.95, metalness: 0 }
  if (slot === 'metal') return { roughness: 0.42, metalness: 0.72 }
  if (slot === 'gold') return { roughness: 0.48, metalness: 0.62 }
  if (slot === 'screen') return { roughness: 0.22, metalness: 0.45 }
  if (slot === 'counter') return { roughness: 0.52, metalness: 0.02 }
  if (slot === 'sofa') return { roughness: 0.8, metalness: 0 }
  if (slot === 'fabric' || slot === 'rug' || slot === 'bedding') return { roughness: 0.98, metalness: 0 }
  return { roughness: 0.86, metalness: 0.02 }
}

function applySurfacePreset(mat: THREE.MeshStandardMaterial, slot: Slot, preset: StylePreset) {
  mat.map?.dispose()
  mat.map = null
  const fallback = baseFinish(slot)
  const finish = preset.finishes[slot]
  mat.color.set(preset.slots[slot])
  mat.roughness = finish?.roughness ?? fallback.roughness
  mat.metalness = finish?.metalness ?? fallback.metalness

  if (finish?.texture && finish.accent && typeof document !== 'undefined') {
    const base = preset.slots[slot]
    const seed = SLOTS.indexOf(slot) * 37 + preset.key.length * 11
    const tex = finish.texture === 'wood'
      ? makeWoodSurfaceTexture(base, finish.accent, seed)
      : finish.texture === 'stone'
        ? makeStoneSurfaceTexture(base, finish.accent, seed)
        : makeFabricSurfaceTexture(base, finish.accent)
    const repeat = finish.repeat ?? 1
    tex.repeat.set(repeat, repeat)
    mat.map = tex
    mat.color.set('#ffffff')
  }
  mat.needsUpdate = true
}

export function applyGlassPreset(mat: THREE.MeshStandardMaterial, preset: StylePreset) {
  mat.color.set(preset.glass.color)
  mat.roughness = preset.glass.roughness
  mat.metalness = preset.glass.metalness
  mat.opacity = preset.glass.opacity
  mat.needsUpdate = true
}

export interface HouseBuild {
  group: THREE.Group
  registry: MaterialRegistry
  floorMeshes: THREE.Mesh[]
  glassMat: THREE.MeshStandardMaterial
  dispose: () => void
}

function box(
  parent: THREE.Object3D,
  mat: THREE.Material,
  cx: number, cy: number, cz: number,
  sx: number, sy: number, sz: number,
  shadow = true,
): THREE.Mesh {
  const g = new THREE.BoxGeometry(Math.max(sx, 0.001), Math.max(sy, 0.001), Math.max(sz, 0.001))
  const mesh = new THREE.Mesh(g, mat)
  mesh.position.set(cx, cy, cz)
  mesh.castShadow = shadow
  mesh.receiveShadow = true
  parent.add(mesh)
  return mesh
}

// ---------------- 地板 ----------------
function buildFloors(build: HouseBuild, preset: StylePreset) {
  const { group, floorMeshes, registry } = build
  // 底座板（风格无关）
  const base = new THREE.Mesh(
    new THREE.BoxGeometry(13.8, 0.18, 16.4),
    new THREE.MeshStandardMaterial({ color: '#4a453e', roughness: 0.95 }),
  )
  base.position.set(CENTER.x, -0.09 - 0.005, CENTER.z)
  base.receiveShadow = true
  group.add(base)

  for (const f of FLOORS) {
    const w = f.x2 - f.x1
    const d = f.z2 - f.z1
    const geo = new THREE.PlaneGeometry(w, d)
    geo.rotateX(-Math.PI / 2)
    const mat = makeFloorMaterial(preset, f.slot, w, d)
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.set((f.x1 + f.x2) / 2, 0.015, (f.z1 + f.z2) / 2)
    mesh.receiveShadow = true
    mesh.userData.floorSlot = f.slot
    mesh.userData.w = w
    mesh.userData.d = d
    group.add(mesh)
    floorMeshes.push(mesh)
  }

  // 飘窗不是室内地板延伸：先生成抬高实体基座，再在约 450 mm 高处铺窗台面。
  for (const b of BAY_PLATFORMS) {
    const shape = new THREE.Shape()
    shape.moveTo(b.points[0][0], -b.points[0][1])
    for (let i = 1; i < b.points.length; i++) {
      shape.lineTo(b.points[i][0], -b.points[i][1])
    }
    shape.closePath()
    const baseGeo = new THREE.ExtrudeGeometry(shape, { depth: b.sillHeight, bevelEnabled: false })
    baseGeo.rotateX(-Math.PI / 2)
    const baseMesh = new THREE.Mesh(baseGeo, registry.get('wall')!)
    baseMesh.receiveShadow = true
    baseMesh.userData = { entityId: `C40-${b.id}-bay-base`, revision: 'R12', status: 'confirmed' }
    group.add(baseMesh)

    const geo = new THREE.ShapeGeometry(shape)
    geo.rotateX(-Math.PI / 2)
    const xs = b.points.map((p) => p[0])
    const zs = b.points.map((p) => p[1])
    const w = Math.max(...xs) - Math.min(...xs)
    const d = Math.max(...zs) - Math.min(...zs)
    const mat = makeFloorMaterial(preset, b.slot, w, d)
    mat.side = THREE.DoubleSide
    const mesh = new THREE.Mesh(geo, mat)
    mesh.position.y = b.sillHeight + 0.015
    mesh.receiveShadow = true
    mesh.userData.floorSlot = b.slot
    mesh.userData.w = w
    mesh.userData.d = d
    mesh.userData.bayPlatform = true
    mesh.userData.sillHeight = b.sillHeight
    mesh.userData.entityId = `C40-${b.id}-bay-platform`
    mesh.userData.revision = 'R12'
    mesh.userData.status = 'confirmed'
    group.add(mesh)
    floorMeshes.push(mesh)
  }
}

function makeTexFromSpec(spec: FloorTexSpec, w: number, d: number): { tex: THREE.CanvasTexture; roughness: number } {
  let tex: THREE.CanvasTexture
  let roughness = 0.75
  switch (spec.type) {
    case 'plank':
      tex = makeWoodTexture(spec.base, spec.grain)
      tex.repeat.set(w / 1.6, d / 1.6)
      break
    case 'marble':
      tex = makeMarbleTexture(spec.base, spec.grain)
      tex.repeat.set(w / 1.8, d / 1.8)
      roughness = 0.45
      break
    case 'herringbone':
      tex = makeHerringboneTexture(spec.base, spec.grain)
      tex.repeat.set(w / 2.2, d / 2.2)
      roughness = 0.7
      break
    case 'concrete':
      tex = makeConcreteTexture(spec.base, spec.grain)
      tex.repeat.set(w / 1.7, d / 1.7)
      roughness = 0.55
      break
  }
  return { tex, roughness }
}

function makeFloorMaterial(preset: StylePreset, slot: 'wood' | 'tile', w: number, d: number) {
  const spec = slot === 'wood' ? preset.floor.wood : preset.floor.tile
  const { tex, roughness } = makeTexFromSpec(spec, w, d)
  return new THREE.MeshStandardMaterial({ map: tex, roughness, metalness: 0.03 })
}

/** 切换风格时重建地板材质（纹理随风格变化） */
export function refreshFloors(build: HouseBuild, preset: StylePreset) {
  for (const mesh of build.floorMeshes) {
    const old = mesh.material as THREE.MeshStandardMaterial
    old.map?.dispose()
    old.dispose()
    const mat = makeFloorMaterial(
      preset,
      mesh.userData.floorSlot as 'wood' | 'tile',
      mesh.userData.w as number,
      mesh.userData.d as number,
    )
    if (mesh.userData.bayPlatform) mat.side = THREE.DoubleSide
    mesh.material = mat
  }
}

// ---------------- 墙体 ----------------
export function buildHouse(style: StyleKey): HouseBuild {
  const preset = STYLES[style]
  const group = new THREE.Group()
  const registry = createRegistry(preset)
  const glassMat = new THREE.MeshStandardMaterial({
    color: preset.glass.color, roughness: preset.glass.roughness, metalness: preset.glass.metalness,
    transparent: true, opacity: 0.32, side: THREE.DoubleSide, depthWrite: false,
  })
  applyGlassPreset(glassMat, preset)
  const build: HouseBuild = {
    group, registry, glassMat,
    floorMeshes: [],
    dispose: () => {
      const materials = new Set<THREE.Material>()
      group.traverse((o) => {
        if (o instanceof THREE.Mesh) {
          o.geometry.dispose()
          const meshMaterials = Array.isArray(o.material) ? o.material : [o.material]
          meshMaterials.forEach((material) => materials.add(material))
        }
      })
      materials.forEach((material) => {
        if (material instanceof THREE.MeshStandardMaterial) material.map?.dispose()
        material.dispose()
      })
    },
  }

  buildFloors(build, preset)
  for (const w of WALLS) buildWall(build, w)
  // 拆改保留的结构柱
  const wallMat = registry.get('wall')!
  for (const c of COLUMNS) {
    box(group, wallMat, c.x, WALL_H / 2, c.z, c.size, WALL_H, c.size)
  }
  return build
}

function buildWall(build: HouseBuild, def: WallDef) {
  const { group, registry, glassMat } = build
  const wallMat = registry.get('wall')!
  const frameMat = registry.get('frame')!
  const doorMat = registry.get('doorLeaf')!
  const metalMat = registry.get('metal')!

  const dx = def.x2 - def.x1
  const dz = def.z2 - def.z1
  const L = Math.hypot(dx, dz)
  const ux = dx / L
  const uz = dz / L
  const t = def.t

  const wg = new THREE.Group()
  wg.position.set(def.x1, 0, def.z1)
  wg.rotation.y = Math.atan2(-uz, ux)
  group.add(wg)

  // 护栏：矮坎 + 玻璃 + 扶手
  if (def.railing) {
    box(wg, wallMat, L / 2, 0.06, 0, L, 0.12, t)
    box(wg, glassMat, L / 2, 0.56, 0, L, 0.88, 0.02, false)
    box(wg, metalMat, L / 2, 1.04, 0, L, 0.07, 0.1)
    const posts = Math.max(2, Math.round(L / 1.2))
    for (let i = 0; i <= posts; i++) {
      box(wg, metalMat, (L / posts) * i, 0.56, 0, 0.05, 0.92, 0.05)
    }
    return
  }

  const openings = [...(def.openings ?? [])].sort((a, b) => a.start - b.start)

  // 实心段
  let cursor = 0
  const solids: Array<[number, number]> = []
  for (const o of openings) {
    if (o.start > cursor + 0.005) solids.push([cursor, o.start])
    cursor = o.start + o.width
  }
  if (cursor < L - 0.005) solids.push([cursor, L])
  for (const [a, b] of solids) {
    box(wg, wallMat, (a + b) / 2, WALL_H / 2, 0, b - a, WALL_H, t)
  }

  // 洞口上下过梁/窗台墙 + 门窗构造
  for (const o of openings) {
    const cx = o.start + o.width / 2
    if (o.sill > 0.01) {
      box(wg, wallMat, cx, o.sill / 2, 0, o.width, o.sill, t)
    }
    if (o.top < WALL_H - 0.01) {
      const h = WALL_H - o.top
      box(wg, wallMat, cx, o.top + h / 2, 0, o.width, h, t)
    }
    buildOpening(wg, o, t, { wallMat, frameMat, doorMat, metalMat, glassMat })
  }
}

interface OpeningMats {
  wallMat: THREE.Material
  frameMat: THREE.Material
  doorMat: THREE.Material
  metalMat: THREE.Material
  glassMat: THREE.Material
}

function buildOpening(wg: THREE.Group, o: Opening, t: number, mats: OpeningMats) {
  const { frameMat, doorMat, metalMat, glassMat, wallMat } = mats
  const x0 = o.start
  const cx = o.start + o.width / 2
  const fw = 0.06 // 框料宽

  if (o.kind === 'window') {
    // 玻璃 + 四边框
    box(wg, glassMat, cx, (o.sill + o.top) / 2, 0, o.width - 0.04, o.top - o.sill - 0.04, 0.02, false)
    const h = o.top - o.sill
    box(wg, frameMat, cx, o.sill + fw / 2, 0, o.width, fw, t * 0.7)
    box(wg, frameMat, cx, o.top - fw / 2, 0, o.width, fw, t * 0.7)
    box(wg, frameMat, x0 + fw / 2, o.sill + h / 2, 0, fw, h, t * 0.7)
    box(wg, frameMat, x0 + o.width - fw / 2, o.sill + h / 2, 0, fw, h, t * 0.7)
    box(wg, frameMat, cx, o.sill + h / 2, 0, 0.04, h, 0.04) // 中梃
    return
  }

  if (o.kind === 'door' || o.kind === 'pass') {
    // 门套
    const h = o.top
    box(wg, frameMat, x0 + fw / 2, h / 2, 0, fw, h, t + 0.02)
    box(wg, frameMat, x0 + o.width - fw / 2, h / 2, 0, fw, h, t + 0.02)
    box(wg, frameMat, cx, h - fw / 2, 0, o.width, fw, t + 0.02)
    if (o.kind === 'door') {
      // 门扇：绕合页打开约 65°
      const hinge = new THREE.Group()
      hinge.position.set(x0 + fw, 0, 0)
      hinge.rotation.y = -Math.PI * 0.36
      wg.add(hinge)
      const leaf = box(hinge, doorMat, (o.width - 2 * fw) / 2, (o.top - 0.03) / 2, 0, o.width - 2 * fw, o.top - 0.03, 0.04)
      leaf.castShadow = true
      box(hinge, metalMat, o.width - 2 * fw - 0.12, 1.05, 0.05, 0.03, 0.12, 0.03)
    }
    return
  }

  if (o.kind === 'entry') {
    // 入户门：关闭的实心门扇 + 门框
    box(wg, frameMat, x0 + fw / 2, o.top / 2, 0, fw, o.top, t + 0.04)
    box(wg, frameMat, x0 + o.width - fw / 2, o.top / 2, 0, fw, o.top, t + 0.04)
    box(wg, frameMat, cx, o.top - fw / 2, 0, o.width, fw, t + 0.04)
    box(wg, doorMat, cx, (o.top - 0.06) / 2, 0, o.width - 2 * fw, o.top - 0.06, 0.06)
    box(wg, metalMat, x0 + o.width - 0.18, 1.05, t / 2 + 0.05, 0.04, 0.16, 0.04)
    return
  }

  if (o.kind === 'sliding') {
    // 推拉门：按数据构建 2/3 扇错位玻璃门，R26 延续厨房三扇方案。
    box(wg, frameMat, cx, o.top - 0.05, 0, o.width, 0.1, t + 0.04)
    box(wg, frameMat, x0 + fw / 2, o.top / 2, 0, fw, o.top, t + 0.04)
    box(wg, frameMat, x0 + o.width - fw / 2, o.top / 2, 0, fw, o.top, t + 0.04)
    const panels = Math.max(2, o.panels ?? 2)
    const overlap = 0.1
    const pw = o.width / panels + overlap
    const gh = o.top - 0.16
    for (let i = 0; i < panels; i++) {
      const px = x0 + (i + 0.5) * (o.width / panels)
      const pz = (i - (panels - 1) / 2) * 0.035
      box(wg, glassMat, px, gh / 2 + 0.06, pz, pw - 0.1, gh - 0.1, 0.015, false)
      box(wg, frameMat, px, 0.1, pz, pw, 0.08, 0.05)
      box(wg, frameMat, px, gh + 0.02, pz, pw, 0.08, 0.05)
      box(wg, frameMat, px - pw / 2 + 0.03, gh / 2 + 0.06, pz, 0.06, gh, 0.05)
      box(wg, frameMat, px + pw / 2 - 0.03, gh / 2 + 0.06, pz, 0.06, gh, 0.05)
    }
    return
  }

  if (o.kind === 'bay') {
    // 梯形飘窗：抬高窗台 + 正面窗；两侧为业主确认的通高实体墙。
    const d = o.bayDepth ?? 0.6
    const front = o.bayFront ?? o.width // 前边宽（缺省矩形）
    const inset = (o.width - front) / 2 // 单侧内缩
    // 外凸方向：取墙体法向量中背离户型中心的一侧
    const midWorld = new THREE.Vector3(cx, 0, 0).applyEuler(wg.rotation).add(wg.position)
    const toCenter = new THREE.Vector3(CENTER.x - midWorld.x, 0, CENTER.z - midWorld.z).normalize()
    // 局部 +z 即墙法向一侧
    const localNormal = new THREE.Vector3(0, 0, 1).applyEuler(wg.rotation)
    const s = localNormal.dot(toCenter) > 0 ? -1 : 1

    const zIn = s * (t / 2) // 墙面外侧
    const zOut = s * (t / 2 + d) // 凸窗外沿
    const zMid = (zIn + zOut) / 2
    const depth = Math.abs(zOut - zIn)
    // 窗台高为方案参考值；定稿须以原建筑节点和现场完成面复尺替换。
    const sillH = o.sill > 0.05 ? o.sill : BAY_WINDOW_RULES.sillHeight
    const glassTop = Math.min(o.top, WALL_H - 0.1)
    const gh = glassTop - sillH
    const sideLen = Math.hypot(depth, Math.max(inset, 0.001))
    const x1f = x0 + inset // 前边左端
    const x2f = x0 + o.width - inset // 前边右端

    // 正面窗下基座。
    box(wg, wallMat, cx, sillH / 2, zOut - s * 0.05, front + 0.1, sillH, 0.1)
    for (const side of [1, -1] as const) {
      const sx0 = side === 1 ? x0 : x0 + o.width
      const sg = new THREE.Group()
      sg.position.set(sx0, 0, zIn)
      sg.rotation.y = Math.atan2(side * inset, s * depth)
      wg.add(sg)
      if (o.baySide === 'solid-full-height') {
        box(sg, wallMat, 0, WALL_H / 2, sideLen / 2, 0.12, WALL_H, sideLen)
      } else {
        box(sg, wallMat, 0, sillH / 2, sideLen / 2, 0.1, sillH, sideLen)
        const glass = new THREE.Mesh(new THREE.BoxGeometry(0.02, gh, sideLen - 0.04), glassMat)
        glass.position.set(0, sillH + gh / 2, sideLen / 2)
        sg.add(glass)
      }
    }
    // 窗台板（正面）
    box(wg, frameMat, cx, sillH + 0.02, zOut - s * 0.06, front + 0.08, 0.05, 0.14)
    // 正面玻璃
    box(wg, glassMat, cx, sillH + gh / 2, zOut - s * 0.03, front - 0.04, gh, 0.02, false)
    // 窗框：前边上下轨 + 两角柱 + 中梃
    box(wg, frameMat, cx, glassTop - 0.03, zOut - s * 0.03, front, 0.07, 0.06)
    box(wg, frameMat, x1f + 0.02, sillH + gh / 2, zOut - s * 0.03, 0.07, gh, 0.07)
    box(wg, frameMat, x2f - 0.02, sillH + gh / 2, zOut - s * 0.03, 0.07, gh, 0.07)
    box(wg, frameMat, cx, sillH + gh / 2, zOut - s * 0.03, 0.05, gh, 0.05)
    // 可踏窗台的防护高度从窗台面起算；以贴窗横档表达安全控制线。
    const guardY = sillH + BAY_WINDOW_RULES.guardHeightFromPlatform
    if (guardY < glassTop - 0.08) {
      box(wg, frameMat, cx, guardY, zOut - s * 0.055, front - 0.08, 0.055, 0.055)
    }
    // 顶板
    box(wg, wallMat, cx, glassTop + 0.06, zMid, o.width + 0.14, 0.12, depth + 0.1)
    return
  }
}

/** 墙体半透明切换（含凸窗基座/顶板、护栏矮坎，即所有 wall 槽位材质） */
export function setWallsTransparent(build: HouseBuild, transparent: boolean) {
  const m = build.registry.get('wall')!
  m.transparent = transparent
  m.opacity = transparent ? 0.32 : 1
  m.needsUpdate = true
}
