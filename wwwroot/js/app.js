const state = {
  feeds: [],
  articles: [],
  search: '',
  selectedFeedId: 'all',
};

const elements = {
  sidebar: document.getElementById('sidebarDrawer'),
  backdrop: document.getElementById('drawerBackdrop'),
  menuButton: document.getElementById('menuButton'),
  searchInput: document.getElementById('searchInput'),
  refreshAllButton: document.getElementById('refreshAllButton'),
  addFeedForm: document.getElementById('addFeedForm'),
  feedUrlInput: document.getElementById('feedUrlInput'),
  feedFormMessage: document.getElementById('feedFormMessage'),
  feedList: document.getElementById('feedList'),
  feedCount: document.getElementById('feedCount'),
  articleFeed: document.getElementById('articleFeed'),
  statusText: document.getElementById('statusText'),
  statFeeds: document.getElementById('statFeeds'),
  statArticles: document.getElementById('statArticles'),
  statUpdated: document.getElementById('statUpdated'),
  feedItemTemplate: document.getElementById('feedItemTemplate'),
  articleCardTemplate: document.getElementById('articleCardTemplate'),
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

function stripHtml(value) {
  const temp = document.createElement('div');
  temp.innerHTML = value ?? '';
  return temp.textContent?.trim() ?? '';
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

  const main = document.createElement('div');
  main.className = 'feed-item__main';

  const title = document.createElement('strong');
  title.className = 'feed-item__title';
  title.textContent = feed.title || 'Untitled feed';

  const meta = document.createElement('span');
  meta.className = 'feed-item__meta';
  meta.textContent = feed.siteUrl || feed.url;

  const badge = document.createElement('span');
  badge.className = 'feed-item__badge';
  badge.textContent = feed.articleCount ?? 0;

  main.append(title, meta);
  const selectButton = document.createElement('button');
  selectButton.type = 'button';
  selectButton.className = 'feed-item__select';
  selectButton.setAttribute('aria-label', `View articles from ${getFeedDisplayName(feed)}`);
  selectButton.append(main, badge);

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
      setFeedMessage(`Updated ${getFeedDisplayName(feed)}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to refresh feed.';
      setFeedMessage(getFriendlyFeedError(message, 'Unable to refresh feed.'), 'error');
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
      setFeedMessage(`Removed ${getFeedDisplayName(feed)}.`, 'success');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to delete feed.';
      setFeedMessage(getFriendlyFeedError(message, 'Unable to delete feed.'), 'error');
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
      card.querySelector('.article-card__source').textContent = article.feedTitle || 'Unknown source';
      card.querySelector('.article-card__title').textContent = article.title || 'Untitled article';
      card.querySelector('.article-card__time').textContent = formatTime(article.publishedAt);
      card.querySelector('.article-card__summary').textContent = stripHtml(article.summary) || 'No summary available.';
      card.querySelector('.article-card__feed').textContent = article.feedTitle || '';
      const link = card.querySelector('.article-card__link');
      link.href = article.link || '#';
      link.setAttribute('aria-label', `Open article ${article.title || ''}`.trim());
      if (!article.link) {
        link.setAttribute('aria-disabled', 'true');
        link.tabIndex = -1;
        link.style.pointerEvents = 'none';
        link.style.opacity = '0.55';
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
  const allBadge = document.createElement('span');
  allBadge.className = 'feed-item__badge';
  allBadge.textContent = state.articles.length;
  allMain.append(allTitle, allMeta);
  allButton.append(allMain, allBadge);
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
  elements.feedCount.textContent = state.feeds.length;
}

function renderStats() {
  elements.statFeeds.textContent = state.feeds.length;
  elements.statArticles.textContent = state.articles.length;
  const latestArticle = [...state.articles].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())[0];
  elements.statUpdated.textContent = latestArticle ? formatTime(latestArticle.publishedAt) : '—';
}

function render() {
  renderFeeds();
  renderArticles();
  renderStats();
  const count = filteredArticles().length;
  const descriptor = state.selectedFeedId === 'all' ? 'all feeds' : (state.feeds.find((feed) => feed.id === state.selectedFeedId)?.title || 'selected feed');
  setStatus(`${count} article${count === 1 ? '' : 's'} shown from ${descriptor}.`);
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
    setFeedMessage('Feed added successfully.', 'success');
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

  setFeedMessage(getFriendlyFeedError(message, 'Unable to add feed.'), 'error');
}

function wireEvents() {
  elements.menuButton.addEventListener('click', toggleDrawer);
  elements.backdrop.addEventListener('click', closeDrawer);
  elements.searchInput.addEventListener('input', (event) => {
    state.search = event.target.value;
    renderArticles();
    const count = filteredArticles().length;
    const descriptor = state.selectedFeedId === 'all' ? 'all feeds' : (state.feeds.find((feed) => feed.id === state.selectedFeedId)?.title || 'selected feed');
    setStatus(`${count} article${count === 1 ? '' : 's'} shown from ${descriptor}.`);
  });

  elements.refreshAllButton.addEventListener('click', async () => {
    elements.refreshAllButton.disabled = true;
    try {
      await refreshAllFeeds();
      setFeedMessage('Feeds refreshed.', 'success');
    } catch (error) {
      setFeedMessage(error instanceof Error ? error.message : 'Failed to refresh feeds.', 'error');
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
      setFeedMessage(error instanceof Error ? error.message : 'Unable to add feed.', 'error');
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
}

async function init() {
  wireEvents();
  try {
    await loadData();
    setFeedMessage('');
  } catch (error) {
    setStatus('Unable to load data right now.', 'error');
    setFeedMessage(error instanceof Error ? error.message : 'An unexpected error occurred.', 'error');
    elements.articleFeed.innerHTML = `
      <div class="empty-state">
        <h4>Content unavailable</h4>
        <p>The reader could not load feeds or articles. Check the API, then refresh the page.</p>
      </div>
    `;
  }
}

init();
