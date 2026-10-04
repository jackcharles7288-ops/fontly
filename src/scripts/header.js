const header = document.querySelector('.site-header');
const nav = header && header.querySelector('.site-nav');
if (!nav) {
  // Pages without the tool nav skip this module.
} else {
  const burger = nav.querySelector('.site-nav__burger');
  const drops = nav.querySelectorAll('.site-nav__drop');
  const mq = matchMedia('(max-width: 39.99rem)');

  const expand = (el, on) => {
    if (el) el.setAttribute('aria-expanded', on ? 'true' : 'false');
  };

  const closeDrops = () => {
    for (const drop of drops) {
      drop.classList.remove('is-open');
      expand(drop.querySelector('.site-nav__btn'), false);
    }
  };

  const closeMenu = () => {
    nav.classList.remove('is-open');
    expand(burger, false);
  };

  const closeAll = () => {
    closeDrops();
    closeMenu();
  };

  nav.addEventListener('click', (e) => {
    const btn = e.target.closest('.site-nav__btn');
    if (btn && nav.contains(btn)) {
      const drop = btn.closest('.site-nav__drop');
      const willOpen = !drop.classList.contains('is-open');
      closeDrops();
      if (willOpen) {
        drop.classList.add('is-open');
        expand(btn, true);
      }
      return;
    }
    if (burger && e.target.closest('.site-nav__burger')) {
      const willOpen = !nav.classList.contains('is-open');
      closeAll();
      if (willOpen) {
        nav.classList.add('is-open');
        expand(burger, true);
      }
    }
  });

  document.addEventListener('click', (e) => {
    if (!header.contains(e.target)) closeAll();
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (mq.matches) {
      if (nav.classList.contains('is-open')) {
        closeAll();
        if (burger) burger.focus();
      }
      return;
    }
    const openDrop = nav.querySelector('.site-nav__drop.is-open');
    if (openDrop) {
      closeDrops();
      const trigger = openDrop.querySelector('.site-nav__btn');
      if (trigger) trigger.focus();
    }
  });

  mq.addEventListener('change', closeAll);
}
