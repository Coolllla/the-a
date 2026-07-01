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



