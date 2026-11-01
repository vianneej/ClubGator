/** Placeholder cosmetics until real art lands. IDs are stable for saves. */

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
const NONE = { id: "", label: "None", swatch: "#f0d4dc" };
export const CATALOG = {
  hat: [
    NONE,
    { id: "wizard", label: "Wizard hat", swatch: "#7b4bb8" },
    { id: "beanie", label: "Beanie", swatch: "#3d9e3a" },
    { id: "cap", label: "Ball cap", swatch: "#5a9e4a" },
    { id: "bow", label: "Bow", swatch: "#e87aa8" },
    { id: "crown", label: "Crown", swatch: "#f4d35e" },
    { id: "top_hat", label: "Top hat", swatch: "#2a2a2a" },
    { id: "propeller", label: "Propeller", swatch: "#e85a3c" },
    { id: "party", label: "Party hat", swatch: "#2f6fdb" },
    { id: "visor", label: "Visor", swatch: "#4ecdc4" },
  ],
  glasses: [
    NONE,
    { id: "round", label: "Round", swatch: "#5c4033" },
    { id: "square", label: "Square", swatch: "#2a2a2a" },
    { id: "sun", label: "Sunglasses", swatch: "#1a1a1a" },
    { id: "star", label: "Star specs", swatch: "#f4d35e" },
    { id: "mono", label: "Monocle", swatch: "#c0c0c0" },
    { id: "ski", label: "Ski goggles", swatch: "#2f6fdb" },
    { id: "heart", label: "Heart", swatch: "#e87aa8" },
  ],
  outfit: [
    NONE,
    { id: "hoodie", label: "Hoodie", swatch: "#2f6fdb" },
    { id: "tee", label: "T-shirt", swatch: "#efefef" },
    { id: "jersey", label: "Jersey", swatch: "#f4a020" },
    { id: "suit", label: "Suit", swatch: "#2a2a2a" },
    { id: "overalls", label: "Overalls", swatch: "#3d6eb5" },
    { id: "raincoat", label: "Raincoat", swatch: "#e85a3c" },
    { id: "scarf_set", label: "Scarf set", swatch: "#c0392b" },
    { id: "lab_coat", label: "Lab coat", swatch: "#f5f5f5" },
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
