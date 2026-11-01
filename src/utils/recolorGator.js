function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return {
    r: parseInt(h.slice(0, 2), 16),
    g: parseInt(h.slice(2, 4), 16),
    b: parseInt(h.slice(4, 6), 16),
  };
}

function isNearBlack(r, g, b) {
  return r < 18 && g < 18 && b < 18;
}

/** leave tongue, eyes and belly alone */
function isFeaturePixel(r, g, b) {
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  if (r > 180 && g > 170 && b > 130 && max - min < 90) return true; // cream
  if (r > 140 && g < 100 && b < 120) return true;   // pinkish red
  return false;
}
function isBodyGreen(r, g, b) {
  if (isFeaturePixel(r, g, b) || isNearBlack(r, g, b)) return false;
  return g > r + 15 && g > b + 10 && g > 40;
}
const cache = new Map();
export async function recolorGatorSrc(imageUrl, targetHex) {
  const key = `${imageUrl}|${targetHex}`;
  if (cache.has(key)) return cache.get(key);

  const promise = new Promise((resolve, reject) => {
    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      try {
        const canvas = document.createElement("canvas");
        canvas.width = img.naturalWidth;
        canvas.height = img.naturalHeight;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        ctx.drawImage(img, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const { data } = imageData;
        const target = hexToRgb(targetHex);

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (isBodyGreen(r, g, b)) {
            // keep brightness
            const brightness = g / 255;
            data[i] = Math.min(255, Math.round(target.r * brightness * 1.35));
            data[i + 1] = Math.min(255, Math.round(target.g * brightness * 1.35));
            data[i + 2] = Math.min(255, Math.round(target.b * brightness * 1.35));
          }
        }
        ctx.putImageData(imageData, 0, 0);
        resolve(canvas.toDataURL("image/png"));
      } catch (err) {
        reject(err);
      }
    };
    img.onerror = () => reject(new Error("Failed to load gator sprite"));
    img.src = imageUrl;
  });
  cache.set(key, promise);
  return promise;
}
