const state = {
    feeds: [],
    articles: [],
    search: '',
    selectedFeedId: 'all',
    readArticleIds: new Set(),
};

const elements = {
    sidebar: document.getElementById('sidebarDrawer'),
    backdrop: document.getElementById('drawerBackdrop'),
    menuButton: document.getElementById('menuButton'),
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
};

const dateFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
});

const sectionFormatter = new Intl.DateTimeFormat(undefined, {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
});

const readStorageKey = 'rss-reader-read-articles';
const themeStorageKey = 'rss-reader-theme';

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

    return dateFormatter.format(date);
}

function groupLabel(dateValue) {
    const date = new Date(dateValue);
    if (Number.isNaN(date.getTime())) {
        return 'Older';
    }

    const now = new Date();
    const sameDay = date.toDateString() === now.toDateString();
    if (sameDay) {
        return 'Today';
    }

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
        return 'Yesterday';
    }

    return sectionFormatter.format(date);
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
    return feed.title || feed.siteUrl || feed.url || 'this feed';
}

function getFriendlyFeedError(message, fallbackMessage) {
    const normalized = (message || '').trim().toLowerCase();

    if (!normalized) {
        return fallbackMessage;
    }

    if (normalized.includes('parse error') || normalized.includes('not a valid feed') || normalized.includes('invalid feed')) {
        return 'That link does not look like an RSS or Atom feed. Please paste the feed address, not the website homepage.';
    }

    if (normalized.includes('invalid url')) {
        return 'Please enter a valid http:// or https:// feed URL.';
    }

    if (normalized.includes('already subscribed')) {
        return 'That feed is already in your subscriptions.';
    }

    if (normalized.includes('fetch failed') || normalized.includes('unreachable') || normalized.includes('could not') || normalized.includes('connection')) {
        return 'We could not reach that feed right now. Please check the address and try again.';
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
    title.textContent = feed.title || 'Untitled feed';

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
    selectButton.setAttribute('aria-label', `View articles from ${getFeedDisplayName(feed)}`);
    selectButton.append(main);

    selectButton.addEventListener('click', () => {
        state.selectedFeedId = feed.id;
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
    });

    const actions = document.createElement('div');
    actions.className = 'feed-item__actions';

    const refreshButton = makeFeedActionButton('Refresh');
    refreshButton.setAttribute('aria-label', `Refresh ${getFeedDisplayName(feed)}`);
    refreshButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        refreshButton.disabled = true;
        try {
            await refreshFeed(feed.id);
            await loadData();
            showToast(`Updated ${getFeedDisplayName(feed)}.`, 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to refresh feed.';
            showToast(getFriendlyFeedError(message, 'Unable to refresh feed.'), 'error');
        } finally {
            refreshButton.disabled = false;
        }
    });

    const deleteButton = makeFeedActionButton('Delete', 'danger');
    deleteButton.setAttribute('aria-label', `Delete ${getFeedDisplayName(feed)}`);
    deleteButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        const confirmed = window.confirm(`Remove ${getFeedDisplayName(feed)} from your subscriptions?\n\nYou can add it back later if needed.`);
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
            showToast(`Removed ${getFeedDisplayName(feed)}.`, 'success');
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unable to delete feed.';
            showToast(getFriendlyFeedError(message, 'Unable to delete feed.'), 'error');
        } finally {
            deleteButton.disabled = false;
        }
    });

    actions.append(refreshButton, deleteButton);
    chip.append(selectButton, actions);

    return chip;
}

function filteredArticles() {
    const query = state.search.trim().toLowerCase();

    return [...state.articles]
        .filter((article) => {
            const matchesFeed = state.selectedFeedId === 'all' || article.feedId === state.selectedFeedId;
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
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.innerHTML = `
      <h4>No articles found</h4>
      <p>Try a different search term, add a feed, or refresh your subscriptions to pull in new stories.</p>
    `;
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
            const sourceText = feed?.title || article.feedTitle || 'Unknown source';
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
            const articleTitle = article.title || 'Untitled article';
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
            link.textContent = article.link ? 'Open' : 'No link';
            link.setAttribute('aria-label', `Open article ${articleTitle}`.trim());
            if (!article.link) {
                link.setAttribute('aria-disabled', 'true');
                link.tabIndex = -1;
                link.style.pointerEvents = 'none';
                link.style.opacity = '0.55';
            } else {
                link.addEventListener('click', () => markArticleRead(article.id));
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
    allTitle.textContent = 'All articles';
    const allMeta = document.createElement('span');
    allMeta.className = 'feed-item__meta';
    allMeta.textContent = 'View everything in the river';
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
    const descriptor = state.selectedFeedId === 'all' ? 'all feeds' : (state.feeds.find((feed) => feed.id === state.selectedFeedId)?.title || 'selected feed');
    const query = state.search.trim();
    setStatus(query ? `Viewing ${descriptor}. Search active.` : `Viewing ${descriptor}.`);
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
        question: 'How do I add a feed?',
        answer: 'Open the sidebar (tap the menu icon on mobile), paste an RSS or Atom feed URL into "Add feed", and submit. The reader fetches it right away and adds it to your subscriptions.',
    },
    {
        question: 'How do I refresh a feed?',
        answer: 'Click "Refresh" next to a feed in the sidebar to pull new articles from just that source, or use "Refresh all" in the top bar to update every subscription at once.',
    },
    {
        question: 'How do I remove a feed?',
        answer: 'Click "Delete" next to a feed in the sidebar. You will be asked to confirm, and you can always add the same feed URL back later.',
    },
    {
        question: 'How do I search articles?',
        answer: 'Use the search box in the top bar. It matches against article titles, feed titles, and summaries as you type.',
    },
    {
        question: 'How do I view articles from one feed only?',
        answer: 'Click a feed in the sidebar to filter the river to just that subscription. Click "All articles" to go back to the unified view.',
    },
    {
        question: 'How does read/unread tracking work?',
        answer: 'Opening an article marks it as read. Read state is stored in your browser only, so it is local to this device and browser.',
    },
    {
        question: 'Why is an article shown right-to-left?',
        answer: 'Titles and summaries automatically detect their own text direction, so Arabic, Hebrew, Urdu, and Persian articles render right-to-left while others stay left-to-right.',
    },
    {
        question: 'Why does an article have no image?',
        answer: 'Not every feed includes an image. The reader shows one when the source provides an enclosure, media:content, or an image inside the article content.',
    },
];

function renderHelpTopics(filterText = '') {
    const query = filterText.trim().toLowerCase();
    const matches = helpTopics.filter((topic) =>
        !query || topic.question.toLowerCase().includes(query) || topic.answer.toLowerCase().includes(query)
    );

    elements.helpTopicList.innerHTML = '';

    if (!matches.length) {
        const empty = document.createElement('p');
        empty.className = 'help-panel__empty';
        empty.textContent = 'No help topics match your search.';
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
        question.innerHTML = `<span>${topic.question}</span><i class="bi bi-chevron-down" aria-hidden="true"></i>`;

        const answer = document.createElement('p');
        answer.className = 'help-topic__answer';
        answer.textContent = topic.answer;
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

async function loadData() {
    setStatus('Loading feeds and articles...');
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

    if (state.selectedFeedId !== 'all' && !state.feeds.some((feed) => feed.id === state.selectedFeedId)) {
        state.selectedFeedId = 'all';
    }

    render();
}

async function refreshAllFeeds() {
    setStatus('Refreshing feeds...', 'neutral');
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
        showToast('Feed added.', 'success');
        clearFeedMessage();
        elements.feedUrlInput.value = '';
        await loadData();
        return;
    }

    let message = 'Unable to add feed.';
    try {
        const body = await response.json();
        message = body?.error || message;
    } catch {
        // keep fallback message
    }

    showToast(getFriendlyFeedError(message, 'Unable to add feed.'), 'error');
}

function wireEvents() {
    elements.menuButton.addEventListener('click', toggleDrawer);
    elements.backdrop.addEventListener('click', closeDrawer);
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
            showToast('Feeds refreshed.', 'success');
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Failed to refresh feeds.', 'error');
        } finally {
            elements.refreshAllButton.disabled = false;
        }
    });

    elements.addFeedForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const url = elements.feedUrlInput.value.trim();
        if (!url) {
            setFeedMessage('Enter a feed URL.', 'error');
            return;
        }

        elements.feedFormMessage.textContent = 'Adding feed...';
        elements.feedFormMessage.dataset.tone = 'neutral';
        try {
            await addFeed(url);
        } catch (error) {
            showToast(error instanceof Error ? error.message : 'Unable to add feed.', 'error');
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            closeDrawer();
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
}

async function init() {
    loadTheme();
    wireEvents();
    loadReadState();
    renderHelpTopics();
    try {
        await loadData();
        setFeedMessage('');
    } catch (error) {
        setStatus('Unable to load data right now.', 'error');
        showToast(error instanceof Error ? error.message : 'An unexpected error occurred.', 'error');
        elements.articleFeed.innerHTML = `
      <div class="empty-state">
        <h4>Content unavailable</h4>
        <p>The reader could not load feeds or articles. Check the API, then refresh the page.</p>
      </div>
    `;
    }
}

init();