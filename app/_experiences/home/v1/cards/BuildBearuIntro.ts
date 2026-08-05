import gsap from "gsap";

const EASE = "power3.out";
const CLIP = {
  idle: "polygon(0% 0%, 100% 0%, 100% 0%, 0% 0%)",
  full: "polygon(0% 0%, 100% 0%, 100% 100%, 0% 108%)",
};

function glitch(frames: NodeListOf<Element>, text: NodeListOf<Element>) {
  const tl = gsap.timeline({
    paused: false,
    defaults: { ease: EASE, duration: 0 },
  });

  tl.set(frames[0], { autoAlpha: 1 })
    .set(frames, { autoAlpha: 0 }, "+=0.05")
    .from(text, { autoAlpha: 0, duration: 0 }, "+=0.05")
    .set(text, { autoAlpha: 0 }, "+=0.05")
    .set(text, { autoAlpha: 1, color: "#eee", y: "-5%" }, "+=0.05")
    .set(frames[1], { autoAlpha: 1 }, "+=0.05")
    .set(text, { autoAlpha: 0 }, "<")
    .set(text, { autoAlpha: 1, color: "#1c1917", y: "5%", x: "4%" }, "+=0.05")
    .set(frames, { autoAlpha: 0 }, "<")
    .set(text, { autoAlpha: 0, y: 0, x: 0 }, "+=0.05")
    .set(frames[2], { autoAlpha: 1 }, "+=0.05")
    .set(frames, { autoAlpha: 0 }, "+=0.05")
    .set(text, { autoAlpha: 1 }, "+=0.05");
  return tl;
}

export function buildBearuIntro(root: HTMLElement) {
  const act = (name: string) => root.querySelectorAll(`[data-act="${name}"]`);
  const frames = act("glitchFrame");
  gsap.set(frames, { autoAlpha: 0 });
  gsap.set(act("text"), { autoAlpha: 0 });

  const tl = gsap.timeline({
    paused: true,
    defaults: { ease: EASE, duration: 0.5 },
  });

  tl.fromTo(
    act("name-layer"),
    {
      clipPath: CLIP.idle,
      stagger: 0.08,
      duration: 1,
    },
    {
      clipPath: CLIP.full,
      stagger: 0.08,
      duration: 1,
    },
    0.2,
  )
    .addLabel("nameWritten")
    .to(
      act("name-layer"),
      { autoAlpha: 0, duration: 2, ease: "back.out" },
      "+=0.6",
    )
    .add(glitch(frames, act("text")), "nameWritten+=0.1")
    .from(act("tail"), { autoAlpha: 0, y: "8%", stagger: 0.3 }, ">+=0.1");

  return tl;
}
