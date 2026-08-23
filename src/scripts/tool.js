// Browser wiring only. Mapping lives in generator.js — do not duplicate it.
import { applyStyle, countCharacters } from './generator.js';
import { styles } from '../data/styles.ts';
import { decorations, applyDecoration } from '../data/decorations.ts';

const DEBOUNCE_MS = 120;
const COPY_LABEL_MS = 2000;
const FAV_STORAGE_KEY = 'fontly-favourites';
const RECENTS_STORAGE_KEY = 'fontly-recents';
const RECENTS_MAX = 8;
const PREVIEW_SIZES = ['1.125rem', '1.5rem', '1.875rem'];

/** @type {Map<string, import('../data/styles.ts').Style>} */
const styleById = new Map(styles.map((s) => [s.id, s]));

/** Wrappers, not styles. Ids never collide with a style id. */
/** @type {Map<string, import('../data/decorations.ts').Decoration>} */
const decorationById = new Map(decorations.map((d) => [d.id, d]));

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
 * Most-recent first. Membership only — never used to reorder the DOM.
 * @returns {string[]}
 */
function readRecents() {
  try {
    const raw = localStorage.getItem(RECENTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((id) => typeof id === 'string').slice(0, RECENTS_MAX);
  } catch {
    return [];
  }
}

/**
 * @param {string[]} ids
 * @returns {void}
 */
function writeRecents(ids) {
  try {
    localStorage.setItem(RECENTS_STORAGE_KEY, JSON.stringify(ids));
  } catch {
    // Quota or private mode — recents stay session-only.
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
 * Title-case by code point so astral characters are not split.
 * @param {string} text
 * @returns {string}
 */
function toTitleCase(text) {
  let out = '';
  let atWordStart = true;
  for (const ch of text) {
    if (/\s/u.test(ch)) {
      out += ch;
      atWordStart = true;
      continue;
    }
    out += atWordStart ? ch.toUpperCase() : ch.toLowerCase();
    atWordStart = false;
  }
  return out;
}

/**
 * @param {string} text
 * @param {HTMLElement} card
 * @returns {void}
 */
function updateCard(card, text) {
  const id = card.getAttribute('data-card-id');
  if (!id) return;
  const style = styleById.get(id);
  const decoration = style === undefined ? decorationById.get(id) : undefined;
  if (style === undefined && decoration === undefined) return;
  const outputEl = card.querySelector('[data-output]');
  if (!(outputEl instanceof HTMLElement)) return;
  const empty = text.length === 0;
  // Empty input: the sample is the card's own name, styles and decorations alike.
  const source = empty ? (style ?? decoration).name : text;
  const styled = style
    ? applyStyle(source, style)
    : applyDecoration(source, /** @type {NonNullable<typeof decoration>} */ (decoration));
  outputEl.textContent = styled;
  const { utf16Length } = countCharacters(styled);
  const utfEl = card.querySelector('[data-counter-utf16]');
  if (utfEl) utfEl.textContent = String(utf16Length);
  const unitsEl = card.querySelector('.tool-card__units');
  if (unitsEl instanceof HTMLElement) {
    // Empty input: no box. Typing is an interaction; DEBOUNCE_MS is 120, so
    // the later reserved-height growth is excluded from CLS.
    unitsEl.hidden = empty;
  }

  if (style && card.getAttribute('data-has-digit-note') === 'true') {
    const note = card.querySelector('[data-digits-note]');
    if (note instanceof HTMLElement) {
      note.hidden = empty;
      // Once text exists, visibility keeps the note's line reserved.
      note.classList.toggle(
        'is-quiet',
        !(style.digits === null && textHasDigit(text)),
      );
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

/**
 * @param {HTMLButtonElement} favBtn
 * @param {string} cardName
 * @param {boolean} isFav
 * @returns {void}
 */
function syncFavButton(favBtn, cardName, isFav) {
  favBtn.setAttribute('aria-pressed', isFav ? 'true' : 'false');
  favBtn.classList.toggle('is-on', isFav);
  favBtn.setAttribute(
    'aria-label',
    isFav ? `Remove ${cardName} from favourites` : `Add ${cardName} to favourites`,
  );
}

function initTool() {
  const root = document.querySelector('[data-tool]');
  if (!(root instanceof HTMLElement)) return;

  const input = root.querySelector('#tool-input');
  if (!(input instanceof HTMLInputElement)) return;

  const searchInput = root.querySelector('#tool-search');
  const inputCpEl = root.querySelector('[data-input-codepoints]');
  const emptyFavEl = root.querySelector('[data-favourites-empty]');
  const emptyRecentsEl = root.querySelector('[data-recents-empty]');
  const emptySearchEl = root.querySelector('[data-search-empty]');
  const previewInput = root.querySelector('#tool-preview-size');

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

  /** @type {Map<string, HTMLElement>} */
  const cardById = new Map();
  for (const card of cards) {
    const id = card.getAttribute('data-card-id');
    if (id) cardById.set(id, card);
  }

  /**
   * Cards currently intersecting the viewport. Updated only from
   * IntersectionObserver entry.isIntersecting — never from measured geometry.
   * @type {Set<string>}
   */
  const visibleIds = new Set();

  let activeFilter = 'all';
  const favourites = readFavourites();
  let recents = readRecents();

  // Mark favourites only — do not reorder cards on load (avoids layout shift).
  for (const card of cards) {
    const id = card.getAttribute('data-card-id');
    const isFav = id !== null && favourites.has(id);
    card.setAttribute('data-favourite', isFav ? 'true' : 'false');
    const favBtn = card.querySelector('[data-fav]');
    const nameEl = card.querySelector('.tool-card__name');
    const cardName = nameEl?.textContent?.trim() || 'card';
    if (favBtn instanceof HTMLButtonElement) {
      syncFavButton(favBtn, cardName, isFav);
    }
  }

  const observer = new IntersectionObserver(
    (entries) => {
      const text = input.value;
      for (const entry of entries) {
        const card = entry.target;
        if (!(card instanceof HTMLElement)) continue;
        const id = card.getAttribute('data-card-id');
        if (!id) continue;
        if (entry.isIntersecting) {
          visibleIds.add(id);
          if (card.getAttribute('data-needs-update') === 'true') {
            updateCard(card, text);
          }
        } else {
          visibleIds.delete(id);
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
      card.setAttribute('data-needs-update', 'true');
    }
    for (const id of visibleIds) {
      const card = cardById.get(id);
      if (card) updateCard(card, text);
    }
  }

  /**
   * Chip filter AND search query. Both must pass for a card to show.
   * @returns {void}
   */
  function applyFilter() {
    const query =
      searchInput instanceof HTMLInputElement
        ? searchInput.value.trim().toLowerCase()
        : '';
    let anyFavMatch = false;
    let anyRecentMatch = false;
    let anyShown = false;

    for (const section of sections) {
      const catId = section.getAttribute('data-category');
      /** @type {NodeListOf<HTMLElement>} */
      const sectionCards = section.querySelectorAll('.tool-card');
      let visibleInSection = 0;

      for (const card of sectionCards) {
        const isFav = card.getAttribute('data-favourite') === 'true';
        const name = card.getAttribute('data-card-name') || '';
        const id = card.getAttribute('data-card-id') || '';
        let chipOk = false;
        if (activeFilter === 'all') {
          chipOk = true;
        } else if (activeFilter === 'favourites') {
          chipOk = isFav;
          if (chipOk) anyFavMatch = true;
        } else if (activeFilter === 'recent') {
          chipOk = recents.includes(id);
          if (chipOk) anyRecentMatch = true;
        } else {
          chipOk = catId === activeFilter;
        }
        const searchOk = query === '' || name.includes(query);
        const show = chipOk && searchOk;
        card.hidden = !show;
        if (show) {
          visibleInSection += 1;
          anyShown = true;
        }
      }

      if (activeFilter === 'favourites' || activeFilter === 'recent') {
        section.hidden = visibleInSection === 0;
      } else if (activeFilter === 'all') {
        section.hidden = visibleInSection === 0 && query !== '';
      } else {
        section.hidden = catId !== activeFilter || visibleInSection === 0;
      }
    }

    if (emptyFavEl instanceof HTMLElement) {
      emptyFavEl.hidden = !(
        activeFilter === 'favourites' &&
        query === '' &&
        !anyFavMatch
      );
    }
    if (emptyRecentsEl instanceof HTMLElement) {
      emptyRecentsEl.hidden = !(
        activeFilter === 'recent' &&
        query === '' &&
        !anyRecentMatch
      );
    }
    if (emptySearchEl instanceof HTMLElement) {
      emptySearchEl.hidden = !(query !== '' && !anyShown);
    }
  }

  input.addEventListener('input', () => {
    if (debounceTimer !== undefined) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refreshVisible(input.value);
    }, DEBOUNCE_MS);
  });

  if (searchInput instanceof HTMLInputElement) {
    searchInput.addEventListener('input', () => {
      applyFilter();
    });
  }

  root.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const caseBtn = target.closest('[data-case]');
    if (caseBtn instanceof HTMLButtonElement && root.contains(caseBtn)) {
      const mode = caseBtn.getAttribute('data-case');
      if (mode === 'upper') input.value = input.value.toUpperCase();
      else if (mode === 'lower') input.value = input.value.toLowerCase();
      else if (mode === 'title') input.value = toTitleCase(input.value);
      else return;
      // Same refresh path as debounced typing — no second update mechanism.
      refreshVisible(input.value);
      return;
    }

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
      const id = card.getAttribute('data-card-id');
      if (!id) return;
      if (favourites.has(id)) {
        favourites.delete(id);
      } else {
        favourites.add(id);
      }
      writeFavourites(favourites);
      const isFav = favourites.has(id);
      card.setAttribute('data-favourite', isFav ? 'true' : 'false');
      const nameEl = card.querySelector('.tool-card__name');
      const cardName = nameEl?.textContent?.trim() || 'card';
      syncFavButton(favBtn, cardName, isFav);
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
    const cardName = nameEl?.textContent?.trim() || 'card';
    const text = output.textContent ?? '';
    const ok = await copyText(text);
    if (ok) {
      const copiedId = card.getAttribute('data-card-id');
      if (copiedId) {
        recents = [copiedId, ...recents.filter((x) => x !== copiedId)].slice(
          0,
          RECENTS_MAX,
        );
        writeRecents(recents);
        if (activeFilter === 'recent') applyFilter();
      }
      announce(`Copied ${cardName}`);
      const prev = copyTimers.get(button);
      if (prev !== undefined) clearTimeout(prev);
      // Class toggle only — button box size is reserved in CSS from first paint.
      button.classList.add('is-copied');
      copyTimers.set(
        button,
        setTimeout(() => {
          button.classList.remove('is-copied');
          copyTimers.delete(button);
        }, COPY_LABEL_MS),
      );
    } else {
      announce('Copy failed');
    }
  });

  if (previewInput instanceof HTMLInputElement) {
    previewInput.addEventListener('input', () => {
      const index = Number(previewInput.value);
      const size = PREVIEW_SIZES[index] ?? PREVIEW_SIZES[1];
      root.style.setProperty('--preview-size', size);
    });
  }
}

initTool();
