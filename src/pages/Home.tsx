import { useEffect, useRef, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Box,
  ClipboardCheck,
  Eye,
  Image as ImageIcon,
  Info,
  Layers,
  Loader2,
  Orbit,
  PersonStanding,
  ShieldAlert,
  Tag,
} from 'lucide-react'
import {
  DESIGN_ITEMS,
  DESIGN_META,
  DESIGN_REVIEWS,
  DESIGN_RISKS,
  STATUS_LABEL,
  type DecisionStatus,
} from '@/design/spec'
import { Viewer, type ViewMode } from '@/three/viewer'
import { ROOM_AREAS } from '@/three/plan'
import { STYLES, STYLE_ORDER, isStyleKey, type StyleKey } from '@/three/styles'

const VIEW_MODES: Array<{ key: ViewMode; name: string; icon: typeof Orbit }> = [
  { key: 'orbit', name: '环绕', icon: Orbit },
  { key: 'top', name: '顶视', icon: Eye },
  { key: 'walk', name: '漫游', icon: PersonStanding },
]

const statusClass: Record<DecisionStatus, string> = {
  confirmed: 'bg-emerald-100 text-emerald-800 hover:bg-emerald-100',
  reference: 'bg-sky-100 text-sky-800 hover:bg-sky-100',
  verify: 'bg-amber-100 text-amber-800 hover:bg-amber-100',
}

export default function Home() {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewerRef = useRef<Viewer | null>(null)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [initial] = useState(() => {
    const q = new URLSearchParams(window.location.search)
    const style = q.get('style')
    const mode = q.get('mode')
    return {
      style: (isStyleKey(style) ? style : 'minimal') as StyleKey,
      mode: (mode === 'top' || mode === 'walk' ? mode : 'orbit') as ViewMode,
    }
  })
  const [style, setStyle] = useState<StyleKey>(initial.style)
  const [viewMode, setViewMode] = useState<ViewMode>(initial.mode)
  const [showLabels, setShowLabels] = useState(true)
  const [wallsTransparent, setWallsTransparent] = useState(false)

  useEffect(() => {
    if (!containerRef.current || viewerRef.current) return
    let errorFrame = 0
    try {
      const viewer = new Viewer(containerRef.current, { onReady: () => setReady(true) })
      viewerRef.current = viewer
      if (initial.style !== 'minimal') viewer.setStyle(initial.style)
      if (initial.mode !== 'orbit') viewer.setViewMode(initial.mode)
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : 'WebGL 模型初始化失败'
      errorFrame = requestAnimationFrame(() => setError(message))
    }
    return () => {
      cancelAnimationFrame(errorFrame)
      viewerRef.current?.dispose()
      viewerRef.current = null
    }
  }, [initial.mode, initial.style])

  const selectStyle = (next: StyleKey) => {
    setStyle(next)
    viewerRef.current?.setStyle(next)
  }

  const selectView = (next: ViewMode) => {
    setViewMode(next)
    viewerRef.current?.setViewMode(next)
  }

  return (
    <div className="flex h-dvh w-screen flex-col overflow-hidden bg-stone-100 text-stone-900">
      <header className="z-20 flex h-16 shrink-0 items-center justify-between border-b border-stone-200 bg-white/95 px-3 backdrop-blur md:px-5">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-stone-900 text-white">
            <Box className="h-4.5 w-4.5" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="truncate text-sm font-semibold md:text-base">Angelica's Home · 全屋设计模型</h1>
              <Badge className="hidden bg-stone-900 text-[10px] sm:inline-flex">{DESIGN_META.revision}</Badge>
            </div>
            <p className="truncate text-[11px] text-stone-500 md:text-xs">最新确认：主卧方镜 · 玄关柜差异化 CMF · 阳台侧窗墙体收口</p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button aria-label="打开设计依据" variant="outline" size="sm" className="gap-1.5 px-2.5">
                <ClipboardCheck className="h-4 w-4" />
                <span className="hidden sm:inline">设计依据</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-h-[88vh] max-w-4xl overflow-hidden">
              <DialogHeader>
                <DialogTitle>R01–R39 设计沉淀与审查</DialogTitle>
                <DialogDescription>{DESIGN_META.disclaimer}</DialogDescription>
              </DialogHeader>
              <ScrollArea className="max-h-[68vh] pr-4">
                <div className="grid gap-5 lg:grid-cols-[1.25fr_0.75fr]">
                  <section>
                    <h2 className="mb-2 text-sm font-semibold">已进入模型的设计决策</h2>
                    <div className="space-y-2">
                      {DESIGN_ITEMS.map((item) => (
                        <div key={item.id} className="rounded-lg border border-stone-200 bg-stone-50 p-3">
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-[10px] text-stone-500">{item.id}</span>
                            <span className="text-sm font-medium">{item.room} · {item.name}</span>
                            <Badge className={`ml-auto text-[10px] ${statusClass[item.status]}`}>{STATUS_LABEL[item.status]}</Badge>
                          </div>
                          <p className="mt-1 text-xs leading-relaxed text-stone-700">{item.intent}</p>
                          {item.verification && <p className="mt-1 text-[11px] leading-relaxed text-amber-800">待复核：{item.verification}</p>}
                        </div>
                      ))}
                    </div>
                  </section>

                  <section className="space-y-5">
                    <div>
                      <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold"><ShieldAlert className="h-4 w-4" />工程风险门禁</h2>
                      <div className="space-y-2">
                        {DESIGN_RISKS.map((risk) => (
                          <div key={risk.id} className="rounded-lg border border-amber-200 bg-amber-50 p-3">
                            <p className="text-xs font-semibold text-amber-950">{risk.title}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-amber-900">{risk.action}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h2 className="mb-2 text-sm font-semibold">两轮专业优化</h2>
                      <div className="space-y-2">
                        {DESIGN_REVIEWS.map((review) => (
                          <div key={review.round} className="rounded-lg border p-3">
                            <p className="text-xs font-semibold">{review.round}</p>
                            <p className="mt-1 text-[11px] leading-relaxed text-stone-600">{review.summary}</p>
                            <ul className="mt-2 space-y-1 text-[11px] text-stone-600">
                              {review.checks.map((check) => <li key={check}>• {check}</li>)}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                </div>
              </ScrollArea>
            </DialogContent>
          </Dialog>

          <Dialog>
            <DialogTrigger asChild>
              <Button aria-label="打开二维户型图对照" variant="outline" size="sm" className="gap-1.5 px-2.5">
                <ImageIcon className="h-4 w-4" />
                <span className="hidden sm:inline">二维对照</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl">
              <DialogHeader>
                <DialogTitle>R07 平面基线 / R39 三维深化</DialogTitle>
                <DialogDescription>二维图用于核对平面位置；R39 将生活阳台西侧窗调整为与正面窗一致的墙中大窗，保留四周墙体收口，并延续主卧方镜与入户旁柜体差异化 CMF；平面位置与尺寸仍以既有深化和现场复尺为准。</DialogDescription>
              </DialogHeader>
              <div className="flex items-center justify-center overflow-hidden rounded-xl border bg-stone-50">
                <img src="./floorplan-r07.png" alt="R07 平面基线，R39 三维模型落实方镜、玄关柜差异化材质和保留四周墙体的生活阳台西侧大窗" className="max-h-[68vh] w-auto object-contain" />
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </header>

      <main className="relative min-h-0 flex-1">
        <div ref={containerRef} className="absolute inset-0" aria-label="可交互三维户型模型" />

        {!ready && !error && (
          <div className="absolute inset-0 z-30 flex flex-col items-center justify-center gap-3 bg-stone-100">
            <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
            <p className="text-sm text-stone-500">正在构建 R39 设计模型…</p>
          </div>
        )}

        {error && (
          <div className="absolute inset-0 z-30 grid place-items-center overflow-auto bg-stone-100 p-6">
            <Card className="max-w-2xl p-5 text-center">
              <Info className="mx-auto h-7 w-7 text-amber-700" />
              <h2 className="mt-2 font-semibold">3D 视图暂不可用</h2>
              <p className="mt-1 text-xs text-stone-600">{error}。你仍可使用下方二维平面基线进行核对。</p>
              <img src="./floorplan-r07.png" alt="R07 二维平面基线降级预览" className="mt-4 max-h-[55vh] rounded-lg border object-contain" />
            </Card>
          </div>
        )}

        {viewMode === 'walk' && ready && (
          <div className="pointer-events-none absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-stone-950/80 px-4 py-1.5 text-[11px] text-white shadow">
            WASD / 方向键移动 · 拖动鼠标转向
          </div>
        )}

        <Card className="absolute left-3 top-3 z-10 hidden max-h-[calc(100%-1.5rem)] w-56 overflow-y-auto bg-white/92 p-3 shadow-sm backdrop-blur md:block">
          <p className="text-xs font-semibold">材质风格</p>
          <p className="mt-0.5 text-[10px] text-stone-500">布局锁定，只切换材质与灯光</p>
          <div className="mt-3 space-y-1.5">
            {STYLE_ORDER.map((key) => {
              const preset = STYLES[key]
              const active = style === key
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={active}
                  onClick={() => selectStyle(key)}
                  className={`w-full rounded-lg border p-2.5 text-left transition ${active ? 'border-stone-900 bg-stone-900 text-white' : 'border-stone-200 bg-white hover:bg-stone-50'}`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium">{preset.name}</span>
                    <div className="flex gap-1">
                      {preset.palette.slice(0, 3).map((color) => <span key={color} className="h-3 w-3 rounded-full border border-black/10" style={{ backgroundColor: color }} />)}
                    </div>
                  </div>
                  <p className={`mt-1 text-[10px] leading-relaxed ${active ? 'text-stone-300' : 'text-stone-500'}`}>{preset.desc}</p>
                </button>
              )
            })}
          </div>
        </Card>

        <Card className="absolute right-3 top-3 z-10 bg-white/92 p-2.5 shadow-sm backdrop-blur">
          <div className="flex gap-1">
            {VIEW_MODES.map((item) => {
              const Icon = item.icon
              return (
                <Button key={item.key} aria-label={`${item.name}视角`} size="sm" variant={viewMode === item.key ? 'default' : 'ghost'} className="h-8 gap-1 px-2" onClick={() => selectView(item.key)}>
                  <Icon className="h-3.5 w-3.5" /><span className="hidden text-xs lg:inline">{item.name}</span>
                </Button>
              )
            })}
          </div>
          <Separator className="my-2" />
          <div className="flex items-center justify-between gap-5">
            <Label htmlFor="labels" className="flex items-center gap-1 text-[11px]"><Tag className="h-3.5 w-3.5" />标签</Label>
            <Switch id="labels" checked={showLabels} onCheckedChange={(value) => { setShowLabels(value); viewerRef.current?.setLabelsVisible(value) }} />
          </div>
          <div className="mt-2 flex items-center justify-between gap-5">
            <Label htmlFor="walls" className="flex items-center gap-1 text-[11px]"><Layers className="h-3.5 w-3.5" />透墙</Label>
            <Switch id="walls" checked={wallsTransparent} onCheckedChange={(value) => { setWallsTransparent(value); viewerRef.current?.setWallsTransparent(value) }} />
          </div>
        </Card>

        <Card className="absolute bottom-3 right-3 z-10 hidden w-64 bg-white/92 p-3 shadow-sm backdrop-blur lg:block">
          <div className="flex items-center justify-between">
            <p className="text-xs font-semibold">模型状态</p>
            <Badge className="bg-emerald-100 text-[10px] text-emerald-800 hover:bg-emerald-100">功能布局已同步</Badge>
          </div>
          <p className="mt-2 rounded-md bg-amber-50 p-2 text-[10px] leading-relaxed text-amber-900">{DESIGN_META.disclaimer}</p>
          <Separator className="my-2.5" />
          <ScrollArea className="h-32">
            <div className="space-y-1.5 pr-3">
              {ROOM_AREAS.map((room) => (
                <div key={room.name} className="flex items-center justify-between gap-2 text-[10px]">
                  <span className="truncate text-stone-600">{room.name}</span>
                  <span className="shrink-0 font-mono">{room.area}</span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </Card>

        <div className="absolute bottom-3 left-3 right-3 z-10 flex gap-1 overflow-x-auto rounded-xl border bg-white/92 p-2 shadow-sm backdrop-blur md:hidden">
          {STYLE_ORDER.map((key) => (
            <Button key={key} size="sm" variant={style === key ? 'default' : 'ghost'} className="h-8 shrink-0 text-[11px]" onClick={() => selectStyle(key)}>
              {STYLES[key].name}
            </Button>
          ))}
        </div>
      </main>
    </div>
  )
}
