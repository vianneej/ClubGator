import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  BODY_COLORS,
  CATALOG,
  getDefaultAppearance,
} from "../data/appearanceCatalog";

const COLOR_IDS = new Set(BODY_COLORS.map((c) => c.id));
const SLOT_KEYS = ["hat", "glasses", "outfit", "accessory"];

function isValidSlotId(categoryId, itemId) {
  if (itemId === "") return true;
  if (typeof itemId !== "string") return false;
  return Boolean(CATALOG[categoryId]?.some((item) => item.id === itemId));
}

export function normalizeAppearance(input = {}) {
  const defaults = getDefaultAppearance();
  const color =
    typeof input.color === "string" && COLOR_IDS.has(input.color)
      ? input.color
      : defaults.color;

  const appearance = { color };

  for (const key of SLOT_KEYS) {
    const value = typeof input[key] === "string" ? input[key] : defaults[key];
    appearance[key] = isValidSlotId(key, value) ? value : "";
  }

  return appearance;
}

export async function createPenguin(appearanceInput) {
  await auth.authStateReady();

  const user = auth.currentUser;

  if (!user) {
    throw new Error("You must be logged in to create a penguin.");
  }

  const appearance = normalizeAppearance(appearanceInput);
  const profileRef = doc(db, "users", user.uid);
  const penguinRef = doc(db, "penguins", user.uid);

  return runTransaction(db, async (transaction) => {
    const profileSnapshot = await transaction.get(profileRef);
    const penguinSnapshot = await transaction.get(penguinRef);

    if (!profileSnapshot.exists()) {
      throw new Error("Finish creating your account first.");
    }

    // repeated submissions return current penguin
    if (penguinSnapshot.exists()) {
      const existing = penguinSnapshot.data();

      if (hasSavedLook(existing)) {
        return existing;
      }

      transaction.update(penguinRef, { appearance });
      return { ...existing, appearance };
    }

    const penguin = {
      ownerId: user.uid,
      appearance,
      createdAt: serverTimestamp(),
      schemaVersion: 1,
    };

    transaction.set(penguinRef, penguin);

    return penguin;
  });
}

export async function getPlayerPenguin(uid) {
  if (!uid) return null;
  const penguinRef = doc(db, "penguins", uid);
  const snap = await getDoc(penguinRef);
  return snap.exists() ? snap.data() : null;
}

/** true when penguin exists as a save */
export function hasSavedLook(penguin) {
  if (!penguin || typeof penguin !== "object") return false;
  const appearance = penguin.appearance;
  if (!appearance || typeof appearance !== "object") return false;
  return (
    typeof appearance.color === "string" &&
    appearance.color.length > 0 &&
    COLOR_IDS.has(appearance.color)
  );
}
