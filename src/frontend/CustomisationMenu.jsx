import { useEffect, useMemo, useState } from "react";
import gatorSrc from "../assets/gator.png";
import skySrc from "../assets/sky_background.png";
import {
  BODY_COLORS,
  CATALOG,
  CATEGORIES,
  ITEMS_PER_PAGE,
  getColorHex,
  getDefaultAppearance,
} from "../data/appearanceCatalog";
import { recolorGatorSrc } from "../utils/recolorGator";
import GrassGround from "./GrassGround";
import "./CustomisationMenu.css";

export default function CustomisationMenu({
  username,
  initialAppearance,
  onConfirm,
  onBack,
  onLogout,
  submitting = false,
  error = "",
}) {
  const [appearance, setAppearance] = useState(
  () => initialAppearance ?? getDefaultAppearance()
  );
  const [categoryId, setCategoryId] = useState("hat");
  const [page, setPage] = useState(0);
  const [previewSrc, setPreviewSrc] = useState(gatorSrc);
  const category = CATEGORIES.find((c) => c.id === categoryId) ?? CATEGORIES[0];
  const items = CATALOG[categoryId] ?? [];
  const pageCount = Math.max(1, Math.ceil(items.length / ITEMS_PER_PAGE));
  

  const pageItems = useMemo(() => {
    const slice = items.slice(
      page * ITEMS_PER_PAGE,
      page * ITEMS_PER_PAGE + ITEMS_PER_PAGE
    );
    const padded = [...slice];
    while (padded.length < ITEMS_PER_PAGE) padded.push(null);
    return padded;
  }, [items, page]);

  useEffect(() => {
    let cancelled = false;
    const hex = getColorHex(appearance.color);
    recolorGatorSrc(gatorSrc, hex)
      .then((src) => {
        if (!cancelled) setPreviewSrc(src);
      })
      .catch(() => {
        if (!cancelled) setPreviewSrc(gatorSrc);
      });
    return () => {
      cancelled = true;
    };
  }, [appearance.color]);

  function selectCategory(id) {
    setCategoryId(id);
    setPage(0);
  }

  function selectItem(item) {
    if (!item) return;
    setAppearance((prev) => ({
      ...prev,
      [categoryId]: item.id,
    }));
  }

  function selectColor(colorId) {
    setAppearance((prev) => ({ ...prev, color: colorId }));
  }

  return (
    <main className="cm-scene">
      <img className="cm-sky" src={skySrc} alt="" aria-hidden="true" />
      <GrassGround />

      {onBack && (
        <button
          type="button"
          className="cm-back-hub"
          disabled={submitting}
          onClick={onBack}
        >
          Back to hub
        </button>
      )}

      <div className="cm-layout">
        <section className="cm-panel" aria-label="Item selection">
          <div className="cm-tabs" role="tablist" aria-label="Cosmetic categories">
            {CATEGORIES.map((cat) => {
              const active = cat.id === categoryId;
              return (
                <button
                  key={cat.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  className={`cm-tab${active ? " is-active" : ""}`}
                  style={{ "--tab-bg": cat.tabColor }}
                  onClick={() => selectCategory(cat.id)}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          <div className="cm-panel-body">
            <header
              className="cm-panel-header"
              style={{ background: category.headerColor }}
            >
              {category.label}
            </header>

            <div className="cm-grid" role="listbox" aria-label={`${category.label} items`}>
              {pageItems.map((item, index) => {
                if (!item) {
                  return (
                    <div
                      key={`empty-${index}`}
                      className="cm-slot cm-slot--empty"
                      aria-hidden="true"
                    />
                  );
                }

                const selected = appearance[categoryId] === item.id;
                return (
                  <button
                    key={item.id || `none-${categoryId}`}
                    type="button"
                    role="option"
                    aria-selected={selected}
                    className={`cm-slot${selected ? " is-selected" : ""}`}
                    onClick={() => selectItem(item)}
                    title={item.label}
                  >
                    <span
                      className="cm-slot-swatch"
                      style={{ background: item.swatch }}
                      aria-hidden="true"
                    />
                    <span className="cm-slot-label">{item.label}</span>
                  </button>
                );
              })}
            </div>

            <div className="cm-pager">
              <button
                type="button"
                className="cm-pager-btn"
                aria-label="Previous page"
                disabled={page <= 0}
                onClick={() => setPage((p) => Math.max(0, p - 1))}
              >
                ◀
              </button>
              <span className="cm-pager-label">
                {page + 1} / {pageCount}
              </span>
              <button
                type="button"
                className="cm-pager-btn"
                aria-label="Next page"
                disabled={page >= pageCount - 1}
                onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              >
                ▶
              </button>
            </div>
          </div>
        </section>

        <section className="cm-preview" aria-label="Character preview">
          <div className="cm-gator-wrap">
            <img
              className="cm-gator"
              src={previewSrc}
              alt="Your gator"
              draggable={false}
            />
          </div>

          <label className="cm-username">
            <span className="visually-hidden">Username</span>
            <input
              type="text"
              value={username || ""}
              readOnly
              tabIndex={0}
              aria-readonly="true"
              placeholder="Username"
            />
          </label>

          <div
            className="cm-colors"
            role="radiogroup"
            aria-label="Body color"
          >
            {BODY_COLORS.map((color) => {
              const selected = appearance.color === color.id;
              return (
                <button
                  key={color.id}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  aria-label={color.label}
                  className={`cm-color${selected ? " is-selected" : ""}`}
                  style={{ background: color.hex }}
                  onClick={() => selectColor(color.id)}
                />
              );
            })}
          </div>

          {error && (
            <p className="cm-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="button"
            className="cm-confirm"
            disabled={submitting}
            onClick={() => onConfirm(appearance)}
          >
            {submitting ? "Saving..." : "Confirm look"}
          </button>

          {onLogout && (
            <button
              type="button"
              className="cm-logout"
              disabled={submitting}
              onClick={onLogout}
            >
              Log out
            </button>
          )}
        </section>
      </div>
    </main>
  );
}
