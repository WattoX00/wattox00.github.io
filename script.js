// WattoX projects page – all effects work on any .card automatically.
// Add or remove cards in index.html; nothing here needs to change.
(() => {
    const root = document.documentElement;
    const grid = document.getElementById('grid');
    const cards = [...grid.querySelectorAll('.card')];
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const canHover = matchMedia('(hover: hover)').matches;

    /* ---------- stagger entrance ---------- */
    cards.forEach((c, i) => c.style.setProperty('--i', i));

    /* ---------- animated counter ---------- */
    const countEl = document.getElementById('count');
    const total = cards.length;
    if (reduced) {
        countEl.textContent = total;
    } else {
        let n = 0;
        const t = setInterval(() => {
            countEl.textContent = ++n;
            if (n >= total) clearInterval(t);
        }, 90);
    }

    /* ---------- typing tagline ---------- */
    const typed = document.getElementById('typed');
    const phrases = (typed.dataset.phrases || '').split('|').filter(Boolean);
    if (reduced || !phrases.length) {
        typed.textContent = phrases[0] || '';
    } else {
        let p = 0, ch = 0, del = false;
        const tick = () => {
            const word = phrases[p];
            typed.textContent = word.slice(0, ch);
            if (!del && ch === word.length) { del = true; return setTimeout(tick, 1800); }
            if (del && ch === 0) { del = false; p = (p + 1) % phrases.length; return setTimeout(tick, 350); }
            ch += del ? -1 : 1;
            setTimeout(tick, del ? 30 : 65);
        };
        setTimeout(tick, 900);
    }

    /* ---------- filter chips (built from data-tags) ---------- */
    const filters = document.getElementById('filters');
    const empty = document.getElementById('empty');
    const tags = [...new Set(cards.flatMap(c => (c.dataset.tags || '').split(/\s+/).filter(Boolean)))].sort();

    if (tags.length > 1) {
        ['all', ...tags].forEach((tag, i) => {
            const b = document.createElement('button');
            b.type = 'button';
            b.className = 'chip' + (i === 0 ? ' active' : '');
            b.dataset.tag = tag;
            b.textContent = tag === 'all' ? 'All' : tag[0].toUpperCase() + tag.slice(1);
            filters.appendChild(b);
        });

        filters.addEventListener('click', e => {
            const b = e.target.closest('.chip');
            if (!b) return;
            filters.querySelectorAll('.chip').forEach(x => x.classList.toggle('active', x === b));
            const tag = b.dataset.tag;
            let shown = 0;
            cards.forEach(c => {
                const match = tag === 'all' || (c.dataset.tags || '').split(/\s+/).includes(tag);
                c.classList.remove('reveal');
                c.classList.toggle('is-hidden', !match);
                if (match) {
                    c.style.setProperty('--j', shown++);
                    void c.offsetWidth; // restart animation
                    c.classList.add('reveal');
                }
            });
            empty.hidden = shown > 0;
        });
    } else {
        filters.remove();
    }

    /* ---------- cursor glow + 3D tilt (mouse only) ---------- */
    if (canHover && !reduced) {
        addEventListener('pointermove', e => {
            root.style.setProperty('--mx', e.clientX + 'px');
            root.style.setProperty('--my', e.clientY + 'px');
        }, { passive: true });

        grid.addEventListener('pointermove', e => {
            const card = e.target.closest('.card');
            if (!card) return;
            const r = card.getBoundingClientRect();
            const px = (e.clientX - r.left) / r.width;
            const py = (e.clientY - r.top) / r.height;
            card.style.setProperty('--x', px * 100 + '%');
            card.style.setProperty('--y', py * 100 + '%');
            card.style.setProperty('--ry', (px - 0.5) * 14 + 'deg');
            card.style.setProperty('--rx', (0.5 - py) * 14 + 'deg');
        });

        grid.addEventListener('pointerout', e => {
            const card = e.target.closest('.card');
            if (!card || card.contains(e.relatedTarget)) return;
            card.style.setProperty('--rx', '0deg');
            card.style.setProperty('--ry', '0deg');
        });
    }

    /* ---------- click ripple + particle burst ---------- */
    grid.addEventListener('click', e => {
        const card = e.target.closest('.card');
        if (!card || reduced) return;
        const r = card.getBoundingClientRect();
        const size = Math.max(r.width, r.height) * 2;

        const rip = document.createElement('span');
        rip.className = 'ripple';
        rip.style.cssText = `width:${size}px;height:${size}px;left:${e.clientX - r.left - size / 2}px;top:${e.clientY - r.top - size / 2}px`;
        card.appendChild(rip);
        rip.addEventListener('animationend', () => rip.remove());

        const color = getComputedStyle(card).getPropertyValue('--c').trim() || '#38bdf8';
        for (let i = 0; i < 10; i++) {
            const p = document.createElement('span');
            p.className = 'particle';
            p.style.background = color;
            p.style.left = e.clientX + 'px';
            p.style.top = e.clientY + 'px';
            document.body.appendChild(p);
            const a = (Math.PI * 2 * i) / 10 + Math.random() * 0.5;
            const d = 40 + Math.random() * 50;
            p.animate([
                { transform: 'translate(0,0) scale(1)', opacity: 1 },
                { transform: `translate(${Math.cos(a) * d}px,${Math.sin(a) * d}px) scale(0)`, opacity: 0 }
            ], { duration: 600 + Math.random() * 300, easing: 'cubic-bezier(.2,.8,.3,1)' }).onfinish = () => p.remove();
        }
    });

    /* ---------- header logo easter egg ---------- */
    const logo = document.querySelector('.header-logo');
    if (logo) {
        logo.addEventListener('click', () => {
            logo.classList.remove('spin');
            void logo.offsetWidth;
            logo.classList.add('spin');
        });
    }
})();
