import worl from "./assets/home-worl.png";
import dorath from "./assets/home-dorath.png";
import bearu from "./assets/home-bearu.png";
import duke from "./assets/home-duke.png";
import bg from "./assets/home-bg.jpg";

const CHARACTERS = [
  {
    name: "worl",
    img: worl,
    offsetU: -0.01,
    classname: ".worl",
    zindex: 3,
  },
  {
    name: "dorath",
    img: dorath,
    offsetU: -0.01,
    classname: ".dorath",
    zindex: 4,
  },
  {
    name: "bearu",
    img: bearu,
    offsetU: -0.003,
    classname: ".bearu",
    zindex: 1,
  },
  {
    name: "duke",
    img: duke,
    offsetU: -0.005,
    classname: ".duke",
    zindex: 2,
  },
  {
    name: "bg",
    img: bg,
    offsetU: -0.003,
    classname: ".bg",
    zindex: 0,
    fit: "cover",
  },
];

export { CHARACTERS };
