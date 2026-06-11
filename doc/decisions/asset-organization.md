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

## 七、决策变更日志

- **2026-06-09**：初版定稿。确定 import 静态导入为默认偏好，资产按"体验层 vs 数据层"分离，v1 专属资产 co-location 于 `_experiences/home/v1/assets/`，MDX 章节图走 `public/chapters/`，全小写短横线命名。
