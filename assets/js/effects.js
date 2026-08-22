const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

class TypeEffect {
  constructor(element, words, options = {}) {
    this.el = element;
    this.words = words;
    this.typeSpeed = options.typeSpeed || 60;
    this.backSpeed = options.backSpeed || 30;
    this.pauseTime = options.pauseTime || 2000;
    this.index = 0;
    this.charIndex = 0;
    this.isDeleting = false;
    this._timer = null;
    this._stopped = false;

    if (prefersReducedMotion()) {
      this.el.textContent = words[0] || '';
      return;
    }
    this._tick();
  }

  _tick() {
    if (this._stopped) return;
    const word = this.words[this.index];

    let txt;
    if (this.isDeleting) {
      txt = word.substring(0, this.charIndex - 1);
      this.charIndex--;
    } else {
      txt = word.substring(0, this.charIndex + 1);
      this.charIndex++;
    }
    this.el.textContent = txt;

    let delay = this.isDeleting ? this.backSpeed : this.typeSpeed;

    if (!this.isDeleting && this.charIndex === word.length) {
      delay = this.pauseTime;
      this.isDeleting = true;
    } else if (this.isDeleting && this.charIndex === 0) {
      this.isDeleting = false;
      this.index = (this.index + 1) % this.words.length;
      delay = 300;
    }

    this._timer = setTimeout(() => this._tick(), delay);
  }

  stop() {
    this._stopped = true;
    if (this._timer) { clearTimeout(this._timer); this._timer = null; }
    this.el.textContent = '';
  }
}

class CounterAnim {
  static observe(elements) {
    if (prefersReducedMotion()) {
      elements.forEach((el) => {
        el.textContent = parseInt(el.dataset.target || '0').toLocaleString();
      });
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        const el = entry.target;
        const target = parseInt(el.dataset.target || '0');
        const duration = 1800;
        const start = performance.now();

        const step = (now) => {
          const progress = Math.min((now - start) / duration, 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.floor(eased * target).toLocaleString();
          if (progress < 1) requestAnimationFrame(step);
          else el.textContent = target.toLocaleString();
        };
        requestAnimationFrame(step);
        observer.unobserve(el);
      });
    }, { threshold: 0.5 });
    elements.forEach((el) => observer.observe(el));
  }
}

class SectionReveal {
  static init() {
    const revealClass = 'reveal';
    if (prefersReducedMotion()) {
      document.querySelectorAll('.' + revealClass).forEach((el) => el.classList.add('revealed'));
      return;
    }
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -50px 0px' });
    document.querySelectorAll('.' + revealClass).forEach((el) => observer.observe(el));
  }
}

export { TypeEffect, CounterAnim, SectionReveal };
