/* HELETRA Editorial | Consentimento analitico V1
   GA4 so carrega apos aceite; GTM nao instalado.
*/
(function () {
  'use strict';
  const STORAGE_KEY = 'heletra_analytics_consent_v1';
  const GA_ID = 'G-LTYG7TBBJ1';
  let analyticsStarted = false;
  let banner = null;

  function storedConsent() {
    try { return localStorage.getItem(STORAGE_KEY); } catch (e) { return null; }
  }
  function saveConsent(value) {
    try { localStorage.setItem(STORAGE_KEY, value); } catch (e) { /* modo privado */ }
  }

  function startAnalytics() {
    if (analyticsStarted) return;
    analyticsStarted = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('consent', 'default', {
      analytics_storage: 'granted',
      ad_storage: 'denied',
      ad_user_data: 'denied',
      ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', GA_ID, {
      allow_google_signals: false,
      allow_ad_personalization_signals: false
    });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(GA_ID);
    document.head.appendChild(script);
  }

  function deleteAnalyticsCookies() {
    // Apaga apenas cookies proprios acessiveis via document.cookie.
    // Cookies de terceiros/HttpOnly nao podem ser apagados por este script.
    document.cookie.split(';').forEach(function (part) {
      const name = part.split('=')[0].trim();
      if (!/^_ga(?:_|$)/.test(name)) return;
      const hostname = window.location.hostname;
      const domains = ['', hostname, '.' + hostname, '.heletra.com.br'];
      domains.forEach(function (domain) {
        const attrs = domain ? '; domain=' + domain : '';
        document.cookie = name + '=; Max-Age=0; path=/' + attrs + '; SameSite=Lax';
      });
    });
  }

  function selectConsent(value) {
    saveConsent(value);
    if (banner) banner.hidden = true;
    if (value === 'accepted') startAnalytics();
    else {
      if (typeof window.gtag === 'function') {
        window.gtag('consent', 'update', { analytics_storage: 'denied' });
      }
      deleteAnalyticsCookies();
      if (analyticsStarted) window.location.reload();
    }
  }

  function showBanner() {
    if (!banner) return;
    banner.hidden = false;
    const button = banner.querySelector('[data-he-cookie="reject"]');
    if (button) button.focus({ preventScroll: true });
  }

  function createBanner() {
    const wrapper = document.createElement('section');
    wrapper.className = 'he-cookie-banner';
    wrapper.hidden = true;
    wrapper.setAttribute('role', 'region');
    wrapper.setAttribute('aria-label', 'Preferencias de cookies');
    wrapper.innerHTML = '<div><h2>Seu espaço, sua escolha.</h2><p>Usamos recursos essenciais para apresentar o site. Com sua autorização, ativamos o Google Analytics para compreender as visitas. Você pode recusar sem perder acesso ao conteúdo. <a href="privacidade.html">Leia a Política de Privacidade</a>.</p></div>' +
      '<div class="he-cookie-actions"><button type="button" class="he-cookie-action secondary" data-he-cookie="reject">Recusar</button><button type="button" class="he-cookie-action" data-he-cookie="accept">Aceitar</button></div>';
    wrapper.querySelector('[data-he-cookie="reject"]').addEventListener('click', function () { selectConsent('rejected'); });
    wrapper.querySelector('[data-he-cookie="accept"]').addEventListener('click', function () { selectConsent('accepted'); });
    document.body.appendChild(wrapper);
    return wrapper;
  }

  function installPreferenceControls() {
    document.querySelectorAll('[data-he-cookie="preferences"]').forEach(function (button) {
      button.addEventListener('click', showBanner);
    });
  }

  function registerMailtoEvent() {
    document.addEventListener('click', function (event) {
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest('a[href^="mailto:contato@heletra.com.br"]');
      if (!link || storedConsent() !== 'accepted' || !analyticsStarted || typeof window.gtag !== 'function') return;
      window.gtag('event', 'generate_lead', { method: 'email_click' });
    });
  }

  function init() {
    banner = createBanner();
    installPreferenceControls();
    registerMailtoEvent();
    const choice = storedConsent();
    if (choice === 'accepted') startAnalytics();
    else if (choice !== 'rejected') banner.hidden = false;
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();