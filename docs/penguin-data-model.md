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
## Integration

After login, if no penguin document exists, the app shows
`CustomisationMenu`. Confirming a look calls
`createPenguin(appearance)` from `src/services/penguinService.js`,
then the campus map loads.

## Pending
- Swap placeholder swatches for real hat / glasses / outfit / accessory art
- Layer cosmetics onto the gator preview
- Optional later: allow appearance updates after creation
