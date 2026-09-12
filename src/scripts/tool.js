// Browser wiring only. Mapping lives in generator.js — do not duplicate it.
import { applyStyle, applyCombination, applyCombo, countCharacters } from './generator.js';
import { styles, DIGITS_NOTE } from '../data/styles.ts';
import { decorations, applyDecoration } from '../data/decorations.ts';
import { effects, applyEffect } from '../data/effects.ts';
import { combinations } from '../data/combinations.ts';
import { separators } from '../data/separators.ts';

const DEBOUNCE_MS = 120;
const COPY_LABEL_MS = 2000;
const FAV_STORAGE_KEY = 'fonti-favourites';
const RECENTS_STORAGE_KEY = 'fonti-recents';
const RECENTS_MAX = 8;
const PREVIEW_SIZES = ['1.125rem', '1.5rem', '1.875rem'];
const SECTION_ROOT_MARGIN = '800px';
const CARD_ROOT_MARGIN = '200px';
const IG_BIO_LIMIT = 150;
const TT_BIO_LIMIT = 80;
const LIVE_STATIC_IG_NAME = 'Your Brand Name';
const LIVE_STATIC_TT_NAME = 'Your Display Name';
const LIVE_STATIC_BIO = 'A short bio to describe your brand';

/** @type {Map<string, import('../data/styles.ts').Style>} */
const styleById = new Map(styles.map((s) => [s.id, s]));

/** Wrappers, not styles. Ids never collide with a style id. */
/** @type {Map<string, import('../data/decorations.ts').Decoration>} */
const decorationById = new Map(decorations.map((d) => [d.id, d]));

/** Combining marks, not styles. Ids never collide with a style id. */
/** @type {Map<string, import('../data/effects.ts').Effect>} */
const effectById = new Map(effects.map((e) => [e.id, e]));

/** Alphabet + decoration pairs. Ids never collide with a style id. */
/** @type {Map<string, import('../data/combinations.ts').Combination>} */
const combinationById = new Map(combinations.map((c) => [c.id, c]));

/** @type {Map<string, import('../data/separators.ts').Separator>} */
const separatorById = new Map(separators.map((s) => [s.id, s]));

const groupSectionsRaw =
  document.querySelector('[data-tool]')?.getAttribute('data-group-sections') ?? '';
if (!groupSectionsRaw.trim()) {
  console.error('[fonti] Missing or empty data-group-sections attribute');
}
const DECORATION_GROUP_IDS = new Set(
  groupSectionsRaw.trim() ? groupSectionsRaw.trim().split(/\s+/) : [],
);

/**
 * Membership string for a decoration card. cute is derived from stars/hearts.
 * @param {string} group
 * @returns {string}
 */
function decorationMembership(group) {
  let membership = `decorated ${group}`;
  if (group === 'stars' || group === 'hearts') {
    membership += ' cute';
  }
  return membership;
}

/**
 * Catalogue row used for filtering and mounting. Not the DOM.
 * @typedef {{
 *   id: string,
 *   name: string,
 *   searchName: string,
 *   category: string,
 *   membership: string,
 *   caveat: string | null,
 *   caveatNote: string | null,
 *   caseNote: string | null,
 *   digitsPassThrough: boolean,
 * }} CardData
 */

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
 * @param {string} categoryId
 * @returns {CardData[]}
 */
function catalogForCategory(categoryId) {
  if (DECORATION_GROUP_IDS.has(categoryId)) {
    return decorations
      .filter((decoration) => decoration.group === categoryId)
      .map((decoration) => ({
        id: decoration.id,
        name: decoration.name,
        searchName: decoration.name.toLowerCase(),
        category: categoryId,
        membership: decorationMembership(decoration.group),
        caveat: decoration.caveat,
        caveatNote: null,
        caseNote: null,
        digitsPassThrough: false,
      }));
  }
  if (categoryId === 'effects') {
    return effects.map((effect) => ({
      id: effect.id,
      name: effect.name,
      searchName: effect.name.toLowerCase(),
      category: 'effects',
      membership: 'effects',
      caveat: effect.caveat,
      caveatNote: effect.caveatNote,
      caseNote: null,
      digitsPassThrough: false,
    }));
  }
  if (categoryId === 'combined') {
    return combinations.map((combination) => {
      const style = styleById.get(combination.style);
      return {
        id: combination.id,
        name: combination.name,
        searchName: combination.name.toLowerCase(),
        category: 'combined',
        membership: combination.categories.join(' '),
        caveat: style ? style.caveat : null,
        caveatNote: style && style.caveatNote ? style.caveatNote : null,
        caseNote: style ? style.caseNote : null,
        digitsPassThrough: style ? style.digits === null : false,
      };
    });
  }
  return styles
    .filter((style) => style.categories.includes(categoryId))
    .map((style) => ({
      id: style.id,
      name: style.name,
      searchName: style.name.toLowerCase(),
      category: categoryId,
      membership: style.categories.join(' '),
      caveat: style.caveat,
      caveatNote: style.caveatNote ?? null,
      caseNote: style.caseNote,
      digitsPassThrough: style.digits === null,
    }));
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
  const effect = style === undefined && decoration === undefined ? effectById.get(id) : undefined;
  const combination =
    style === undefined && decoration === undefined && effect === undefined
      ? combinationById.get(id)
      : undefined;
  if (style === undefined && decoration === undefined && effect === undefined && combination === undefined)
    return;
  // Combination cards look up by pair id; digit notes and applyCombination need the parent alphabet.
  const parentStyle = combination
    ? /** @type {NonNullable<import('../data/styles.ts').Style>} */ (styleById.get(combination.style))
    : style;
  const outputEl = card.querySelector('[data-output]');
  if (!(outputEl instanceof HTMLElement)) return;
  const empty = text.length === 0;
  // Empty input: the sample is the card's own name, styles, decorations and effects alike.
  const source = empty ? (style ?? decoration ?? effect ?? combination).name : text;
  const styled = style
    ? applyStyle(source, style)
    : decoration
      ? applyDecoration(source, decoration)
      : combination
        ? applyCombination(
            source,
            parentStyle,
            /** @type {NonNullable<import('../data/decorations.ts').Decoration>} */ (
              decorationById.get(combination.decoration)
            ),
          )
        : applyEffect(source, /** @type {NonNullable<typeof effect>} */ (effect));
  outputEl.textContent = styled;

  if ((style ?? combination) && card.getAttribute('data-has-digit-note') === 'true') {
    const note = card.querySelector('[data-digits-note]');
    if (note instanceof HTMLElement) {
      note.hidden = empty;
      // Once text exists, visibility keeps the note's line reserved.
      note.classList.toggle(
        'is-quiet',
        !(parentStyle.digits === null && textHasDigit(text)),
      );
    }
  }

  card.setAttribute('data-needs-update', 'false');
}

/**
 * Styled sample for a catalogue id. Empty input uses the record's name,
 * matching updateCard — never a blank string.
 * @param {string} id
 * @param {string} text
 * @returns {{ name: string, styled: string } | null}
 */
function renderById(id, text) {
  const style = styleById.get(id);
  const decoration = style === undefined ? decorationById.get(id) : undefined;
  const effect = style === undefined && decoration === undefined ? effectById.get(id) : undefined;
  const combination =
    style === undefined && decoration === undefined && effect === undefined
      ? combinationById.get(id)
      : undefined;
  const record = style ?? decoration ?? effect ?? combination;
  if (record === undefined) return null;
  const parentStyle = combination
    ? /** @type {NonNullable<import('../data/styles.ts').Style>} */ (styleById.get(combination.style))
    : style;
  const source = text.length === 0 ? record.name : text;
  const styled = style
    ? applyStyle(source, style)
    : decoration
      ? applyDecoration(source, decoration)
      : combination
        ? applyCombination(
            source,
            parentStyle,
            /** @type {NonNullable<import('../data/decorations.ts').Decoration>} */ (
              decorationById.get(combination.decoration)
            ),
          )
        : applyEffect(source, /** @type {NonNullable<typeof effect>} */ (effect));
  return { name: record.name, styled };
}

/**
 * Recompute a card when its output may be read but typing skipped it.
 * @param {HTMLElement} card
 * @param {string} text
 * @returns {void}
 */
function ensureCardFresh(card, text) {
  if (card.getAttribute('data-needs-update') === 'true') {
    updateCard(card, text);
  }
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
 * @param {Element | null} el
 * @param {number} units UTF-16 length compared against the platform limit
 * @param {number} chars code-point count of the visible slot
 * @param {number} limit
 * @param {string} app
 * @returns {void}
 */
function syncLiveMeta(el, units, chars, limit, app) {
  if (!(el instanceof HTMLElement)) return;
  el.textContent =
    units === chars
      ? `${units} / ${limit}`
      : `${units} / ${limit} units (${chars} characters)`;
  const over = units > limit;
  el.classList.toggle('is-over', over);
  if (over) {
    el.setAttribute(
      'aria-label',
      app === 'TikTok'
        ? `${units} of 80 units, ${chars} characters typed. TikTok bios are usually limited to 80 characters, though some accounts allow more.`
        : `${units} of 150 units, ${chars} characters typed. Exceeds Instagram's limit.`,
    );
  } else {
    el.setAttribute(
      'aria-label',
      `${units} of ${limit} units, ${chars} characters typed`,
    );
  }
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
  const cardTemplate = root.querySelector('#tool-card-template');
  if (!(cardTemplate instanceof HTMLTemplateElement)) return;

  /** @type {NodeListOf<HTMLElement>} */
  const sections = root.querySelectorAll('.tool__category');
  /** @type {NodeListOf<HTMLButtonElement>} */
  const chips = root.querySelectorAll('.tool__chip');
  const builderEntrance = root.querySelector(
    '.tool__case-btn[data-filter="combo"]',
  );
  const livePanel = root.querySelector('#tool-live-preview');
  const liveToggle = root.querySelector('[aria-controls="tool-live-preview"]');
  let livePreviewOpen = false;
  const liveStyleEl = root.querySelector('[data-live-style]');
  const liveIgName = root.querySelector('[data-live-ig-name]');
  const liveIgBio = root.querySelector('[data-live-ig-bio]');
  const liveIgMeta = root.querySelector('[data-live-ig-meta]');
  const liveIgCaption = root.querySelector('[data-live-ig-caption]');
  const liveTtName = root.querySelector('[data-live-tt-name]');
  const liveTtBio = root.querySelector('[data-live-tt-bio]');
  const liveTtMeta = root.querySelector('[data-live-tt-meta]');
  const liveTtCaption = root.querySelector('[data-live-tt-caption]');
  const liveIgArticle = liveIgName instanceof Element ? liveIgName.closest('article') : null;
  const liveTtArticle = liveTtName instanceof Element ? liveTtName.closest('article') : null;
  const liveTargetRow = root.querySelector('[data-live-target-row]');
  /** @type {'name' | 'bio' | 'both'} */
  let liveTarget = 'bio';

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;
  /** @type {WeakMap<HTMLButtonElement, ReturnType<typeof setTimeout>>} */
  const copyTimers = new WeakMap();

  /**
   * Live registry of mounted cards. One style id may have several DOM nodes
   * (one per section it belongs to). Mounting appends; never a frozen NodeList.
   * @type {Map<string, HTMLElement[]>}
   */
  const cardById = new Map();

  /**
   * Cards currently intersecting the viewport. Stores elements, not ids, so
   * two copies of the same style can be visible independently.
   * @type {Set<HTMLElement>}
   */
  const visibleCards = new Set();

  let activeFilter = 'all';
  const favourites = readFavourites();
  let recents = readRecents();

  /**
   * Catalogue keyed by section id, built once from data imports.
   * @type {Map<string, CardData[]>}
   */
  const catalogByCategory = new Map();
  for (const section of sections) {
    const catId = section.getAttribute('data-category');
    if (!catId) continue;
    catalogByCategory.set(catId, catalogForCategory(catId));
  }

  const comboStyleGroup = root.querySelector('#tool-combo-style');
  const comboSeparatorGroup = root.querySelector('#tool-combo-separator');
  const comboWrapperGroup = root.querySelector('#tool-combo-wrapper');
  const comboOutputEl = root.querySelector('[data-combo-output]');
  const comboCountEl = root.querySelector('[data-combo-count]');
  const comboCaveatEl = root.querySelector('[data-combo-caveat]');
  const comboCaseNoteEl = root.querySelector('[data-combo-case-note]');
  const comboDigitsNoteEl = root.querySelector('[data-combo-digits-note]');
  const comboCaveatNoteEl = root.querySelector('[data-combo-caveat-note]');

  /**
   * @param {string} id
   * @param {string} label
   * @param {boolean} pressed
   * @param {{ title?: string, ariaLabel?: string }} [opts]
   * @returns {HTMLButtonElement}
   */
  function createComboButton(id, label, pressed, opts) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'tool__combo-btn';
    btn.setAttribute('data-combo-id', id);
    btn.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    btn.textContent = label;
    if (opts?.title) btn.title = opts.title;
    if (opts?.ariaLabel) btn.setAttribute('aria-label', opts.ariaLabel);
    return btn;
  }

  if (comboStyleGroup instanceof HTMLElement) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createComboButton('', 'Plain', true));
    for (const style of styles) {
      fragment.appendChild(createComboButton(style.id, style.name, false));
    }
    comboStyleGroup.appendChild(fragment);
  }

  if (comboSeparatorGroup instanceof HTMLElement) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createComboButton('', 'None', true));
    for (const separator of separators) {
      const isSpace = separator.id === 'space';
      const label = isSpace ? 'space' : separator.char;
      fragment.appendChild(
        createComboButton(separator.id, label, false, {
          title: separator.name,
          ariaLabel: separator.name,
        }),
      );
    }
    comboSeparatorGroup.appendChild(fragment);
  }

  if (comboWrapperGroup instanceof HTMLElement) {
    const fragment = document.createDocumentFragment();
    fragment.appendChild(createComboButton('', 'None', true));
    for (const groupId of DECORATION_GROUP_IDS) {
      for (const decoration of decorations) {
        if (decoration.group !== groupId) continue;
        fragment.appendChild(
          createComboButton(
            decoration.id,
            `${decoration.prefix} ${decoration.suffix}`,
            false,
            { title: decoration.name, ariaLabel: decoration.name },
          ),
        );
      }
    }
    comboWrapperGroup.appendChild(fragment);
  }

  /**
   * @param {Element | null} group
   * @returns {string}
   */
  function pressedComboId(group) {
    if (!(group instanceof HTMLElement)) return '';
    const pressed = group.querySelector('.tool__combo-btn[aria-pressed="true"]');
    return pressed instanceof HTMLElement
      ? (pressed.getAttribute('data-combo-id') ?? '')
      : '';
  }

  function refreshCombo() {
    if (!(comboOutputEl instanceof HTMLElement)) return;
    const styleId = pressedComboId(comboStyleGroup);
    const separatorId = pressedComboId(comboSeparatorGroup);
    const decorationId = pressedComboId(comboWrapperGroup);
    const style = styleId ? styleById.get(styleId) : undefined;
    const separator = separatorId ? separatorById.get(separatorId) : undefined;
    const decoration = decorationId ? decorationById.get(decorationId) : undefined;
    const result = applyCombo(input.value, style, separator, decoration);
    comboOutputEl.textContent = result;
    if (comboCountEl instanceof HTMLElement) {
      comboCountEl.textContent = String(countCharacters(result).utf16Length);
    }

    // Base font notes: caveat badge, case note, digit note. Absent field = hidden.
    if (comboCaveatEl instanceof HTMLElement) {
      if (style && style.caveat) {
        comboCaveatEl.textContent = style.caveat;
        comboCaveatEl.hidden = false;
      } else {
        comboCaveatEl.textContent = '';
        comboCaveatEl.hidden = true;
      }
    }
    if (comboCaseNoteEl instanceof HTMLElement) {
      if (style && style.caseNote) {
        comboCaseNoteEl.textContent = style.caseNote;
        comboCaseNoteEl.hidden = false;
      } else {
        comboCaseNoteEl.textContent = '';
        comboCaseNoteEl.hidden = true;
      }
    }
    if (comboDigitsNoteEl instanceof HTMLElement) {
      if (style && style.digits === null) {
        comboDigitsNoteEl.textContent = DIGITS_NOTE;
        comboDigitsNoteEl.hidden = false;
      } else {
        comboDigitsNoteEl.textContent = '';
        comboDigitsNoteEl.hidden = true;
      }
      // Same quiet test as updateCard's card digit note (tool.js:279-282).
      comboDigitsNoteEl.classList.toggle(
        'is-quiet',
        !(style != null && style.digits === null && textHasDigit(input.value)),
      );
    }
    if (comboCaveatNoteEl instanceof HTMLElement) {
      if (style && style.caveatNote) {
        comboCaveatNoteEl.textContent = style.caveatNote;
        comboCaveatNoteEl.hidden = false;
      } else {
        comboCaveatNoteEl.textContent = '';
        comboCaveatNoteEl.hidden = true;
      }
    }
  }

  refreshCombo();

  const cardObserver = new IntersectionObserver(
    (entries) => {
      const text = input.value;
      for (const entry of entries) {
        const card = entry.target;
        if (!(card instanceof HTMLElement)) continue;
        const id = card.getAttribute('data-card-id');
        if (!id) continue;
        if (entry.isIntersecting) {
          visibleCards.add(card);
          if (card.getAttribute('data-needs-update') === 'true') {
            updateCard(card, text);
          }
        } else {
          visibleCards.delete(card);
        }
      }
    },
    { root: null, rootMargin: CARD_ROOT_MARGIN, threshold: 0 },
  );

  /**
   * Adds a mounted card to the live registry and starts observing it.
   * @param {HTMLElement} card
   * @returns {void}
   */
  function registerCard(card) {
    const id = card.getAttribute('data-card-id');
    if (!id) return;
    const list = cardById.get(id);
    if (list) {
      if (list.includes(card)) return;
      list.push(card);
    } else {
      cardById.set(id, [card]);
    }
    const isFav = favourites.has(id);
    card.setAttribute('data-favourite', isFav ? 'true' : 'false');
    const favBtn = card.querySelector('[data-fav]');
    const nameEl = card.querySelector('.tool-card__name');
    const cardName = nameEl?.textContent?.trim() || 'card';
    if (favBtn instanceof HTMLButtonElement) {
      syncFavButton(favBtn, cardName, isFav);
    }
    cardObserver.observe(card);
  }

  /**
   * @param {CardData} data
   * @returns {HTMLElement}
   */
  function createCardFromTemplate(data) {
    const fragment = cardTemplate.content.cloneNode(true);
    const card = /** @type {HTMLElement | null} */ (
      fragment.querySelector('.tool-card')
    );
    if (!(card instanceof HTMLElement)) {
      throw new Error('[fonti] Card template is missing .tool-card');
    }

    card.setAttribute('data-card-id', data.id);
    card.setAttribute('data-card-name', data.searchName);
    card.setAttribute('data-category', data.category);
    card.setAttribute('data-categories', data.membership);
    card.setAttribute('data-favourite', 'false');
    card.setAttribute('data-needs-update', 'false');
    card.setAttribute('data-has-digit-note', data.digitsPassThrough ? 'true' : 'false');

    const nameEl = card.querySelector('.tool-card__name');
    if (nameEl) nameEl.textContent = data.name;

    const riskEl = card.querySelector('.tool-card__risk');
    if (riskEl instanceof HTMLElement) {
      if (data.caveat) {
        riskEl.textContent = data.caveat;
        riskEl.hidden = false;
      } else {
        riskEl.hidden = true;
        riskEl.textContent = '';
      }
    }

    const favBtn = card.querySelector('[data-fav]');
    if (favBtn instanceof HTMLButtonElement) {
      favBtn.setAttribute('aria-label', `Add ${data.name} to favourites`);
    }
    const copyBtn = card.querySelector('[data-copy]');
    if (copyBtn instanceof HTMLButtonElement) {
      copyBtn.setAttribute('aria-label', `Copy ${data.name}`);
    }

    const digitsNote = card.querySelector('[data-digits-note]');
    if (digitsNote instanceof HTMLElement) {
      digitsNote.hidden = true;
      if (!data.digitsPassThrough) {
        digitsNote.remove();
      }
    }

    const caseNote = card.querySelector('.tool-card__case-note');
    if (caseNote instanceof HTMLElement) {
      if (data.caseNote) {
        caseNote.textContent = data.caseNote;
        caseNote.hidden = false;
      } else {
        caseNote.remove();
      }
    }

    const caveatNote = card.querySelector('.tool-card__caveat-note');
    if (caveatNote instanceof HTMLElement) {
      if (data.caveatNote) {
        caveatNote.textContent = data.caveatNote;
        caveatNote.hidden = false;
      } else {
        caveatNote.remove();
      }
    }

    // Empty-input sample: the card's own name, converted.
    updateCard(card, '');
    return card;
  }

  /**
   * @param {HTMLElement} section
   * @returns {void}
   */
  function mountSection(section) {
    if (section.getAttribute('data-mounted') === 'true') return;
    const catId = section.getAttribute('data-category');
    if (!catId) return;
    const list = section.querySelector('.tool__cards');
    if (!(list instanceof HTMLElement)) return;
    const catalog = catalogByCategory.get(catId) ?? [];
    const fragment = document.createDocumentFragment();
    for (const data of catalog) {
      const card = createCardFromTemplate(data);
      fragment.appendChild(card);
    }
    list.appendChild(fragment);
    section.setAttribute('data-mounted', 'true');
    for (const card of list.querySelectorAll('.tool-card')) {
      if (card instanceof HTMLElement) {
        registerCard(card);
        // Apply current input if the visitor has already typed.
        if (input.value.length > 0) {
          updateCard(card, input.value);
        }
      }
    }
  }

  const sectionObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const section = entry.target;
        if (!(section instanceof HTMLElement)) continue;
        if (section.getAttribute('data-mounted') === 'true') {
          sectionObserver.unobserve(section);
          continue;
        }
        mountSection(section);
        sectionObserver.unobserve(section);
      }
    },
    { root: null, rootMargin: SECTION_ROOT_MARGIN, threshold: 0 },
  );

  // Register the first section's server-rendered cards; observe the rest to mount.
  for (const section of sections) {
    if (section.getAttribute('data-mounted') === 'true') {
      for (const card of section.querySelectorAll('.tool-card')) {
        if (card instanceof HTMLElement) registerCard(card);
      }
    } else {
      sectionObserver.observe(section);
    }
  }

  /**
   * @param {string} text
   * @returns {void}
   */
  function refreshVisible(text) {
    if (inputCpEl) {
      inputCpEl.textContent = String(countCharacters(text).codePoints);
    }
    // Live registry — every mounted copy of every card.
    for (const copies of cardById.values()) {
      for (const card of copies) {
        card.setAttribute('data-needs-update', 'true');
      }
    }
    for (const card of visibleCards) {
      updateCard(card, text);
    }
    refreshCombo();
    refreshLivePreview(text);
  }

  /**
   * Hidden panel: skip all work. Early-return is the first statement.
   * @param {string} text
   * @returns {void}
   */
  function refreshLivePreview(text) {
    if (!(livePanel instanceof HTMLElement) || livePanel.hasAttribute('hidden')) return;
    const fromRecent = recents[0];
    const fallbackId = root.querySelector('.tool-card')?.getAttribute('data-card-id');
    const id = fromRecent || fallbackId;
    if (!id) return;
    const rendered = renderById(id, text) ?? (fallbackId && fallbackId !== id ? renderById(fallbackId, text) : null);
    if (!rendered) return;
    const styled = rendered.styled;
    const liveName = liveTarget !== 'bio';
    const liveBio = liveTarget !== 'name';
    const igNameText = liveName ? styled : LIVE_STATIC_IG_NAME;
    const ttNameText = liveName ? styled : LIVE_STATIC_TT_NAME;
    const bioText = liveBio ? styled : LIVE_STATIC_BIO;
    const counted = countCharacters(bioText);
    const n = counted.utf16Length;
    const chars = counted.codePoints;
    if (liveStyleEl) liveStyleEl.textContent = `Style: ${rendered.name}`;
    if (liveIgName) liveIgName.textContent = igNameText;
    if (liveIgBio) liveIgBio.textContent = bioText;
    if (liveTtName) liveTtName.textContent = ttNameText;
    if (liveTtBio) liveTtBio.textContent = bioText;
    const kind =
      liveTarget === 'name' ? 'display name' : liveTarget === 'both' ? 'profile' : 'bio';
    if (liveIgCaption) liveIgCaption.textContent = `Instagram ${kind} preview`;
    if (liveTtCaption) liveTtCaption.textContent = `TikTok ${kind} preview`;
    if (liveIgArticle instanceof HTMLElement) {
      liveIgArticle.setAttribute('aria-label', `Instagram ${kind}`);
    }
    if (liveTtArticle instanceof HTMLElement) {
      liveTtArticle.setAttribute('aria-label', `TikTok ${kind}`);
    }
    const hideMeta = liveTarget === 'name' || text.trim() === '';
    for (const el of [liveIgMeta, liveTtMeta]) {
      if (!(el instanceof HTMLElement)) continue;
      if (hideMeta) {
        el.textContent = '';
        el.removeAttribute('aria-label');
        el.classList.remove('is-over');
        el.setAttribute('hidden', '');
      } else {
        el.removeAttribute('hidden');
      }
    }
    if (!hideMeta) {
      syncLiveMeta(liveIgMeta, n, chars, IG_BIO_LIMIT, 'Instagram');
      syncLiveMeta(liveTtMeta, n, chars, TT_BIO_LIMIT, 'TikTok');
    }
  }

  /**
   * Open or close the live preview. Toggle click and Escape share this.
   * @param {boolean} open
   * @returns {void}
   */
  function setLivePreviewOpen(open) {
    if (!(livePanel instanceof HTMLElement) || !(liveToggle instanceof HTMLButtonElement)) return;
    if (open) {
      livePanel.removeAttribute('hidden');
      liveToggle.setAttribute('aria-expanded', 'true');
      livePreviewOpen = true;
      refreshLivePreview(input.value);
    } else {
      livePanel.setAttribute('hidden', '');
      liveToggle.setAttribute('aria-expanded', 'false');
      livePreviewOpen = false;
    }
  }

  document.addEventListener('keydown', (event) => {
    if (event.key !== 'Escape') return;
    if (!livePreviewOpen) return;
    const focusInside =
      livePanel instanceof HTMLElement && livePanel.contains(document.activeElement);
    setLivePreviewOpen(false);
    if (focusInside && liveToggle instanceof HTMLButtonElement) liveToggle.focus();
  });

  if (liveTargetRow instanceof HTMLElement) {
    liveTargetRow.addEventListener('click', (event) => {
      const target = event.target;
      if (!(target instanceof Element)) return;
      const btn = target.closest('[data-live-target]');
      if (!(btn instanceof HTMLButtonElement) || !liveTargetRow.contains(btn)) return;
      const next = btn.getAttribute('data-live-target');
      if (next !== 'name' && next !== 'bio' && next !== 'both') return;
      liveTarget = next;
      for (const b of liveTargetRow.querySelectorAll('[data-live-target]')) {
        const on = b === btn;
        b.classList.toggle('is-active', on);
        b.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      refreshLivePreview(input.value);
    });
  }

  /**
   * Chip and search decided from catalogue data, not from mounted DOM.
   * @param {CardData} data
   * @param {string} query
   * @returns {boolean}
   */
  function cardMatches(data, query) {
    let chipOk = false;
    if (activeFilter === 'all') {
      chipOk = true;
    } else if (activeFilter === 'favourites') {
      chipOk = favourites.has(data.id);
    } else if (activeFilter === 'recent') {
      chipOk = recents.includes(data.id);
    } else {
      chipOk = data.membership.split(' ').includes(activeFilter);
    }
    const searchOk = query === '' || data.searchName.includes(query);
    return chipOk && searchOk;
  }

  /**
   * Chip filter AND search query. Matching is decided from data lists.
   * A match inside an unmounted section mounts that section.
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
      if (!catId) continue;
      if (catId === 'combo') {
        section.hidden =
          query !== '' || activeFilter !== 'combo';
        continue;
      }
      const catalog = catalogByCategory.get(catId) ?? [];
      /** @type {CardData[]} */
      const matching = [];
      for (const data of catalog) {
        if (!cardMatches(data, query)) continue;
        matching.push(data);
        if (activeFilter === 'favourites') anyFavMatch = true;
        if (activeFilter === 'recent') anyRecentMatch = true;
        anyShown = true;
      }

      if (matching.length > 0 && section.getAttribute('data-mounted') !== 'true') {
        mountSection(section);
      }

      const visibleInSection = matching.length;
      const matchIds = new Set(matching.map((d) => d.id));

      if (section.getAttribute('data-mounted') === 'true') {
        for (const data of catalog) {
          const copies = cardById.get(data.id) ?? [];
          const show = matchIds.has(data.id);
          for (const card of copies) {
            if (card.getAttribute('data-category') !== catId) continue;
            if (!(card instanceof HTMLElement)) continue;
            card.hidden = !show;
            if (show) ensureCardFresh(card, input.value);
          }
        }
      }

      if (activeFilter === 'favourites' || activeFilter === 'recent') {
        section.hidden = visibleInSection === 0;
      } else if (activeFilter === 'all') {
        section.hidden = visibleInSection === 0 && query !== '';
      } else {
        // Membership chip: hide the whole section (heading and note included)
        // when no card in this section matches.
        section.hidden = visibleInSection === 0;
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

    const comboBtn = target.closest('.tool__combo-btn');
    if (comboBtn instanceof HTMLButtonElement && root.contains(comboBtn)) {
      const group = comboBtn.closest('.tool__combo-group');
      if (!(group instanceof HTMLElement)) return;
      for (const btn of group.querySelectorAll('.tool__combo-btn')) {
        if (btn instanceof HTMLButtonElement) {
          btn.setAttribute('aria-pressed', btn === comboBtn ? 'true' : 'false');
        }
      }
      refreshCombo();
      return;
    }

    const filterBtn = target.closest('[data-filter]');
    if (filterBtn instanceof HTMLButtonElement && root.contains(filterBtn)) {
      const filter = filterBtn.getAttribute('data-filter');
      if (!filter) return;
      activeFilter = filter;
      for (const c of chips) {
        const on = c.getAttribute('data-filter') === filter;
        c.classList.toggle('is-active', on);
        c.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      if (builderEntrance instanceof HTMLButtonElement) {
        const on = filter === 'combo';
        builderEntrance.classList.toggle('is-active', on);
        builderEntrance.setAttribute('aria-pressed', on ? 'true' : 'false');
      }
      applyFilter();
      return;
    }

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
      const copies = cardById.get(id) ?? [];
      const nameEl = card.querySelector('.tool-card__name');
      const cardName = nameEl?.textContent?.trim() || 'card';
      for (const copy of copies) {
        copy.setAttribute('data-favourite', isFav ? 'true' : 'false');
        const copyFav = copy.querySelector('[data-fav]');
        if (copyFav instanceof HTMLButtonElement) {
          syncFavButton(copyFav, cardName, isFav);
        }
      }
      if (activeFilter === 'favourites') applyFilter();
      return;
    }

    const liveBtn = target.closest('[aria-controls="tool-live-preview"]');
    if (liveBtn instanceof HTMLButtonElement && livePanel instanceof HTMLElement) {
      setLivePreviewOpen(!livePreviewOpen);
      return;
    }

    const button = target.closest('[data-copy]');
    if (!(button instanceof HTMLButtonElement)) return;

    if (button.getAttribute('data-copy') === 'combo') {
      const output = root.querySelector('[data-combo-output]');
      if (!(output instanceof HTMLElement)) return;
      refreshCombo();
      const text = output.textContent ?? '';
      const ok = await copyText(text);
      if (ok) {
        announce('Copied combo');
        const prev = copyTimers.get(button);
        if (prev !== undefined) clearTimeout(prev);
        const useEl = button.querySelector('use');
        if (useEl instanceof SVGUseElement) {
          useEl.setAttribute('href', '#icon-done');
          copyTimers.set(
            button,
            setTimeout(() => {
              useEl.setAttribute('href', '#icon-copy');
              copyTimers.delete(button);
            }, COPY_LABEL_MS),
          );
        }
      } else {
        announce('Copy failed');
      }
      return;
    }

    const card = button.closest('.tool-card');
    if (!(card instanceof HTMLElement)) return;
    ensureCardFresh(card, input.value);
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
        refreshLivePreview(input.value);
      }
      announce(`Copied ${cardName}`);
      const prev = copyTimers.get(button);
      if (prev !== undefined) clearTimeout(prev);
      const useEl = button.querySelector('use');
      if (useEl instanceof SVGUseElement) {
        useEl.setAttribute('href', '#icon-done');
        copyTimers.set(
          button,
          setTimeout(() => {
            useEl.setAttribute('href', '#icon-copy');
            copyTimers.delete(button);
          }, COPY_LABEL_MS),
        );
      }
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
