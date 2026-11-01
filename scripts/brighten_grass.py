from pathlib import Path
from PIL import Image
ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "src" / "assets" / "grass_2d_strip_clean.png"
BACKUP = ROOT / "src" / "assets" / "grass_2d_strip_clean_original.png"

GROUND = (76, 174, 58) 
HIGHLIGHT = (126, 200, 80) 
TUFT = (133, 212, 124) 
FLECK = (168, 230, 150)
REMAP = {
    (73, 112, 67): GROUND,
    (72, 108, 67): GROUND,
    (93, 126, 75): HIGHLIGHT,
    (122, 148, 100): TUFT,
    (174, 189, 183): FLECK,
    (175, 178, 168): FLECK,
}
def is_background(r, g, b, a):
    if a < 8:
        return True
    if r < 20 and g < 20 and b < 20:
        return True
    if r < 55 and g < 45 and b < 40 and g <= r + 5:
        return True
    return False
def main():
    source = BACKUP if BACKUP.exists() else SRC
    img = Image.open(source).convert("RGBA")
    if not BACKUP.exists():
        img.save(BACKUP)
    w, h = img.size
    src_px = img.load()

    is_bg = [[False] * w for _ in range(h)]
    for y in range(h):
        for x in range(w):
            r, g, b, a = src_px[x, y]
            is_bg[y][x] = is_background(r, g, b, a)
    ground_y = h - 1
    for y in range(h):
        green = sum(1 for x in range(w) if not is_bg[y][x])
        if green > w * 0.6:
            ground_y = y
            break
    out = Image.new("RGBA", (w, h))
    out_px = out.load()
    for y in range(h):
        for x in range(w):
            r, g, b, a = src_px[x, y]
            if is_bg[y][x]:
                out_px[x, y] = (0, 0, 0, 255 if a > 8 else a)
                continue
            base = REMAP.get((r, g, b), GROUND)
            if y < ground_y:
                out_px[x, y] = (*TUFT, a)
                continue
            if y <= ground_y + 2 and base == GROUND:
                out_px[x, y] = (*HIGHLIGHT, a)
                continue
            out_px[x, y] = (*base, a)
    out.save(SRC)
    print(f"Ground row starts at y={ground_y}")
    print(f"Wrote {SRC}")

if __name__ == "__main__":
    main()
