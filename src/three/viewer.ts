// 3D 查看器：渲染器 / 相机 / 视角模式 / 灯光 / 标签 / 风格切换
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { CSS2DObject, CSS2DRenderer } from 'three/addons/renderers/CSS2DRenderer.js'
import { applyGlassPreset, applyPresetToRegistry, buildHouse, refreshFloors, setWallsTransparent, type HouseBuild } from './builder'
import { buildFurniture, type FurnitureBuild } from './furniture'
import { CENTER, ROOM_LABELS, WALK_RECTS, WALLS } from './plan'
import { STYLES, type StyleKey } from './styles'

const DEFAULT_STYLE: StyleKey = 'minimal'

export type ViewMode = 'orbit' | 'top' | 'walk'

export interface ViewerOptions {
  onReady?: () => void
}

export class Viewer {
  private container: HTMLElement
  private renderer: THREE.WebGLRenderer
  private labelRenderer: CSS2DRenderer
  private scene = new THREE.Scene()
  private camera: THREE.PerspectiveCamera
  private controls: OrbitControls
  private house: HouseBuild
  private furniture: FurnitureBuild
  private currentStyle: StyleKey = DEFAULT_STYLE
  private labelGroup = new THREE.Group()
  private lastFrameTime = performance.now()
  private raf = 0
  private resizeObs: ResizeObserver
  private disposed = false

  // 灯光（风格切换时调色温）
  private hemi: THREE.HemisphereLight
  private ambient: THREE.AmbientLight
  private sun: THREE.DirectionalLight
  private points: THREE.PointLight[] = []
  private ground: THREE.Mesh<THREE.CircleGeometry, THREE.MeshStandardMaterial>

  // 漫游状态
  private mode: ViewMode = 'orbit'
  private walkPos = new THREE.Vector3(5.5, 1.6, 6.8)
  private walkYaw = 0 // 面朝北（-z）
  private walkPitch = 0
  private keys = new Set<string>()
  private dragging = false
  private lastPointer = { x: 0, y: 0 }

  private onKeyDown = (e: KeyboardEvent) => {
    if (this.mode !== 'walk') return
    this.keys.add(e.code)
    if (['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.code)) {
      e.preventDefault()
    }
  }
  private onKeyUp = (e: KeyboardEvent) => this.keys.delete(e.code)
  private onPointerDown = (e: PointerEvent) => {
    if (this.mode !== 'walk') return
    this.dragging = true
    this.lastPointer = { x: e.clientX, y: e.clientY }
    this.renderer.domElement.setPointerCapture(e.pointerId)
  }
  private onPointerMove = (e: PointerEvent) => {
    if (this.mode !== 'walk' || !this.dragging) return
    const dx = e.clientX - this.lastPointer.x
    const dy = e.clientY - this.lastPointer.y
    this.lastPointer = { x: e.clientX, y: e.clientY }
    this.walkYaw -= dx * 0.0038
    this.walkPitch = THREE.MathUtils.clamp(this.walkPitch - dy * 0.0032, -1.1, 1.1)
  }
  private onPointerUp = () => {
    this.dragging = false
  }

  constructor(container: HTMLElement, opts: ViewerOptions = {}) {
    this.container = container
    const w = container.clientWidth || 1
    const h = container.clientHeight || 1

    this.renderer = new THREE.WebGLRenderer({ antialias: true })
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    this.renderer.setSize(w, h)
    this.renderer.shadowMap.enabled = true
    this.renderer.shadowMap.type = THREE.PCFShadowMap
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping
    this.renderer.toneMappingExposure = STYLES[DEFAULT_STYLE].light.exposure
    container.appendChild(this.renderer.domElement)

    this.labelRenderer = new CSS2DRenderer()
    this.labelRenderer.setSize(w, h)
    Object.assign(this.labelRenderer.domElement.style, {
      position: 'absolute', inset: '0', pointerEvents: 'none',
    })
    container.appendChild(this.labelRenderer.domElement)

    this.scene.background = new THREE.Color('#c7d2dc')
    this.scene.fog = new THREE.Fog('#c7d2dc', 45, 90)

    this.camera = new THREE.PerspectiveCamera(50, w / h, 0.1, 200)
    this.camera.position.set(CENTER.x + 8.5, 9.5, CENTER.z + 12)
    this.camera.rotation.order = 'YXZ'

    this.controls = new OrbitControls(this.camera, this.renderer.domElement)
    this.controls.target.set(CENTER.x, 0.6, CENTER.z)
    this.controls.enableDamping = true
    this.controls.dampingFactor = 0.08
    this.controls.minDistance = 2.5
    this.controls.maxDistance = 45
    this.controls.maxPolarAngle = Math.PI * 0.495

    // 外部环境地面
    this.ground = new THREE.Mesh(
      new THREE.CircleGeometry(40, 48),
      new THREE.MeshStandardMaterial({ color: STYLES[DEFAULT_STYLE].light.ground, roughness: 1 }),
    )
    this.ground.rotation.x = -Math.PI / 2
    this.ground.position.set(CENTER.x, -0.19, CENTER.z)
    this.ground.receiveShadow = true
    this.scene.add(this.ground)

    // 灯光
    this.hemi = new THREE.HemisphereLight('#ffffff', '#999999', 0.7)
    this.scene.add(this.hemi)
    this.ambient = new THREE.AmbientLight('#ffffff', 0.35)
    this.scene.add(this.ambient)
    this.sun = new THREE.DirectionalLight('#ffffff', 1.8)
    this.sun.position.set(CENTER.x + 11, 15, CENTER.z + 9)
    this.sun.target.position.set(CENTER.x, 0, CENTER.z)
    this.sun.castShadow = true
    this.sun.shadow.mapSize.set(2048, 2048)
    this.sun.shadow.camera.left = -13
    this.sun.shadow.camera.right = 13
    this.sun.shadow.camera.top = 13
    this.sun.shadow.camera.bottom = -13
    this.sun.shadow.camera.far = 45
    this.sun.shadow.bias = -0.0004
    this.scene.add(this.sun)
    this.scene.add(this.sun.target)

    const pointDefs: Array<[number, number, number]> = [
      [5.2, 2.1, 4.6], // 餐厅基础照明
      [5.6, 2.4, 9.6], // 客厅
      [9.5, 2.3, 10.2], // 主卧
      [1.8, 2.3, 9.6], // 次卧
      [9.4, 2.3, 1.9], // 书房
    ]
    for (const [x, y, z] of pointDefs) {
      const p = new THREE.PointLight('#ffe0b0', 20, 9, 2)
      p.position.set(x, y, z)
      this.scene.add(p)
      this.points.push(p)
    }

    // 建筑 + 家具
    this.house = buildHouse(DEFAULT_STYLE)
    this.scene.add(this.house.group)
    this.furniture = buildFurniture(this.house.registry, this.house.glassMat)
    this.scene.add(this.furniture.group)
    this.furniture.styleGroups[DEFAULT_STYLE].visible = true

    // 房间标签
    for (const r of ROOM_LABELS) {
      const div = document.createElement('div')
      div.className = 'room-label'
      const name = document.createElement('span')
      name.className = 'room-name'
      name.textContent = r.name
      const area = document.createElement('span')
      area.className = 'room-area'
      area.textContent = r.area
      div.append(name, area)
      const obj = new CSS2DObject(div)
      obj.position.set(r.x, 1.4, r.z)
      this.labelGroup.add(obj)
    }
    this.scene.add(this.labelGroup)

    this.applyLightPreset(DEFAULT_STYLE)

    // 事件
    this.resizeObs = new ResizeObserver(() => this.handleResize())
    this.resizeObs.observe(container)
    window.addEventListener('keydown', this.onKeyDown)
    window.addEventListener('keyup', this.onKeyUp)
    this.renderer.domElement.addEventListener('pointerdown', this.onPointerDown)
    window.addEventListener('pointermove', this.onPointerMove)
    window.addEventListener('pointerup', this.onPointerUp)
    window.addEventListener('pointercancel', this.onPointerUp)

    this.animate()
    // 首帧渲染完成后通知
    requestAnimationFrame(() => opts.onReady?.())
  }

  private applyLightPreset(style: StyleKey) {
    const l = STYLES[style].light
    this.renderer.toneMappingExposure = l.exposure
    this.scene.background = new THREE.Color(l.environment)
    if (this.scene.fog instanceof THREE.Fog) this.scene.fog.color.set(l.environment)
    this.ground.material.color.set(l.ground)
    this.hemi.color.set(l.hemiSky)
    this.hemi.groundColor.set(l.hemiGround)
    this.hemi.intensity = l.hemiIntensity
    this.ambient.color.set(l.ambient)
    this.ambient.intensity = l.ambientIntensity
    this.sun.color.set(l.sunColor)
    this.sun.intensity = l.sunIntensity
    for (const p of this.points) {
      p.color.set(l.pointColor)
      p.intensity = l.pointIntensity
    }
  }

  setStyle(style: StyleKey) {
    const preset = STYLES[style]
    applyPresetToRegistry(this.house.registry, preset)
    applyGlassPreset(this.house.glassMat, preset)
    refreshFloors(this.house, preset)
    this.applyLightPreset(style)
    // 风格专属家具组显隐切换
    this.furniture.styleGroups[this.currentStyle].visible = false
    this.furniture.styleGroups[style].visible = true
    this.currentStyle = style
  }

  setViewMode(mode: ViewMode) {
    this.mode = mode
    this.keys.clear()
    if (mode === 'walk') {
      this.controls.enabled = false
      this.walkPos.set(5.5, 1.6, 6.8)
      this.walkYaw = 0
      this.walkPitch = 0.02
    } else {
      this.controls.enabled = true
      if (mode === 'orbit') {
        this.camera.position.set(CENTER.x + 8.5, 9.5, CENTER.z + 12)
        this.controls.target.set(CENTER.x, 0.6, CENTER.z)
      } else {
        this.camera.position.set(CENTER.x, 19, CENTER.z + 0.6)
        this.controls.target.set(CENTER.x, 0, CENTER.z)
      }
      this.controls.update()
    }
  }

  setLabelsVisible(v: boolean) {
    this.labelGroup.visible = v
    this.labelRenderer.domElement.style.display = v ? 'block' : 'none'
  }

  setWallsTransparent(v: boolean) {
    setWallsTransparent(this.house, v)
  }

  private handleResize() {
    if (this.disposed) return
    const w = this.container.clientWidth || 1
    const h = this.container.clientHeight || 1
    this.camera.aspect = w / h
    this.camera.updateProjectionMatrix()
    this.renderer.setSize(w, h)
    this.labelRenderer.setSize(w, h)
  }

  /** 漫游碰撞简化：房间矩形并集（外扩 0.22m 允许过门） */
  private walkAllowed(x: number, z: number) {
    const pad = 0.22
    if (x < -0.5 || x > 12.65 || z < -1.1 || z > 14.6) return false
    for (const [x1, z1, x2, z2] of WALK_RECTS) {
      if (x >= x1 - pad && x <= x2 + pad && z >= z1 - pad && z <= z2 + pad) return true
    }
    return false
  }

  /** 阻止漫游穿墙；门、入户口、通道和推拉门洞可正常通过。 */
  private crossesSolidWall(x0: number, z0: number, x1: number, z1: number) {
    const eps = 0.0001
    const passKinds = new Set(['door', 'entry', 'pass', 'sliding'])

    for (const wall of WALLS) {
      const horizontal = Math.abs(wall.z2 - wall.z1) < eps
      const vertical = Math.abs(wall.x2 - wall.x1) < eps
      let along = 0
      let crosses = false

      if (horizontal && Math.abs(z1 - z0) > eps) {
        const t = (wall.z1 - z0) / (z1 - z0)
        if (t > eps && t <= 1) {
          const ix = x0 + (x1 - x0) * t
          const minX = Math.min(wall.x1, wall.x2)
          const maxX = Math.max(wall.x1, wall.x2)
          crosses = ix >= minX - eps && ix <= maxX + eps
          along = Math.abs(ix - wall.x1)
        }
      } else if (vertical && Math.abs(x1 - x0) > eps) {
        const t = (wall.x1 - x0) / (x1 - x0)
        if (t > eps && t <= 1) {
          const iz = z0 + (z1 - z0) * t
          const minZ = Math.min(wall.z1, wall.z2)
          const maxZ = Math.max(wall.z1, wall.z2)
          crosses = iz >= minZ - eps && iz <= maxZ + eps
          along = Math.abs(iz - wall.z1)
        }
      }

      if (!crosses) continue
      const inPassage = (wall.openings ?? []).some((opening) => (
        opening.sill <= 0.05
        && passKinds.has(opening.kind)
        && along >= opening.start + 0.07
        && along <= opening.start + opening.width - 0.07
      ))
      if (!inPassage) return true
    }
    return false
  }

  private updateWalk(dt: number) {
    const speed = 2.4 * dt
    let mx = 0
    let mz = 0
    if (this.keys.has('KeyW') || this.keys.has('ArrowUp')) mz -= 1
    if (this.keys.has('KeyS') || this.keys.has('ArrowDown')) mz += 1
    if (this.keys.has('KeyA') || this.keys.has('ArrowLeft')) mx -= 1
    if (this.keys.has('KeyD') || this.keys.has('ArrowRight')) mx += 1
    if (mx !== 0 || mz !== 0) {
      const len = Math.hypot(mx, mz)
      mx /= len
      mz /= len
      const sin = Math.sin(this.walkYaw)
      const cos = Math.cos(this.walkYaw)
      // forward = (-sin, -cos)，right = (cos, -sin)
      const f = -mz // W 为前进
      const dx = (f * -sin + mx * cos) * speed
      const dz = (f * -cos + mx * -sin) * speed
      const nx = this.walkPos.x + dx
      const nz = this.walkPos.z + dz
      if (this.walkAllowed(nx, nz) && !this.crossesSolidWall(this.walkPos.x, this.walkPos.z, nx, nz)) {
        this.walkPos.x = nx
        this.walkPos.z = nz
      } else if (
        this.walkAllowed(nx, this.walkPos.z)
        && !this.crossesSolidWall(this.walkPos.x, this.walkPos.z, nx, this.walkPos.z)
      ) {
        this.walkPos.x = nx
      } else if (
        this.walkAllowed(this.walkPos.x, nz)
        && !this.crossesSolidWall(this.walkPos.x, this.walkPos.z, this.walkPos.x, nz)
      ) {
        this.walkPos.z = nz
      }
    }
    this.camera.position.copy(this.walkPos)
    this.camera.rotation.set(this.walkPitch, this.walkYaw, 0)
  }

  private animate = () => {
    if (this.disposed) return
    this.raf = requestAnimationFrame(this.animate)
    const now = performance.now()
    const dt = Math.min((now - this.lastFrameTime) / 1000, 0.1)
    this.lastFrameTime = now
    if (this.mode === 'walk') {
      this.updateWalk(dt)
    } else {
      this.controls.update()
    }
    this.renderer.render(this.scene, this.camera)
    if (this.labelGroup.visible) this.labelRenderer.render(this.scene, this.camera)
  }

  dispose() {
    this.disposed = true
    cancelAnimationFrame(this.raf)
    this.resizeObs.disconnect()
    window.removeEventListener('keydown', this.onKeyDown)
    window.removeEventListener('keyup', this.onKeyUp)
    window.removeEventListener('pointermove', this.onPointerMove)
    window.removeEventListener('pointerup', this.onPointerUp)
    window.removeEventListener('pointercancel', this.onPointerUp)
    this.controls.dispose()
    this.scene.traverse((o) => {
      if (o instanceof THREE.Mesh) {
        o.geometry.dispose()
        const mats = Array.isArray(o.material) ? o.material : [o.material]
        for (const mt of mats) {
          const std = mt as THREE.MeshStandardMaterial
          std.map?.dispose()
          mt.dispose()
        }
      }
    })
    this.renderer.dispose()
    this.renderer.domElement.remove()
    this.labelRenderer.domElement.remove()
  }
}
