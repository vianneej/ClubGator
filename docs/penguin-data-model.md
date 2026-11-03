# Penguin data model

Collection: penguins
Document ID: the owner's Firebase Authentication UID

Each account can have one penguin.
Creation requires authentication and an existing user profile.
Players can create and read only their own penguin.
Repeated creation requests preserve the existing document.
Updates, deletion, and collection listing are currently denied.

## Appearance
appearance: {
  color: string,      // catalog colour id, e.g. "green"
  hat: string,        // item id, empty string if no id
  glasses: string,
  outfit: string,
  accessory: string
}
Catalog source: `src/data/appearanceCatalog.js`

## Wardrobe storage

The penguin document at `penguins/{uid}` stores what the player is
currently wearing in `appearance`: `color`, `hat`, `glasses`,
`outfit`, and `accessory`. An empty equipment slot means nothing
is equipped in that slot.

Owned items are stored separately at
`penguins/{uid}/ownedItems/{itemKey}`. Each document records the
item's catalog ID and slot. Use a stable key such as `hat:beanie`
so the same item cannot be granted twice.

Body color remains an appearance choice. For equipment, the
player may clear a slot or equip a catalog item they own.
Existing penguins keep their saved appearance. Before enforcing
ownership on wardrobe edits, decide which items are free starters
and how existing selections receive ownership records.

## Integration

After login, if no penguin document exists, the app shows
`CustomisationMenu`. Confirming a look calls
`createPenguin(appearance)` from `src/services/penguinService.js`,
then the campus map loads.

## Pending
- Swap placeholder swatches for real hat / glasses / outfit / accessory art
- Layer cosmetics onto the gator preview
- Optional later: allow appearance updates after creation
