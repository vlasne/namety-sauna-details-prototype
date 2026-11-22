(() => {
  'use strict';
  const albums = JSON.parse(document.getElementById('spa-gallery-data').textContent);
  const dialog = document.getElementById('photo-viewer');
  const image = document.getElementById('viewer-image');
  const thumbs = document.getElementById('viewer-thumbs');
  const previous = document.getElementById('viewer-prev');
  const next = document.getElementById('viewer-next');
  let activeAlbum, index = 0, returnFocus, savedOverflow = '', swipeStart;
  const asset = (src) => '/namety-sauna-details-prototype/assets/' + src;
  function showPhoto(value) {
    index = (value + activeAlbum.photos.length) % activeAlbum.photos.length;
    const photo = activeAlbum.photos[index];
    image.src = asset(photo.src);
    image.alt = photo.alt || photo.caption || activeAlbum.title;
    document.getElementById('viewer-caption').textContent = photo.caption || photo.alt || activeAlbum.title;
    document.getElementById('viewer-counter').textContent = `${index + 1} / ${activeAlbum.photos.length}`;
    [...thumbs.children].forEach((button, i) => button.setAttribute('aria-current', String(i === index)));
    const selected = thumbs.children[index];
    if (selected) {
      const left = selected.offsetLeft - thumbs.offsetLeft;
      if (left < thumbs.scrollLeft || left + selected.offsetWidth > thumbs.scrollLeft + thumbs.clientWidth) thumbs.scrollTo({ left: left - (thumbs.clientWidth - selected.offsetWidth) / 2, behavior: 'instant' });
    }
  }
  function openGallery(button) {
    activeAlbum = albums[button.dataset.gallery];
    if (!activeAlbum?.photos?.length) return;
    returnFocus = button;
    savedOverflow = document.body.style.overflow;
    document.getElementById('viewer-title').textContent = activeAlbum.title;
    thumbs.replaceChildren();
    activeAlbum.photos.forEach((photo, i) => {
      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.setAttribute('aria-label', `Фото ${i + 1}: ${photo.caption || activeAlbum.title}`);
      const img = document.createElement('img');
      img.src = asset(photo.src); img.alt = ''; img.loading = 'lazy';
      thumb.append(img); thumb.addEventListener('click', () => showPhoto(i)); thumbs.append(thumb);
    });
    previous.hidden = next.hidden = thumbs.hidden = activeAlbum.photos.length < 2;
    dialog.showModal();
    document.body.style.overflow = 'hidden';
    showPhoto(Number(button.dataset.index) || 0);
    document.getElementById('viewer-close').focus({ preventScroll: true });
  }
  document.addEventListener('click', event => {
    const galleryButton = event.target.closest('[data-gallery]');
    if (galleryButton) openGallery(galleryButton);
  });
  document.getElementById('viewer-close').addEventListener('click', () => dialog.close());
  previous.addEventListener('click', () => showPhoto(index - 1));
  next.addEventListener('click', () => showPhoto(index + 1));
  dialog.addEventListener('keydown', event => {
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault(); showPhoto(index + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });
  dialog.addEventListener('close', () => {
    document.body.style.overflow = savedOverflow;
    if (returnFocus?.isConnected) returnFocus.focus({ preventScroll: true });
  });
  const stage = document.querySelector('.viewer-stage');
  stage.addEventListener('touchstart', event => { if (event.touches.length === 1) swipeStart = { x:event.touches[0].clientX, y:event.touches[0].clientY }; }, { passive:true });
  stage.addEventListener('touchend', event => {
    if (!swipeStart || !event.changedTouches.length) return;
    const dx = event.changedTouches[0].clientX - swipeStart.x, dy = event.changedTouches[0].clientY - swipeStart.y;
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.5) showPhoto(index + (dx < 0 ? 1 : -1));
    swipeStart = null;
  }, { passive:true });
  stage.addEventListener('touchcancel', () => { swipeStart = null; }, { passive:true });
  const sticky = document.querySelector('.detail-sticky');
  const hero = document.querySelector('.detail-intro');
  const reserve = document.getElementById('reserve');
  const footer = document.querySelector('footer');
  let scheduled = false;
  function updateSticky() {
    const r = reserve.getBoundingClientRect();
    sticky.hidden = hero.getBoundingClientRect().bottom > 80 || (r.top < innerHeight && r.bottom > 0) || footer.getBoundingClientRect().top < innerHeight;
    scheduled = false;
  }
  addEventListener('scroll', () => { if (!scheduled) { requestAnimationFrame(updateSticky); scheduled = true; } }, { passive:true });
  addEventListener('resize', updateSticky);
  updateSticky();
})();
