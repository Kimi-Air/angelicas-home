# Design QA — R36 / C71 全屋差异化 CMF

## R36 集成门禁

- viewport：Codex 内置浏览器实际渲染；路由依次核对 `minimal`、`wood`、`italian`、`lux`、`vintage` 的顶视，并对默认暖木灰做环绕与透墙复核。
- state：`R36 / C71`；默认暖木灰简约；五套方案不改变 R35 建筑、家具和设备包络。
- automated checks：`npm run check` 通过，包含 ESLint、25 项 Vitest 和生产构建。
- browser checks：五个材质按钮均可由路由正确激活；版本、最新确认、C71 决策和“材质颜色与光泽尚未完成实物联样”风险在设计依据中可见；顶视、环绕、标签和透墙开关工作正常；浏览器 `error` / `warning` 日志为空。
- visual checks：默认暖木灰首轮渲染发现橡木偏蜂蜜黄，已把地板、桌柜木色与模拟日光同步去黄；意式、暖灰和中古首轮仍受旧橙光影响，已将装饰性橙光校正为 2700–3500K 高显色暖白表达。最终默认方案形成骨白/蘑菇灰背景、中性橡木和矿物灰绿软包的清晰层级；白橡自然保持轻盈，意式静奢保留受控深度，暖灰雅致以松针绿形成焦点，奶油中古把焦糖限制在家具点缀。
- material checks：木材、石材和织物使用独立程序纹理；柜门、衣柜、金属、家电与玻璃具有独立粗糙度、金属度、透明度和颜色参数；切换风格时旧纹理会释放并重建，避免只换 HEX 和累积 GPU 资源。
- contract check：连续空间控制大面平静、木色与单一软装点缀，不使用亮金、纯黑装饰线或大花纹石材制造高级感；程序纹理与屏幕色值均明确列为参考，实物联样门禁已写入 C71/M02。无长期设计契约偏离。

---

# Design QA — R35 / C70 卧室家具、主卧 L 型深化与直墙收口

## R35 集成门禁

- source visual truth paths：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-56e6268c-110b-4ba8-9517-e1d3deabd7c5.png`（三处家具红框）与 `/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-b450fb98-654d-423b-b9c3-a2c0929af8f0.png`（主卧北墙毛边精确标注）。
- implementation screenshot paths：`outputs/angelicas-home-r35-c70-bedroom-lux-top.png`、`outputs/angelicas-home-r35-c70-bedrooms-focus.jpg`、`outputs/angelicas-home-r35-c70-bedroom-top.png` 与 `outputs/angelicas-home-r35-c70-master-focus.jpg`。
- state：`/?style=lux&mode=top`，暖灰轻奢、顶视、标签关闭、透墙关闭；另以现代简约顶视复核同一几何。当前版本 `R35 / C70`。
- full-view evidence：全屋顶视确认次卧床两侧均有床头柜；主卧床与双床头柜同步南移，右上衣柜长段与加长短返形成清晰 L；梳妆台和低矮转角柜未进入床脚、飘窗或客厅—主卧入口路径。
- focused evidence：卧室聚焦图可见两间卧室均为双床头柜，主卧衣柜右返相对 R34 明显加长；主卧北侧横墙从主卫分隔墙到东侧返段为连续等厚直线，旧 `x≈11.20 m` 接缝的台阶状毛边消失。
- geometry evidence：次卧床头柜中心参考 `z≈8.92/11.12 m`，围绕床中心 `z≈10.02 m` 对称；主卧床中心由 `z≈10.34 m` 移至 `10.74 m`，衣柜短返由约 `0.62 m` 加长到 `1.02 m`，与上侧床头柜仍留约 `0.25 m`；梳妆台沿西墙由约 `1.24 m` 加长到 `1.60 m`；转角柜为三个净层、顶高约 `1.70 m`，南墙段止于主卧飘窗洞口前。
- automated checks：ESLint、25 项 Vitest 与生产构建通过；专项断言锁定主卧单段连续北墙、次卧双床头柜对称关系、主卧睡眠组 `0.40 m` 联动位移、约 `1.02 m` 衣柜返段、梳妆台最小长度、三层 L 柜层数/高度/转角重叠和窗洞避让。
- browser checks：R35/C70 版本与顶部最新确认显示正确；设计依据弹窗可见 C70；顶视/环绕、标签和透墙开关工作正常；浏览器 `error` / `warning` 日志为空。

## Findings

- 无 P0/P1/P2：四项用户明确要求均已进入同一模型，且墙体毛边按第二张标注定位到墙段拼接而非柜体端头。
- 无 P0/P1/P2：主卧新增柜量集中在原梳妆角与衣柜短返，不增加另一组通顶碎柜；三层转角柜保留上部墙面留白并避开飘窗洞口。
- `[P3]`：三层 L 柜的真实层板跨度、转角连接、防倾倒、墙体固定基层和灯带检修仍需定制深化；当前只锁定层数、相对方向与方案包络。

## Contract check

- 采用“业主最新明确指令优先、好用优先、柜体弱化、围合式外延不侵占动线、开放展示集中、隐藏系统可维护、参考值必须复尺”。
- 单次偏离：延长 C68 的主卧短返并替换 C66 通高窄展示柜；原因、影响和替代措施已写入 C70。该次调整不改变长期设计基线，`DESIGN_CONTRACT.md` 无需更新。

# Design QA — R34 / C69 储物间西侧外挑与主卧南侧延伸

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-5727e333-ebb4-4b2e-9d75-6e96d3a5d512.png`；项目内无红框平面基线为 `public/floorplan-r07.png`。
- implementation screenshot path：`outputs/angelicas-home-r34-c69-structural-projections-top.png`。
- viewport：Codex 内置浏览器 `1280 × 720`、DPR 2。
- state：`/?mode=top&style=minimal`，现代简约、顶视、标签关闭、透墙关闭；R34 / C69。
- full-view comparison evidence：`outputs/qa-comparison-r34-c69-full.jpg` 将业主双红框原图与浏览器顶视实现在同一画布并排；两处外轮廓在全屋位置、朝向和相邻关系一致。
- focused region comparison evidence：`outputs/qa-comparison-r34-c69-focused.jpg` 分别放大储物间西侧错台和主卧南侧错台；可见储物间西墙相对厨房西墙向左外挑，主卧南墙相对客厅—生活阳台界面向下延伸，且主卧飘窗继续位于新南墙外侧。
- primary interactions tested：顶视路由加载；标签开关关闭成功；设计依据弹窗打开并显示 C69；二维对照弹窗打开并显示 R34 说明与原始平面；核心模型状态保持可交互。
- console errors checked：浏览器 `error` / `warning` / `warn` 日志为空。
- automated checks：ESLint、24 项 Vitest、TypeScript 与 Vite 生产构建全部通过。

## Findings

- 无 P0/P1/P2：储物间西墙已从与厨房外墙齐平改为向西外挑约 `0.52 m` 的错台；北墙、南侧回接墙、地面和浅层收纳同步闭合，没有漏地或悬空。
- 无 P0/P1/P2：主卧南墙已从 `z=12.20 m` 延至约 `z=12.77 m`；东墙、主卧—生活阳台共墙、南墙和外凸飘窗连续闭合，主卧主体明显大于旧实现。
- 无 P0/P1/P2：主卧贴南墙的窗边桌、半幅飘窗延伸、坐榻、圆镜、圆凳、展示柜、插座及任务灯作为一个功能组整体南移约 `0.57 m`；床、双床头柜、L 型衣柜和入口未发生回退。
- `[P3]`：现有顶视仍使用轻微透视相机，储物间西侧墙顶面在截图中有少量透视收缩；聚焦对照仍能清楚辨认错台，且不影响几何、漫游或施工风险表达。

## Required fidelity surfaces

- Fonts and typography：应用标题、版本、最新确认、房间标签与弹窗文字沿用既有层级；R34 / C69、C69 决策和待复尺文案均无截断。参考图中的尺寸文字仅作为证据，没有伪造为施工标注。
- Spacing and layout rhythm：储物间西向错台约 `0.52 m`，主卧南向错台约 `0.57 m`，主卧飘窗外凸约 `0.70 m`；两处比例与原图红框的“短外挑＋主体延伸＋飘窗再外凸”节奏一致。
- Colors and visual tokens：未改动五套风格材质、灯光、墙地色和家具配色；本轮仅恢复建筑几何并同步必要家具。
- Image quality and asset fidelity：业主原图、项目平面基线、浏览器全图、全景同画面对照和两处聚焦同画面对照均可打开；外轮廓由实际 Three.js 墙、地与飘窗几何生成，不以占位图或代码图形替代。
- Copy and content：顶部最新确认、设计依据、二维对照、风险门禁、README 与变更记录统一指向“储物间向左外挑、主卧向下延伸”；`0.52 m`、`0.57 m` 明确标为方案参考，19.6㎡/17.4㎡明确为原图标注。

## Comparison history

1. R33：储物间西墙与厨房西墙错误拉齐，主卧南墙与客厅—生活阳台界面错误拉齐。
2. R34 第一轮：恢复两处错台并同步墙、地、飘窗、家具和机电参考点；`outputs/qa-comparison-r34-c69-full.jpg` 与 `outputs/qa-comparison-r34-c69-focused.jpg` 未发现可执行 P0/P1/P2，因此无需第二轮视觉修复。

## Open Questions

- 建筑轴线、结构属性、外墙/共墙厚度、窗洞和完成面净面积尚未复尺；当前方向与拓扑已确认，数值不得直接用于施工放样或定制下单。

## Implementation Checklist

- [x] 储物间西墙、北墙、错台回接墙与地面同步。
- [x] 主卧东墙、南墙、共墙、地面与飘窗同步。
- [x] 主卧南侧梳妆/坐榻/展示/机电组合整体联动。
- [x] C69 设计依据、风险、变更记录和 UI 版本追溯完成。
- [x] 自动化、浏览器交互、控制台与同画面对照通过。

final result: passed

# Design QA — R32 集成模型（含 C66 主卧坐姿左手展示柜与 C67 厨房双开门冰箱）

## R32 集成回归 / C66 主卧坐姿左手侧展示柜纠正门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-e6cfb05c-6b60-4771-b527-eb795f814d4d.png`，红框中原实现把柜体放在圆镜右侧；业主明确以坐在梳妆台前的使用者为准，要求柜体在左手边靠墙角。
- implementation screenshot paths：`outputs/angelicas-home-r32-c66-master-user-left-display-top.png`、`outputs/angelicas-home-r32-c66-master-user-left-display-orbit.png` 与聚焦图 `outputs/angelicas-home-r32-c66-master-user-left-display-orbit-focus.jpg`。
- viewport：Codex 内置浏览器实际截图 `1280 × 720`、DPR 2；暖灰轻奢。
- state：当前整屋集成版本 `R32 / C67`，本次主卧范围为 C66；顶视为标签关闭、透墙关闭，轴测复核为标签关闭、透墙开启。
- combined visual comparison：在同一视觉比较输入中打开业主最新红框图与聚焦实现图；源图清楚显示错误柜体在圆镜右侧，实现图清楚显示柜体已换到圆镜左侧、靠飘窗端墙角。两者按坐姿方向与邻接关系对照，不用屏幕左右猜测平面方向。
- full-view comparison evidence：整屋顶视确认 1.8 m 床、双床头柜、L 型衣柜、U 弧 L 型梳妆桌、半幅飘窗桌、坐榻、圆镜与圆凳均未移动；R32/C67 厨房更新同时保留。
- primary interactions tested：暖灰轻奢路由加载；顶视与环绕切换；标签关闭；透墙开启/关闭；设计依据打开/关闭；C66 在设计依据中可见。
- console errors checked：浏览器 `error` / `warning` / `warn` 日志为空。
- automated checks：ESLint、23 项 Vitest、TypeScript 与 Vite 生产构建全部通过；专项不变量锁定 C64 旧实体缺席、C66 新实体存在、坐姿左手方向、柜镜间距与墙角间距。

### Findings

- 无 P0/P1/P2：C64 的错误方向几何已经删除；C66 展示柜位于坐姿左手侧，即圆镜左边，贴近飘窗端南墙角，正面朝房间。
- 无 P0/P1/P2：展示柜参考覆盖 `z=11.72–12.14 m`，圆镜左边缘至柜体约 `0.08 m`，柜体至南墙角约 `0.06 m`；柜底约 `0.80 m`，不进入 U 型腿部区或圆凳后撤区。
- `[P3]`：柜宽、柜深、固定、层板承重、窗帘避让、灯带驱动与插座位置仍为方案级参考，定制下单前必须用完成面和最终物品清单复核。

### Required fidelity surfaces

- Spacing and layout rhythm：展示柜与圆镜之间保留窄而清晰的呼吸缝，另一端贴靠墙角；浅柜悬空，不增加碎格或侵占床侧主通道。
- Colors and visual tokens：沿用既有暖浅木、细侧板、少分缝和克制任务灯，未改变整屋暖灰轻奢材质逻辑。
- Image quality and asset fidelity：源图、顶视、透墙轴测和聚焦图均为可打开的原始栅格证据；展示柜、圆镜、U 弧桌与圆凳为实际 Three.js 几何，不以占位图替代。
- Copy and content：C64 标记为历史误读，C66 明确“以坐姿方向为准”；尺寸分为参考值与待完成面复核项，没有冒充施工下单数据。

final result: passed

## R17 / C51 书房参考图对照门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-fc938d97-52dc-4a18-9a45-232e4b745b64.jpg`；第二参考为 `/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-abdd8ea6-c2e3-4423-80ae-02a56659e331.jpg`。
- implementation screenshot path：`outputs/angelicas-home-r18-study-top.png`。
- focused implementation path：`outputs/angelicas-home-r18-study-focus.png`。
- combined comparison evidence：`outputs/r18-study-reference-comparison.png`。
- viewport：浏览器实际截图 `1849 × 1152`；桌面顶视路由 `/?mode=top&style=minimal`。
- state：现代简约、顶视、标签开启、透墙关闭；WebGL 首帧已完成。
- full-view comparison evidence：全屋截图确认 C51 长桌位于书房北侧窗内、右墙窄书架贴墙、南墙原衣柜包络不变；书房中央和入口路径连续。
- focused region comparison evidence：对照板将临窗长桌参考照与书房顶视裁切放在同一画布，确认浅木连续台面、低矮笔记本、人体工学坐席与单组侧向书架的关系一致；未用全景小图代替细节判断。
- primary interactions tested：顶视路由加载；“原木极简”材质切换成功并出现 `aria-pressed=true`；切回“现代简约”成功；家具拓扑未随风格变化。
- console errors checked：浏览器 `error` / `warning` 日志为空。

### Findings

- 第一轮发现 `[P2]`：现代简约默认桌面为近黑色，与参考图的浅木长桌主视觉不符。修复：新增 `studyOak` 专用材质槽，并让桌面、两侧抽屉、支撑与右墙窄书架共用浅木色。
- 第二轮复核：`outputs/angelicas-home-r18-study-top.png` 与 `outputs/r18-study-reference-comparison.png` 中不再存在可执行的 P0/P1/P2 差异。
- `[P3]`：当前是方案级顶视 3D 模型，椅子软包曲面、木纹、窗帘及实景光影较参考照简化；该差异不影响平面关系、人体工学包络或本轮设计判断，留待效果图阶段深化。

### Required fidelity surfaces

- Fonts and typography：应用标题、版本、房间标签和控制字号层级稳定，无截断或错位；参考图本身无需要复刻的界面字体。
- Spacing and layout rhythm：约 3.16 m 长桌连续贴窗；桌深约 0.64 m；中部腿部净空约 1.80 m；椅背后沿至衣柜前沿约 1.82 m；右墙书架约 0.28 m 深且未进入主要通道。
- Colors and visual tokens：浅木桌面已从全局深色桌几槽分离，五种风格均保留木质主色，默认现代简约下与参考图的暖浅木关系一致。
- Image quality and asset fidelity：参考图、全屋浏览器截图和书房聚焦裁切均为可打开的原始栅格证据；未以占位图、CSS 图形或伪造资产替代比较对象。
- Copy and content：版本为 `R18 / C53`，书房决策追溯为 `C51`；“衣柜位置不变”、临窗长桌、人体工学椅、悬浮抽屉、窄书架及待复核项均已进入设计依据与变更记录。

### Comparison history

1. `outputs/angelicas-home-r17-study-top.png`：发现桌面为深色的 P2 视觉漂移。
2. 引入 `studyOak`，保持几何和衣柜位置不变，仅修正书房指定材质。
3. `outputs/angelicas-home-r18-study-top.png`：复核浅木桌面、坐席、书架、衣柜和通道；P2 已关闭。

prior result: passed

- 最新二维平面基线：`outputs/floor-plan-rev-c27.png`
- 最新三维深化：三处通高实体侧墙飘窗；书房为室内侧临窗连续长桌，主卧保留左半幅书桌型飘窗
- 最新书房深化：连续长桌、人体工学椅、两端悬浮抽屉、单组窄书架；原衣柜位置不变
- 最新玄关深化：取消小窗，完整连续整排柜；仅保留一处集中置物龛
- 最新主卧深化：衣柜贴齐上侧实墙并规整短返；1.8 m 床配双床头柜；删除椅子与右下柜
- 最新生活阳台深化：取消客厅—阳台左门垛及上方过梁；保留右承重墙垛并对齐洗衣机；新增洗衣机上柜
- 最新飘窗校正：三处均改为约 0.45 m 高的外凸实体窗台，不再作为室内地面延伸；主卧桌面仅占指定半幅
- 最新原图校正：恢复餐厅—过道竖向短墙；主卧东墙外扩，模型面积约 19.5㎡，次卧约 17.6㎡
- 最新玄关纠正：进门旁无窗长墙只保留半高鞋柜；进门正对短墙恢复三段式高柜
- 最新阳台补充：生活阳台水池正上方恢复外窗，并与洗衣机上柜分段避让
- 最新客厅减法：取消满墙电视柜、上下柜、侧柜与设备槽，仅保留约 1.90 m 宽、75 mm 厚的壁挂电视和大面积留白
- 最新电视校正：电视中心与沙发中心严格共用 `z=9.78 m` 轴线
- 应用内对照资产：`public/floorplan-r07.png`
- 设计来源：`DESIGN_CHANGELOG.md`
- 约束基线：`DESIGN_CONTRACT.md`
- 验证日期：2026-07-19

## 自动化结果

- ESLint：通过。
- Vitest：1 个测试文件、20 项测试全部通过。
- TypeScript + Vite 生产构建：通过。
- 浏览器：WebGL 首帧正常，无运行错误；五风格材质切换不改变家具拓扑。

## 浏览器验收

- 桌面首屏可见版本、风格、视角、标签、透墙、房间面积和风险提示。
- 顶视图确认：厨房与餐厅之间有三扇玻璃门；客厅电视墙在左、沙发在右；中央无茶几。
- 设计依据弹窗可追溯 C01–C53 的有效决策与结构/机电/定制风险。
- 二维对照弹窗明确区分 R07 平面基线与 R08–R18 三维深化。
- 390 × 844 手机视口下，左侧风格面板收为底部横向选择器，核心视角与开关仍可操作。
- WebGL 初始化失败时提供 R07 二维平面基线降级预览。

## 第一轮优化：功能与动线

- 删除旧代码中的开放厨房岛台、吧凳、书房床、客厅茶几和风格专属额外家具。
- 恢复储物间、独立厨房、生活阳台与次卧门。
- 将书桌、衣柜、床、家政设备、玄关柜、电视位和沙发按 R18 统一重排。
- 客厅中央保持连续通行；五套风格共享同一功能包络。

## 第二轮优化：收口与低噪

- 默认风格改为现代简约；所有柜体采用平板、少分缝、低反射表达。
- 电视墙仅保留壁挂电视，不再设置电视龛、设备槽或其他柜体；进门正对高柜只保留一处集中开放层。
- 移除旧版大量金线、格栅、挂画、灯具和装饰绿植等无明确功能体量。
- 增加可访问按钮名称、稳定骨架渲染、WebGL 失败降级和响应式控制。
- 三处飘窗侧墙改为通高实体墙；书房依据 C51 改为室内侧临窗长桌，主卧左半幅继续设置桌面并保留另一半坐卧/置物区。
- 玄关窗洞完全取消，上下柜贯通整段实墙，中部开放区收束为一处，避免窗洞和独立柜造成零碎立面。
- 主卧衣柜横段不再伸出实墙，右返与墙角统一收口；删除窗边椅和右下柜，以双床头柜恢复睡眠区对称关系。
- 客厅与生活阳台之间不再生成左门垛和顶部过梁；右侧承重墙垛作为结构边界保留，洗衣机上柜采用“封闭上柜＋单层开放区”的克制组合。
- 三处外凸区域由“地面延伸”纠正为抬高实体窗台；书房与主卧桌面架在指定半幅窗台上方，未占用半幅仍保持可坐/置物窗台。
- 恢复厨房/书房分界墙向下延伸的过道短墙；主卧外墙向东错台，床、床头柜、衣柜和主卧飘窗随新边界重新对齐。
- 入户正对短墙高柜完整覆盖约 1.50 m 墙段，三段比例与右手玄关柜一致；中部只保留一处集中置物龛。
- 阳台水池上方窗洞位于相邻洗衣机上柜之后，窗台参考高约 1.05 m，避免柜窗重叠并保留水池操作。
- 客厅电视墙所有柜体均已撤销，大屏壁挂电视以约 75 mm 厚度贴墙表达并与沙发居中；进门旁鞋柜参考高约 1.15 m，正对短墙恢复三段式高柜。

## 专业设计反馈

- 电视墙与次卧共墙，深化时应做设备减振和隔声，不把低音设备硬连接在共墙上。
- 沙发长度须由主卧入口与阳台通道的剩余净距反推，不宜增加贵妃位。
- 三扇玻璃门、厨房短墙、储物间原阳台构造、飘窗属性均须由结构图与现场复核。
- 水池窗扇、灶具排烟、冰箱开门、洗衣机减振、桌柜窗帘和门扇扫掠需在完成面模型中联检。
- 进门旁半高鞋柜与正对三段式高柜宜统一墙面同色、踢脚和收口，避免公共区体量过重。

## 居住者反馈

- 当前入户—餐厨—客厅—阳台路径清晰，客厅不放茶几对家政和日常走动更友好。
- 主卧功能多，真实尺寸若偏大容易拥挤；应优先保证入口、床侧、柜门与窗前操作空间。
- 次卧保持简单适合作为客房；若改为儿童房、老人房或长期卧室，需要重新确认书桌、夜间照明与无障碍需求。
- 书房已按业主决定取消留宿功能，工作属性明确；不能在风格切换中擅自加回沙发床。
- 餐厅和两卫尚未收到家具/洁具的明确新增指令，模型保留可深化空间，不擅自填充预设元素。

## 施工前门禁

1. 结构图与现场墙体核验完成。
2. 完成面尺寸、门窗洞口和飘窗台高复尺完成。
3. 厨房、卫浴、阳台的给排水、燃气、排烟、电源、地漏和防水联检完成。
4. 电视、沙发、冰箱、洗衣机、床与所有定制柜型号冻结。
5. 门扇、柜门、抽屉、冰箱门、窗扇、窗帘与检修包络无冲突。

结论：R18 在保留 R17 书房临窗长桌方案的基础上，已纠正两组玄关柜位置，并完成大尺寸厚壁挂电视与沙发中心线对齐；壁挂基层、暗线设备位置、两柜尺寸及既有结构仍须现场复核，在此之前不是施工放样图。

## R19 / C54 书房 L 型纠正门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-8354b34e-b354-4dff-ba1b-ce156c0d09d7.png`。
- implementation screenshot path：`outputs/angelicas-home-r19-study-l-top.png`。
- focused implementation path：`outputs/angelicas-home-r19-study-l-focus.png`。
- combined comparison evidence：`outputs/r19-study-l-reference-comparison.png`。
- viewport：浏览器实际截图 `1849 × 1152`；路由 `/?mode=top&style=wood`。
- state：原木极简、顶视、标签开启、透墙关闭；WebGL 首帧完成。
- full-view comparison evidence：全屋截图确认书桌已从整窗连续体量缩到书房右上角；南墙衣柜、入口、右墙窄书架和全屋其他家具包络未变。
- focused region comparison evidence：聚焦裁切清楚显示横桌只占右半飘窗、右墙短返形成 L 型、左半飘窗无桌面；转角、坐席与书架间隙可读。
- primary interactions tested：顶视路由与原木风格参数正确生效；房间标签、材质面板、视角控制和模型状态正常显示。
- console errors checked：浏览器 `error` / `warning` 日志为空。

### Findings

- 无 P0/P1/P2：红框要求的“右半飘窗横桌＋右墙短返”已完整表达，未继续保留整窗长桌。
- `[P3]`：当前为方案级顶视 3D，转角封边、真实板材纹理、窗帘和五金未做施工级细节；不影响本轮占用范围与动线判断。

### Required fidelity surfaces

- Fonts and typography：版本更新为 `R19 / C54`，顶部最新确认文案与设计依据一致；房间标签无新增截断。
- Spacing and layout rhythm：右半横桌参考宽约 1.20 m、深约 0.52 m；右返参考长约 1.07 m、宽约 0.58 m；椅背后沿至衣柜前沿约 2.32 m，右返与书架之间保留约 0.12 m 方案间隙。
- Colors and visual tokens：继续使用 C51 建立的 `studyOak` 浅木槽，L 型两段同材质、同厚度，避免转角色差。
- Image quality and asset fidelity：用户红框原图、浏览器全图、聚焦裁切和同画布对照均可打开；比较未使用占位图或代码绘制的替代证据。
- Copy and content：C54 明确记录“L 型、只占右半飘窗、左半留空、衣柜不变”，C51 已标为被本轮局部替代的历史方案。

### Comparison history

1. R18 / C53：书房仍为整窗连续长桌，与最新红框纠正不符。
2. R19 / C54：移除整窗桌面和两端抽屉，恢复右半幅横桌，增加右墙短返；保留浅木、人体工学椅、短线槽、右墙窄书架和原衣柜坐标。
3. `outputs/r19-study-l-reference-comparison.png`：同画布复核后无可执行 P0/P1/P2。

scoped result: passed

## R21 集成回归复核（保留 C54）

- integrated implementation screenshot：`outputs/angelicas-home-r21-study-l-top.png`。
- focused evidence：`outputs/angelicas-home-r19-study-l-focus.png`（C54 局部几何未变化）。
- state：`/?mode=top&style=wood`，R21 / C56，原木极简、顶视、标签开启、透墙关闭。
- regression finding：R21 全屋集成后，书房仍为右半飘窗横桌与右墙短返的 L 型；左半飘窗留空，南墙衣柜仍为 `x=9.92 m / z=3.65 m / 2.05 × 0.55 m`。
- functional verification：20 项自动化测试、ESLint 与生产构建均通过；浏览器无 `error` / `warning` 日志，WebGL 正常进入可交互状态。
- comparison judgement：对照用户红框与既有同画布证据 `outputs/r19-study-l-reference-comparison.png`，未出现可执行 P0/P1/P2 回退。

scoped result: passed

## R24 / C59 书房一体 L 桌与 U 型内弧门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-0299261a-c083-474b-aafc-c15a78e3c64e.png`。
- implementation screenshot path：`outputs/angelicas-home-r26-study-integrated-u-top.png`。
- focused implementation path：`outputs/angelicas-home-r26-study-integrated-u-focus.jpg`。
- combined comparison evidence：`outputs/r26-study-integrated-u-reference-comparison.png`。
- viewport：Codex 内置浏览器实际截图 `1280 × 720`；路由 `/?mode=top&style=wood`。
- state：R26 集成模型、原木极简、顶视、标签开启、透墙关闭；WebGL 首帧完成。
- full-view comparison evidence：全屋顶视确认书房仍只占右半飘窗，左半留空、南墙衣柜与右墙书架原位；右半窗台面已跨过连接段并沿右墙连续返下。
- focused region comparison evidence：聚焦裁切可见一体桌为单一连续浅木轮廓，使用者侧从横向桌前缘平顺转入右返，形成 U 型内凹包裹边缘；不再是两块方形台板的独立拼放。
- primary interactions tested：原木风格和顶视路由生效，标签、透墙、三种视角与五种材质切换仍可用。
- console errors checked：浏览器 `error` / `warning` 日志为空。
- automated checks：ESLint、21 项 Vitest 与生产构建全部通过；专项断言确认 `continuous=true`、`userEdge=U-curve`、约 `0.45 m` 参考内弧以及唯一一张 `ExtrudeGeometry` 连续台面。

### Findings

- 无 P0/P1/P2：用户最新要求的“半幅飘窗桌与右墙书桌延伸连接成整体”已实现为单一闭合几何；使用者侧内边缘为连续曲线，衣柜、书架、左半飘窗和椅后通道未回退。
- `[P3]`：顶视中的浅木高明度使圆弧阴影较轻；当前聚焦截图仍可辨识连续内弧。效果图阶段可通过更低角度光线强化弧边，但不应增加装饰线或改变几何。
- `[P3]`：一体外观不等于现场必须整张运输；施工深化应根据板材幅面、楼梯/电梯和门洞确定隐藏拼缝及独立钢架，保证完成面连续且机电可检修。

### Required fidelity surfaces

- Fonts and typography：当前应用版本 `R26 / C61` 为集成版本；C59 在设计依据与变更记录中独立可追溯，界面文字无截断。
- Spacing and layout rhythm：半幅起点仍约 `x=9.35 m`，桌面外缘连接至约 `x=11.12 m`，右返至约 `z=1.02 m`；椅背至衣柜前沿仍约 `2.32 m`。
- Colors and visual tokens：一体桌全段复用 `studyOak` 浅木材质和约 `65 mm` 同厚台面，连接段没有异色或高差。
- Image quality and asset fidelity：用户红框原图、浏览器全图、聚焦裁切和同画布比较均可打开；桌面是实际 Three.js 连续挤出几何，不以图片或占位形状替代。
- Copy and content：C59 明确记录“一体 L 型、使用者侧 U 型内弧、右半飘窗、左半留空、衣柜不变”，并列出支撑、拼接、圆弧封边、窗帘机电和现场复尺要求。

### Comparison history

1. R19 / C54：两块矩形台板只在角点重叠，视觉上仍像独立横桌与右返，内角为方角。
2. R24 / C59：改为单一闭合轮廓，补齐窗边至右墙的桥接段，并用三次贝塞尔内弧连续连接横向前缘与右返内缘。
3. R26 集成回归：后续厨房与主卧更新合入后，C59 几何、衣柜坐标和通行净距仍保持；同画布比较无可执行 P0/P1/P2。

final result: passed

## R30 集成回归 / C64 主卧展示柜移位门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-de8a79f4-fa05-4a12-8a2b-02ce8a6763da.png`；聚焦证据为 `outputs/source-r28-master-display-relocation-focus.png`。
- implementation screenshot paths：`outputs/angelicas-home-r30-c64-master-display-top.png`、`outputs/angelicas-home-r30-c64-master-display-focus.jpg`、`outputs/angelicas-home-r30-c64-master-display-orbit.png` 与 `outputs/angelicas-home-r30-c64-master-display-orbit-focus.jpg`。
- viewport：Codex 内置浏览器实际截图 `1280 × 720`。
- state：当前整屋集成版本 `R30 / C65`，本次主卧范围为 C64；暖灰轻奢，顶视为标签关闭、透墙关闭，轴测复核为标签关闭、透墙开启。
- full-view comparison evidence：整屋顶视确认原飘窗端展示柜已经删除，坐榻端部与窗前留白恢复；新柜体落在梳妆台左端西墙，床、双床头柜、L 型衣柜、U 型梳妆桌、圆镜和圆凳均未移动。R28/C63 书房与 R30/C65 次卧更新同时存在。
- focused region comparison evidence：同一视觉比较输入中并列打开红框聚焦图、主卧顶视聚焦图与透墙轴测聚焦图；逐项核对“旧柜位清空—新柜位落在梳妆台左侧—正面朝房间—柜底从桌面以上起”的邻接关系。源图与实现视角不同，因此比较红框指定的语义位置、体量和动线，不做像素级相机伪对齐。
- geometry evidence：新柜参考宽约 `0.42 m`、深约 `0.22 m`、柜底约 `0.80 m`、顶高约 `2.30 m`；柜背贴西墙，柜体南端与梳妆台北端约留 `0.04 m`，与圆镜边缘约留 `0.28 m`。开放格正面朝房间，未进入 U 型腿部区、圆凳后撤区或床侧通道。
- primary interactions tested：R30 路由加载；暖灰轻奢；顶视与环绕切换；标签关闭；透墙开启/关闭；设计依据弹窗打开/关闭；C64 与 C65 条目可见。
- console errors checked：浏览器 `error` / `warning` / `warn` 日志为空，WebGL 首帧及交互正常。
- automated checks：ESLint、22 项 Vitest、TypeScript 与 Vite 生产构建全部通过；仅有非阻断性的 Browserslist 数据更新提示。

### Findings

- 无 P0/P1/P2：柜体已经从业主标注的原飘窗端位置移除，并落到梳妆台左侧墙角；原柜位不以其他碎柜填补，坐榻与采光更完整。
- 无 P0/P1/P2：约 `0.22 m` 浅深、桌面以上悬空和正面朝房间的处理降低了压迫感，取物不需要跨过圆凳或床；柜镜间距足以避免视觉拥挤。
- `[P3]`：当前为方案级 Three.js 几何，真实木纹、墙角垂直误差、层板连接、灯带发光、圆角封边和展示物尚未深化；不影响本轮位置、方向和动线判断。

### Required fidelity surfaces

- Fonts and typography：当前应用显示 `R30 / C65`，C64 在设计依据中独立可追溯；标题、版本、控制与决策文案无截断。
- Spacing and layout rhythm：新柜与梳妆台端部只保留克制收口缝，与圆镜留出约 `0.28 m` 空白；原窗边柜位留空，不制造第二组展示或多余分缝。
- Colors and visual tokens：沿用暖灰轻奢的浅暖木、低反射浅台面和深绿软包，不新增高饱和色、复杂金属线或多余灯槽。
- Image quality and asset fidelity：源红框图、浏览器顶视、顶视聚焦和轴测聚焦均为可打开的真实栅格证据；展示柜、层板与灯带为场景几何，不以平面占位替代。
- Copy and content：C64 明确记录“从飘窗端移至梳妆台左侧西墙墙角、柜底从桌面以上起、正面朝房间、原柜位恢复坐榻留白”，并列出完成面、固定、防倾倒、层板承重、灯带和检修要求。

### Comparison history

1. R26 / C61：窄展示柜位于飘窗端，与梳妆台相隔，形成业主最新红框指出的功能分散。
2. R29 / C64：柜体移至梳妆台左侧墙角，旧柜位清空；首轮同画布比较未发现可执行 P0/P1/P2。
3. R30 集成回归：后续次卧 C65 合入后，C64 几何、专项测试、设计依据和浏览器证据仍保持。

final result: passed

## R27 集成回归 / C61 主卧视觉右侧 U 弧 L 型梳妆桌

- source visual truth paths：位置纠正图 `/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-fbbca517-edfa-4533-a746-61c336db7665.png`；风格与功能参考 `/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-309cd860-0c6f-44f6-a35d-06aa930f93c4.jpg`。
- implementation screenshot paths：`outputs/angelicas-home-r27-c61-master-u-l-top-clean.png`、`outputs/angelicas-home-r27-c61-master-u-l-focus.jpg`、`outputs/angelicas-home-r27-c61-master-u-l-orbit.png`。
- viewport：Codex 内置浏览器截图 `1280 × 720`。
- state：当前整屋集成版本 `R27 / C62`，本次主卧范围为 C61；暖灰轻奢，顶视为标签关闭、透墙关闭，轴测复核为标签关闭、透墙开启。
- orientation evidence：业主纠正图与应用顶视相差约 180°，因此按“人在业主截图方向观察”的语义核对左右；模型西侧对应截图视觉右侧，梳妆位已落在该侧，没有沿用 C56 的反向床头侧位置。
- full-view comparison evidence：整屋顶视确认 1.8 m 床、贴墙 L 型衣柜、入口与两只独立床头柜不移动；梳妆系统只占窗边及视觉右侧实墙，另一半飘窗保留坐榻，圆凳收起后不进入床脚主通道。
- focused comparison evidence：同一视觉比较输入中并列打开位置纠正图、附件实景、主卧聚焦图及透墙轴测图；逐项核对视觉右侧、半幅飘窗、连续 L 型、坐榻、窄展示格、圆镜与可收圆凳。参考与模型视角不同，因此比较功能模块、邻接关系和使用朝向，不做像素级透视伪对齐。
- geometry evidence：窗边横桌约 `2.00 × 0.50 m`，半幅飘窗延伸约 `1.08 × 0.44 m`，墙边梳妆返台约 `1.24 × 0.52 m`、台高约 `0.75 m`；使用者侧 U 型内凹参考宽约 `0.66 m`、内凹约 `0.12 m`、腿部净高约 `0.58 m`。三段同高并在角部重叠连接，构成连续 L 型而非两块独立台板。
- primary interactions tested：暖灰轻奢路由加载；顶视与环绕切换；标签关闭；透墙开启/关闭；版本、最新确认和设计依据正常显示。
- console errors checked：浏览器日志仅有 Vite 连接、热更新与 React DevTools 提示，`error` / `warning` 为空；WebGL 画面正常。
- automated checks：ESLint、21 项 Vitest 和生产构建通过；专项断言锁定视觉右侧、L 型连续、半幅延伸、坐榻分界、U 弧宽度、腿部净空、双床头柜与可检修插座。

### Findings

- 无 P0/P1/P2：梳妆位已按业主纠正整体换到视觉右侧，并与右半幅飘窗延伸桌连续接成 L；U 型内凹朝坐姿使用者，不朝墙或窗；床、衣柜与入口关系保持稳定。
- `[P3]`：浅色顶视下，约 `0.12 m` 的柔和内凹不会呈现夸张轮廓；当前几何足以表达使用方向，但真实弧形半径、加工模板、封边和手肘触感仍须厂家深化。
- `[P3]`：当前为方案级 Three.js 几何，木纹、镜面、灯带、抽屉缝、支撑节点和窗帘均为简化表达；不影响本轮平面邻接和通行判断。

### Required fidelity surfaces

- Fonts and typography：当前应用为 `R27 / C62` 集成版；C61 在设计依据与变更记录中独立可追溯，界面文字无截断。
- Spacing and layout rhythm：L 型桌只占指定半幅窗边与右侧实墙，坐榻集中在另一半；圆凳可推入桌下，双床头关系恢复，未以新增柜体填满留白。
- Colors and visual tokens：沿用暖灰轻奢的浅暖木、低反射浅台面、深绿软包和克制深色金属，与附件参考的中性暖木关系一致。
- Asset fidelity：坐榻、桌面、U 弧、展示格、圆镜、抽屉、任务灯、圆凳和插座均为真实场景几何，不以平面占位图替代。
- Copy and content：C61 明确记录“视觉右侧、与半幅飘窗连续成 L、面向使用者为 U 型内弧、床柜不动并恢复双床头柜”，并列出完成面、结构、防水保温、窗扇窗帘、圆弧加工、机电和检修复核要求。

### Comparison history

1. R21 / C56：附件图功能语言已转译，但梳妆台被放到业主指出的反向位置，并兼任一侧床头台。
2. R26 / C61：红框内整体镜像，梳妆台改至截图视觉右侧，与右半幅飘窗桌连续成 L，增加面向使用者的 U 型内弧，并恢复双床头柜。
3. R27 集成回归：后续客厅 C62 合入后，C61 几何、左右语义、床柜位置与专项测试仍保持，无新增 P0/P1/P2。

final result: passed

## R27 / C62 客厅 L 型沙发门禁

- source visual truth：业主客厅红框图与深灰皮质四座 L 型沙发附件。
- implementation screenshot：[outputs/angelicas-home-r27-l-sofa-top.png](./outputs/angelicas-home-r27-l-sofa-top.png)。
- viewport：`1280 × 720`，现代简约、顶视、标签关闭、透墙关闭。
- geometry：主沙发参考 `3.00 × 0.96 m`，阳台侧贵妃总进深约 `1.59 m`；沙发与电视主轴从 `z=9.78 m` 同步移至 `z=10.12 m`。
- circulation：阳台侧端部方案余量约 `0.58 m`；贵妃前端至电视墙约 `2.21 m`，中央继续不设茶几。以上均须完成面与成品复核。
- browser：WebGL 首帧正常，R27 / C62、最新确认文案和深灰皮质风格说明可见；`error` / `warning` 日志为空。
- automated checks：ESLint、21 项 Vitest 和生产构建全部通过；测试锁定旧一字沙发已删除、新 L 型与贵妃模块存在、右移量大于 `0.30 m`、电视与主沙发中心线完全一致。

### Findings

- 无 P0/P1/P2：参考图的四座分段、饱满靠背、包覆扶手、深灰低反射皮质、细黑金属脚与阳台侧 L 型贵妃位已进入模型；电视同步右移后仍与主沙发居中。
- `[P3]`：当前为方案级 3D，真实皮革褶皱、缝线、软包曲面与金属脚倾角仍为简化表达；不影响本轮平面包络、方向和中心线判断。

final result: passed

## R25 / C60 厨房案台设备段门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-d9d32048-c021-4bd8-997b-0c0cae321f9c.png`；红框指向厨房右侧案台设备段。
- integrated browser state：`/?style=wood&mode=top`，当前集成版本 R26 / C61；C60 与后续主卧 C61 同时存在。
- geometry evidence：原约 `1.45 × 0.58 m` 右侧案台保持一整块同高连续台面；其中约 `0.60 m` 模块改为台下洗碗机，台上放置约 `0.50 × 0.42 × 0.32 m` 微波炉，前后余段仍为地柜，同侧后段冰箱不动。
- semantic evidence：设计依据弹窗已显示 C60“右侧案台嵌入洗碗机与台上微波炉”，并列出进排水、防漏、插座、散热、回路与检修复核项。
- automated checks：专项断言确认台面覆盖完整右侧案台范围、洗碗机位于台下且处于台面范围内、微波炉底面高于台面并与洗碗机中心对齐；全量 ESLint、21 项 Vitest 和生产构建通过。
- console errors checked：本地浏览器 `error` / `warning` 日志为空，WebGL 顶视正常加载。

### Findings

- 无 P0/P1/P2：红框位置已从普通地柜表达纠正为“连续台面＋台下洗碗机＋台上微波炉”，没有移动冰箱或侵占厨房通道。
- `[P3]`：当前洗碗机、微波炉、把手与控制面板均为方案级几何，不代表最终产品；下单前须以具体型号替换，并复核洗碗机门体开启、进排水与防漏，微波炉侧后/顶部散热、插座和回路容量。

scoped result: passed

## R22 / C57 玻璃展示列外露端侧补玻璃

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-0cc18983-7693-49ad-831b-1ff7d66d10f9.png`，红框指向玻璃展示列朝过道外露的端侧。
- geometry evidence：保留 C55 正面通高玻璃门，在 `z=4.912 m` 补入一块与柜深方向一致的端侧通高玻璃；参考可视净宽约 `0.40 m`、高约 `2.62 m`、方案表达厚度约 `24 mm`，并补齐后侧竖框及顶底横框。柜体占地仍为约 `1.50 × 0.48 m`，未侵占过道。
- material evidence：正面玻璃门和新增外露侧板均复用同一透明玻璃材质，侧板不再以层板裸边或不透明板表达。
- automated checks：C57 专项断言确认侧板实体存在、使用玻璃材质、位于柜体外露端、沿柜深方向展开，且侧板厚度方向正确；专项测试、ESLint 与生产构建通过。

### Findings

- 无 P0/P1/P2：红框侧面已由“无玻璃”修正为“正面＋外露端侧”转角玻璃围合，C55 左列开放龛及整柜占地保持不变。
- `[P3]`：当前尺寸和厚度仅用于三维可读性，不是玻璃下单值；施工前须由厂家复尺并确定安全玻璃等级、磨边/护角、固定槽、转角五金、层板承重、防夹手和整柜防倾倒，儿童可达区不放置易坠重物。

scoped result: passed

## R21 / C56 主卧窗边梳妆区门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-309cd860-0c6f-44f6-a35d-06aa930f93c4.jpg`；红框位置依据为 `/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-4028d19f-d6bf-45c8-ac78-b4c2924ad4c4.png`。
- implementation screenshot path：`outputs/angelicas-home-r21-master-top-clean.png`。
- focused implementation paths：`outputs/angelicas-home-r21-master-focus.png` 与 `outputs/angelicas-home-r21-master-orbit-focus.png`。
- viewport：Codex 内置浏览器实际截图 `1280 × 720`、DPR 2。
- state：暖灰轻奢；顶视为标签关闭、透墙关闭；立体复核为标签关闭、透墙开启；WebGL 首帧已完成。
- full-view comparison evidence：`outputs/angelicas-home-r21-master-top-clean.png` 确认 L 型衣柜、1.8 m 床与上侧床头柜均未移动；梳妆区限制在红框窗边与床头侧实墙内，未侵入入口和衣柜通道。
- focused comparison evidence：同一视觉比较输入中打开附件参考照、`outputs/angelicas-home-r21-master-focus.png` 和 `outputs/angelicas-home-r21-master-orbit-focus.png`，逐项核对窗边坐榻、低抽屉、转角窄展示格、悬浮梳妆台、圆镜与圆凳的对应关系；参考为实景透视，模型为方案级顶视/轴测，因此比较功能模块、邻接关系和体量，不做像素级视角伪对齐。
- primary interactions tested：暖灰轻奢路由加载；顶视与环绕切换；标签关闭；透墙开启/关闭；版本与最新确认文案显示正确。
- console errors checked：浏览器 `error` / `warning` 日志为空。

### Findings

- 无 P0/P1/P2：附件图的六个关键构成均已进入模型，梳妆台沿床头侧实墙、展示格位于窗洞终点右侧实墙、圆凳在收起状态不占主通道；没有保留会与梳妆台重复或碰撞的下侧独立床头柜。
- `[P3]`：梳妆台受床头板终点与南墙完成面限制，模型净长约 0.74 m，属于紧凑单人梳妆位；若现场净长不足或使用者需要更大台面，应优先缩窄展示格或调整床架外径，不能压缩窗帘、窗扇和床侧通道。
- `[P3]`：当前模型简化了窗帘、真实木纹、软包缝线、镜面反射、灯带发光和五金节点；不影响平面关系与本轮布局判断，留待效果图和施工深化。

### Required fidelity surfaces

- Fonts and typography：应用版本为 `R21 / C56`，顶部“主卧窗边坐榻 · 悬浮梳妆台”与设计依据一致；控制和房间面积文案无截断。
- Spacing and layout rhythm：坐榻约 1.12 m 宽；低抽屉约 0.90 m 宽；展示格约 0.42 m 宽、0.24 m 深且左边界位于窗洞终点 `x≈11.11 m` 之外；梳妆台约 0.74 × 0.48 m、高约 0.75 m、腿部净高约 0.58 m；圆凳直径约 0.40 m，靠床侧边缘与床边方案静态间隙约 0.31 m。
- Colors and visual tokens：沿用既有暖灰轻奢主题的浅暖木、低反射台面、深绿软包与克制深色金属；参考图的中性暖木关系得到保留，没有为追求案例感新增金色线条或复杂吊顶。
- Image quality and asset fidelity：附件实景、浏览器全图、顶视聚焦和轴测聚焦均为可打开的原始栅格证据；圆镜、坐榻、抽屉、展示格、梳妆台和圆凳均为真实 Three.js 几何，不以占位图替代。
- Copy and content：C56 明确记录“梳妆台兼任下侧床头置物面”；C30/C42 标明主卧半幅桌已被替代，C32/C35 标明圆凳与床头位的最新关系；结构、窗扇窗帘、冷凝、固定、机电和检修均列为待复核。

### Comparison history

1. R20 / C55 基线：主卧仍为 C30 半幅多功能桌、两只独立床头柜，未表达附件图的梳妆系统。
2. R21 / C56：移除旧半幅桌与下侧独立床头柜，加入坐榻、低抽屉、窄展示格、悬浮梳妆台、圆镜、任务灯、可维护插座和可收圆凳；床与衣柜保持原位。
3. 浏览器顶视与透墙轴测复核：窗洞、床、床头板、展示格、梳妆台和圆凳之间无可见穿插；自动化间隙测试、ESLint、20 项 Vitest 和生产构建均通过，浏览器无错误或警告。

final result: passed

## R20 / C55 入户正对高柜门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-d07c0084-d34a-4279-9b49-8f3dfb354f7a.png`。
- browser state：本地实际页面 `/?style=minimal&mode=orbit` 与顶视路由均完成首帧；复核过标签关闭、透墙开启状态。
- geometry evidence：柜体继续覆盖 `z=3.40–4.90 m` 的约 1.50 m 短墙，深度维持约 0.48 m；面向柜体时左列约 0.90 m、右列约 0.60 m，总占地未扩大。
- material evidence：右列门板使用建筑模型共用的透明玻璃材质，不以不透明浅色板代替；右列包含通高玻璃门、细框和 4 道可见层板。
- console errors checked：浏览器 `error` / `warning` 日志为空。
- automated checks：C55 专项测试确认左列开放龛存在、右列玻璃门使用透明材质、4 道层板存在且总柜高不超过墙高；全量 ESLint、20 项 Vitest 和生产构建通过。

### Findings

- 无 P0/P1/P2：左右方向按人站在过道内面向柜体定义，左列中段已开放，右列已从下到上统一为玻璃展示柜；C55 与后续 R21 / C56 主卧改动可同时存在。
- `[P3]`：当前为方案级 3D，玻璃反射、铰链、门缝、层板连接和柜内灯光仍为简化表达；不影响本轮功能分列和占地判断，施工前仍须完成安全玻璃、五金、承重、防倾倒和防夹手专项核验。

final result: passed

## R28 / C63 书房延伸桌、端柜与三层低书架门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-3f5fecf8-f239-4625-880d-63bbb6dd981d.png`。
- implementation screenshot paths：`outputs/angelicas-home-r28-study-cabinet-shelf-top.png`、`outputs/angelicas-home-r28-study-focus.jpg`、`outputs/angelicas-home-r28-study-orbit-transparent.jpg` 与 `outputs/angelicas-home-r28-study-orbit-focus.jpg`；同画布比较输入为 `outputs/angelicas-home-r28-study-comparison.png`。
- viewport：Codex 内置浏览器实际截图 `1280 × 720`；原木极简；顶视为标签关闭、透墙关闭，轴测为标签关闭、透墙开启。
- state：应用版本与顶部文案均为 `R28 / C63`；WebGL 首帧完成，顶视/环绕和标签/透墙交互均实测正常。
- console errors checked：浏览器日志仅含 Vite 连接、热更新和 React 开发提示，`error` / `warning` 为零。
- automated checks：ESLint、21 项 Vitest、TypeScript 与 Vite 生产构建全部通过。
- combined visual comparison：同画布逐项核对红框端部关系，参考图中的桌面延伸方向、下柜位置和上方靠墙连续书架在实现侧均有对应；实现图改用正顶视以消除透视遮挡，因此比较邻接、范围和体量，不做像素级相机对齐。

### Findings

- 无 P0/P1/P2：右墙桌面由原约 `z=1.02 m` 连续延伸至约 `z=2.18 m`，仍与右半飘窗桌共用一块 ExtrudeGeometry 台面；使用者侧 U 型内弧未改变，原衣柜坐标保持不变。
- 无 P0/P1/P2：延伸末端下方存在一组落地封闭端柜和两扇平板门，中段继续留出腿部空间；旧右返小抽屉已移除，避免与端柜形成重复碎收纳。
- 无 P0/P1/P2：开放书架从靠墙端约 `z=0.28 m` 连续到端柜末端，模型以四块水平板界定三个净层；参考顶高约 `2.03 m`，低于旧书架约 `2.30 m`，与用户“铺到墙体、三层就好”的要求一致。
- `[P3]`：端柜宽深、台面跨度、书架层板挠度和书本净高均为比例模型参考；下单前必须用完成面复尺替换，并校核墙体基层、承重、防倾倒、柜门开启、插座网络和检修路径。

### Required fidelity surfaces

- Spacing and layout rhythm：桌面沿墙延伸段、端柜和书架终点对齐；书架三个净层等距，开放收纳集中成一条低矮连续带，未恢复整窗长桌或增加通高碎格。
- Colors and visual tokens：沿用既有浅暖木、平板柜门和低反射表面；不新增复杂灯槽、金属装饰线或高饱和色。
- Image quality and asset fidelity：顶视与透墙轴测均由本地实际 WebGL 页面截图；桌面、端柜、门板与书架均为真实 Three.js 几何，不以占位图替代。
- Copy and content：设计依据、版本号、最新确认文案、变更记录和风险门禁均同步到 C63，并明确区分业主已确认的相对关系与待现场复尺的施工数据。

final result: passed

## R32 / C67 厨房双开门冰箱扩宽门禁

- source visual truth path：`/var/folders/p2/p7vnn5_x1lj0zwkssvd0b5900000gn/T/codex-clipboard-eccdef0d-ad30-429e-b4db-be43dc5d6122.png`；红框指向厨房东墙后段的原窄冰箱与其北侧空地。
- geometry evidence：冰箱保持靠东墙与南端位置，沿 z 轴由原约 `0.68 m` 扩宽为约 `1.28 m`，北边缘距案台末端约 `0.085 m`、南边缘距墙约 `0.33 m`；主机体包含两块独立门板、中央竖缝和两根靠中竖向拉手。R25/C60 台面、洗碗机和微波炉坐标未变。
- browser state：Codex 内置浏览器实际加载 `R32 / C67`；核对现代简约顶视、标签关闭、环绕与透墙状态，顶部最新确认文案和设计依据入口正常。
- automated checks：ESLint、23 项 Vitest、TypeScript 与 Vite 生产构建全部通过；C67 专项断言锁定双门数量、扩宽包络、案台/南墙间距和旧 C04 冰箱实体删除。
- console errors checked：本地浏览器 `error` / `warning` 日志为空，WebGL 首帧、顶视、环绕、标签和透墙交互正常。

### Findings

- 无 P0/P1/P2：原红框左侧约 `0.675 m` 空档被压缩到约 `0.085 m` 的设备/案台间隙，双开门体量已连续占据该段；冰箱未穿入案台、南墙或三扇移门轨道。
- 无 P0/P1/P2：双门通过两块真实 Three.js 门板、中央门缝和双竖拉手表达，不再沿用原单体块加单拉手的窄冰箱几何。
- `[P3]`：`1.28 × 0.64 × 1.86 m` 为红框比例模型参考包络，不代表已选商品；冻结机型前必须复核厂家散热、插座、门扇与内部抽屉完全开启、搬运和检修。若实际机型较窄，以可拆侧封板或厂家允许的散热留缝收口。

scoped result: passed
