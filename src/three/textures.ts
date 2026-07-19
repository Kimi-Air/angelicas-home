// 程序化纹理：canvas 生成简单木纹 / 大理石纹
import * as THREE from 'three'

function seeded(seed: number) {
  let state = seed >>> 0
  return () => {
    state = (state * 1664525 + 1013904223) >>> 0
    return state / 4294967296
  }
}

function canvasTexture(cv: HTMLCanvasElement) {
  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 家具直纹木饰面：无地板板缝，适合柜门、桌面与开放层板。 */
export function makeWoodSurfaceTexture(base: string, grain: string, seed = 17): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  const random = seeded(seed)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  for (let i = 0; i < 72; i += 1) {
    const x0 = random() * S
    ctx.strokeStyle = grain
    ctx.globalAlpha = 0.035 + random() * 0.11
    ctx.lineWidth = 0.4 + random() * 1.3
    ctx.beginPath()
    ctx.moveTo(x0, 0)
    for (let y = 0; y <= S; y += 24) {
      const drift = Math.sin(y / (45 + random() * 30) + i) * (1.5 + random() * 3)
      ctx.lineTo(x0 + drift, y)
    }
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  return canvasTexture(cv)
}

/** 柔光石材：保留细云纹，不绘制会放大空间噪声的砖缝或大花纹。 */
export function makeStoneSurfaceTexture(base: string, vein: string, seed = 29): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  const random = seeded(seed)
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  for (let i = 0; i < 34; i += 1) {
    const r = 28 + random() * 96
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    gradient.addColorStop(0, vein)
    gradient.addColorStop(1, base)
    ctx.save()
    ctx.translate(random() * S, random() * S)
    ctx.scale(1.8, 0.7)
    ctx.globalAlpha = 0.025 + random() * 0.055
    ctx.fillStyle = gradient
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  ctx.globalAlpha = 1
  return canvasTexture(cv)
}

/** 织物微纹理：仅形成近看触感，避免远景出现明显棋盘格。 */
export function makeFabricSurfaceTexture(base: string, thread: string): THREE.CanvasTexture {
  const S = 256
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)
  ctx.strokeStyle = thread
  ctx.lineWidth = 0.55
  ctx.globalAlpha = 0.12
  for (let i = 0; i <= S; i += 5) {
    ctx.beginPath()
    ctx.moveTo(i, 0)
    ctx.lineTo(i, S)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(0, i + 2)
    ctx.lineTo(S, i + 2)
    ctx.stroke()
  }
  ctx.globalAlpha = 1
  return canvasTexture(cv)
}

/** 直拼木纹地板纹理 */
export function makeWoodTexture(base: string, grain: string): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  const plankH = S / 4 // 每块地板高度
  for (let row = 0; row < 4; row++) {
    const y0 = row * plankH
    // 每行错缝
    const offset = row % 2 === 0 ? 0 : S / 2
    // 板内木纹：细曲线
    for (let i = 0; i < 26; i++) {
      const gy = y0 + 4 + Math.random() * (plankH - 8)
      ctx.strokeStyle = grain
      ctx.globalAlpha = 0.08 + Math.random() * 0.14
      ctx.lineWidth = 0.6 + Math.random() * 1.4
      ctx.beginPath()
      ctx.moveTo(0, gy)
      for (let x = 0; x <= S; x += 32) {
        ctx.lineTo(x, gy + Math.sin((x / S) * Math.PI * 2 + i) * 2.5 + (Math.random() - 0.5) * 2)
      }
      ctx.stroke()
    }
    ctx.globalAlpha = 1
    // 板缝（横）
    ctx.strokeStyle = grain
    ctx.globalAlpha = 0.55
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.moveTo(0, y0 + 0.5)
    ctx.lineTo(S, y0 + 0.5)
    ctx.stroke()
    // 板缝（纵，错缝）
    ctx.beginPath()
    ctx.moveTo(offset + 0.5, y0)
    ctx.lineTo(offset + 0.5, y0 + plankH)
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 大理石纹瓷砖纹理 */
export function makeMarbleTexture(base: string, vein: string): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  // 大理石脉络：随机游走曲线
  for (let i = 0; i < 22; i++) {
    let x = Math.random() * S
    let y = Math.random() * S
    let angle = Math.random() * Math.PI * 2
    ctx.strokeStyle = vein
    ctx.globalAlpha = 0.1 + Math.random() * 0.22
    ctx.lineWidth = 0.5 + Math.random() * 1.8
    ctx.beginPath()
    ctx.moveTo(x, y)
    const steps = 40 + Math.floor(Math.random() * 50)
    for (let s = 0; s < steps; s++) {
      angle += (Math.random() - 0.5) * 0.9
      x += Math.cos(angle) * 9
      y += Math.sin(angle) * 9
      ctx.lineTo(x, y)
    }
    ctx.stroke()
  }
  // 砖缝（2×2）
  ctx.globalAlpha = 0.5
  ctx.strokeStyle = vein
  ctx.lineWidth = 2.5
  ctx.strokeRect(1, 1, S - 2, S - 2)
  ctx.beginPath()
  ctx.moveTo(S / 2, 0)
  ctx.lineTo(S / 2, S)
  ctx.moveTo(0, S / 2)
  ctx.lineTo(S, S / 2)
  ctx.stroke()
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 鱼骨拼木地板纹理（人字拼） */
export function makeHerringboneTexture(base: string, grain: string): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  const plankL = 128 // 板长
  const plankW = 32 // 板宽
  ctx.lineWidth = 1.6

  // 以 45°/-45° 交替绘制人字形板条
  for (let row = -2; row < S / plankW + 2; row++) {
    for (let col = -2; col < S / plankL + 2; col++) {
      const cx = col * plankL + (row % 2 === 0 ? 0 : plankL / 2)
      const cy = row * plankW * 2
      for (const dir of [1, -1] as const) {
        ctx.save()
        ctx.translate(cx + (dir === 1 ? 0 : plankL / 2), cy)
        ctx.rotate((dir * Math.PI) / 4)
        // 板面
        ctx.fillStyle = base
        ctx.globalAlpha = 0.85 + Math.random() * 0.15
        ctx.fillRect(0, 0, plankL, plankW)
        // 板内木纹
        ctx.strokeStyle = grain
        for (let i = 0; i < 4; i++) {
          ctx.globalAlpha = 0.1 + Math.random() * 0.12
          ctx.lineWidth = 0.7 + Math.random()
          ctx.beginPath()
          ctx.moveTo(2, 4 + Math.random() * (plankW - 8))
          ctx.bezierCurveTo(
            plankL * 0.3, Math.random() * plankW,
            plankL * 0.6, Math.random() * plankW,
            plankL - 2, 4 + Math.random() * (plankW - 8),
          )
          ctx.stroke()
        }
        // 板缝
        ctx.globalAlpha = 0.55
        ctx.lineWidth = 1.6
        ctx.strokeStyle = grain
        ctx.strokeRect(0, 0, plankL, plankW)
        ctx.restore()
      }
    }
  }
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}

/** 水泥/柔光砖纹理 */
export function makeConcreteTexture(base: string, speck: string): THREE.CanvasTexture {
  const S = 512
  const cv = document.createElement('canvas')
  cv.width = S
  cv.height = S
  const ctx = cv.getContext('2d')!
  ctx.fillStyle = base
  ctx.fillRect(0, 0, S, S)

  // 大面积柔和色斑
  for (let i = 0; i < 40; i++) {
    const r = 30 + Math.random() * 90
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, r)
    g.addColorStop(0, speck)
    g.addColorStop(1, base)
    ctx.save()
    ctx.translate(Math.random() * S, Math.random() * S)
    ctx.globalAlpha = 0.05 + Math.random() * 0.08
    ctx.fillStyle = g
    ctx.beginPath()
    ctx.arc(0, 0, r, 0, Math.PI * 2)
    ctx.fill()
    ctx.restore()
  }
  // 细颗粒噪点
  for (let i = 0; i < 900; i++) {
    ctx.globalAlpha = 0.04 + Math.random() * 0.06
    ctx.fillStyle = Math.random() > 0.5 ? speck : '#ffffff'
    ctx.fillRect(Math.random() * S, Math.random() * S, 1.5, 1.5)
  }
  // 砖缝（2×2）
  ctx.globalAlpha = 0.4
  ctx.strokeStyle = speck
  ctx.lineWidth = 2
  ctx.strokeRect(1, 1, S - 2, S - 2)
  ctx.beginPath()
  ctx.moveTo(S / 2, 0)
  ctx.lineTo(S / 2, S)
  ctx.moveTo(0, S / 2)
  ctx.lineTo(S, S / 2)
  ctx.stroke()
  ctx.globalAlpha = 1

  const tex = new THREE.CanvasTexture(cv)
  tex.wrapS = THREE.RepeatWrapping
  tex.wrapT = THREE.RepeatWrapping
  tex.colorSpace = THREE.SRGBColorSpace
  tex.anisotropy = 4
  return tex
}
