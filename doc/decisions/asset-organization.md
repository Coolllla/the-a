# 静态资产组织约定

> 决定图片、字体、媒体等静态资源的存放位置、目录结构与命名规则——回答"一张图 / 一个字体进项目时，应该放哪、叫什么名字"。

---

## 一、问题背景

the-a 是视觉密集型项目，预计会积累大量静态资产：

- **角色立绘 / 世界地图 / 章节插图 / 个人画作**——内容资产，跨版本共享；
- **首页 v1 的纸张纹理 / 墨迹 / 手绘装饰**——皮肤资产，专属版本；
- **章节 MDX 内嵌插图**——写作者引用，需稳定路径；
- **favicon / OG 分享图 / 字体文件 / 大体积视频**——基础资源。

如果不预先约定组织方式，几个月后会变成"`public/` 堆 200 张图找不到"的状态。本文档定义一套**按用途 + 生命周期**分类的组织约定。

---

## 二、两条存放路径

Next.js 提供两种静态资源使用方式：

| 路径 | 引用方式 | 适用 |
|---|---|---|
| **`public/`** | 字符串路径 `<img src="/foo.png" />` | 需要**稳定公共 URL** 的资源 |
| **import 静态导入**（位于 `app/` 任意位置） | `import img from './foo.png'` 然后 `<Image src={img} />` | 组件用到的 UI 资产 |

### 静态导入的优势

```tsx
// import 方式
import linShen from "@/app/_assets/characters/lin-shen.png";
<Image src={linShen} alt="" />
//   ↑ 自动读取 width/height
//   ↑ 文件不存在时编译报错（TS 完整保护）
//   ↑ 文件名带 hash，缓存自动失效
//   ↑ 未引用时 tree-shake 不进 bundle
```

**默认偏好 import 方式**；只有以下情况用 `public/`：

- 需要稳定 URL（favicon、OG、sitemap、robots.txt）；
- 字体文件（CSS `@font-face` 引用）；
- MDX 章节插图（写作时手填路径，不应每张图都 `import`）；
- 大体积媒体（视频、4K 原图）。

---

## 三、分类原则：按"用途 + 生命周期"

### 明确**不**采用的分类方式

| ❌ | 原因 |
|---|---|
| 按版本拆（v1/v2 各一套） | 强迫复制共享资产；v2 想换皮但人物没换时找不到归属 |
| 按文件类型拆（png/svg/jpg） | 文件类型是技术细节；找图时心里想的是"那张地图"，不是"那张 jpg" |

### 采用：体验层资产 vs 数据层资产

与 [`architecture.md`](./architecture.md) 的"剧院三层模型"完全对应：

| 资产性质 | 归属层 | 位置 |
|---|---|---|
| 角色立绘 / 世界地图 / 章节插图 / 画作 | **数据层**（跨版本共享）| `app/_assets/` |
| v1 的纸张纹理 / 墨迹 / 手绘边框装饰 | **体验层**（专属版本，co-location）| `app/_experiences/home/v1/assets/` |
| favicon / OG / 字体 / MDX 章节图 / 大体积媒体 | **基础资源**（稳定 URL）| `public/` |

### 判断"该放哪"的标准问句

> 假设某天做 v2 完全换风格——**这张图你还会用吗**？
> - 会 → `app/_assets/`（共享）
> - 不会 → 该版本自己的 `assets/` 子目录（co-location）

---

## 四、推荐目录结构

```
app/
├── _assets/                          # ⭐ 跨版本共享的内容资产（数据层）
│   ├── characters/                   # 角色立绘
│   ├── world/                        # 世界观相关（地图、场景、势力徽章）
│   ├── factions/                     # 势力徽记
│   └── gallery/                      # 个人绘画作品
│
└── _experiences/
    ├── home/
    │   └── v1/
    │       ├── HomeV1.tsx
    │       ├── HomeV1.module.scss
    │       └── assets/               # ⭐ v1 专属皮肤资产（体验层）
    │           ├── paper-texture.jpg
    │           ├── ink-splatter.png
    │           └── frame-doodle.svg
    └── ... 其他可版本化页面同样的 assets/ 子目录约定

public/
├── favicon.ico
├── favicon-32.png
├── og.png                            # 社交分享卡
├── fonts/                            # 自部署字体
├── chapters/                         # MDX 章节内嵌插图
│   └── ch-01-mist/
│       └── pier.jpg                  # MDX 中：![](/chapters/ch-01-mist/pier.jpg)
└── media/                            # 大体积素材（视频、4K 原图）
```

### 为什么所有目录用 `_` 前缀

Next.js App Router 中 `app/` 下以 `_` 开头的文件夹是**保留命名**，不会成为路由。`_experiences/` `_assets/` 同属"组织性目录"，统一约定保持代码库视觉整齐。

### 章节 MDX 插图为什么进 `public/`

写小说时不应每张图都写 `import` 语句。`public/chapters/<slug>/` 让 MDX 引用变成纯字符串路径，写作流畅：

```mdx
![雾港码头](/chapters/ch-01-mist/pier.jpg)
```

代价是失去 import 方式的编译期保护——但对**写作者主导**的章节内容，写作流畅性优先级更高。

---

## 五、命名约定

文件名是未来检索资产的主要线索，**比目录结构更高频**。

### 三条规则

1. **全小写 + 短横线连字符**——不要空格、不要中文、不要混用下划线；
2. **从大到小**：`类别-身份-用途.扩展名`，例如 `character-lin-shen-portrait.png`；
3. **同一资产多版本**用语义化后缀：`@2x`（高清）/ `-dark`（暗色版）/ `-alt`（备选），**不要**在文件名中嵌入日期或"最终版"字样。

### 示例对照

| ✅ 好 | ❌ 坏 |
|---|---|
| `lin-shen-portrait.png` | `林深立绘最终版2.png` |
| `lin-shen-portrait@2x.png` | `lin-shen-2x.png`（混用风格）|
| `map-fog-port-overview.jpg` | `IMG_2391.jpg` |
| `paper-texture-warm.jpg` | `bg.jpg` |

---

## 六、`<Image>` 使用注意

- 默认使用 `next/image` 而非原生 `<img>`，获得自动响应式、懒加载、AVIF/WebP 转换；
- 静态导入的资产**自动带 width/height**，不需要手填；
- `public/` 路径资产必须手填 `width` `height` 或使用 `fill` 属性；
- 装饰性图片（不承载信息）的 `alt=""`，无障碍工具会跳过；
- 真实内容图必须写有意义的 `alt`。

---

## 七、动图 / 序列帧动画

少量帧的循环动画（如 3 帧人物呼吸、装饰元素摆动），**不使用 GIF**——使用 **APNG / 动图 WebP** 或 **序列帧 + JS 切换**。

### 为什么不用 GIF

| 维度 | GIF | APNG / 动图 WebP / 序列帧 |
|---|---|---|
| 色彩深度 | 256 色（**手绘的细腻渐变会掉色 / 抖色**） | 真彩色 |
| 透明度 | 1 位（**透明边缘有锯齿白边**，贴在纸张背景上特别明显） | 真透明（8 位 alpha） |
| 体积 | 通常比 WebP 大 3-5 倍 | 现代格式压缩高效 |

对"手绘记事本/日记本"风格 + 透明边角色立绘的项目，GIF 的两个硬伤都会触发——直接淘汰。

### 选择标准

| 场景 | 选什么 |
|---|---|
| **装饰性自动循环**（火苗摇摆、雾气飘动、人物呼吸） | **APNG / 动图 WebP**——单文件、`<img>` / `<Image>` 直接用，浏览器自动循环 |
| **需要交互控制**（hover 才动、滚动触发、单步、悬停反向） | **序列帧 PNG/WebP + JS 切换**——3 张图加 10 行 React 状态切换，控制权完全在外 |

### 工具

- **WebP 动图**：FFmpeg、[ezgif.com](https://ezgif.com/) 在线转换；
- **APNG**：apngasm、Photoshop 时间轴导出；
- **序列帧**：直接导出多张 PNG/WebP，按命名规范命名（如 `lin-shen-breath-1.png` / `-2.png` / `-3.png`），与单张资产同目录存放。

### 序列帧 + JS 的极简实现参考

```tsx
import { useEffect, useState } from "react";
import frame1 from "./assets/wave-1.png";
import frame2 from "./assets/wave-2.png";
import frame3 from "./assets/wave-3.png";

const FRAMES = [frame1, frame2, frame3];

export function ThreeFrameLoop({ active = true, fps = 6 }) {
  const [i, setI] = useState(0);
  useEffect(() => {
    if (!active) return;
    const id = setInterval(() => setI((v) => (v + 1) % FRAMES.length), 1000 / fps);
    return () => clearInterval(id);
  }, [active, fps]);
  return <img src={FRAMES[i].src} alt="" />;
}
```

控制点全部外置：`active` 决定播不播，`fps` 控制速度，可以再扩展 `direction`（正/反）、`oneShot`（一次性）等。

---

## 八、决策变更日志

- **2026-06-16**：新增"动图 / 序列帧动画"章节。明确不使用 GIF（256 色 + 1 位透明的硬伤），装饰性自动循环用 APNG / 动图 WebP，需交互控制用序列帧 + JS。
- **2026-06-09**：初版定稿。确定 import 静态导入为默认偏好，资产按"体验层 vs 数据层"分离，v1 专属资产 co-location 于 `_experiences/home/v1/assets/`，MDX 章节图走 `public/chapters/`，全小写短横线命名。
