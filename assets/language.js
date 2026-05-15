(function () {
  const STORAGE_KEY = 'woxuehanyu-lang';
  const SUPPORTED_LANGS = ['en', 'vi'];

  function normalizeLang(lang) {
    return SUPPORTED_LANGS.includes(lang) ? lang : 'en';
  }

  function detectLang() {
    const params = new URLSearchParams(window.location.search);
    const queryLang = normalizeLang(params.get('lang'));
    if (params.get('lang')) return queryLang;

    const savedLang = normalizeLang(localStorage.getItem(STORAGE_KEY));
    if (localStorage.getItem(STORAGE_KEY)) return savedLang;

    const browserLang = navigator.language || navigator.userLanguage || '';
    return browserLang.toLowerCase().startsWith('vi') ? 'vi' : 'en';
  }

  function getLang() {
    return normalizeLang(window.WOXUEHANYU_CURRENT_LANG || detectLang());
  }

  function setLang(lang) {
    window.WOXUEHANYU_CURRENT_LANG = normalizeLang(lang);
    localStorage.setItem(STORAGE_KEY, window.WOXUEHANYU_CURRENT_LANG);
    document.documentElement.lang = window.WOXUEHANYU_CURRENT_LANG;
    syncSelect();

    if (typeof window.applyLanguage === 'function') {
      window.applyLanguage(window.WOXUEHANYU_CURRENT_LANG);
    }
  }

  function syncSelect() {
    const select = document.getElementById('languageSelect');
    if (select) select.value = getLang();
    const label = document.querySelector('.language-select-wrap label');
    if (label) label.textContent = getLang() === 'vi' ? 'Ngôn ngữ' : 'Language';
  }

  function ensureSelector() {
    if (document.getElementById('languageSelect')) {
      syncSelect();
      return;
    }

    const wrap = document.createElement('div');
    wrap.className = 'language-select-wrap';
    wrap.innerHTML = `
      <label for="languageSelect">Language</label>
      <select id="languageSelect" aria-label="Select language">
        <option value="en">EN</option>
        <option value="vi">VI</option>
      </select>
    `;
    document.body.prepend(wrap);
    document.getElementById('languageSelect').addEventListener('change', function (event) {
      setLang(event.target.value);
    });
    syncSelect();
  }

  window.getWoXueHanyuLanguage = getLang;
  window.setWoXueHanyuLanguage = setLang;

  window.addEventListener('DOMContentLoaded', function () {
    window.WOXUEHANYU_CURRENT_LANG = detectLang();
    document.documentElement.lang = window.WOXUEHANYU_CURRENT_LANG;
    ensureSelector();
    if (typeof window.applyLanguage === 'function') {
      window.applyLanguage(window.WOXUEHANYU_CURRENT_LANG);
    }
  });
})();
