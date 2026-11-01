import grassSrc from "../assets/grass_2d_strip_clean.png";

export default function GrassGround() {
  return (
    <img
      className="cg-grass"
      src={grassSrc}
      alt=""
      aria-hidden="true"
      draggable={false}
    />
  );
}
