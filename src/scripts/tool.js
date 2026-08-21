// Browser wiring only. Mapping lives in generator.js — do not duplicate it.
import { applyStyle, countCharacters } from './generator.js';
import { styles } from '../data/styles.ts';

const DEBOUNCE_MS = 120;
const COPY_LABEL_MS = 2000;
const FAV_STORAGE_KEY = 'fontly-favourites';

/** @type {Map<string, import('../data/styles.ts').Style>} */
const styleById = new Map(styles.map((s) => [s.id, s]));

/**
 * @returns {Set<string>}
 */
function readFavourites() {
  try {
    const raw = localStorage.getItem(FAV_STORAGE_KEY);
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return new Set();
    return new Set(parsed.filter((id) => typeof id === 'string'));
  } catch {
    return new Set();
  }
}

/**
 * @param {Set<string>} favs
 * @returns {void}
 */
function writeFavourites(favs) {
  try {
    localStorage.setItem(FAV_STORAGE_KEY, JSON.stringify([...favs]));
  } catch {
    // Quota or private mode — favourites stay session-only.
  }
}

/**
 * @param {string} text
 * @returns {boolean}
 */
function textHasDigit(text) {
  for (const ch of text) {
    const code = ch.codePointAt(0);
    if (code !== undefined && code >= 0x30 && code <= 0x39) return true;
  }
  return false;
}

/**
 * @param {string} text
 * @param {HTMLElement} card
 * @returns {void}
 */
function updateCard(card, text) {
  const id = card.getAttribute('data-style-id');
  if (!id) return;
  const style = styleById.get(id);
  if (!style) return;
  const outputEl = card.querySelector('[data-output]');
  if (!(outputEl instanceof HTMLElement)) return;
  const styled = applyStyle(text, style);
  outputEl.textContent = styled;
  const { utf16Length } = countCharacters(styled);
  const utfEl = card.querySelector('[data-counter-utf16]');
  if (utfEl) utfEl.textContent = String(utf16Length);

  if (card.getAttribute('data-has-digit-note') === 'true') {
    const note = card.querySelector('[data-digits-note]');
    if (note instanceof HTMLElement) {
      note.hidden = !(style.digits === null && textHasDigit(text));
    }
  }

  card.setAttribute('data-needs-update', 'false');
}

/**
 * @param {string} text
 * @returns {Promise<boolean>}
 */
async function copyText(text) {
  if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      // Fall through to execCommand.
    }
  }
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.position = 'fixed';
  ta.style.top = '0';
  ta.style.left = '0';
  ta.style.opacity = '0';
  document.body.appendChild(ta);
  ta.select();
  let ok = false;
  try {
    ok = document.execCommand('copy');
  } catch {
    ok = false;
  }
  document.body.removeChild(ta);
  return ok;
}

/**
 * @param {string} message
 * @returns {void}
 */
function announce(message) {
  const live = document.querySelector('[data-copy-status]');
  if (!(live instanceof HTMLElement)) return;
  live.textContent = '';
  // Force a fresh announcement when the same style is copied twice.
  requestAnimationFrame(() => {
    live.textContent = message;
  });
}

function initTool() {
  const root = document.querySelector('[data-tool]');
  if (!(root instanceof HTMLElement)) return;

  const input = root.querySelector('#tool-input');
  if (!(input instanceof HTMLInputElement)) return;

  const inputCpEl = root.querySelector('[data-input-codepoints]');
  const emptyFavEl = root.querySelector('[data-favourites-empty]');

  /** @type {NodeListOf<HTMLElement>} */
  const cards = root.querySelectorAll('.tool-card');
  /** @type {NodeListOf<HTMLElement>} */
  const sections = root.querySelectorAll('.tool__category');
  /** @type {NodeListOf<HTMLButtonElement>} */
  const chips = root.querySelectorAll('.tool__chip');

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;
  /** @type {WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>} */
  const copyTimers = new WeakMap();

  let activeFilter = 'all';
  const favourites = readFavourites();

  // Mark favourites only — do not reorder cards on load (avoids layout shift).
  for (const card of cards) {
    const id = card.getAttribute('data-style-id');
    const isFav = id !== null && favourites.has(id);
    card.setAttribute('data-favourite', isFav ? 'true' : 'false');
    const favBtn = card.querySelector('[data-fav]');
    if (favBtn instanceof HTMLButtonElement) {
      favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
      favBtn.classList.toggle('is-on', isFav);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const text = input.value;
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const card = entry.target;
        if (!(card instanceof HTMLElement)) continue;
        if (card.getAttribute('data-needs-update') === 'true') {
          updateCard(card, text);
        }
      }
    },
    { root: null, rootMargin: '0px', threshold: 0 },
  );

  for (const card of cards) {
    observer.observe(card);
  }

  /**
   * @param {string} text
   * @returns {void}
   */
  function refreshVisible(text) {
    if (inputCpEl) {
      inputCpEl.textContent = String(countCharacters(text).codePoints);
    }
    for (const card of cards) {
      const rect = card.getBoundingClientRect();
      const inView =
        rect.bottom > 0 &&
        rect.top < (window.innerHeight || document.documentElement.clientHeight);
      if (inView) {
        updateCard(card, text);
      } else {
        card.setAttribute('data-needs-update', 'true');
      }
    }
  }

  /**
   * @returns {void}
   */
  function applyFilter() {
    let anyFavVisible = false;

    for (const section of sections) {
      const catId = section.getAttribute('data-category');
      /** @type {NodeListOf<HTMLElement>} */
      const sectionCards = section.querySelectorAll('.tool-card');
      let visibleInSection = 0;

      for (const card of sectionCards) {
        const isFav = card.getAttribute('data-favourite') === 'true';
        let show = false;
        if (activeFilter === 'all') {
          show = true;
        } else if (activeFilter === 'favourites') {
          show = isFav;
          if (show) anyFavVisible = true;
        } else {
          show = catId === activeFilter;
        }
        card.hidden = !show;
        if (show) visibleInSection += 1;
      }

      if (activeFilter === 'favourites') {
        section.hidden = visibleInSection === 0;
      } else if (activeFilter === 'all') {
        section.hidden = false;
      } else {
        section.hidden = catId !== activeFilter;
      }
    }

    if (emptyFavEl instanceof HTMLElement) {
      emptyFavEl.hidden = !(activeFilter === 'favourites' && !anyFavVisible);
    }
  }

  input.addEventListener('input', () => {
    if (debounceTimer !== undefined) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refreshVisible(input.value);
    }, DEBOUNCE_MS);
  });

  root.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const chip = target.closest('.tool__chip');
    if (chip instanceof HTMLButtonElement && root.contains(chip)) {
      const filter = chip.getAttribute('data-filter');
      if (!filter) return;
      activeFilter = filter;
      for (const c of chips) {
        const on = c === chip;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      applyFilter();
      return;
    }

    const favBtn = target.closest('[data-fav]');
    if (favBtn instanceof HTMLButtonElement) {
      const card = favBtn.closest('.tool-card');
      if (!(card instanceof HTMLElement)) return;
      const id = card.getAttribute('data-style-id');
      if (!id) return;
      if (favourites.has(id)) {
        favourites.delete(id);
      } else {
        favourites.add(id);
      }
      writeFavourites(favourites);
      const isFav = favourites.has(id);
      card.setAttribute('data-favourite', isFav ? 'true' : 'false');
      favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
      favBtn.classList.toggle('is-on', isFav);
      // Re-apply only when the Favourites filter is active (reorder/filter after click).
      if (activeFilter === 'favourites') applyFilter();
      return;
    }

    const button = target.closest('[data-copy]');
    if (!(button instanceof HTMLButtonElement)) return;
    const card = button.closest('.tool-card');
    if (!(card instanceof HTMLElement)) return;
    const output = card.querySelector('[data-output]');
    if (!(output instanceof HTMLElement)) return;
    const nameEl = card.querySelector('.tool-card__name');
    const styleName = nameEl?.textContent?.trim() || 'style';
    const text = output.textContent ?? '';
    const ok = await copyText(text);
    if (ok) {
      announce(`Copied ${styleName}`);
      const prev = copyTimers.get(button);
      if (prev !== undefined) clearTimeout(prev);
      button.textContent = 'Copied';
      copyTimers.set(
        button,
        setTimeout(() => {
          button.textContent = 'Copy';
          copyTimers.delete(button);
        }, COPY_LABEL_MS),
      );
    } else {
      announce('Copy failed');
    }
  });
}

initTool();
