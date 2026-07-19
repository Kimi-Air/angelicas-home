import * as THREE from 'three'
import { describe, expect, it } from 'vitest'
import { DESIGN_ITEMS, DESIGN_META, DESIGN_RISKS } from './spec'
import { createRegistry } from '@/three/builder'
import { BAY_DESK_LAYOUT, ENTRY_CABINET_RUN, KITCHEN_APPLIANCE_LAYOUT, LAUNDRY_LAYOUT, LIVING_LAYOUT, MASTER_DRESSING_LAYOUT, MASTER_LAYOUT, OPPOSITE_ENTRY_CABINET_RUN, SECONDARY_LAYOUT, STORAGE_LAYOUT, STUDY_LAYOUT, buildFurniture } from '@/three/furniture'
import { BAY_PLATFORMS, BAY_WINDOW_RULES, BEDROOM_FOOTPRINTS, COLUMNS, LAUNDRY_SINK_WINDOW, LIVING_BALCONY_FRONT_WINDOW, LIVING_BALCONY_INTERFACE, LIVING_BALCONY_WEST_WINDOW, MASTER_NORTH_WALL, PASSAGE_PARTITION, ROOM_LABELS, STRUCTURAL_PROJECTIONS, WALL_H, WALLS } from '@/three/plan'
import { STYLES, STYLE_ORDER } from '@/three/styles'

describe('R35 户型拓扑', () => {
  it('所有墙体与洞口几何均合法且不重叠', () => {
    for (const wall of WALLS) {
      const length = Math.hypot(wall.x2 - wall.x1, wall.z2 - wall.z1)
      expect(length).toBeGreaterThan(0)
      const openings = [...(wall.openings ?? [])].sort((a, b) => a.start - b.start)
      let cursor = 0
      for (const opening of openings) {
        expect(opening.width).toBeGreaterThan(0)
        expect(opening.start).toBeGreaterThanOrEqual(cursor)
        expect(opening.start + opening.width).toBeLessThanOrEqual(length + 0.001)
        expect(opening.top).toBeGreaterThan(opening.sill)
        cursor = opening.start + opening.width
      }
    }
  })

  it('锁定三处通高实体侧墙飘窗、厨房三扇移门与次卧门', () => {
    const openings = WALLS.flatMap((wall) => wall.openings ?? [])
    const bays = openings.filter((opening) => opening.kind === 'bay')
    expect(bays).toHaveLength(3)
    expect(bays.every((opening) => opening.baySide === 'solid-full-height')).toBe(true)
    expect(openings.some((opening) => opening.kind === 'sliding' && opening.panels === 3)).toBe(true)
    const secondaryDoorWall = WALLS.find((wall) => wall.x1 === 3.6 && wall.x2 === 3.6 && wall.z1 === 7.3)
    expect(secondaryDoorWall?.openings?.some((opening) => opening.kind === 'door')).toBe(true)
  })

  it('房间标签使用最新功能名称且唯一', () => {
    const names = ROOM_LABELS.map((room) => room.name)
    expect(new Set(names).size).toBe(names.length)
    expect(names).toEqual(expect.arrayContaining(['储物间', '厨房', '书房', '次卧', '主卧', '生活阳台']))
    expect(names).not.toEqual(expect.arrayContaining(['开放式厨房', '卧室A', '卧室B（主卧）']))
  })

  it('玄关整排柜墙面没有窗洞', () => {
    const entryCabinetWall = WALLS.find((wall) => wall.x1 === 3.6 && wall.x2 === 3.6 && wall.z1 === 5.9 && wall.z2 === 7.3)
    expect(entryCabinetWall).toBeDefined()
    expect(entryCabinetWall?.openings ?? []).toHaveLength(0)
  })

  it('客厅与生活阳台左侧保持无梁开放，洗衣机前为通高承重墙段', () => {
    const screenWall = WALLS.find((wall) => (
      wall.z1 === LIVING_BALCONY_INTERFACE.z
      && wall.z2 === LIVING_BALCONY_INTERFACE.z
      && wall.x1 === LIVING_BALCONY_INTERFACE.loadBearingWallStartX
      && wall.x2 === LIVING_BALCONY_INTERFACE.loadBearingWallEndX
    ))
    expect(screenWall).toMatchObject({ t: LIVING_BALCONY_INTERFACE.loadBearingWallThickness })
    expect(LIVING_BALCONY_INTERFACE).toMatchObject({ leftPier: false, topBeam: false, washerScreenWall: true })
    expect(LIVING_BALCONY_INTERFACE.loadBearingWallEndX - LIVING_BALCONY_INTERFACE.loadBearingWallStartX)
      .toBeCloseTo(LIVING_BALCONY_INTERFACE.loadBearingWallReferenceWidth, 5)
    expect(COLUMNS).toHaveLength(0)
  })

  it('三处飘窗均为抬高窗台而非室内地板延伸', () => {
    const bays = WALLS.flatMap((wall) => wall.openings ?? []).filter((opening) => opening.kind === 'bay')
    expect(BAY_WINDOW_RULES).toMatchObject({ sillHeight: 0.45, treatedAsFloor: false, guardHeightFromPlatform: 0.9 })
    expect(BAY_PLATFORMS).toHaveLength(3)
    expect(BAY_PLATFORMS.every((platform) => platform.sillHeight === BAY_WINDOW_RULES.sillHeight)).toBe(true)
    expect(bays.every((opening) => opening.sill === BAY_WINDOW_RULES.sillHeight)).toBe(true)
    expect(bays.every((opening) => (opening.bayDepth ?? 0) <= BAY_WINDOW_RULES.maxProjectionReference)).toBe(true)
  })

  it('恢复原始户型中的过道竖向短墙', () => {
    const wall = WALLS.find((item) => (
      item.x1 === PASSAGE_PARTITION.x
      && item.x2 === PASSAGE_PARTITION.x
      && item.z1 === PASSAGE_PARTITION.startZ
      && item.z2 === PASSAGE_PARTITION.endZ
    ))
    expect(wall).toBeDefined()
  })

  it('主卧北侧横墙为单段等厚直墙，不在东侧返段产生毛边', () => {
    const northWallSegments = WALLS.filter((wall) => (
      wall.z1 === MASTER_NORTH_WALL.z
      && wall.z2 === MASTER_NORTH_WALL.z
      && Math.max(wall.x1, wall.x2) > MASTER_NORTH_WALL.startX
      && Math.min(wall.x1, wall.x2) < MASTER_NORTH_WALL.endX
    ))
    expect(northWallSegments).toEqual([{
      x1: MASTER_NORTH_WALL.startX,
      z1: MASTER_NORTH_WALL.z,
      x2: MASTER_NORTH_WALL.endX,
      z2: MASTER_NORTH_WALL.z,
      t: MASTER_NORTH_WALL.thickness,
    }])
  })

  it('生活阳台水池上方有窗且避开洗衣机上柜', () => {
    const wall = WALLS.find((item) => item.x1 === 7.65 && item.x2 === 7.65 && item.z1 === STRUCTURAL_PROJECTIONS.master.southZ && item.z2 === 14.3)
    const window = wall?.openings?.find((opening) => opening.kind === 'window')
    expect(window).toMatchObject({
      start: LAUNDRY_SINK_WINDOW.start,
      width: LAUNDRY_SINK_WINDOW.width,
      sill: LAUNDRY_SINK_WINDOW.sill,
      top: LAUNDRY_SINK_WINDOW.top,
    })
    expect(LAUNDRY_SINK_WINDOW.wallStartZ + LAUNDRY_SINK_WINDOW.start + LAUNDRY_SINK_WINDOW.width / 2)
      .toBeCloseTo(LAUNDRY_SINK_WINDOW.centerZ, 5)
    expect(LAUNDRY_SINK_WINDOW.centerZ).toBeCloseTo(13.5, 5)
  })

  it('生活阳台西侧大窗参考正面窗并保留四周墙体', () => {
    const matchingWalls = WALLS.filter((item) => (
      item.x1 === LIVING_BALCONY_WEST_WINDOW.wallX
      && item.x2 === LIVING_BALCONY_WEST_WINDOW.wallX
      && item.z1 === LIVING_BALCONY_WEST_WINDOW.startZ
      && item.z2 === LIVING_BALCONY_WEST_WINDOW.endZ
    ))
    expect(matchingWalls).toHaveLength(1)
    const wall = matchingWalls[0]
    const opening = wall?.openings?.find((item) => item.kind === 'window')
    const wallLength = LIVING_BALCONY_WEST_WINDOW.endZ - LIVING_BALCONY_WEST_WINDOW.startZ
    const rightPier = wallLength - LIVING_BALCONY_WEST_WINDOW.start - LIVING_BALCONY_WEST_WINDOW.width
    const frontWallLength = LIVING_BALCONY_FRONT_WINDOW.wallEndX - LIVING_BALCONY_FRONT_WINDOW.wallStartX
    expect(wall).toBeDefined()
    expect(opening).toMatchObject({
      start: LIVING_BALCONY_WEST_WINDOW.start,
      width: LIVING_BALCONY_WEST_WINDOW.width,
      sill: LIVING_BALCONY_FRONT_WINDOW.sill,
      top: LIVING_BALCONY_FRONT_WINDOW.top,
    })
    expect(LIVING_BALCONY_WEST_WINDOW.start).toBeGreaterThanOrEqual(0.15)
    expect(rightPier).toBeGreaterThanOrEqual(0.15)
    expect(LIVING_BALCONY_WEST_WINDOW.sill).toBeGreaterThan(0)
    expect(LIVING_BALCONY_WEST_WINDOW.top).toBeLessThan(WALL_H)
    expect(LIVING_BALCONY_WEST_WINDOW.width / wallLength)
      .toBeCloseTo(LIVING_BALCONY_FRONT_WINDOW.width / frontWallLength, 1)
  })

  it('储物间向西外挑，主卧向南延伸并明显大于次卧', () => {
    const secondary = BEDROOM_FOOTPRINTS.secondary
    const master = BEDROOM_FOOTPRINTS.master
    const secondaryArea = (secondary.x2 - secondary.x1) * (secondary.z2 - secondary.z1)
    const masterArea = (master.x2 - master.x1) * (master.z2 - master.z1)

    expect(STRUCTURAL_PROJECTIONS.storage.westX).toBeLessThan(STRUCTURAL_PROJECTIONS.storage.alignedWallX)
    expect(STRUCTURAL_PROJECTIONS.storage.alignedWallX - STRUCTURAL_PROJECTIONS.storage.westX)
      .toBeCloseTo(STRUCTURAL_PROJECTIONS.storage.westProjection, 5)
    expect(WALLS.some((wall) => (
      wall.x1 === STRUCTURAL_PROJECTIONS.storage.westX
      && wall.x2 === STRUCTURAL_PROJECTIONS.storage.westX
      && wall.z1 === STRUCTURAL_PROJECTIONS.storage.northZ
      && wall.z2 === STRUCTURAL_PROJECTIONS.storage.southZ
    ))).toBe(true)

    expect(STRUCTURAL_PROJECTIONS.master.southZ).toBeGreaterThan(STRUCTURAL_PROJECTIONS.master.livingInterfaceZ)
    expect(STRUCTURAL_PROJECTIONS.master.southZ - STRUCTURAL_PROJECTIONS.master.livingInterfaceZ)
      .toBeCloseTo(STRUCTURAL_PROJECTIONS.master.southProjection, 5)
    expect(WALLS.some((wall) => (
      wall.z1 === STRUCTURAL_PROJECTIONS.master.southZ
      && wall.z2 === STRUCTURAL_PROJECTIONS.master.southZ
      && wall.x1 === BEDROOM_FOOTPRINTS.master.x1
      && wall.x2 === BEDROOM_FOOTPRINTS.master.x2
    ))).toBe(true)

    expect(masterArea).toBeGreaterThan(secondaryArea)
    expect(masterArea - secondaryArea).toBeGreaterThan(3.5)
    expect(secondaryArea).toBeCloseTo(secondary.sourceArea, 0)
    expect(master.sourceArea).toBe(19.6)
  })
})

describe('R35 家具与定制', () => {
  it('客厅为右移的 L 型皮质沙发，壁挂电视与主沙发居中，不生成电视柜和茶几', () => {
    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    const ids = new Set<string>()
    build.group.traverse((object) => {
      if (typeof object.userData.entityId === 'string') ids.add(object.userData.entityId)
    })
    expect(ids.has('C53-large-wall-mounted-tv')).toBe(true)
    expect(ids.has('C47-wall-mounted-tv')).toBe(false)
    expect(ids.has('C27-tv-wall')).toBe(false)
    expect(ids.has('C27-embedded-tv')).toBe(false)
    expect(ids.has('C27-equipment-slot')).toBe(false)
    expect(ids.has('C27-sofa')).toBe(false)
    expect(ids.has('C62-l-shaped-leather-sofa')).toBe(true)
    expect(ids.has('C62-chaise-module')).toBe(true)
    expect([...ids].some((id) => id.toLowerCase().includes('coffee'))).toBe(false)
    expect([...ids].some((id) => id.includes('study-bed'))).toBe(false)
    expect([...ids]).toEqual(expect.arrayContaining([
      'C63-study-extended-integrated-desk',
      'C63-study-desk-base-cabinet',
      'C63-study-desk-base-cabinet-door',
      'C63-study-three-tier-wall-shelf',
      'C63-study-three-tier-wall-shelf-side',
      'C54-ergonomic-chair',
      'C17-study-wardrobe',
      'C65-secondary-wardrobe-main',
      'C65-secondary-wardrobe-return',
      'C70-secondary-nightstand-upper',
      'C70-secondary-nightstand-lower',
      'C33-master-wardrobe-main',
      'C34-master-wardrobe-return',
      'C35-master-bed',
      'C35-nightstand-upper',
      'C61-master-bay-seat',
      'C61-master-window-desk-run',
      'C61-master-half-bay-extension',
      'C70-master-three-tier-l-corner-cabinet',
      'C70-master-corner-cabinet-task-light',
      'C61-master-u-curve-floating-vanity',
      'C72-master-square-mirror-frame',
      'C72-master-square-mirror',
      'C61-master-tuckable-stool',
      'C61-master-serviceable-outlet',
      'C38-washer-aligned',
      'C13-laundry-sink',
      'C39-laundry-upper-cabinet',
      'C39-laundry-open-shelf',
      'C73-entry-half-height-shoe-cabinet-cmf',
      'C52-entry-shoe-cabinet-top',
      'C55-opposite-left-lower-storage',
      'C55-opposite-left-open-niche',
      'C55-opposite-left-upper-storage',
      'C55-opposite-right-glass-cabinet',
      'C55-opposite-right-glass-door',
      'C55-opposite-right-glass-shelf',
      'C57-opposite-right-exposed-side-glass',
      'C57-opposite-right-side-glass-frame',
      'C60-kitchen-countertop-extension',
      'C60-kitchen-dishwasher',
      'C60-kitchen-microwave',
      'C53-large-wall-mounted-tv',
      'C68-storage-shallow-upper',
      'C68-storage-open-bay-header',
    ]))
    expect(ids.has('C61-master-corner-display')).toBe(false)
    expect(ids.has('C61-master-display-task-light')).toBe(false)
    expect(ids.has('C64-master-vanity-left-corner-display')).toBe(false)
    expect(ids.has('C64-master-display-task-light')).toBe(false)
    expect(ids.has('C66-master-user-left-corner-display')).toBe(false)
    expect(ids.has('C66-master-display-task-light')).toBe(false)
    expect(LIVING_LAYOUT.tvWidth).toBeGreaterThan(1.8)
    expect(LIVING_LAYOUT.tvThickness).toBeGreaterThanOrEqual(0.07)
    expect(LIVING_LAYOUT.tvCenterY).toBeGreaterThanOrEqual(1.1)
    expect(LIVING_LAYOUT.tvCenterY).toBeLessThanOrEqual(1.25)
    expect(LIVING_LAYOUT.tvCenterZ).toBe(LIVING_LAYOUT.sofaCenterZ)
    expect(LIVING_LAYOUT.centerShiftZ).toBeCloseTo(LIVING_LAYOUT.sofaCenterZ - LIVING_LAYOUT.previousCenterZ, 5)
    expect(LIVING_LAYOUT.centerShiftZ).toBeGreaterThan(0.3)
    expect(LIVING_LAYOUT.sofaMainLength).toBeGreaterThanOrEqual(3)
    expect(LIVING_LAYOUT.chaiseSide).toBe('balcony')
    expect(LIVING_LAYOUT.chaiseProjectionX).toBeCloseTo(LIVING_LAYOUT.sofaBackX - LIVING_LAYOUT.chaiseFrontX, 5)
    expect(LIVING_LAYOUT.chaiseProjectionX).toBeGreaterThanOrEqual(1.55)
    expect(LIVING_LAYOUT.chaiseToTvClearanceX).toBeGreaterThanOrEqual(2.2)
    expect(LIVING_LAYOUT.balconyClearanceZ).toBeGreaterThanOrEqual(0.55)
    expect(ids.has('C30-chair')).toBe(false)
    expect(ids.has('C35-nightstand-lower')).toBe(true)
    expect(ids.has('C30-master-bay-desk')).toBe(false)
    expect(ids.has('C61-master-round-mirror')).toBe(false)
    expect(ids.has('C52-entry-half-height-shoe-cabinet')).toBe(false)
    expect(ids.has('C21-bookcase')).toBe(false)
    registry.forEach((material) => material.dispose())
    glass.dispose()
  })

  it('书房右半飘窗与延伸墙桌连成一体 L 型，以 U 型内弧面向使用者并由端柜承托', () => {
    expect(BAY_DESK_LAYOUT.study).toMatchObject({
      side: 'right',
      share: 0.5,
      shape: 'L',
      continuous: true,
      userEdge: 'U-curve',
    })
    expect(STUDY_LAYOUT.bayDesk.startX).toBeCloseTo((8.1 + 10.6) / 2, 5)
    expect(STUDY_LAYOUT.bayDesk.endX).toBeLessThanOrEqual(10.6)
    expect(STUDY_LAYOUT.wallReturn.centerX).toBeGreaterThan(10.5)
    expect(STUDY_LAYOUT.wallReturn.endZ - STUDY_LAYOUT.wallReturn.startZ).toBeGreaterThanOrEqual(2.2)
    expect(STUDY_LAYOUT.integratedTop.endZ).toBe(STUDY_LAYOUT.wallReturn.endZ)
    expect(STUDY_LAYOUT.integratedTop.innerRightX).toBeLessThanOrEqual(STUDY_LAYOUT.bayDesk.endX)
    expect(STUDY_LAYOUT.integratedTop.outerRightX).toBeGreaterThan(STUDY_LAYOUT.bayDesk.endX)
    expect(STUDY_LAYOUT.integratedTop.userCurve.radiusReference).toBeGreaterThanOrEqual(0.4)
    expect(STUDY_LAYOUT.integratedTop.userCurve.startX).toBeLessThan(STUDY_LAYOUT.kneeSpace.chairCenterX)
    expect(STUDY_LAYOUT.integratedTop.userCurve.endX).toBeGreaterThan(STUDY_LAYOUT.kneeSpace.chairCenterX)
    expect(STUDY_LAYOUT.kneeSpace.width).toBeGreaterThanOrEqual(0.9)
    expect(STUDY_LAYOUT.baseCabinet.endZ).toBe(STUDY_LAYOUT.wallReturn.endZ)
    expect(STUDY_LAYOUT.baseCabinet.startZ).toBeGreaterThan(STUDY_LAYOUT.integratedTop.userCurve.endZ)
    expect(STUDY_LAYOUT.baseCabinet.height).toBeLessThan(STUDY_LAYOUT.bayDesk.height)
    expect(STUDY_LAYOUT.openShelf.startZ).toBeLessThanOrEqual(0.3)
    expect(STUDY_LAYOUT.openShelf.endZ).toBe(STUDY_LAYOUT.baseCabinet.endZ)
    expect(STUDY_LAYOUT.openShelf.levels).toBe(3)
    expect(STUDY_LAYOUT.openShelf.bottomY).toBeGreaterThanOrEqual(1.35)
    expect(STUDY_LAYOUT.openShelf.levelClearHeight).toBeGreaterThanOrEqual(0.32)
    const openShelfTopY = STUDY_LAYOUT.openShelf.bottomY
      + STUDY_LAYOUT.openShelf.levels * (STUDY_LAYOUT.openShelf.levelClearHeight + STUDY_LAYOUT.openShelf.shelfThickness)
    expect(openShelfTopY).toBeLessThanOrEqual(2.45)
    const wardrobeFrontZ = STUDY_LAYOUT.wardrobe.z - STUDY_LAYOUT.wardrobe.depth / 2
    expect(wardrobeFrontZ - STUDY_LAYOUT.chair.rearEdgeZ).toBeGreaterThanOrEqual(2.2)

    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    const integratedTops: THREE.Mesh[] = []
    const baseCabinets: THREE.Mesh[] = []
    const baseCabinetDoors: THREE.Mesh[] = []
    const shelfBoards: THREE.Mesh[] = []
    const shelfSides: THREE.Mesh[] = []
    build.group.traverse((object) => {
      if (object.userData.entityId === BAY_DESK_LAYOUT.study.entityId && object instanceof THREE.Mesh) integratedTops.push(object)
      if (object.userData.entityId === 'C63-study-desk-base-cabinet' && object instanceof THREE.Mesh) baseCabinets.push(object)
      if (object.userData.entityId === 'C63-study-desk-base-cabinet-door' && object instanceof THREE.Mesh) baseCabinetDoors.push(object)
      if (object.userData.entityId === 'C63-study-three-tier-wall-shelf' && object instanceof THREE.Mesh) shelfBoards.push(object)
      if (object.userData.entityId === 'C63-study-three-tier-wall-shelf-side' && object instanceof THREE.Mesh) shelfSides.push(object)
    })
    expect(integratedTops).toHaveLength(2)
    expect(integratedTops.filter((mesh) => mesh.geometry.type === 'ExtrudeGeometry')).toHaveLength(1)
    expect(baseCabinets).toHaveLength(1)
    expect(baseCabinetDoors).toHaveLength(2)
    expect(shelfBoards).toHaveLength(STUDY_LAYOUT.openShelf.levels + 1)
    expect(shelfSides).toHaveLength(2)
    registry.forEach((item) => item.dispose())
    glass.dispose()
  })

  it('书房原衣柜位置保持不变', () => {
    expect(STUDY_LAYOUT.wardrobe).toEqual({ x: 9.92, z: 3.65, width: 2.05, depth: 0.55 })
  })

  it('厨房右侧红框段保持连续台面，台下洗碗机、台上微波炉', () => {
    const run = KITCHEN_APPLIANCE_LAYOUT.rightRun
    const dishwasher = KITCHEN_APPLIANCE_LAYOUT.dishwasher
    const microwave = KITCHEN_APPLIANCE_LAYOUT.microwave
    expect(run.endZ - run.startZ).toBeGreaterThan(dishwasher.width)
    expect(dishwasher.width).toBeCloseTo(0.6, 5)
    expect(dishwasher.centerZ - dishwasher.width / 2).toBeGreaterThanOrEqual(run.startZ)
    expect(dishwasher.centerZ + dishwasher.width / 2).toBeLessThanOrEqual(run.endZ)
    expect(microwave.centerZ).toBe(dishwasher.centerZ)
    expect(microwave.bottomY).toBeGreaterThan(run.counterCenterY + run.counterThickness / 2)

    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    const ids = new Set<string>()
    build.group.traverse((object) => {
      if (typeof object.userData.entityId === 'string') ids.add(object.userData.entityId)
    })
    expect([...ids]).toEqual(expect.arrayContaining([
      'C60-kitchen-countertop-extension',
      'C60-kitchen-dishwasher',
      'C60-kitchen-microwave',
    ]))
    expect(ids.has('C10-right-counter')).toBe(false)
    registry.forEach((item) => item.dispose())
    glass.dispose()
  })

  it('厨房原窄冰箱替换为向左扩宽的双开门冰箱', () => {
    const run = KITCHEN_APPLIANCE_LAYOUT.rightRun
    const fridge = KITCHEN_APPLIANCE_LAYOUT.fridge
    expect(fridge.doorCount).toBe(2)
    expect(fridge.width).toBeGreaterThanOrEqual(1.2)
    expect(fridge.centerZ - fridge.width / 2 - run.endZ).toBeCloseTo(fridge.northClearance, 5)
    expect(3.4 - (fridge.centerZ + fridge.width / 2)).toBeCloseTo(fridge.southClearance, 5)

    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    const ids: string[] = []
    build.group.traverse((object) => {
      if (typeof object.userData.entityId === 'string') ids.push(object.userData.entityId)
    })
    expect(ids.filter((id) => id === 'C67-double-door-fridge')).toHaveLength(1)
    expect(ids.filter((id) => id === 'C67-double-door-fridge-door')).toHaveLength(2)
    expect(ids.filter((id) => id === 'C67-double-door-fridge-handle')).toHaveLength(2)
    expect(ids.filter((id) => id === 'C67-double-door-fridge-center-seam')).toHaveLength(1)
    expect(ids.includes('C04-fridge')).toBe(false)
    registry.forEach((item) => item.dispose())
    glass.dispose()
  })

  it('储物间改为可进入的浅层收纳并保留下部推进位', () => {
    expect(STORAGE_LAYOUT.westWallX).toBe(STRUCTURAL_PROJECTIONS.storage.westX)
    expect(STORAGE_LAYOUT.roomWidth).toBeCloseTo(STRUCTURAL_PROJECTIONS.storage.eastX - STRUCTURAL_PROJECTIONS.storage.westX, 5)
    expect(STORAGE_LAYOUT.shelfDepth).toBeLessThanOrEqual(0.3)
    expect(STORAGE_LAYOUT.standingClearance).toBeCloseTo(STORAGE_LAYOUT.roomWidth - STORAGE_LAYOUT.shelfDepth, 5)
    expect(STORAGE_LAYOUT.standingClearance).toBeGreaterThanOrEqual(0.65)
    expect(STORAGE_LAYOUT.bottomOpenHeight).toBeGreaterThanOrEqual(0.7)
  })

  it('进门旁柜覆盖完整无窗墙段但只保留下半部鞋柜', () => {
    expect(ENTRY_CABINET_RUN.length).toBeCloseTo(ENTRY_CABINET_RUN.wallEnd - ENTRY_CABINET_RUN.wallStart, 5)
    expect(ENTRY_CABINET_RUN.length).toBeGreaterThan(2.3)
    expect(ENTRY_CABINET_RUN.height).toBeLessThanOrEqual(WALL_H / 2)
    expect(ENTRY_CABINET_RUN.height).toBeGreaterThanOrEqual(0.9)
    expect(ENTRY_CABINET_RUN.height).toBeLessThanOrEqual(1)
    expect(ENTRY_CABINET_RUN.depth).toBeLessThanOrEqual(0.4)
    expect(ENTRY_CABINET_RUN.bottomOpenHeight).toBeGreaterThanOrEqual(0.15)
  })

  it('入户正对柜左列开放，右列正面与外露端侧均为通高玻璃', () => {
    expect(OPPOSITE_ENTRY_CABINET_RUN.wallStart).toBe(PASSAGE_PARTITION.startZ)
    expect(OPPOSITE_ENTRY_CABINET_RUN.wallEnd).toBe(PASSAGE_PARTITION.endZ)
    expect(OPPOSITE_ENTRY_CABINET_RUN.length).toBeCloseTo(PASSAGE_PARTITION.endZ - PASSAGE_PARTITION.startZ, 5)
    expect(OPPOSITE_ENTRY_CABINET_RUN.leftColumnWidth + OPPOSITE_ENTRY_CABINET_RUN.rightGlassColumnWidth)
      .toBeCloseTo(OPPOSITE_ENTRY_CABINET_RUN.length, 5)
    expect(OPPOSITE_ENTRY_CABINET_RUN.rightGlassColumnWidth).toBeGreaterThanOrEqual(0.6)
    expect(OPPOSITE_ENTRY_CABINET_RUN.lowerHeight + OPPOSITE_ENTRY_CABINET_RUN.middleHeight + OPPOSITE_ENTRY_CABINET_RUN.upperHeight)
      .toBeCloseTo(OPPOSITE_ENTRY_CABINET_RUN.totalHeight, 5)
    expect(OPPOSITE_ENTRY_CABINET_RUN.totalHeight).toBeLessThanOrEqual(WALL_H)
    expect(WALL_H - OPPOSITE_ENTRY_CABINET_RUN.totalHeight).toBeCloseTo(OPPOSITE_ENTRY_CABINET_RUN.ceilingShadowGap, 5)

    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    const byId = new Map<string, THREE.Object3D[]>()
    build.group.traverse((object) => {
      const id = object.userData.entityId
      if (typeof id !== 'string') return
      byId.set(id, [...(byId.get(id) ?? []), object])
    })
    expect(byId.has('C55-opposite-left-open-niche')).toBe(true)
    expect(byId.get('C55-opposite-right-glass-shelf')).toHaveLength(4)
    const glassDoor = byId.get('C55-opposite-right-glass-door')?.[0] as THREE.Mesh
    expect(glassDoor.material).toBe(glass)
    expect(glassDoor.position.y).toBeCloseTo(OPPOSITE_ENTRY_CABINET_RUN.totalHeight / 2, 5)
    const sideGlass = byId.get('C57-opposite-right-exposed-side-glass')?.[0] as THREE.Mesh
    expect(sideGlass.material).toBe(glass)
    expect(sideGlass.position.z).toBeCloseTo(OPPOSITE_ENTRY_CABINET_RUN.wallEnd + 0.012, 5)
    const sideGlassSize = new THREE.Vector3()
    new THREE.Box3().setFromObject(sideGlass).getSize(sideGlassSize)
    expect(sideGlassSize.x).toBeCloseTo(OPPOSITE_ENTRY_CABINET_RUN.depth - 0.08, 2)
    expect(sideGlassSize.z).toBeCloseTo(0.024, 2)
    registry.forEach((item) => item.dispose())
    glass.dispose()
  })

  it('主卧衣柜贴齐实墙并形成短 L，不保留左凸柜段', () => {
    expect(MASTER_LAYOUT.wardrobeMain).toMatchObject({ startX: 9, endX: 12.4, wallZ: 8.1 })
    expect(MASTER_LAYOUT.wardrobeReturn).toMatchObject({ wallX: 12.4, startZ: 8.1, endZ: 9.12 })
    expect(MASTER_LAYOUT.wardrobeReturn.endZ - MASTER_LAYOUT.wardrobeReturn.startZ).toBeGreaterThanOrEqual(1)
    expect(MASTER_LAYOUT.upperNightstandStartZ - MASTER_LAYOUT.wardrobeReturn.endZ)
      .toBeCloseTo(MASTER_LAYOUT.wardrobeToNightstandClearance, 5)
    expect(MASTER_LAYOUT.wardrobeToNightstandClearance).toBeGreaterThanOrEqual(0.2)
  })

  it('次卧衣柜沿北墙与无门西墙形成短 L，并避开东侧内开门和床头柜', () => {
    expect(SECONDARY_LAYOUT.wardrobeMain).toMatchObject({ startX: 0, endX: 2.6, wallZ: 7.3, depth: 0.58 })
    expect(SECONDARY_LAYOUT.wardrobeReturn).toMatchObject({ wallX: 0, startZ: 7.3, endZ: 8.26, depth: 0.58 })
    expect(SECONDARY_LAYOUT.cornerAccess).toBe('main-run-priority')
    expect(SECONDARY_LAYOUT.returnFunction).toBe('secondary-clean-clothes-and-long-hang')
    expect(SECONDARY_LAYOUT.luggageBay).toBe(true)
    expect(SECONDARY_LAYOUT.nightstandCount).toBe(2)
    expect(SECONDARY_LAYOUT.nightstandCentersZ).toHaveLength(2)
    expect(SECONDARY_LAYOUT.bedCenterZ - SECONDARY_LAYOUT.nightstandCentersZ[0])
      .toBeCloseTo(SECONDARY_LAYOUT.nightstandCentersZ[1] - SECONDARY_LAYOUT.bedCenterZ, 5)
    expect(SECONDARY_LAYOUT.nightstandClearance).toBeGreaterThanOrEqual(0.45)
    expect(SECONDARY_LAYOUT.doorSwingClearance).toBeGreaterThanOrEqual(0.35)
    expect(SECONDARY_LAYOUT.headboardInstallationGap).toBeGreaterThanOrEqual(0.02)
    expect(SECONDARY_LAYOUT.headboardInstallationGap).toBeLessThanOrEqual(0.05)
  })

  it('主卧睡眠组南移、衣柜短返加长，梳妆区扩大并配置低矮三层 L 型转角柜', () => {
    expect(MASTER_LAYOUT.bedWidth).toBe(1.8)
    expect(MASTER_LAYOUT.bedCenterZ - MASTER_LAYOUT.previousBedCenterZ).toBeCloseTo(MASTER_LAYOUT.bedShiftZ, 5)
    expect(MASTER_LAYOUT.bedShiftZ).toBeCloseTo(0.4, 5)
    expect(MASTER_LAYOUT.nightstandCount).toBe(2)
    expect(MASTER_LAYOUT.upperNightstandCenterZ - MASTER_LAYOUT.bedCenterZ)
      .toBeCloseTo(MASTER_LAYOUT.bedCenterZ - MASTER_LAYOUT.lowerNightstandCenterZ, 5)
    expect(MASTER_LAYOUT.vanityActsAsNightstand).toBe(false)
    expect(MASTER_LAYOUT.chair).toBe(true)
    expect(MASTER_LAYOUT.lowerRightCabinet).toBe(false)
    expect(MASTER_DRESSING_LAYOUT.side).toBe('visual-right')
    expect(MASTER_DRESSING_LAYOUT.shape).toBe('L-with-user-facing-U-curve')
    expect(MASTER_DRESSING_LAYOUT.continuousL).toBe(true)
    expect(MASTER_DRESSING_LAYOUT.windowRun.endX).toBe(MASTER_DRESSING_LAYOUT.bayExtension.endX)
    expect(MASTER_DRESSING_LAYOUT.baySeat.startX).toBeGreaterThan(MASTER_DRESSING_LAYOUT.bayExtension.endX)
    expect(MASTER_DRESSING_LAYOUT.stool.tuckable).toBe(true)
    expect(MASTER_DRESSING_LAYOUT.mirror.shape).toBe('square')
    expect(MASTER_DRESSING_LAYOUT.mirror.width).toBe(MASTER_DRESSING_LAYOUT.mirror.height)
    expect(MASTER_DRESSING_LAYOUT.vanityReturn.endZ - MASTER_DRESSING_LAYOUT.vanityReturn.startZ).toBeGreaterThanOrEqual(1.55)
    expect(MASTER_DRESSING_LAYOUT.vanityReturn.depth).toBeGreaterThanOrEqual(0.5)
    expect(MASTER_DRESSING_LAYOUT.vanityReturn.kneeClearHeight).toBeGreaterThanOrEqual(0.62)
    expect(MASTER_DRESSING_LAYOUT.vanityReturn.userFacingNotchWidth).toBeGreaterThanOrEqual(0.6)
    expect(MASTER_DRESSING_LAYOUT.vanityReturn.userFacingNotchDepth).toBeGreaterThanOrEqual(0.1)
    expect(MASTER_DRESSING_LAYOUT.vanityReturn.userFacingNotchDepth).toBeLessThan(MASTER_DRESSING_LAYOUT.vanityReturn.depth / 2)
    expect(MASTER_DRESSING_LAYOUT.stool.centerX).toBeGreaterThan(MASTER_DRESSING_LAYOUT.vanityReturn.wallInnerX)
    const shelfL = MASTER_DRESSING_LAYOUT.cornerShelfL
    const seatedLeftMirrorEdgeZ = MASTER_DRESSING_LAYOUT.mirror.centerZ + MASTER_DRESSING_LAYOUT.mirror.width / 2
    const displayToMirrorGap = shelfL.westLeg.startZ - seatedLeftMirrorEdgeZ
    const displayToSouthCornerGap = STRUCTURAL_PROJECTIONS.master.southZ - shelfL.westLeg.endZ
    expect(shelfL.location).toBe('seated-user-left-south-wall-corner')
    expect(shelfL.seatedSide).toBe('left')
    expect(shelfL.shape).toBe('low-three-tier-L')
    expect(shelfL.levels).toBe(3)
    expect(shelfL.top).toBeLessThanOrEqual(1.7)
    expect(shelfL.westLeg.startZ).toBeGreaterThan(seatedLeftMirrorEdgeZ)
    expect(displayToMirrorGap).toBeGreaterThanOrEqual(0.06)
    expect(displayToMirrorGap).toBeLessThanOrEqual(0.12)
    expect(displayToSouthCornerGap).toBeGreaterThanOrEqual(0.04)
    expect(displayToSouthCornerGap).toBeLessThanOrEqual(0.08)
    expect(MASTER_DRESSING_LAYOUT.bayExtension.centerZ).toBeGreaterThan(STRUCTURAL_PROJECTIONS.master.southZ)
    expect(shelfL.westLeg.startZ).toBeLessThan(MASTER_DRESSING_LAYOUT.vanityReturn.endZ)
    expect(shelfL.westLeg.endZ).toBeGreaterThanOrEqual(MASTER_DRESSING_LAYOUT.vanityReturn.endZ)
    expect(shelfL.bottom).toBeGreaterThanOrEqual(MASTER_DRESSING_LAYOUT.vanityReturn.height)
    expect(shelfL.westLeg.depth).toBeLessThanOrEqual(0.25)
    expect(shelfL.southLeg.depth).toBeLessThanOrEqual(0.25)
    expect(shelfL.southLeg.startX).toBeLessThan(shelfL.westLeg.backX + shelfL.westLeg.depth)
    expect(shelfL.southLeg.endX).toBeLessThan(8.61)
    expect(MASTER_DRESSING_LAYOUT.outlet.serviceable).toBe(true)
    expect(MASTER_DRESSING_LAYOUT.baySeat.finalTopY).toBeLessThanOrEqual(0.48)

    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    const shelfMeshes: THREE.Mesh[] = []
    const taskLights: THREE.Mesh[] = []
    const squareMirrors: THREE.Mesh[] = []
    build.group.traverse((object) => {
      if (object.userData.entityId === 'C70-master-three-tier-l-corner-cabinet' && object instanceof THREE.Mesh) shelfMeshes.push(object)
      if (object.userData.entityId === 'C70-master-corner-cabinet-task-light' && object instanceof THREE.Mesh) taskLights.push(object)
      if (object.userData.entityId === 'C72-master-square-mirror' && object instanceof THREE.Mesh) squareMirrors.push(object)
    })
    expect(shelfMeshes).toHaveLength((shelfL.levels + 1) * 2 + 3)
    expect(taskLights).toHaveLength(2)
    expect(squareMirrors).toHaveLength(1)
    squareMirrors[0].geometry.computeBoundingBox()
    const mirrorSize = new THREE.Vector3()
    squareMirrors[0].geometry.boundingBox?.getSize(mirrorSize)
    expect(mirrorSize.y).toBeCloseTo(MASTER_DRESSING_LAYOUT.mirror.height, 2)
    expect(mirrorSize.z).toBeCloseTo(MASTER_DRESSING_LAYOUT.mirror.width, 2)
    registry.forEach((item) => item.dispose())
    glass.dispose()
  })

  it('洗衣机与右承重墙完成面对齐，并配置上柜和单层开放区', () => {
    const wallInnerX = LAUNDRY_LAYOUT.wallX - LAUNDRY_LAYOUT.wallThickness / 2
    const washerLeftX = LAUNDRY_LAYOUT.washerCenterX - LAUNDRY_LAYOUT.washerWidth / 2
    const washerRightX = LAUNDRY_LAYOUT.washerCenterX + LAUNDRY_LAYOUT.washerWidth / 2
    expect(washerRightX).toBeCloseTo(wallInnerX, 5)
    expect(LIVING_BALCONY_INTERFACE.loadBearingWallStartX).toBeLessThanOrEqual(washerLeftX)
    expect(LIVING_BALCONY_INTERFACE.loadBearingWallEndX).toBeGreaterThanOrEqual(washerRightX)
    expect(LAUNDRY_LAYOUT.upperCabinetClosedHeight).toBeGreaterThan(0.8)
    expect(LAUNDRY_LAYOUT.openShelfHeight).toBeGreaterThanOrEqual(0.45)
  })

  it('五种风格不生成额外功能家具', () => {
    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    for (const key of STYLE_ORDER) expect(build.styleGroups[key].children).toHaveLength(0)
    registry.forEach((material) => material.dispose())
    glass.dispose()
  })
})

describe('设计状态与风险门禁', () => {
  it('版本、C27–C76 和高风险检查项均可追溯', () => {
    expect(DESIGN_META.revision).toBe('R39 / C76')
    expect(DESIGN_ITEMS.some((item) => item.id === 'C27' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C28' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C29' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C30' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C31' && item.status === 'confirmed')).toBe(true)
    for (const id of ['C32', 'C33', 'C34', 'C35', 'C36']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    for (const id of ['C37', 'C38', 'C39']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    for (const id of ['C40', 'C41', 'C42']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    for (const id of ['C43', 'C44']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    for (const id of ['C45', 'C46']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    for (const id of ['C47', 'C48']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    for (const id of ['C49', 'C50']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    expect(DESIGN_ITEMS.some((item) => item.id === 'C51' && item.status === 'confirmed')).toBe(true)
    for (const id of ['C52', 'C53']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    expect(DESIGN_ITEMS.some((item) => item.id === 'C54' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C55' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C56' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C57' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C58' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C59' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C60' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C61' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C62' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C63' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C64' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C65' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C66' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C67' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C68' && item.status === 'reference')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C69' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C70' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C71' && item.status === 'confirmed')).toBe(true)
    for (const id of ['C72', 'C73', 'C74']) {
      expect(DESIGN_ITEMS.some((item) => item.id === id && item.status === 'confirmed')).toBe(true)
    }
    expect(DESIGN_ITEMS.some((item) => item.id === 'C75' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_ITEMS.some((item) => item.id === 'C76' && item.status === 'confirmed')).toBe(true)
    expect(DESIGN_RISKS.filter((risk) => risk.level === 'high').length).toBeGreaterThanOrEqual(2)
    expect(DESIGN_RISKS.some((risk) => risk.title.includes('拆墙'))).toBe(true)
    expect(DESIGN_RISKS.some((risk) => risk.title.includes('机电'))).toBe(true)
    expect(DESIGN_RISKS.some((risk) => risk.title.includes('承重墙段'))).toBe(true)
  })

  it('五种风格定义完整且默认顺序以克制风格开头', () => {
    expect(STYLE_ORDER).toHaveLength(5)
    expect(STYLE_ORDER[0]).toBe('minimal')
    for (const key of STYLE_ORDER) {
      expect(STYLES[key].palette.length).toBeGreaterThanOrEqual(3)
      expect(STYLES[key].palette.length).toBeLessThanOrEqual(4)
      expect(STYLES[key].slots.wall).toMatch(/^#[0-9a-f]{6}$/i)
      expect(STYLES[key].slots.entryCabinet).toMatch(/^#[0-9a-f]{6}$/i)
      expect(STYLES[key].slots.entryCabinet).not.toBe(STYLES[key].floor.wood.base)
      expect(STYLES[key].finishes.wood?.texture).toBe('wood')
      expect(STYLES[key].finishes.counter?.texture).toBe('stone')
      expect(STYLES[key].glass.opacity).toBeGreaterThan(0.2)
      expect(STYLES[key].glass.opacity).toBeLessThanOrEqual(0.3)
      expect(STYLES[key].light.exposure).toBeLessThanOrEqual(0.9)
    }
    expect(STYLES.minimal.name).toBe('暖木灰简约')
    expect(STYLES.minimal.slots.wood).not.toMatch(/^#7[0-9a-f]{5}$/i)
  })

  it('入户旁半高柜使用独立 CMF 槽位，五套方案均与木地板形成可见色差', () => {
    const rgb = (hex: string) => [
      Number.parseInt(hex.slice(1, 3), 16),
      Number.parseInt(hex.slice(3, 5), 16),
      Number.parseInt(hex.slice(5, 7), 16),
    ]
    for (const key of STYLE_ORDER) {
      const cabinet = rgb(STYLES[key].slots.entryCabinet)
      const floor = rgb(STYLES[key].floor.wood.base)
      const distance = Math.hypot(...cabinet.map((value, index) => value - floor[index]))
      expect(distance).toBeGreaterThan(60)
    }

    const registry = createRegistry(STYLES.minimal)
    const glass = new THREE.MeshStandardMaterial()
    const build = buildFurniture(registry, glass)
    let entryCabinet: THREE.Mesh | undefined
    build.group.traverse((object) => {
      if (object.userData.entityId === 'C73-entry-half-height-shoe-cabinet-cmf' && object instanceof THREE.Mesh) entryCabinet = object
    })
    expect(entryCabinet?.material).toBe(registry.get('entryCabinet'))
    expect(entryCabinet?.material).not.toBe(registry.get('cabinet'))
    registry.forEach((material) => material.dispose())
    glass.dispose()
  })
})
