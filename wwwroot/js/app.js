const state = {
    feeds: [],
    articles: [],
    search: '',
    selectedFeedId: 'all',
    readArticleIds: new Set(),
    favoriteArticleIds: new Set(),
};

const elements = {
    sidebar: document.getElementById('sidebarDrawer'),
    backdrop: document.getElementById('drawerBackdrop'),
    menuButton: document.getElementById('menuButton'),
    langToggle: document.getElementById('langToggle'),
    themeToggle: document.getElementById('themeToggle'),
    searchInput: document.getElementById('searchInput'),
    refreshAllButton: document.getElementById('refreshAllButton'),
    addFeedForm: document.getElementById('addFeedForm'),
    feedUrlInput: document.getElementById('feedUrlInput'),
    feedFormMessage: document.getElementById('feedFormMessage'),
    feedList: document.getElementById('feedList'),
    articleFeed: document.getElementById('articleFeed'),
    statusText: document.getElementById('statusText'),
    topbarStat: document.getElementById('topbarStat'),
    feedItemTemplate: document.getElementById('feedItemTemplate'),
    articleCardTemplate: document.getElementById('articleCardTemplate'),
    helpFabButton: document.getElementById('helpFabButton'),
    helpCloseButton: document.getElementById('helpCloseButton'),
    helpPanel: document.getElementById('helpPanel'),
    helpSearchInput: document.getElementById('helpSearchInput'),
    helpTopicList: document.getElementById('helpTopicList'),
    chatFabButton: document.getElementById('chatFabButton'),
    chatCloseButton: document.getElementById('chatCloseButton'),
    chatPanel: document.getElementById('chatPanel'),
    chatMessages: document.getElementById('chatMessages'),
    chatForm: document.getElementById('chatForm'),
    chatInput: document.getElementById('chatInput'),
};

const readStorageKey = 'rss-reader-read-articles';
const favoritesStorageKey = 'rss-reader-favorite-articles';
const themeStorageKey = 'rss-reader-theme';
const langStorageKey = 'rss-reader-lang';

/* ---------- Localization ---------- */

const translations = {
    en: {
        appTitle: 'RSS Reader',
        switchToArabic: 'AR',
        switchToEnglish: 'EN',
        switchToArabicAria: 'Switch interface language to Arabic',
        switchToEnglishAria: 'Switch interface language to English',
        openNavigation: 'Open navigation',
        toggleDarkMode: 'Toggle dark mode',
        searchPlaceholder: 'Search articles or feeds',
        refreshAll: 'Refresh all',
        subscriptions: 'Subscriptions',
        sidebarDescription: 'Add a feed URL, refresh sources, or remove one you do not need.',
        addFeed: 'Add feed',
        feedUrlLabel: 'RSS or Atom URL',
        latestArticles: 'Latest articles',
        loadingFeeds: 'Loading feeds and articles...',
        articlesAriaLabel: 'Articles',
        openHelp: 'Open help',
        helpHeading: 'How can we help?',
        closeHelp: 'Close help',
        searchHelpTopics: 'Search help topics',
        openAssistant: 'Open AI assistant',
        askAssistant: 'Ask the assistant',
        closeAssistant: 'Close AI assistant',
        askQuestion: 'Ask a question',
        askQuestionPlaceholder: 'Ask a question...',
        sendMessage: 'Send message',
        copyArticleLink: 'Copy article link',
        saveToFavorites: 'Save to favorites',
        removeFromFavorites: 'Remove from favorites',
        allArticles: 'All articles',
        allArticlesDescription: 'View everything in the river',
        favorites: 'Favorites',
        favoritesMeta: '{count} saved article(s)',
        untitledFeed: 'Untitled feed',
        untitledArticle: 'Untitled article',
        unknownSource: 'Unknown source',
        noLink: 'No link',
        open: 'Open',
        refresh: 'Refresh',
        delete: 'Delete',
        older: 'Older',
        today: 'Today',
        yesterday: 'Yesterday',
        noArticlesFoundTitle: 'No articles found',
        noArticlesFoundBody: 'Try a different search term, add a feed, or refresh your subscriptions to pull in new stories.',
        noFavoritesTitle: 'No favorites yet',
        noFavoritesBody: 'Tap the star on an article to save it here for later.',
        noHelpTopics: 'No help topics match your search.',
        contentUnavailableTitle: 'Content unavailable',
        contentUnavailableBody: 'The reader could not load feeds or articles. Check the API, then refresh the page.',
        chatEmpty: 'Ask about your articles or feeds, in any language.',
        thinking: 'Thinking...',
        assistantUnavailable: 'The assistant is unavailable right now.',
        noResponse: 'No response received.',
        couldNotReachAssistant: 'Could not reach the assistant. Check your connection and try again.',
        linkCopied: 'Link copied to clipboard',
        couldNotCopyLink: 'Could not copy link',
        feedAdded: 'Feed added.',
        feedsRefreshed: 'Feeds refreshed.',
        failedToRefreshFeeds: 'Failed to refresh feeds.',
        enterFeedUrl: 'Enter a feed URL.',
        addingFeed: 'Adding feed...',
        unableToAddFeed: 'Unable to add feed.',
        unableToRefreshFeed: 'Unable to refresh feed.',
        unableToDeleteFeed: 'Unable to delete feed.',
        unableToLoadData: 'Unable to load data right now.',
        unexpectedError: 'An unexpected error occurred.',
        feedUpdated: 'Updated {name}.',
        feedRemoved: 'Removed {name}.',
        viewArticlesFrom: 'View articles from {name}',
        moreActionsFor: 'More actions for {name}',
        refreshFeedAria: 'Refresh {name}',
        deleteFeedAria: 'Delete {name}',
        confirmRemoveFeed: 'Remove {name} from your subscriptions?\n\nYou can add it back later if needed.',
        openArticleAria: 'Open article {title}',
        copyLinkToAria: 'Copy link to {title}',
        saveFavoriteAria: 'Save {title} to favorites',
        removeFavoriteAria: 'Remove {title} from favorites',
        viewingAllFeeds: 'all feeds',
        viewingFavorites: 'favorites',
        viewingSelectedFeed: 'selected feed',
        viewingDescriptor: 'Viewing {descriptor}.',
        viewingDescriptorSearch: 'Viewing {descriptor}. Search active.',
        refreshingFeeds: 'Refreshing feeds...',
        thisFeed: 'this feed',
        notFeedLink: 'That link does not look like an RSS or Atom feed. Please paste the feed address, not the website homepage.',
        invalidFeedUrl: 'Please enter a valid http:// or https:// feed URL.',
        alreadySubscribed: 'That feed is already in your subscriptions.',
        couldNotReachFeed: 'We could not reach that feed right now. Please check the address and try again.',
    },
    ar: {
        appTitle: 'قارئ RSS',
        switchToArabic: 'AR',
        switchToEnglish: 'EN',
        switchToArabicAria: 'تبديل لغة الواجهة إلى العربية',
        switchToEnglishAria: 'تبديل لغة الواجهة إلى الإنجليزية',
        openNavigation: 'فتح التنقل',
        toggleDarkMode: 'تبديل الوضع الداكن',
        searchPlaceholder: 'ابحث في المقالات أو المصادر',
        refreshAll: 'تحديث الكل',
        subscriptions: 'الاشتراكات',
        sidebarDescription: 'أضف رابط مصدر RSS، حدّث المصادر، أو احذف مصدرًا لم تعد بحاجة إليه.',
        addFeed: 'إضافة مصدر',
        feedUrlLabel: 'رابط RSS أو Atom',
        latestArticles: 'أحدث المقالات',
        loadingFeeds: 'جارٍ تحميل المصادر والمقالات...',
        articlesAriaLabel: 'المقالات',
        openHelp: 'فتح المساعدة',
        helpHeading: 'كيف يمكننا المساعدة؟',
        closeHelp: 'إغلاق المساعدة',
        searchHelpTopics: 'ابحث في مواضيع المساعدة',
        openAssistant: 'فتح المساعد الذكي',
        askAssistant: 'اسأل المساعد',
        closeAssistant: 'إغلاق المساعد الذكي',
        askQuestion: 'اطرح سؤالاً',
        askQuestionPlaceholder: 'اطرح سؤالاً...',
        sendMessage: 'إرسال الرسالة',
        copyArticleLink: 'نسخ رابط المقال',
        saveToFavorites: 'إضافة إلى المفضلة',
        removeFromFavorites: 'إزالة من المفضلة',
        allArticles: 'كل المقالات',
        allArticlesDescription: 'عرض كل شيء في القائمة',
        favorites: 'المفضلة',
        favoritesMeta: '{count} مقال محفوظ',
        untitledFeed: 'مصدر بدون عنوان',
        untitledArticle: 'مقال بدون عنوان',
        unknownSource: 'مصدر غير معروف',
        noLink: 'لا يوجد رابط',
        open: 'فتح',
        refresh: 'تحديث',
        delete: 'حذف',
        older: 'أقدم',
        today: 'اليوم',
        yesterday: 'أمس',
        noArticlesFoundTitle: 'لا توجد مقالات',
        noArticlesFoundBody: 'جرّب كلمة بحث مختلفة، أضف مصدرًا، أو حدّث اشتراكاتك لجلب قصص جديدة.',
        noFavoritesTitle: 'لا توجد مفضلات بعد',
        noFavoritesBody: 'اضغط على النجمة في أي مقال لحفظه هنا لوقت لاحق.',
        noHelpTopics: 'لا توجد مواضيع مساعدة مطابقة لبحثك.',
        contentUnavailableTitle: 'المحتوى غير متاح',
        contentUnavailableBody: 'تعذّر على القارئ تحميل المصادر أو المقالات. تحقق من الـ API ثم أعد تحميل الصفحة.',
        chatEmpty: 'اسأل عن مقالاتك أو مصادرك، بأي لغة.',
        thinking: 'جارٍ التفكير...',
        assistantUnavailable: 'المساعد غير متاح حاليًا.',
        noResponse: 'لم يتم استلام أي رد.',
        couldNotReachAssistant: 'تعذّر الوصول إلى المساعد. تحقق من اتصالك وحاول مرة أخرى.',
        linkCopied: 'تم نسخ الرابط',
        couldNotCopyLink: 'تعذّر نسخ الرابط',
        feedAdded: 'تمت إضافة المصدر.',
        feedsRefreshed: 'تم تحديث المصادر.',
        failedToRefreshFeeds: 'فشل تحديث المصادر.',
        enterFeedUrl: 'أدخل رابط مصدر.',
        addingFeed: 'جارٍ إضافة المصدر...',
        unableToAddFeed: 'تعذّرت إضافة المصدر.',
        unableToRefreshFeed: 'تعذّر تحديث المصدر.',
        unableToDeleteFeed: 'تعذّر حذف المصدر.',
        unableToLoadData: 'تعذّر تحميل البيانات الآن.',
        unexpectedError: 'حدث خطأ غير متوقع.',
        feedUpdated: 'تم تحديث {name}.',
        feedRemoved: 'تمت إزالة {name}.',
        viewArticlesFrom: 'عرض مقالات {name}',
        moreActionsFor: 'إجراءات إضافية لـ {name}',
        refreshFeedAria: 'تحديث {name}',
        deleteFeedAria: 'حذف {name}',
        confirmRemoveFeed: 'إزالة {name} من اشتراكاتك؟\n\nيمكنك إضافته مرة أخرى لاحقًا إذا لزم الأمر.',
        openArticleAria: 'فتح مقال {title}',
        copyLinkToAria: 'نسخ رابط {title}',
        saveFavoriteAria: 'حفظ {title} في المفضلة',
        removeFavoriteAria: 'إزالة {title} من المفضلة',
        viewingAllFeeds: 'كل المصادر',
        viewingFavorites: 'المفضلة',
        viewingSelectedFeed: 'المصدر المحدد',
        viewingDescriptor: 'عرض {descriptor}.',
        viewingDescriptorSearch: 'عرض {descriptor}. البحث مفعّل.',
        refreshingFeeds: 'جارٍ تحديث المصادر...',
        thisFeed: 'هذا المصدر',
        notFeedLink: 'هذا الرابط لا يبدو مصدر RSS أو Atom. الرجاء لصق رابط المصدر نفسه، وليس الصفحة الرئيسية للموقع.',
        invalidFeedUrl: 'الرجاء إدخال رابط مصدر صالح يبدأ بـ http:// أو https://.',
        alreadySubscribed: 'هذا المصدر مضاف بالفعل إلى اشتراكاتك.',
        couldNotReachFeed: 'تعذّر الوصول إلى هذا المصدر الآن. الرجاء التحقق من الرابط والمحاولة مرة أخرى.',
    },
};

let currentLang = 'en';

function t(key, vars) {
    const dict = translations[currentLang] || translations.en;
    let text = dict[key] ?? translations.en[key] ?? key;
    if (vars) {
        for (const [name, value] of Object.entries(vars)) {
            text = text.replaceAll(`{${name}}`, value);
        }
    }
    return text;
}

function applyStaticTranslations() {
    for (const el of document.querySelectorAll('[data-i18n]')) {
        el.textContent = t(el.dataset.i18n);
    }
    for (const el of document.querySelectorAll('[data-i18n-placeholder]')) {
        el.setAttribute('placeholder', t(el.dataset.i18nPlaceholder));
    }
    for (const el of document.querySelectorAll('[data-i18n-aria-label]')) {
        el.setAttribute('aria-label', t(el.dataset.i18nAriaLabel));
    }
}

function updateLangToggle() {
    if (currentLang === 'ar') {
        elements.langToggle.textContent = t('switchToEnglish');
        elements.langToggle.setAttribute('aria-label', t('switchToEnglishAria'));
    } else {
        elements.langToggle.textContent = t('switchToArabic');
        elements.langToggle.setAttribute('aria-label', t('switchToArabicAria'));
    }
}

function applyLanguage(lang) {
    currentLang = lang === 'ar' ? 'ar' : 'en';
    document.documentElement.setAttribute('lang', currentLang);
    document.documentElement.setAttribute('dir', currentLang === 'ar' ? 'rtl' : 'ltr');
    applyStaticTranslations();
    updateLangToggle();
    renderHelpTopics(elements.helpSearchInput.value);
    renderChatMessages();
    render();
}

function loadLanguage() {
    const saved = window.localStorage.getItem(langStorageKey);
    applyLanguage(saved === 'ar' ? 'ar' : 'en');
}

function toggleLanguage() {
    const next = currentLang === 'ar' ? 'en' : 'ar';
    window.localStorage.setItem(langStorageKey, next);
    applyLanguage(next);
}

function getDateFormatter() {
    return new Intl.DateTimeFormat(currentLang === 'ar' ? 'ar' : undefined, {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
    });
}

function getSectionFormatter() {
    return new Intl.DateTimeFormat(currentLang === 'ar' ? 'ar' : undefined, {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
    });
}

/**
 * Applies automatic text direction (RTL/LTR) to an element based on its text content.
 * Uses the browser's native `dir="auto"` for robust RTL detection across
 * Arabic, Urdu, Hebrew, Persian, and other RTL scripts.
 */
function applyDirection(element, _text) {
  element.setAttribute('dir', 'auto');
}

let toastHost;
let toastTimers = [];

function stripHtml(value) {
    const temp = document.createElement('div');
    temp.innerHTML = value ?? '';
    return temp.textContent?.trim() ?? '';
}

function loadReadState() {
    try {
        const raw = window.localStorage.getItem(readStorageKey);
        const values = raw ? JSON.parse(raw) : [];
        state.readArticleIds = new Set(Array.isArray(values) ? values : []);
    } catch {
        state.readArticleIds = new Set();
    }
}

function saveReadState() {
    window.localStorage.setItem(readStorageKey, JSON.stringify([...state.readArticleIds]));
}

function markArticleRead(articleId) {
    if (!articleId || state.readArticleIds.has(articleId)) {
        return;
    }

    state.readArticleIds.add(articleId);
    saveReadState();
    renderArticles();
}

function loadFavoritesState() {
    try {
        const raw = window.localStorage.getItem(favoritesStorageKey);
        const values = raw ? JSON.parse(raw) : [];
        state.favoriteArticleIds = new Set(Array.isArray(values) ? values : []);
    } catch {
        state.favoriteArticleIds = new Set();
    }
}

function saveFavoritesState() {
    window.localStorage.setItem(favoritesStorageKey, JSON.stringify([...state.favoriteArticleIds]));
}

function toggleArticleFavorite(articleId) {
    if (!articleId) {
        return;
    }

    if (state.favoriteArticleIds.has(articleId)) {
        state.favoriteArticleIds.delete(articleId);
    } else {
        state.favoriteArticleIds.add(articleId);
    }

    saveFavoritesState();
    renderArticles();
    renderFeeds();
}

/* ---------- Theme handling ---------- */

function isDarkActive() {
    const current = document.documentElement.getAttribute('data-theme');
    if (current === 'dark') {
        return true;
    }
    if (current === 'light') {
        return false;
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function updateThemeColorMeta() {
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) {
        meta.setAttribute('content', isDarkActive() ? '#0e1013' : '#F8F9FA');
    }
}

function applyTheme(theme) {
    if (theme === 'dark' || theme === 'light') {
        document.documentElement.setAttribute('data-theme', theme);
    } else {
        document.documentElement.removeAttribute('data-theme');
    }
    updateThemeColorMeta();
}

function loadTheme() {
    const saved = window.localStorage.getItem(themeStorageKey);
    applyTheme(saved);
}

function toggleTheme() {
    const next = isDarkActive() ? 'light' : 'dark';
    applyTheme(next);
    window.localStorage.setItem(themeStorageKey, next);
}

function formatTime(value) {
    if (!value) {
        return '—';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
        return '—';
    }

    return getDateFormatter().format(date);
}

function groupLabel(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return t('older');
    }

    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) {
        return t('today');
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return t('yesterday');
    }

    return getSectionFormatter().format(date);
}

function setStatus(message, tone = 'neutral') {
    elements.statusText.textContent = message;
    elements.statusText.dataset.tone = tone;
}

function setFeedMessage(message, tone = 'neutral') {
    elements.feedFormMessage.textContent = message;
    elements.feedFormMessage.dataset.tone = tone;
}

function clearFeedMessage() {
    elements.feedFormMessage.textContent = '';
    delete elements.feedFormMessage.dataset.tone;
}

function ensureToastHost() {
    if (!toastHost) {
        toastHost = document.createElement('div');
        toastHost.className = 'toast-host';
        toastHost.setAttribute('aria-live', 'polite');
        toastHost.setAttribute('aria-atomic', 'true');
        document.body.append(toastHost);
    }

    return toastHost;
}

function showToast(message, tone = 'neutral') {
    if (!message) {
        return;
    }

    const host = ensureToastHost();
    const toast = document.createElement('div');
    toast.className = 'toast';
    if (tone !== 'neutral') {
        toast.dataset.tone = tone;
    }
    toast.textContent = message;
    host.append(toast);

    const timer = window.setTimeout(() => {
        toast.classList.add('is-leaving');
        window.setTimeout(() => toast.remove(), 180);
    }, 3200);

    toastTimers.push(timer);
}

async function copyTextToClipboard(text) {
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        return;
    }

    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.append(textarea);
    textarea.select();
    document.execCommand('copy');
    textarea.remove();
}

async function shareArticle(url, title) {
    if (navigator.share) {
        try {
            await navigator.share({ title, url });
            return;
        } catch (error) {
            if (error?.name === 'AbortError') {
                return;
            }
        }
    }

    try {
        await copyTextToClipboard(url);
        showToast(t('linkCopied'), 'success');
    } catch {
        showToast(t('couldNotCopyLink'), 'error');
    }
}

function getFeedById(feedId) {
    return state.feeds.find((feed) => feed.id === feedId);
}

function getFeedAccent(seed) {
    const text = `${seed ?? ''}`;
    let hash = 0;
    for (let i = 0; i < text.length; i += 1) {
        hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
    }

    const palette = ['#5b6b2f', '#2f5d62', '#8a5a3c', '#6b4e71', '#556b8d'];
    return palette[hash % palette.length];
}

function getFeedHost(feed) {
    const source = feed?.siteUrl || feed?.url;
    if (!source) {
        return '';
    }

    try {
        return new URL(source).hostname.replace(/^www\./i, '');
    } catch {
        return source;
    }
}

function getFaviconUrl(feed) {
    const host = getFeedHost(feed);
    if (!host) {
        return '';
    }

    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=64`;
}

function openDrawer() {
    elements.sidebar.classList.add('is-open');
    elements.backdrop.classList.add('is-open');
    elements.backdrop.hidden = false;
    elements.menuButton.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
}

function closeDrawer() {
    elements.sidebar.classList.remove('is-open');
    elements.backdrop.classList.remove('is-open');
    elements.backdrop.hidden = true;
    elements.menuButton.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
}

function toggleDrawer() {
    if (elements.sidebar.classList.contains('is-open')) {
        closeDrawer();
    } else {
        openDrawer();
    }
}

function makeFeedActionButton(label, tone = 'neutral') {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = `feed-item__action${tone === 'danger' ? ' feed-item__action--danger' : ''}`;
    button.textContent = label;
    return button;
}

function getFeedDisplayName(feed) {
    return feed.title || feed.siteUrl || feed.url || t('thisFeed');
}

function getFriendlyFeedError(message, fallbackMessage) {
    const normalized = (message || '').trim().toLowerCase();

    if (!normalized) {
        return fallbackMessage;
    }

    if (normalized.includes('parse error') || normalized.includes('not a valid feed') || normalized.includes('invalid feed')) {
        return t('notFeedLink');
    }

    if (normalized.includes('invalid url')) {
        return t('invalidFeedUrl');
    }

    if (normalized.includes('already subscribed')) {
        return t('alreadySubscribed');
    }

    if (normalized.includes('fetch failed') || normalized.includes('unreachable') || normalized.includes('could not') || normalized.includes('connection')) {
        return t('couldNotReachFeed');
    }

    return message;
}

async function refreshFeed(feedId) {
    const response = await fetch(`/api/feeds/${feedId}/refresh`, { method: 'POST' });
    if (!response.ok) {
        throw new Error(`Refresh failed (${response.status})`);
    }
}

async function deleteFeed(feedId) {
    const response = await fetch(`/api/feeds/${feedId}`, { method: 'DELETE' });
    if (!response.ok) {
        throw new Error(`Delete failed (${response.status})`);
    }
}

function buildFeedChip(feed) {
    const chip = document.createElement('div');
    chip.className = `feed-item${state.selectedFeedId === feed.id ? ' is-active' : ''}`;
    chip.dataset.feedId = feed.id;
    chip.style.setProperty('--item-accent', getFeedAccent(feed.title || feed.url));

    const main = document.createElement('div');
    main.className = 'feed-item__main';

    const favicon = document.createElement('img');
    favicon.className = 'feed-item__favicon';
    favicon.alt = '';
    favicon.loading = 'lazy';
    favicon.referrerPolicy = 'no-referrer';
    const faviconUrl = getFaviconUrl(feed);
    if (faviconUrl) {
        favicon.src = faviconUrl;
    }

    const title = document.createElement('strong');
    title.className = 'feed-item__title';
    title.textContent = feed.title || t('untitledFeed');

    const meta = document.createElement('span');
    meta.className = 'feed-item__meta';
    meta.textContent = getFeedHost(feed) || feed.siteUrl || feed.url;

    if (faviconUrl) {
        main.append(favicon);
    }
    main.append(title, meta);
    const selectButton = document.createElement('button');
    selectButton.type = 'button';
    selectButton.className = 'feed-item__select';
    selectButton.setAttribute('aria-label', t('viewArticlesFrom', { name: getFeedDisplayName(feed) }));
    selectButton.append(main);

    selectButton.addEventListener('click', () => {
        state.selectedFeedId = feed.id;
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
    });

    const moreButton = document.createElement('button');
    moreButton.type = 'button';
    moreButton.className = 'feed-item__more';
    moreButton.setAttribute('aria-label', t('moreActionsFor', { name: getFeedDisplayName(feed) }));
    moreButton.setAttribute('aria-expanded', 'false');
    moreButton.innerHTML = '<i class="bi bi-three-dots-vertical" aria-hidden="true"></i>';

    const actions = document.createElement('div');
    actions.className = 'feed-item__actions';

    moreButton.addEventListener('click', (event) => {
        event.stopPropagation();
        const isOpen = actions.classList.contains('is-open');
        closeAllFeedActions();
        if (!isOpen) {
            actions.classList.add('is-open');
            moreButton.setAttribute('aria-expanded', 'true');
        }
    });

    const refreshButton = makeFeedActionButton(t('refresh'));
    refreshButton.setAttribute('aria-label', t('refreshFeedAria', { name: getFeedDisplayName(feed) }));
    refreshButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        refreshButton.disabled = true;
        try {
            await refreshFeed(feed.id);
            await loadData();
            showToast(t('feedUpdated', { name: getFeedDisplayName(feed) }), 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : t('unableToRefreshFeed');
            showToast(getFriendlyFeedError(message, t('unableToRefreshFeed')), 'error');
        } finally {
            refreshButton.disabled = false;
        }
    });

    const deleteButton = makeFeedActionButton(t('delete'), 'danger');
    deleteButton.setAttribute('aria-label', t('deleteFeedAria', { name: getFeedDisplayName(feed) }));
    deleteButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const confirmed = window.confirm(t('confirmRemoveFeed', { name: getFeedDisplayName(feed) }));
        if (!confirmed) {
            return;
        }

        deleteButton.disabled = true;
        try {
            await deleteFeed(feed.id);
            if (state.selectedFeedId === feed.id) {
                state.selectedFeedId = 'all';
            }
            await loadData();
            showToast(t('feedRemoved', { name: getFeedDisplayName(feed) }), 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : t('unableToDeleteFeed');
            showToast(getFriendlyFeedError(message, t('unableToDeleteFeed')), 'error');
        } finally {
            deleteButton.disabled = false;
        }
    });

    actions.append(refreshButton, deleteButton);
    chip.append(selectButton, moreButton, actions);

    return chip;
}

function closeAllFeedActions() {
    for (const actions of document.querySelectorAll('.feed-item__actions.is-open')) {
        actions.classList.remove('is-open');
    }
    for (const button of document.querySelectorAll('.feed-item__more[aria-expanded="true"]')) {
        button.setAttribute('aria-expanded', 'false');
    }
}

function filteredArticles() {
    const query = state.search.trim().toLowerCase();

    return [...state.articles]
        .filter((article) => {
            let matchesFeed;
            if (state.selectedFeedId === 'all') {
                matchesFeed = true;
            } else if (state.selectedFeedId === 'favorites') {
                matchesFeed = state.favoriteArticleIds.has(article.id);
            } else {
                matchesFeed = article.feedId === state.selectedFeedId;
            }
            const searchableText = [article.title, article.feedTitle, article.summary]
                .join(' ')
                .toLowerCase();
            const matchesSearch = !query || searchableText.includes(query);
            return matchesFeed && matchesSearch;
        })
        .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());
}

function renderArticles() {
    const articles = filteredArticles();
    elements.articleFeed.innerHTML = '';

    if (!articles.length) {
        const isFavoritesView = state.selectedFeedId === 'favorites';
        const empty = document.createElement('div');
        empty.className = 'empty-state';

        const heading = document.createElement('h4');
        heading.textContent = isFavoritesView ? t('noFavoritesTitle') : t('noArticlesFoundTitle');

        const body = document.createElement('p');
        body.textContent = isFavoritesView ? t('noFavoritesBody') : t('noArticlesFoundBody');

        empty.append(heading, body);
        elements.articleFeed.append(empty);
        return;
    }

    const buckets = new Map();
    for (const article of articles) {
        const label = groupLabel(article.publishedAt);
        if (!buckets.has(label)) {
            buckets.set(label, []);
        }
        buckets.get(label).push(article);
    }

    for (const [label, groupedArticles] of buckets.entries()) {
        const section = document.createElement('section');
        section.className = 'article-group';

        const heading = document.createElement('p');
        heading.className = 'article-group__label';
        heading.textContent = label;

        const list = document.createElement('div');
        list.className = 'article-group__list';

        for (const article of groupedArticles) {
            const card = elements.articleCardTemplate.content.firstElementChild.cloneNode(true);
            const feed = getFeedById(article.feedId);
            const feedAccent = getFeedAccent(feed?.title || article.feedTitle || article.feedId);
            const source = card.querySelector('.article-card__source');
            const sourceText = feed?.title || article.feedTitle || t('unknownSource');
            const faviconUrl = getFaviconUrl(feed);
            source.style.setProperty('--feed-accent', feedAccent);
            if (faviconUrl) {
                card.classList.add('article-card--with-favicon');
                const favicon = document.createElement('img');
                favicon.className = 'article-card__favicon';
                favicon.alt = '';
                favicon.loading = 'lazy';
                favicon.referrerPolicy = 'no-referrer';
                favicon.src = faviconUrl;
                source.append(favicon);
            }
                        source.append(document.createTextNode(sourceText));

            // --- Title with RTL support ---
            const titleEl = card.querySelector('.article-card__title');
            const articleTitle = article.title || t('untitledArticle');
            titleEl.textContent = articleTitle;
            applyDirection(titleEl, articleTitle);

            card.querySelector('.article-card__time').textContent = formatTime(article.publishedAt);

            // --- Image display ---
            const mediaContainer = card.querySelector('.article-card__media');
            const img = card.querySelector('.article-card__image');
            if (article.imageUrl) {
                img.src = article.imageUrl;
                img.alt = articleTitle;
                mediaContainer.hidden = false;
                card.classList.add('article-card--with-image');
            } else {
                mediaContainer.hidden = true;
                img.removeAttribute('src');
            }

            // --- Summary with RTL support ---
            const summaryText = stripHtml(article.summary);
            const summary = card.querySelector('.article-card__summary');
            if (summaryText) {
                summary.textContent = summaryText;
                applyDirection(summary, summaryText);
            } else {
                summary.remove();
                card.classList.add('article-card--compact');
            }

            const feedLabel = card.querySelector('.article-card__feed');
            const feedHost = getFeedHost(feed);
            feedLabel.textContent = feedHost ? feedHost : (article.feedTitle || '');
            if (feedHost) {
                feedLabel.style.setProperty('--feed-accent', feedAccent);
            }

            card.dataset.read = state.readArticleIds.has(article.id) ? 'true' : 'false';
            card.style.setProperty('--feed-accent', feedAccent);
            const link = card.querySelector('.article-card__link');
            link.href = article.link || '#';
            link.textContent = article.link ? t('open') : t('noLink');
            link.setAttribute('aria-label', t('openArticleAria', { title: articleTitle }));

            const isFavorite = state.favoriteArticleIds.has(article.id);
            const favoriteButton = card.querySelector('.article-card__favorite');
            favoriteButton.classList.toggle('is-active', isFavorite);
            favoriteButton.innerHTML = `<i class="bi ${isFavorite ? 'bi-star-fill' : 'bi-star'}" aria-hidden="true"></i>`;
            favoriteButton.setAttribute('aria-label', t(isFavorite ? 'removeFavoriteAria' : 'saveFavoriteAria', { title: articleTitle }));
            favoriteButton.setAttribute('aria-pressed', isFavorite ? 'true' : 'false');
            favoriteButton.addEventListener('click', () => toggleArticleFavorite(article.id));

            const shareButton = card.querySelector('.article-card__share');
            if (!article.link) {
                link.setAttribute('aria-disabled', 'true');
                link.tabIndex = -1;
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.55';
                shareButton.disabled = true;
                shareButton.style.opacity = '0.55';
                shareButton.setAttribute('aria-label', t('copyArticleLink'));
            } else {
                link.addEventListener('click', () => markArticleRead(article.id));
                shareButton.setAttribute('aria-label', t('copyLinkToAria', { title: articleTitle }));
                shareButton.addEventListener('click', () => shareArticle(article.link, articleTitle));
            }
            list.append(card);
        }

        section.append(heading, list);
        elements.articleFeed.append(section);
    }
}

function renderFeeds() {
    const fragment = document.createDocumentFragment();
    const allButton = document.createElement('button');
    allButton.type = 'button';
    allButton.className = `feed-item${state.selectedFeedId === 'all' ? ' is-active' : ''}`;
    allButton.dataset.feedId = 'all';

    const allMain = document.createElement('div');
    allMain.className = 'feed-item__main';
    const allTitle = document.createElement('strong');
    allTitle.className = 'feed-item__title';
    allTitle.textContent = t('allArticles');
    const allMeta = document.createElement('span');
    allMeta.className = 'feed-item__meta';
    allMeta.textContent = t('allArticlesDescription');
    allMain.append(allTitle, allMeta);
    allButton.append(allMain);
    allButton.addEventListener('click', () => {
        state.selectedFeedId = 'all';
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
    });
    fragment.append(allButton);

    const favoritesButton = document.createElement('button');
    favoritesButton.type = 'button';
    favoritesButton.className = `feed-item${state.selectedFeedId === 'favorites' ? ' is-active' : ''}`;
    favoritesButton.dataset.feedId = 'favorites';

    const favMain = document.createElement('div');
    favMain.className = 'feed-item__main';
    const favTitle = document.createElement('strong');
    favTitle.className = 'feed-item__title';
    favTitle.textContent = t('favorites');
    const favMeta = document.createElement('span');
    favMeta.className = 'feed-item__meta';
    favMeta.textContent = t('favoritesMeta', { count: state.favoriteArticleIds.size });
    favMain.append(favTitle, favMeta);
    favoritesButton.append(favMain);
    favoritesButton.addEventListener('click', () => {
        state.selectedFeedId = 'favorites';
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
    });
    fragment.append(favoritesButton);

    for (const feed of state.feeds) {
        fragment.append(buildFeedChip(feed));
    }

    elements.feedList.innerHTML = '';
    elements.feedList.append(fragment);
}

function renderStats() {
    const latestArticle = [...state.articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0];
    elements.topbarStat.textContent = `${state.feeds.length} feeds · ${state.articles.length} articles · updated ${latestArticle ? formatTime(latestArticle.publishedAt) : '—'}`;
}

function updateViewStatus() {
    let descriptor;
    if (state.selectedFeedId === 'all') {
        descriptor = t('viewingAllFeeds');
    } else if (state.selectedFeedId === 'favorites') {
        descriptor = t('viewingFavorites');
    } else {
        descriptor = state.feeds.find((feed) => feed.id === state.selectedFeedId)?.title || t('viewingSelectedFeed');
    }
    const query = state.search.trim();
    setStatus(query ? t('viewingDescriptorSearch', { descriptor }) : t('viewingDescriptor', { descriptor }));
}

function render() {
    renderFeeds();
    renderArticles();
    renderStats();
    updateViewStatus();
}

/* ---------- Help widget ---------- */

const helpTopics = [
    {
        question: {
            en: 'How do I add a feed?',
            ar: 'كيف أضيف مصدرًا؟',
        },
        answer: {
            en: 'Open the sidebar (tap the menu icon on mobile), paste an RSS or Atom feed URL into "Add feed", and submit. The reader fetches it right away and adds it to your subscriptions.',
            ar: 'افتح الشريط الجانبي (اضغط على أيقونة القائمة على الجوال)، ألصق رابط مصدر RSS أو Atom في "إضافة مصدر"، ثم أرسل. سيقوم القارئ بجلبه فورًا وإضافته إلى اشتراكاتك.',
        },
    },
    {
        question: {
            en: 'How do I refresh a feed?',
            ar: 'كيف أحدّث مصدرًا؟',
        },
        answer: {
            en: 'Click "Refresh" next to a feed in the sidebar to pull new articles from just that source, or use "Refresh all" in the top bar to update every subscription at once.',
            ar: 'اضغط على "تحديث" بجانب أي مصدر في الشريط الجانبي لجلب مقالات جديدة من هذا المصدر فقط، أو استخدم "تحديث الكل" في الشريط العلوي لتحديث جميع الاشتراكات دفعة واحدة.',
        },
    },
    {
        question: {
            en: 'How do I remove a feed?',
            ar: 'كيف أحذف مصدرًا؟',
        },
        answer: {
            en: 'Click "Delete" next to a feed in the sidebar. You will be asked to confirm, and you can always add the same feed URL back later.',
            ar: 'اضغط على "حذف" بجانب أي مصدر في الشريط الجانبي. سيُطلب منك التأكيد، ويمكنك دائمًا إضافة نفس رابط المصدر مرة أخرى لاحقًا.',
        },
    },
    {
        question: {
            en: 'How do I search articles?',
            ar: 'كيف أبحث في المقالات؟',
        },
        answer: {
            en: 'Use the search box in the top bar. It matches against article titles, feed titles, and summaries as you type.',
            ar: 'استخدم مربع البحث في الشريط العلوي. يطابق البحث عناوين المقالات وعناوين المصادر والملخصات أثناء الكتابة.',
        },
    },
    {
        question: {
            en: 'How do I view articles from one feed only?',
            ar: 'كيف أعرض مقالات مصدر واحد فقط؟',
        },
        answer: {
            en: 'Click a feed in the sidebar to filter the river to just that subscription. Click "All articles" to go back to the unified view.',
            ar: 'اضغط على أحد المصادر في الشريط الجانبي لتصفية القائمة إلى هذا الاشتراك فقط. اضغط على "كل المقالات" للعودة إلى العرض الموحد.',
        },
    },
    {
        question: {
            en: 'How do I save an article to favorites?',
            ar: 'كيف أحفظ مقالًا في المفضلة؟',
        },
        answer: {
            en: 'Click the star icon on any article card to save it. Click "Favorites" in the sidebar to see every article you have starred, stored locally on this device.',
            ar: 'اضغط على أيقونة النجمة في أي بطاقة مقال لحفظه. اضغط على "المفضلة" في الشريط الجانبي لرؤية كل المقالات التي حفظتها، ويتم تخزينها محليًا على هذا الجهاز.',
        },
    },
    {
        question: {
            en: 'How do I share an article?',
            ar: 'كيف أشارك مقالًا؟',
        },
        answer: {
            en: 'Click the share icon next to "Open" on any article card. It uses your device\'s share menu when available, or copies the article link to your clipboard.',
            ar: 'اضغط على أيقونة المشاركة بجانب "فتح" في أي بطاقة مقال. تستخدم قائمة المشاركة في جهازك عند توفرها، أو تنسخ رابط المقال إلى الحافظة.',
        },
    },
    {
        question: {
            en: 'How does read/unread tracking work?',
            ar: 'كيف يعمل تتبّع المقالات المقروءة/غير المقروءة؟',
        },
        answer: {
            en: 'Opening an article marks it as read. Read state is stored in your browser only, so it is local to this device and browser.',
            ar: 'فتح المقال يعلّمه كمقروء. تُخزَّن حالة القراءة في متصفحك فقط، لذا فهي محلية لهذا الجهاز والمتصفح.',
        },
    },
    {
        question: {
            en: 'Can I use the reader in Arabic?',
            ar: 'هل يمكنني استخدام القارئ بالعربية؟',
        },
        answer: {
            en: 'Yes. Click the language button (EN/AR) in the top bar to switch the entire interface between English and Arabic, including right-to-left layout.',
            ar: 'نعم. اضغط على زر اللغة (EN/AR) في الشريط العلوي لتبديل الواجهة بالكامل بين الإنجليزية والعربية، بما في ذلك التخطيط من اليمين إلى اليسار.',
        },
    },
    {
        question: {
            en: 'Why is an article shown right-to-left?',
            ar: 'لماذا يظهر مقال ما من اليمين إلى اليسار؟',
        },
        answer: {
            en: 'Titles and summaries automatically detect their own text direction, so Arabic, Hebrew, Urdu, and Persian articles render right-to-left while others stay left-to-right.',
            ar: 'تكتشف العناوين والملخصات اتجاه نصها تلقائيًا، لذا تُعرض المقالات بالعربية والعبرية والأردية والفارسية من اليمين إلى اليسار بينما تبقى اللغات الأخرى من اليسار إلى اليمين.',
        },
    },
    {
        question: {
            en: 'Why does an article have no image?',
            ar: 'لماذا لا تظهر صورة لمقال ما؟',
        },
        answer: {
            en: 'Not every feed includes an image. The reader shows one when the source provides an enclosure, media:content, or an image inside the article content.',
            ar: 'لا تتضمن كل المصادر صورة. يعرض القارئ صورة عندما يوفرها المصدر عبر enclosure أو media:content أو داخل محتوى المقال.',
        },
    },
];

function renderHelpTopics(filterText = '') {
    const query = filterText.trim().toLowerCase();
    const matches = helpTopics.filter((topic) =>
        !query || topic.question[currentLang].toLowerCase().includes(query) || topic.answer[currentLang].toLowerCase().includes(query)
    );

    elements.helpTopicList.innerHTML = '';

    if (!matches.length) {
        const empty = document.createElement('p');
        empty.className = 'help-panel__empty';
        empty.textContent = t('noHelpTopics');
        elements.helpTopicList.append(empty);
        return;
    }

    for (const topic of matches) {
        const item = document.createElement('div');
        item.className = 'help-topic';

        const question = document.createElement('button');
        question.type = 'button';
        question.className = 'help-topic__question';
        question.setAttribute('aria-expanded', 'false');
        question.innerHTML = `<span>${topic.question[currentLang]}</span><i class="bi bi-chevron-down" aria-hidden="true"></i>`;

        const answer = document.createElement('p');
        answer.className = 'help-topic__answer';
        answer.textContent = topic.answer[currentLang];
        answer.hidden = true;

        question.addEventListener('click', () => {
            const isOpen = item.classList.toggle('is-open');
            answer.hidden = !isOpen;
            question.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        });

        item.append(question, answer);
        elements.helpTopicList.append(item);
    }
}

function openHelpPanel() {
    elements.helpPanel.hidden = false;
    elements.helpFabButton.setAttribute('aria-expanded', 'true');
    elements.helpSearchInput.focus();
}

function closeHelpPanel() {
    elements.helpPanel.hidden = true;
    elements.helpFabButton.setAttribute('aria-expanded', 'false');
}

function toggleHelpPanel() {
    if (elements.helpPanel.hidden) {
        openHelpPanel();
    } else {
        closeHelpPanel();
    }
}

/* ---------- AI chat widget ---------- */

const chatHistory = [];

function renderChatMessages() {
    elements.chatMessages.innerHTML = '';

    if (!chatHistory.length) {
        const empty = document.createElement('p');
        empty.className = 'chat-panel__empty';
        empty.textContent = t('chatEmpty');
        elements.chatMessages.append(empty);
        return;
    }

    for (const entry of chatHistory) {
        const bubble = document.createElement('div');
        bubble.className = `chat-message chat-message--${entry.role}`;
        if (entry.pending) {
            bubble.classList.add('chat-message--pending');
        }
        if (entry.error) {
            bubble.classList.add('chat-message--error');
        }
        bubble.textContent = entry.content;
        applyDirection(bubble, entry.content);
        elements.chatMessages.append(bubble);
    }

    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

async function sendChatMessage(text) {
    chatHistory.push({ role: 'user', content: text });
    const pendingEntry = { role: 'assistant', content: t('thinking'), pending: true };
    chatHistory.push(pendingEntry);
    renderChatMessages();

    try {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                messages: chatHistory
                    .filter((entry) => !entry.pending)
                    .map((entry) => ({ role: entry.role, content: entry.content })),
            }),
        });

        let payload = null;
        try {
            payload = await response.json();
        } catch {
            // ignore non-JSON error bodies
        }

        if (!response.ok) {
            pendingEntry.content = payload?.error || t('assistantUnavailable');
            pendingEntry.pending = false;
            pendingEntry.error = true;
            renderChatMessages();
            return;
        }

        pendingEntry.content = payload?.reply || t('noResponse');
        pendingEntry.pending = false;
        renderChatMessages();
    } catch {
        pendingEntry.content = t('couldNotReachAssistant');
        pendingEntry.pending = false;
        pendingEntry.error = true;
        renderChatMessages();
    }
}

function openChatPanel() {
    elements.chatPanel.hidden = false;
    elements.chatFabButton.setAttribute('aria-expanded', 'true');
    elements.chatInput.focus();
}

function closeChatPanel() {
    elements.chatPanel.hidden = true;
    elements.chatFabButton.setAttribute('aria-expanded', 'false');
}

function toggleChatPanel() {
    if (elements.chatPanel.hidden) {
        openChatPanel();
    } else {
        closeChatPanel();
    }
}

async function loadData() {
    setStatus(t('loadingFeeds'));
    const [feedsResponse, articlesResponse] = await Promise.all([
        fetch('/api/feeds'),
        fetch('/api/articles'),
    ]);

    if (!feedsResponse.ok) {
        throw new Error(`Feed request failed (${feedsResponse.status})`);
    }

    if (!articlesResponse.ok) {
        throw new Error(`Article request failed (${articlesResponse.status})`);
    }

    state.feeds = await feedsResponse.json();
    state.articles = await articlesResponse.json();

    if (state.selectedFeedId !== 'all' && state.selectedFeedId !== 'favorites' && !state.feeds.some((feed) => feed.id === state.selectedFeedId)) {
        state.selectedFeedId = 'all';
    }

    render();
}

async function refreshAllFeeds() {
    setStatus(t('refreshingFeeds'), 'neutral');
    for (const feed of state.feeds) {
        try {
            await refreshFeed(feed.id);
        } catch {
            // ignore individual refresh failures and continue
        }
    }
    await loadData();
}

async function addFeed(url) {
    const response = await fetch('/api/feeds', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
    });

    if (response.ok) {
        showToast(t('feedAdded'), 'success');
        clearFeedMessage();
        elements.feedUrlInput.value = '';
        await loadData();
        return;
    }

    let message = t('unableToAddFeed');
    try {
        const body = await response.json();
        message = body?.error || message;
    } catch {
        // keep fallback message
    }

    showToast(getFriendlyFeedError(message, t('unableToAddFeed')), 'error');
}

function wireEvents() {
    elements.menuButton.addEventListener('click', toggleDrawer);
    elements.backdrop.addEventListener('click', closeDrawer);
    elements.langToggle.addEventListener('click', toggleLanguage);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.searchInput.addEventListener('input', (event) => {
        state.search = event.target.value;
        renderArticles();
        updateViewStatus();
    });

    elements.refreshAllButton.addEventListener('click', async () => {
        elements.refreshAllButton.disabled = true;
        try {
            await refreshAllFeeds();
            showToast(t('feedsRefreshed'), 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : t('failedToRefreshFeeds'), 'error');
        } finally {
            elements.refreshAllButton.disabled = false;
        }
    });

    elements.addFeedForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const url = elements.feedUrlInput.value.trim();
        if (!url) {
            setFeedMessage(t('enterFeedUrl'), 'error');
            return;
        }

        elements.feedFormMessage.textContent = t('addingFeed');
        elements.feedFormMessage.dataset.tone = 'neutral';
        try {
            await addFeed(url);
        } catch (error) {
            showToast(error instanceof Error ? error.message : t('unableToAddFeed'), 'error');
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDrawer();
            closeAllFeedActions();
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.feed-item__actions') && !event.target.closest('.feed-item__more')) {
            closeAllFeedActions();
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            closeDrawer();
        }
    });

    elements.helpFabButton.addEventListener('click', toggleHelpPanel);
    elements.helpCloseButton.addEventListener('click', closeHelpPanel);
    elements.helpSearchInput.addEventListener('input', (event) => {
        renderHelpTopics(event.target.value);
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !elements.helpPanel.hidden) {
            closeHelpPanel();
        }
    });

    elements.chatFabButton.addEventListener('click', toggleChatPanel);
    elements.chatCloseButton.addEventListener('click', closeChatPanel);
    elements.chatForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const text = elements.chatInput.value.trim();
        if (!text) {
            return;
        }

        elements.chatInput.value = '';
        elements.chatInput.disabled = true;
        try {
            await sendChatMessage(text);
        } finally {
            elements.chatInput.disabled = false;
            elements.chatInput.focus();
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !elements.chatPanel.hidden) {
            closeChatPanel();
        }
    });
}

async function init() {
    loadTheme();
    loadLanguage();
    wireEvents();
    loadReadState();
    loadFavoritesState();
    renderHelpTopics(elements.helpSearchInput.value);
    renderChatMessages();
    try {
        await loadData();
        setFeedMessage('');
    } catch (error) {
        setStatus(t('unableToLoadData'), 'error');
        showToast(error instanceof Error ? error.message : t('unexpectedError'), 'error');
        elements.articleFeed.innerHTML = '';
        const unavailable = document.createElement('div');
        unavailable.className = 'empty-state';
        const heading = document.createElement('h4');
        heading.textContent = t('contentUnavailableTitle');
        const body = document.createElement('p');
        body.textContent = t('contentUnavailableBody');
        unavailable.append(heading, body);
        elements.articleFeed.append(unavailable);
    }
}

init();
