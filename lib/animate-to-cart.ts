/** Fly a decorative copy of the clicked icon into the shop's visible cart. */
export function animateToCart(source: HTMLButtonElement) {
  const cart = document.querySelector<HTMLButtonElement>('[data-shop-cart]');
  if (!cart || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  const start = source.getBoundingClientRect();
  const end = cart.getBoundingClientRect();
  const token = document.createElement('div');
  token.className = 'flex items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg';
  token.setAttribute('aria-hidden', 'true');
  Object.assign(token.style, {
    position: 'fixed', left: `${start.left}px`, top: `${start.top}px`,
    width: `${start.width}px`, height: `${start.height}px`,
    pointerEvents: 'none', zIndex: '100',
  });
  const icon = source.querySelector('svg')?.cloneNode(true);
  if (icon) token.appendChild(icon);
  document.body.appendChild(token);

  const x = end.left + end.width / 2 - start.left - start.width / 2;
  const y = end.top + end.height / 2 - start.top - start.height / 2;
  const flight = token.animate([
    { transform: 'translate(0, 0) scale(1)', opacity: 1 },
    { transform: `translate(${x * 0.45}px, ${y * 0.45 - 80}px) scale(.8)`, opacity: 1, offset: 0.5 },
    { transform: `translate(${x}px, ${y}px) scale(.2)`, opacity: 0.2 },
  ], { duration: 650, easing: 'cubic-bezier(.3, 0, .65, 1)' });

  flight.onfinish = () => {
    token.remove();
    if (cart.isConnected) cart.animate([
      { transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' },
    ], { duration: 250 });
  };
  flight.oncancel = () => token.remove();
}
