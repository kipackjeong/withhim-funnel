(() => {
  'use strict';

  // The buttons ship `hidden` and are revealed only when this form can work:
  // without JavaScript, <dialog> or fetch a visitor never meets a dead button.
  const dialog = document.getElementById('android-waitlist');
  const openers = [...document.querySelectorAll('[data-android-waitlist]')];
  if (!dialog || !openers.length || typeof dialog.showModal !== 'function' || !('fetch' in window)) return;

  const form = document.getElementById('waitlist-form');
  const done = document.getElementById('waitlist-done');
  const email = document.getElementById('waitlist-email');
  const status = document.getElementById('waitlist-status');
  const submit = form.querySelector('button[type="submit"]');
  const submitLabel = submit.textContent;
  const messages = {
    empty: 'Enter your email address.',
    invalid: 'That doesn’t look like an email address. Check it and try again.',
    limited: 'Too many tries from this connection. Please try again in an hour.',
    unavailable: 'We couldn’t save that just now. Please try again in a moment.',
    offline: 'We couldn’t reach the signup service. Check your connection and try again.'
  };

  let source = 'hero';
  let opener = null;
  let sending = false;
  let pressedBackdrop = false;

  // Counts only the step, never the address.
  function track(step, extra) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(Object.assign({ event: 'index_android_waitlist', page: 'index', step, location: source }, extra || {}));
  }

  // Only a problem with the address marks the field invalid; a busy or
  // unreachable service is not the reader's mistake.
  function showError(text, fieldProblem) {
    status.textContent = text;
    if (fieldProblem) email.setAttribute('aria-invalid', 'true');
    else email.removeAttribute('aria-invalid');
  }

  function clearError() {
    status.textContent = '';
    email.removeAttribute('aria-invalid');
  }

  function setSending(value) {
    sending = value;
    submit.disabled = value;
    submit.textContent = value ? 'Saving…' : submitLabel;
  }

  function reset() {
    setSending(false);
    clearError();
    form.hidden = false;
    done.hidden = true;
    form.reset();
  }

  openers.forEach(button => {
    button.hidden = false;
    button.addEventListener('click', () => {
      opener = button;
      source = button.dataset.androidWaitlist === 'closing' ? 'closing' : 'hero';
      reset();
      dialog.showModal();
      track('open');
    });
  });

  dialog.querySelectorAll('[data-waitlist-close]').forEach(button => {
    button.addEventListener('click', () => dialog.close());
  });

  // A click that starts inside the card (selecting the address, say) and ends
  // on the backdrop must not dismiss it, so both ends have to be the backdrop.
  dialog.addEventListener('pointerdown', event => { pressedBackdrop = event.target === dialog; });
  dialog.addEventListener('click', event => {
    if (event.target === dialog && pressedBackdrop) dialog.close();
    pressedBackdrop = false;
  });
  dialog.addEventListener('close', () => {
    if (opener) opener.focus();
  });

  email.addEventListener('input', clearError);

  form.addEventListener('submit', async event => {
    event.preventDefault();
    if (sending) return;

    const address = email.value.trim();
    if (!address) {
      showError(messages.empty, true);
      email.focus();
      return;
    }

    clearError();
    setSending(true);
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 15000);
    try {
      const response = await fetch(dialog.dataset.endpoint, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ email: address, source, website: form.elements.website.value }),
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal
      });

      if (response.status === 204) {
        form.hidden = true;
        done.hidden = false;
        done.querySelector('[data-waitlist-email]').textContent = address;
        done.focus();
        track('joined');
      } else if (response.status === 422) {
        showError(messages.invalid, true);
        email.focus();
        track('error', { reason: 'invalid' });
      } else if (response.status === 429) {
        showError(messages.limited);
        track('error', { reason: 'rate_limited' });
      } else {
        showError(messages.unavailable);
        track('error', { reason: 'unavailable', http: response.status });
      }
    } catch (error) {
      showError(messages.offline);
      track('error', { reason: 'network' });
    } finally {
      window.clearTimeout(timeout);
      setSending(false);
    }
  });
})();
