// Browser wiring only. Mapping lives in generator.js — do not duplicate it.
import { applyStyle, countCharacters } from './generator.js';
import { styles } from '../data/styles.ts';

const DEBOUNCE_MS = 120;

/** @type {Map<string, import('../data/styles.ts').Style>} */
const styleById = new Map(styles.map((s) => [s.id, s]));

/**
 * @param {string} text
 * @param {HTMLElement} card
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
  const { codePoints, utf16Length } = countCharacters(styled);
  const cpEl = card.querySelector('[data-counter-codepoints]');
  const utfEl = card.querySelector('[data-counter-utf16]');
  if (cpEl) cpEl.textContent = String(codePoints);
  if (utfEl) utfEl.textContent = String(utf16Length);
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
  live.textContent = message;
}

function initTool() {
  const root = document.querySelector('[data-tool]');
  if (!(root instanceof HTMLElement)) return;

  const input = root.querySelector('#tool-input');
  if (!(input instanceof HTMLInputElement)) return;

  /** @type {NodeListOf<HTMLElement>} */
  const cards = root.querySelectorAll('.tool-card');

  /** @type {ReturnType<typeof setTimeout> | undefined} */
  let debounceTimer;

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

  input.addEventListener('input', () => {
    if (debounceTimer !== undefined) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      refreshVisible(input.value);
    }, DEBOUNCE_MS);
  });

  root.addEventListener('click', async (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;
    const button = target.closest('[data-copy]');
    if (!(button instanceof HTMLButtonElement)) return;
    const card = button.closest('.tool-card');
    if (!(card instanceof HTMLElement)) return;
    const output = card.querySelector('[data-output]');
    if (!(output instanceof HTMLElement)) return;
    const text = output.textContent ?? '';
    const ok = await copyText(text);
    announce(ok ? 'Copied' : 'Copy failed');
  });
}

initTool();
