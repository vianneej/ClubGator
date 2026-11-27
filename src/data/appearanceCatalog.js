/** Placeholder cosmetics until real art lands. IDs are stable for saves. */

import ClearXImg from "../assets/ClearX.png";
import WizardHatImg from "../assets/WizardHat.png";
import BeanieImg from "../assets/Beanie.png";
import BaseballCapImg from "../assets/BaseballCap.png";
import CrownImg from "../assets/Crown.png";
import TopHatImg from "../assets/TopHat.png";
import PartyHatImg from "../assets/PartyHat.png";
import GlassesImg from "../assets/Glasses.png";
import SunglassesImg from "../assets/Sunglasses.png";
import MonocleImg from "../assets/Monocle.png";
import SquareImg from "../assets/square.png";
import SkiGoggleImg from "../assets/SkiGoggle.png";
import BowImg from "../assets/Bow.png";
import StarSpecsImg from "../assets/star_specs.png";
import HoodieImg from "../assets/Hoodie.png";
import TShirtImg from "../assets/TShirt.png";
import SuitImg from "../assets/Suit.png";
import RainCoatImg from "../assets/RainCoat.png";
import LabCoatImg from "../assets/LabCoat.png";
import JerseyImg from "../assets/Jersey.png";
import VestImg from "../assets/Vest.png";

export const BODY_COLORS = [
  { id: "green", hex: "#3d9e3a", label: "Green" },
  { id: "navy", hex: "#1f3a6e", label: "Navy" },
  { id: "blue", hex: "#2f6fdb", label: "Blue" },
  { id: "coral", hex: "#e85a3c", label: "Coral" },
  { id: "pink", hex: "#e87aa8", label: "Pink" },
  { id: "teal", hex: "#4ecdc4", label: "Teal" },
  { id: "yellow", hex: "#f4d35e", label: "Yellow" },
  { id: "brown", hex: "#8b5a2b", label: "Brown" },
];

export const DEFAULT_COLOR_ID = "green";

export const CATEGORIES = [
  { id: "hat", label: "Hats", tabColor: "#f3e6c8", headerColor: "#f4b6c8" },
  { id: "glasses", label: "Glasses", tabColor: "#c8e6c0", headerColor: "#a8d4a0" },
  { id: "outfit", label: "Outfits", tabColor: "#dcc8f0", headerColor: "#c9a8e0" },
  { id: "accessory", label: "Accessories", tabColor: "#f5e6a8", headerColor: "#ecd878" },
];

/** 3×3 grid on desktop */
export const ITEMS_PER_PAGE = 9;

const NONE = { id: "", label: "Clear", image: ClearXImg };
export const CATALOG = {
  hat: [
    NONE,
    { id: "wizard", label: "Wizard hat", swatch: "#7b4bb8", image: WizardHatImg },
    { id: "beanie", label: "Beanie", swatch: "#3d9e3a", image: BeanieImg },
    { id: "cap", label: "Ball cap", swatch: "#5a9e4a", image: BaseballCapImg },
    { id: "bow", label: "Bow", swatch: "#e87aa8", image: BowImg },
    { id: "crown", label: "Crown", swatch: "#f4d35e", image: CrownImg },
    { id: "top_hat", label: "Top hat", swatch: "#2a2a2a", image: TopHatImg },
    { id: "party", label: "Party hat", swatch: "#2f6fdb", image: PartyHatImg },
  ],
  glasses: [
    NONE,
    { id: "round", label: "Round", swatch: "#5c4033", image: GlassesImg },
    { id: "square", label: "Square", swatch: "#2a2a2a", image: SquareImg },
    { id: "sun", label: "Sunglasses", swatch: "#1a1a1a", image: SunglassesImg },
    { id: "star", label: "Star specs", swatch: "#f4d35e", image: StarSpecsImg },
    { id: "mono", label: "Monocle", swatch: "#c0c0c0", image: MonocleImg },
    { id: "ski", label: "Ski goggles", swatch: "#2f6fdb", image: SkiGoggleImg },
  ],
  outfit: [
    NONE,
    { id: "hoodie", label: "Hoodie", swatch: "#2f6fdb", image: HoodieImg },
    { id: "tee", label: "T-shirt", swatch: "#efefef", image: TShirtImg },
    { id: "jersey", label: "Jersey", swatch: "#f4a020", image: JerseyImg },
    { id: "suit", label: "Suit", swatch: "#2a2a2a", image: SuitImg },
    { id: "raincoat", label: "Raincoat", swatch: "#e85a3c", image: RainCoatImg },
    { id: "vest", label: "Vest", swatch: "#2a2a2a", image: VestImg },
    { id: "lab_coat", label: "Lab coat", swatch: "#f5f5f5", image: LabCoatImg },
  ],
  accessory: [
    NONE,
    { id: "backpack", label: "Backpack", swatch: "#8b5a2b" },
    { id: "skateboard", label: "Skateboard", swatch: "#e85a3c" },
    { id: "balloon", label: "Balloon", swatch: "#e87aa8" },
    { id: "uf_flag", label: "UF flag", swatch: "#f4a020" },
    { id: "camera", label: "Camera", swatch: "#555555" },
    { id: "book", label: "Textbook", swatch: "#1f3a6e" },
    { id: "coffee", label: "Coffee", swatch: "#6f4e37" },
  ],
};

export function getDefaultAppearance() {
  return {
    color: DEFAULT_COLOR_ID,
    hat: "",
    glasses: "",
    outfit: "",
    accessory: "",
  };
}
export function getColorHex(colorId) {
  return BODY_COLORS.find((c) => c.id === colorId)?.hex ?? BODY_COLORS[0].hex;
}
export function getItem(categoryId, itemId) {
  if (!itemId) return null;
  return CATALOG[categoryId]?.find((item) => item.id === itemId) ?? null;
}
