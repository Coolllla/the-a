# Motion

## basic use

```tsx
<motion.div 
    initial={{opacity:0}}
    animate={{...}}
    transition={{...}}
>
	<div>something</div>
</motion.div>
```



## To exit

```tsx
<AnimatePresence>
	<motion.div
        key={key} 
        initial animate transition...
        exit={{}}
        >
    	<div>something</div>
    </motion.div>
</AnimatePresence>
```

`key` 变了 = 旧的走 `exit`、新的走 `initial → animate`。**触发靠且只靠 `key`**，不是靠内容变。

### 同一位置换内容：加 `mode="wait"` + `initial={false}`

```tsx
<AnimatePresence mode="wait" initial={false}>
  <motion.p key={state} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}}>
    {TEXT[state]}
  </motion.p>
</AnimatePresence>
```

两个参数各解决一件事（2026-08-05 bearu 名片实测）：

- **`mode="wait"`** —— 默认（`"sync"`）下新旧两段文字**同时在场**、一个淡出一个淡入，叠在同一位置就是**双重曝光**，两段中文糊成一团。`wait` 改成"旧的播完 exit 才挂新的"，视觉上是干净的交替。代价是总时长翻倍（0.5s 淡出 + 0.5s 淡入），所以单程时长要比原来想的短一半。
- **`initial={false}`** —— 首次挂载时跳过 `initial`，直接以 `animate` 态出现。不写的话页面一进来那段文字会自己淡入一次，而它本该"本来就在那"。

> 用 `key={state}` 而不是 `key` 加在内容上：`state` 是**驱动切换的那个状态**，一个状态对应一段文字，切换点天然对齐。



