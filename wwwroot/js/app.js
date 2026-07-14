const state = {
    feeds: [],
    articles: [],
    categories: [],
    historyArticles: [],
    search: '',
    selectedFeedId: 'all',
    currentPage: 1,
    readArticleIds: new Set(),
    favoriteArticleIds: new Set(),
    currentUser: null,
    communityPosts: [],
    activeThreadId: null,
};

const CATEGORY_FILTER_PREFIX = 'category:';

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
    categoryPills: document.getElementById('categoryPills'),
    articleFeed: document.getElementById('articleFeed'),
    paginationBar: document.getElementById('paginationBar'),
    paginationPrev: document.getElementById('paginationPrev'),
    paginationNext: document.getElementById('paginationNext'),
    paginationStatus: document.getElementById('paginationStatus'),
    paginationJumpInput: document.getElementById('paginationJumpInput'),
    dailySummaryCard: document.getElementById('dailySummaryCard'),
    dailySummaryBody: document.getElementById('dailySummaryBody'),
    dailySummaryRefresh: document.getElementById('dailySummaryRefresh'),
    dailySummaryToggle: document.getElementById('dailySummaryToggle'),
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
    communityNavButton: document.getElementById('communityNavButton'),
    communityBackButton: document.getElementById('communityBackButton'),
    readerSection: document.getElementById('readerSection'),
    communitySection: document.getElementById('communitySection'),
    communityAuthStatus: document.getElementById('communityAuthStatus'),
    communityUsername: document.getElementById('communityUsername'),
    communityLogoutButton: document.getElementById('communityLogoutButton'),
    communityLanding: document.getElementById('communityLanding'),
    communityApp: document.getElementById('communityApp'),
    communityGetStartedButton: document.getElementById('communityGetStartedButton'),
    communityLandingLoginButton: document.getElementById('communityLandingLoginButton'),
    postComposer: document.getElementById('postComposer'),
    postComposerInput: document.getElementById('postComposerInput'),
    postComposerCount: document.getElementById('postComposerCount'),
    postComposerMessage: document.getElementById('postComposerMessage'),
    postFeed: document.getElementById('postFeed'),
    postCardTemplate: document.getElementById('postCardTemplate'),
    postThread: document.getElementById('postThread'),
    postThreadBackButton: document.getElementById('postThreadBackButton'),
    postThreadContent: document.getElementById('postThreadContent'),
    authModal: document.getElementById('authModal'),
    authModalBackdrop: document.getElementById('authModalBackdrop'),
    authModalCloseButton: document.getElementById('authModalCloseButton'),
    authModalTitle: document.getElementById('authModalTitle'),
    authForm: document.getElementById('authForm'),
    authUsernameInput: document.getElementById('authUsernameInput'),
    authPasswordInput: document.getElementById('authPasswordInput'),
    authFormMessage: document.getElementById('authFormMessage'),
    authSubmitButton: document.getElementById('authSubmitButton'),
    authSwitchModeButton: document.getElementById('authSwitchModeButton'),
    landingPage: document.getElementById('landingPage'),
    appShell: document.getElementById('appShell'),
    landingThemeToggle: document.getElementById('landingThemeToggle'),
    landingLoginButton: document.getElementById('landingLoginButton'),
    landingSignupButton: document.getElementById('landingSignupButton'),
    landingStartButton: document.getElementById('landingStartButton'),
    landingGoogleButton: document.getElementById('landingGoogleButton'),
    leaveAppButton: document.getElementById('leaveAppButton'),
};

const readStorageKey = 'rss-reader-read-articles';
const favoritesStorageKey = 'rss-reader-favorite-articles';
const themeStorageKey = 'rss-reader-theme';
const langStorageKey = 'rss-reader-lang';
const enteredAppStorageKey = 'rss-reader-entered-app';

function enterApp() {
    elements.landingPage.hidden = true;
    elements.appShell.hidden = false;
    window.localStorage.setItem(enteredAppStorageKey, '1');
}

async function leaveApp() {
    if (!window.confirm(t('confirmLogOut'))) {
        return;
    }
    showToast(t('loggingOut'));
    if (state.currentUser) {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
        } catch {
            // ignore network errors on logout
        }
        state.currentUser = null;
        renderAuthStatus();
    }
    closeCommunitySection();
    window.localStorage.removeItem(enteredAppStorageKey);
    elements.appShell.hidden = true;
    elements.landingPage.hidden = false;
}

function wireLandingEvents() {
    elements.landingThemeToggle.addEventListener('click', toggleTheme);
    elements.landingStartButton.addEventListener('click', () => {
        enterApp();
        openAuthModal('register');
    });
    elements.landingLoginButton.addEventListener('click', () => {
        enterApp();
        openAuthModal('login');
    });
    elements.landingSignupButton.addEventListener('click', () => {
        enterApp();
        openAuthModal('register');
    });
    elements.landingGoogleButton.addEventListener('click', () => {
        window.location.href = '/api/auth/google/login?returnUrl=' + encodeURIComponent(window.location.pathname);
    });
}

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
        uncategorized: 'Uncategorized',
        categoryLabel: 'Category',
        noCategory: 'No category',
        viewingCategory: '{name} category',
        categoryUpdated: 'Category updated.',
        unableToUpdateCategory: 'Unable to update category.',
        assignCategoryAria: 'Assign a category to {name}',
        copyFeedUrl: 'Copy URL',
        copyFeedUrlAria: 'Copy feed URL for {name}',
        allCategories: 'All',
        history: 'History',
        historyDescription: 'Articles you have read',
        viewingHistory: 'reading history',
        noHistoryTitle: 'No reading history yet',
        noHistoryBody: 'Articles you open will show up here.',
        categoryNameSports: 'Sports',
        categoryNameMedia: 'Media',
        categoryNamePolitics: 'Politics',
        categoryNameTechnology: 'Technology',
        categoryNameGeneral: 'General',
        categoryNameWorld: 'World',
        categoryNameBusiness: 'Business',
        categoryNameEntertainment: 'Entertainment',
        categoryNameScience: 'Science',
        categoryNameHealth: 'Health',
        categoryNameEnvironment: 'Environment',
        dailySummaryTitle: 'Daily News Summary',
        refreshSummaryAria: 'Refresh daily summary',
        showMore: 'Show more',
        showLess: 'Show less',
        summaryUnavailable: 'The daily summary isn\'t available right now.',
        generatingSummary: 'Generating your daily summary...',
        previous: 'Previous',
        next: 'Next',
        jumpTo: 'Jump to',
        pageOf: 'Page {current} of {total}',
        communityNav: 'Community posts',
        logIn: 'Log in',
        signUp: 'Sign up',
        logOut: 'Log out',
        username: 'Username',
        password: 'Password',
        loggingOut: 'Logging out...',
        confirmLogOut: 'Are you sure you want to log out?',
        backToReader: 'Back to RSS Reader',
        needAccount: 'Need an account? Sign up',
        haveAccount: 'Already have an account? Log in',
        close: 'Close',
        postComposerPlaceholder: "What's happening?",
        post: 'Post',
        backToFeed: 'Back to feed',
        communityPostsAriaLabel: 'Community posts',
        loginToPost: 'Log in to post.',
        postEmptyOrTooLong: 'Posts must be between 1 and 280 characters.',
        unableToPost: 'Unable to post right now.',
        unableToLoadPosts: 'Unable to load posts right now.',
        noPostsYet: 'No posts yet. Be the first to say something.',
        deletePost: 'Delete post',
        confirmDeletePost: 'Delete this post? This cannot be undone.',
        unableToDeletePost: 'Unable to delete this post right now.',
        editPost: 'Edit post',
        unableToEditPost: 'Unable to edit this post right now.',
        save: 'Save',
        cancel: 'Cancel',
        reply: 'Reply',
        replies: 'Replies',
        replyCount: '{count} replies',
        usernameTaken: 'That username is already taken.',
        invalidCredentials: 'Invalid username or password.',
        authValidationError: 'Username must be 3-32 characters and password at least 8 characters.',
        authUnavailable: 'Could not reach the server. Please try again.',
        communityLandingTitle: 'Join the conversation',
        communityLandingSubtitle: 'Share short updates and reply to other readers of this site, in real time.',
        getStarted: 'Get started',
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
        uncategorized: 'بدون تصنيف',
        categoryLabel: 'التصنيف',
        noCategory: 'بدون تصنيف',
        viewingCategory: 'تصنيف {name}',
        categoryUpdated: 'تم تحديث التصنيف.',
        unableToUpdateCategory: 'تعذّر تحديث التصنيف.',
        assignCategoryAria: 'تعيين تصنيف لـ {name}',
        copyFeedUrl: 'نسخ الرابط',
        copyFeedUrlAria: 'نسخ رابط المصدر لـ {name}',
        allCategories: 'الكل',
        history: 'السجل',
        historyDescription: 'المقالات التي قرأتها',
        viewingHistory: 'سجل القراءة',
        noHistoryTitle: 'لا يوجد سجل قراءة بعد',
        noHistoryBody: 'ستظهر هنا المقالات التي تفتحها.',
        categoryNameSports: 'رياضة',
        categoryNameMedia: 'إعلام',
        categoryNamePolitics: 'سياسة',
        categoryNameTechnology: 'تقنية',
        categoryNameGeneral: 'عام',
        categoryNameWorld: 'العالم',
        categoryNameBusiness: 'أعمال',
        categoryNameEntertainment: 'ترفيه',
        categoryNameScience: 'علوم',
        categoryNameHealth: 'صحة',
        categoryNameEnvironment: 'بيئة',
        dailySummaryTitle: 'ملخص الأخبار اليومي',
        refreshSummaryAria: 'تحديث الملخص اليومي',
        showMore: 'عرض المزيد',
        showLess: 'عرض أقل',
        summaryUnavailable: 'الملخص اليومي غير متاح حاليًا.',
        generatingSummary: 'جارٍ إنشاء ملخصك اليومي...',
        previous: 'السابق',
        next: 'التالي',
        jumpTo: 'الانتقال إلى',
        pageOf: 'صفحة {current} من {total}',
        communityNav: 'منشورات المجتمع',
        logIn: 'تسجيل الدخول',
        signUp: 'إنشاء حساب',
        logOut: 'تسجيل الخروج',
        username: 'اسم المستخدم',
        password: 'كلمة المرور',
        loggingOut: 'جارٍ تسجيل الخروج...',
        confirmLogOut: 'هل أنت متأكد أنك تريد تسجيل الخروج؟',
        backToReader: 'العودة إلى القارئ',
        needAccount: 'ليس لديك حساب؟ أنشئ حسابًا',
        haveAccount: 'لديك حساب بالفعل؟ سجّل الدخول',
        close: 'إغلاق',
        postComposerPlaceholder: 'ما الذي يحدث؟',
        post: 'نشر',
        backToFeed: 'العودة إلى القائمة',
        communityPostsAriaLabel: 'منشورات المجتمع',
        loginToPost: 'سجّل الدخول للنشر.',
        postEmptyOrTooLong: 'يجب أن يكون المنشور بين 1 و 280 حرفًا.',
        unableToPost: 'تعذّر النشر الآن.',
        unableToLoadPosts: 'تعذّر تحميل المنشورات الآن.',
        noPostsYet: 'لا توجد منشورات بعد. كن أول من يكتب شيئًا.',
        deletePost: 'حذف المنشور',
        confirmDeletePost: 'هل تريد حذف هذا المنشور؟ لا يمكن التراجع عن هذا الإجراء.',
        unableToDeletePost: 'تعذّر حذف المنشور الآن.',
        editPost: 'تعديل المنشور',
        unableToEditPost: 'تعذّر تعديل المنشور الآن.',
        save: 'حفظ',
        cancel: 'إلغاء',
        reply: 'رد',
        replies: 'الردود',
        replyCount: '{count} ردود',
        usernameTaken: 'اسم المستخدم هذا مُستخدم بالفعل.',
        invalidCredentials: 'اسم المستخدم أو كلمة المرور غير صحيحة.',
        authValidationError: 'يجب أن يكون اسم المستخدم بين 3 و32 حرفًا وكلمة المرور 8 أحرف على الأقل.',
        authUnavailable: 'تعذّر الوصول إلى الخادم. حاول مرة أخرى.',
        communityLandingTitle: 'انضم إلى النقاش',
        communityLandingSubtitle: 'شارك تحديثات قصيرة ورُدّ على قراء آخرين لهذا الموقع، في الوقت الفعلي.',
        getStarted: 'ابدأ الآن',
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

function escapeHtml(value) {
    return value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;');
}

/**
 * Minimal Markdown -> HTML renderer for chat replies. Escapes all input first,
 * so the only HTML ever produced is the tags this function inserts itself.
 */
function renderMarkdown(text) {
    const lines = (text ?? '').replace(/\r\n/g, '\n').split('\n');
    const htmlParts = [];
    let listItems = null;

    const inline = (line) => {
        let out = escapeHtml(line);
        out = out.replace(/`([^`]+)`/g, '<code>$1</code>');
        out = out.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
        out = out.replace(/(?<!\*)\*([^*]+)\*(?!\*)/g, '<em>$1</em>');
        out = out.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
        return out;
    };

    const flushList = () => {
        if (listItems) {
            htmlParts.push(`<ul>${listItems.join('')}</ul>`);
            listItems = null;
        }
    };

    for (const rawLine of lines) {
        const line = rawLine.trim();
        const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);
        const listMatch = line.match(/^[-*]\s+(.*)$/);

        if (headingMatch) {
            flushList();
            const level = Math.min(headingMatch[1].length + 3, 6);
            htmlParts.push(`<h${level}>${inline(headingMatch[2])}</h${level}>`);
        } else if (listMatch) {
            listItems ??= [];
            listItems.push(`<li>${inline(listMatch[1])}</li>`);
        } else if (!line) {
            flushList();
        } else {
            flushList();
            htmlParts.push(`<p>${inline(line)}</p>`);
        }
    }
    flushList();

    return htmlParts.join('');
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

function markArticleRead(article) {
    if (!article?.id || state.readArticleIds.has(article.id)) {
        return;
    }

    state.readArticleIds.add(article.id);
    saveReadState();
    renderArticles();

    fetch('/api/articles/read', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId: article.feedId, articleId: article.id }),
    }).catch(() => {
        // Local read state already applied; server sync can retry on next load.
    });
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

function toggleArticleFavorite(article) {
    if (!article?.id) {
        return;
    }

    const isNowFavorite = !state.favoriteArticleIds.has(article.id);
    if (isNowFavorite) {
        state.favoriteArticleIds.add(article.id);
    } else {
        state.favoriteArticleIds.delete(article.id);
    }

    saveFavoritesState();
    renderArticles();
    renderFeeds();

    fetch('/api/articles/favorite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedId: article.feedId, articleId: article.id, isFavorite: isNowFavorite }),
    }).catch(() => {
        // Local favorite state already applied; server sync can retry on next load.
    });
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

async function assignFeedCategory(feedId, categoryId) {
    const response = await fetch(`/api/feeds/${feedId}/category`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categoryId }),
    });
    if (!response.ok) {
        throw new Error(`Category update failed (${response.status})`);
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

    const copyUrlButton = makeFeedActionButton(t('copyFeedUrl'));
    copyUrlButton.setAttribute('aria-label', t('copyFeedUrlAria', { name: getFeedDisplayName(feed) }));
    copyUrlButton.addEventListener('click', async (event) => {
        event.stopPropagation();
        try {
            await copyTextToClipboard(feed.url);
            showToast(t('linkCopied'), 'success');
        } catch {
            showToast(t('couldNotCopyLink'), 'error');
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

    const categorySelect = document.createElement('select');
    categorySelect.className = 'feed-item__category-select';
    categorySelect.setAttribute('aria-label', t('assignCategoryAria', { name: getFeedDisplayName(feed) }));

    const noneOption = document.createElement('option');
    noneOption.value = '';
    noneOption.textContent = t('noCategory');
    categorySelect.append(noneOption);

    for (const category of state.categories) {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = getCategoryDisplayName(category);
        option.selected = feed.categoryId === category.id;
        categorySelect.append(option);
    }

    categorySelect.addEventListener('click', (event) => event.stopPropagation());
    categorySelect.addEventListener('change', async () => {
        categorySelect.disabled = true;
        try {
            await assignFeedCategory(feed.id, categorySelect.value || null);
            await loadData();
            showToast(t('categoryUpdated'), 'success');
        } catch {
            showToast(t('unableToUpdateCategory'), 'error');
        } finally {
            categorySelect.disabled = false;
        }
    });

    actions.append(categorySelect, refreshButton, copyUrlButton, deleteButton);
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

    if (state.selectedFeedId === 'history') {
        return state.historyArticles.filter((article) => {
            const searchableText = [article.title, article.feedTitle, article.summary].join(' ').toLowerCase();
            return !query || searchableText.includes(query);
        });
    }

    return [...state.articles]
        .filter((article) => {
            let matchesFeed;
            if (state.selectedFeedId === 'all') {
                matchesFeed = true;
            } else if (state.selectedFeedId === 'favorites') {
                matchesFeed = state.favoriteArticleIds.has(article.id);
            } else if (state.selectedFeedId.startsWith(CATEGORY_FILTER_PREFIX)) {
                const categoryId = state.selectedFeedId.slice(CATEGORY_FILTER_PREFIX.length);
                const feed = getFeedById(article.feedId);
                matchesFeed = categoryId === 'none' ? !feed?.categoryId : feed?.categoryId === categoryId;
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

const ARTICLES_PER_PAGE = 24;
let lastFilterSignature = null;

function renderArticles() {
    const filterSignature = `${state.selectedFeedId}|${state.search}`;
    if (filterSignature !== lastFilterSignature) {
        state.currentPage = 1;
        lastFilterSignature = filterSignature;
    }

    const allArticles = filteredArticles();
    elements.articleFeed.innerHTML = '';

    if (!allArticles.length) {
        const isFavoritesView = state.selectedFeedId === 'favorites';
        const isHistoryView = state.selectedFeedId === 'history';
        const empty = document.createElement('div');
        empty.className = 'empty-state';

        const heading = document.createElement('h4');
        heading.textContent = isHistoryView ? t('noHistoryTitle') : isFavoritesView ? t('noFavoritesTitle') : t('noArticlesFoundTitle');

        const body = document.createElement('p');
        body.textContent = isHistoryView ? t('noHistoryBody') : isFavoritesView ? t('noFavoritesBody') : t('noArticlesFoundBody');

        empty.append(heading, body);
        elements.articleFeed.append(empty);
        elements.paginationBar.hidden = true;
        return;
    }

    const totalPages = Math.max(1, Math.ceil(allArticles.length / ARTICLES_PER_PAGE));
    state.currentPage = Math.min(Math.max(state.currentPage, 1), totalPages);
    const startIndex = (state.currentPage - 1) * ARTICLES_PER_PAGE;
    const articles = allArticles.slice(startIndex, startIndex + ARTICLES_PER_PAGE);
    renderPagination(totalPages);

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
            favoriteButton.addEventListener('click', () => toggleArticleFavorite(article));

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
                link.addEventListener('click', () => markArticleRead(article));
                shareButton.setAttribute('aria-label', t('copyLinkToAria', { title: articleTitle }));
                shareButton.addEventListener('click', () => shareArticle(article.link, articleTitle));
            }
            list.append(card);
        }

        section.append(heading, list);
        elements.articleFeed.append(section);
    }
}

function renderPagination(totalPages) {
    if (totalPages <= 1) {
        elements.paginationBar.hidden = true;
        return;
    }

    elements.paginationBar.hidden = false;
    elements.paginationStatus.textContent = t('pageOf', { current: state.currentPage, total: totalPages });
    elements.paginationPrev.disabled = state.currentPage <= 1;
    elements.paginationNext.disabled = state.currentPage >= totalPages;
    elements.paginationJumpInput.max = String(totalPages);
    elements.paginationJumpInput.value = '';
}

function goToPage(page) {
    state.currentPage = page;
    renderArticles();
    elements.articleFeed.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    const historyButton = document.createElement('button');
    historyButton.type = 'button';
    historyButton.className = `feed-item${state.selectedFeedId === 'history' ? ' is-active' : ''}`;
    historyButton.dataset.feedId = 'history';

    const historyMain = document.createElement('div');
    historyMain.className = 'feed-item__main';
    const historyTitle = document.createElement('strong');
    historyTitle.className = 'feed-item__title';
    historyTitle.textContent = t('history');
    const historyMeta = document.createElement('span');
    historyMeta.className = 'feed-item__meta';
    historyMeta.textContent = t('historyDescription');
    historyMain.append(historyTitle, historyMeta);
    historyButton.append(historyMain);
    historyButton.addEventListener('click', async () => {
        state.selectedFeedId = 'history';
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
        try {
            const response = await fetch('/api/history');
            state.historyArticles = response.ok ? await response.json() : [];
        } catch {
            state.historyArticles = [];
        }
        if (state.selectedFeedId === 'history') {
            renderArticles();
        }
    });
    fragment.append(historyButton);

    const feedsByCategory = new Map();
    const uncategorized = [];
    for (const feed of state.feeds) {
        if (feed.categoryId) {
            if (!feedsByCategory.has(feed.categoryId)) {
                feedsByCategory.set(feed.categoryId, []);
            }
            feedsByCategory.get(feed.categoryId).push(feed);
        } else {
            uncategorized.push(feed);
        }
    }

    for (const category of state.categories) {
        const feedsInCategory = feedsByCategory.get(category.id);
        if (!feedsInCategory?.length) {
            continue;
        }

        fragment.append(buildCategoryHeader(category));
        for (const feed of feedsInCategory) {
            fragment.append(buildFeedChip(feed));
        }
    }

    if (uncategorized.length) {
        fragment.append(buildCategoryHeader(null));
        for (const feed of uncategorized) {
            fragment.append(buildFeedChip(feed));
        }
    }

    elements.feedList.innerHTML = '';
    elements.feedList.append(fragment);
}

function getCategoryById(categoryId) {
    return state.categories.find((category) => category.id === categoryId);
}

const DEFAULT_CATEGORY_NAME_KEYS = {
    Sports: 'categoryNameSports',
    Media: 'categoryNameMedia',
    Politics: 'categoryNamePolitics',
    Technology: 'categoryNameTechnology',
    General: 'categoryNameGeneral',
    World: 'categoryNameWorld',
    Business: 'categoryNameBusiness',
    Entertainment: 'categoryNameEntertainment',
    Science: 'categoryNameScience',
    Health: 'categoryNameHealth',
    Environment: 'categoryNameEnvironment',
};

function getCategoryDisplayName(category) {
    if (!category) {
        return t('uncategorized');
    }
    const translationKey = DEFAULT_CATEGORY_NAME_KEYS[category.name];
    return translationKey ? t(translationKey) : category.name;
}

function buildCategoryHeader(category) {
    const filterId = `${CATEGORY_FILTER_PREFIX}${category ? category.id : 'none'}`;
    const header = document.createElement('button');
    header.type = 'button';
    header.className = `sidebar__category-header${state.selectedFeedId === filterId ? ' is-active' : ''}`;
    if (category?.color) {
        header.style.setProperty('--item-accent', category.color);
    }
    header.textContent = getCategoryDisplayName(category);
    header.addEventListener('click', () => {
        state.selectedFeedId = filterId;
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
    });
    return header;
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
    } else if (state.selectedFeedId === 'history') {
        descriptor = t('viewingHistory');
    } else if (state.selectedFeedId.startsWith(CATEGORY_FILTER_PREFIX)) {
        const categoryId = state.selectedFeedId.slice(CATEGORY_FILTER_PREFIX.length);
        const categoryName = categoryId === 'none' ? t('uncategorized') : (getCategoryById(categoryId)?.name || t('uncategorized'));
        descriptor = t('viewingCategory', { name: categoryName });
    } else {
        descriptor = state.feeds.find((feed) => feed.id === state.selectedFeedId)?.title || t('viewingSelectedFeed');
    }
    const query = state.search.trim();
    setStatus(query ? t('viewingDescriptorSearch', { descriptor }) : t('viewingDescriptor', { descriptor }));
}

function renderCategoryPills() {
    const counts = new Map();
    for (const article of state.articles) {
        const feed = getFeedById(article.feedId);
        const key = feed?.categoryId || 'none';
        counts.set(key, (counts.get(key) || 0) + 1);
    }

    elements.categoryPills.innerHTML = '';

    const allPill = document.createElement('button');
    allPill.type = 'button';
    allPill.className = `category-pill${state.selectedFeedId === 'all' ? ' is-active' : ''}`;
    allPill.textContent = `${t('allCategories')} (${state.articles.length})`;
    allPill.addEventListener('click', () => {
        state.selectedFeedId = 'all';
        render();
    });
    elements.categoryPills.append(allPill);

    for (const category of state.categories) {
        const count = counts.get(category.id) || 0;
        if (!count) {
            continue;
        }

        const filterId = `${CATEGORY_FILTER_PREFIX}${category.id}`;
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `category-pill${state.selectedFeedId === filterId ? ' is-active' : ''}`;
        pill.style.setProperty('--item-accent', category.color || 'var(--text-muted)');
        pill.textContent = `${getCategoryDisplayName(category)} (${count})`;
        pill.addEventListener('click', () => {
            state.selectedFeedId = filterId;
            render();
        });
        elements.categoryPills.append(pill);
    }

    const uncategorizedCount = counts.get('none') || 0;
    if (uncategorizedCount) {
        const filterId = `${CATEGORY_FILTER_PREFIX}none`;
        const pill = document.createElement('button');
        pill.type = 'button';
        pill.className = `category-pill${state.selectedFeedId === filterId ? ' is-active' : ''}`;
        pill.textContent = `${t('uncategorized')} (${uncategorizedCount})`;
        pill.addEventListener('click', () => {
            state.selectedFeedId = filterId;
            render();
        });
        elements.categoryPills.append(pill);
    }
}

function render() {
    renderFeeds();
    renderCategoryPills();
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
        if (entry.role === 'assistant' && !entry.pending && !entry.error) {
            bubble.innerHTML = renderMarkdown(entry.content);
        } else {
            bubble.textContent = entry.content;
        }
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

/* ---------- Community posts (public timeline) ---------- */

let authMode = 'login';
let communityHubConnection = null;

function openCommunitySection() {
    elements.readerSection.hidden = true;
    elements.communitySection.hidden = false;
    elements.communityNavButton.setAttribute('aria-pressed', 'true');
    document.body.classList.add('community-open');
}

function closeCommunitySection() {
    elements.readerSection.hidden = false;
    elements.communitySection.hidden = true;
    elements.communityNavButton.setAttribute('aria-pressed', 'false');
    document.body.classList.remove('community-open');
}

function toggleCommunitySection() {
    if (elements.communitySection.hidden) {
        openCommunitySection();
    } else {
        closeCommunitySection();
    }
}

function renderAuthStatus() {
    const loggedIn = Boolean(state.currentUser);
    elements.communityAuthStatus.hidden = !loggedIn;
    elements.communityLanding.hidden = loggedIn;
    elements.communityApp.hidden = !loggedIn;
    if (loggedIn) {
        elements.communityUsername.textContent = state.currentUser.username;
    }
}

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        state.currentUser = response.ok ? await response.json() : null;
    } catch {
        state.currentUser = null;
    }
    if (state.currentUser) {
        enterApp();
    } else if (!elements.appShell.hidden && elements.authModal.hidden) {
        // Returning visitor whose session expired/was cleared: the reader now requires an
        // account, so prompt them to log back in instead of silently failing every API call.
        openAuthModal('login');
    }
    renderAuthStatus();
}

function openAuthModal(mode) {
    authMode = mode;
    elements.authForm.reset();
    elements.authFormMessage.textContent = '';
    elements.authModalTitle.textContent = mode === 'register' ? t('signUp') : t('logIn');
    elements.authSubmitButton.textContent = mode === 'register' ? t('signUp') : t('logIn');
    elements.authSwitchModeButton.textContent = mode === 'register' ? t('haveAccount') : t('needAccount');
    elements.authModal.hidden = false;
    elements.authUsernameInput.focus();
}

function closeAuthModal() {
    elements.authModal.hidden = true;
}

async function submitAuth() {
    const username = elements.authUsernameInput.value.trim();
    const password = elements.authPasswordInput.value;
    const endpoint = authMode === 'register' ? '/api/auth/register' : '/api/auth/login';

    try {
        const response = await fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password }),
        });

        if (response.ok) {
            state.currentUser = await response.json();
            renderAuthStatus();
            closeAuthModal();
            await loadCommunityTimeline();
            try {
                await loadData();
                setFeedMessage('');
            } catch (error) {
                setStatus(t('unableToLoadData'), 'error');
                showToast(error instanceof Error ? error.message : t('unexpectedError'), 'error');
            }
            loadDailySummary();
            return;
        }

        if (response.status === 409) {
            elements.authFormMessage.textContent = t('usernameTaken');
        } else if (response.status === 401) {
            elements.authFormMessage.textContent = t('invalidCredentials');
        } else {
            elements.authFormMessage.textContent = t('authValidationError');
        }
    } catch {
        elements.authFormMessage.textContent = t('authUnavailable');
    }
}

async function logoutCommunityUser() {
    if (!window.confirm(t('confirmLogOut'))) {
        return;
    }
    try {
        await fetch('/api/auth/logout', { method: 'POST' });
    } catch {
        // ignore network errors on logout
    }
    state.currentUser = null;
    renderAuthStatus();
    closeThread();
    await loadCommunityTimeline();
}

function formatPostTime(iso) {
    const date = new Date(iso);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString(currentLang === 'ar' ? 'ar' : 'en', { dateStyle: 'medium', timeStyle: 'short' });
}

const AVATAR_COLORS = ['#556b8d', '#7a5c2e', '#2f5d62', '#6b4e71', '#5b6b2f', '#8a3c5c', '#3c5c8a', '#4a7a4a'];

function avatarColorFor(username) {
    let hash = 0;
    for (let i = 0; i < username.length; i += 1) {
        hash = (hash * 31 + username.charCodeAt(i)) >>> 0;
    }
    return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function buildPostCard(post, options) {
    const node = elements.postCardTemplate.content.firstElementChild.cloneNode(true);
    const avatar = node.querySelector('.post-card__avatar');
    avatar.textContent = post.authorUsername.charAt(0).toUpperCase();
    avatar.style.background = avatarColorFor(post.authorUsername);
    node.querySelector('.post-card__author').textContent = post.authorUsername;
    node.querySelector('.post-card__time').textContent = formatPostTime(post.createdAt);
    const contentEl = node.querySelector('.post-card__content');
    contentEl.textContent = post.content;
    node.querySelector('.post-card__reply-count span').textContent = t('replyCount', { count: post.replyCount });
    node.querySelector('.post-card__reply-count').addEventListener('click', () => openThread(post.id));

    const likeButton = node.querySelector('.post-card__like');
    updateLikeButton(likeButton, post);
    likeButton.disabled = !state.currentUser;
    likeButton.addEventListener('click', () => toggleLike(post.id));

    const isOwnPost = Boolean(state.currentUser) && post.authorUsername === state.currentUser.username;

    const deleteButton = node.querySelector('.post-card__delete');
    if (isOwnPost) {
        deleteButton.hidden = false;
        deleteButton.title = t('deletePost');
        deleteButton.addEventListener('click', () => deletePost(post.id));
    }

    const footer = node.querySelector('.post-card__footer');
    const editButton = node.querySelector('.post-card__edit');
    if (isOwnPost) {
        const editForm = node.querySelector('.post-card__edit-form');
        const editTextarea = node.querySelector('.post-card__edit-textarea');
        const editSaveButton = node.querySelector('.post-card__edit-save');
        const editCancelButton = node.querySelector('.post-card__edit-cancel');
        editSaveButton.textContent = t('save');
        editCancelButton.textContent = t('cancel');

        const closeEditForm = () => {
            editForm.hidden = true;
            contentEl.hidden = false;
            footer.hidden = false;
        };

        editButton.hidden = false;
        editButton.title = t('editPost');
        editButton.addEventListener('click', () => {
            editTextarea.value = post.content;
            contentEl.hidden = true;
            footer.hidden = true;
            editForm.hidden = false;
            editTextarea.focus();
        });

        editCancelButton.addEventListener('click', closeEditForm);

        editSaveButton.addEventListener('click', async () => {
            const newContent = editTextarea.value.trim();
            if (!newContent || newContent === post.content) {
                closeEditForm();
                return;
            }
            const updated = await editPost(post.id, newContent);
            if (updated) {
                renderPostFeed();
                renderThread();
            }
        });
    }

    if (options?.isReply) {
        node.classList.add('post-card--reply');
    }

    return node;
}

function updateLikeButton(likeButton, post) {
    likeButton.querySelector('span').textContent = post.likeCount;
    likeButton.classList.toggle('post-card__like--filled', Boolean(post.likedByCurrentUser));
    likeButton.querySelector('i').className = post.likedByCurrentUser ? 'bi bi-heart-fill' : 'bi bi-heart';
}

function renderPostFeed() {
    elements.postFeed.innerHTML = '';

    if (state.communityPosts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        const body = document.createElement('p');
        body.textContent = t('noPostsYet');
        empty.append(body);
        elements.postFeed.append(empty);
        return;
    }

    for (const post of state.communityPosts) {
        elements.postFeed.append(buildPostCard(post));
    }
}

async function loadCommunityTimeline() {
    try {
        const response = await fetch('/api/posts');
        if (!response.ok) {
            throw new Error(`Post request failed (${response.status})`);
        }
        state.communityPosts = await response.json();
        renderPostFeed();
    } catch (error) {
        showToast(error instanceof Error ? error.message : t('unableToLoadPosts'), 'error');
    }
}

async function submitPost(content, parentPostId) {
    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, parentPostId: parentPostId ?? null }),
    });

    if (!response.ok) {
        const message = response.status === 400 ? t('postEmptyOrTooLong') : t('unableToPost');
        throw new Error(message);
    }

    return response.json();
}

function closeThread() {
    state.activeThreadId = null;
    activeThread = null;
    elements.postThread.hidden = true;
    elements.postFeed.hidden = false;
}

let activeThread = null;

function renderThread() {
    if (!activeThread) {
        return;
    }
    elements.postThreadContent.innerHTML = '';
    elements.postThreadContent.append(buildPostCard(activeThread.post));
    for (const reply of activeThread.replies) {
        elements.postThreadContent.append(buildPostCard(reply, { isReply: true }));
    }
}

async function openThread(postId) {
    try {
        const response = await fetch(`/api/posts/${postId}`);
        if (!response.ok) {
            throw new Error(`Thread request failed (${response.status})`);
        }
        const thread = await response.json();

        state.activeThreadId = postId;
        activeThread = thread;
        renderThread();

        elements.postThread.hidden = false;
        elements.postFeed.hidden = true;
    } catch (error) {
        showToast(error instanceof Error ? error.message : t('unableToLoadPosts'), 'error');
    }
}

function handleIncomingPost(post) {
    if (post.parentPostId) {
        if (activeThread && activeThread.post.id === post.parentPostId) {
            activeThread.replies.push(post);
            renderThread();
        }
        const parent = state.communityPosts.find((p) => p.id === post.parentPostId);
        if (parent) {
            parent.replyCount += 1;
            renderPostFeed();
        }
        return;
    }

    state.communityPosts.unshift(post);
    renderPostFeed();
}

function handleLikeUpdate({ postId, likeCount }) {
    const feedPost = state.communityPosts.find((p) => p.id === postId);
    if (feedPost) {
        feedPost.likeCount = likeCount;
        renderPostFeed();
    }

    if (activeThread) {
        const threadPost = activeThread.post.id === postId
            ? activeThread.post
            : activeThread.replies.find((p) => p.id === postId);
        if (threadPost) {
            threadPost.likeCount = likeCount;
            renderThread();
        }
    }
}

async function toggleLike(postId) {
    if (!state.currentUser) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
        if (!response.ok) {
            return;
        }
        const { liked, likeCount } = await response.json();

        const feedPost = state.communityPosts.find((p) => p.id === postId);
        if (feedPost) {
            feedPost.likeCount = likeCount;
            feedPost.likedByCurrentUser = liked;
            renderPostFeed();
        }

        if (activeThread) {
            const threadPost = activeThread.post.id === postId
                ? activeThread.post
                : activeThread.replies.find((p) => p.id === postId);
            if (threadPost) {
                threadPost.likeCount = likeCount;
                threadPost.likedByCurrentUser = liked;
                renderThread();
            }
        }
    } catch {
        // best-effort; the like button simply reflects the last-known state
    }
}

async function editPost(postId, content) {
    try {
        const response = await fetch(`/api/posts/${postId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ content }),
        });
        if (!response.ok) {
            const message = response.status === 400 ? t('postEmptyOrTooLong') : t('unableToEditPost');
            throw new Error(message);
        }
        const updated = await response.json();
        applyPostUpdate(updated);
        return updated;
    } catch (error) {
        showToast(error instanceof Error ? error.message : t('unableToEditPost'), 'error');
        return null;
    }
}

function applyPostUpdate(updated) {
    const feedPost = state.communityPosts.find((p) => p.id === updated.id);
    if (feedPost) {
        feedPost.content = updated.content;
    }

    if (activeThread) {
        if (activeThread.post.id === updated.id) {
            activeThread.post.content = updated.content;
        } else {
            const reply = activeThread.replies.find((p) => p.id === updated.id);
            if (reply) {
                reply.content = updated.content;
            }
        }
    }
}

function handlePostEdited(post) {
    applyPostUpdate(post);
    renderPostFeed();
    renderThread();
}

async function deletePost(postId) {
    if (!state.currentUser) {
        return;
    }
    if (!window.confirm(t('confirmDeletePost'))) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}`, { method: 'DELETE' });
        if (!response.ok) {
            throw new Error(t('unableToDeletePost'));
        }
        removePostFromState(postId);
    } catch (error) {
        showToast(error instanceof Error ? error.message : t('unableToDeletePost'), 'error');
    }
}

function removePostFromState(postId) {
    const feedPost = state.communityPosts.find((p) => p.id === postId);
    state.communityPosts = state.communityPosts.filter((p) => p.id !== postId);

    if (activeThread) {
        if (activeThread.post.id === postId) {
            closeThread();
        } else {
            const reply = activeThread.replies.find((p) => p.id === postId);
            activeThread.replies = activeThread.replies.filter((p) => p.id !== postId);
            if (reply) {
                renderThread();
            }
        }
    }

    if (feedPost) {
        renderPostFeed();
    }
}

function handlePostDeleted({ postId, parentPostId }) {
    let parentUpdated = false;
    if (parentPostId) {
        const parent = state.communityPosts.find((p) => p.id === parentPostId);
        if (parent && parent.replyCount > 0) {
            parent.replyCount -= 1;
            parentUpdated = true;
        }
    }
    removePostFromState(postId);
    if (parentUpdated) {
        renderPostFeed();
    }
}

async function connectCommunityHub() {
    try {
        communityHubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/community')
            .withAutomaticReconnect()
            .build();
        communityHubConnection.on('NewPost', handleIncomingPost);
        communityHubConnection.on('PostLiked', handleLikeUpdate);
        communityHubConnection.on('PostDeleted', handlePostDeleted);
        communityHubConnection.on('PostEdited', handlePostEdited);
        await communityHubConnection.start();
    } catch {
        // real-time updates are a progressive enhancement; timeline still loads via fetch
    }
}

async function loadData() {
    setStatus(t('loadingFeeds'));
    const [feedsResponse, articlesResponse, categoriesResponse] = await Promise.all([
        fetch('/api/feeds'),
        fetch('/api/articles'),
        fetch('/api/categories'),
    ]);

    if (!feedsResponse.ok) {
        throw new Error(`Feed request failed (${feedsResponse.status})`);
    }

    if (!articlesResponse.ok) {
        throw new Error(`Article request failed (${articlesResponse.status})`);
    }

    state.feeds = await feedsResponse.json();
    state.articles = await articlesResponse.json();
    state.categories = categoriesResponse.ok ? await categoriesResponse.json() : [];

    for (const article of state.articles) {
        if (article.isRead) {
            state.readArticleIds.add(article.id);
        }
        if (article.isFavorite) {
            state.favoriteArticleIds.add(article.id);
        }
    }
    saveReadState();
    saveFavoritesState();

    const isVirtualFilter = state.selectedFeedId === 'all'
        || state.selectedFeedId === 'favorites'
        || state.selectedFeedId === 'history'
        || state.selectedFeedId.startsWith(CATEGORY_FILTER_PREFIX);
    if (!isVirtualFilter && !state.feeds.some((feed) => feed.id === state.selectedFeedId)) {
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

/* ---------- Daily AI summary ---------- */

function renderDailySummary(content) {
    elements.dailySummaryCard.hidden = false;
    elements.dailySummaryBody.innerHTML = renderMarkdown(content);
    applyDirection(elements.dailySummaryBody, content);

    const isLong = elements.dailySummaryBody.scrollHeight > 260;
    elements.dailySummaryCard.classList.toggle('is-collapsible', isLong);
    elements.dailySummaryToggle.hidden = !isLong;
    if (isLong) {
        elements.dailySummaryCard.classList.add('is-collapsed');
        elements.dailySummaryToggle.textContent = t('showMore');
    }
}

async function loadDailySummary(forceRefresh = false) {
    elements.dailySummaryCard.hidden = false;
    elements.dailySummaryBody.innerHTML = '';
    elements.dailySummaryBody.textContent = t('generatingSummary');
    elements.dailySummaryToggle.hidden = true;

    try {
        const response = await fetch(forceRefresh ? '/api/summary/daily/refresh' : '/api/summary/daily', {
            method: forceRefresh ? 'POST' : 'GET',
        });
        if (!response.ok) {
            elements.dailySummaryBody.textContent = t('summaryUnavailable');
            return;
        }
        const payload = await response.json();
        renderDailySummary(payload.content);
    } catch {
        elements.dailySummaryBody.textContent = t('summaryUnavailable');
    }
}

function wireEvents() {
    elements.menuButton.addEventListener('click', toggleDrawer);
    elements.backdrop.addEventListener('click', closeDrawer);
    elements.langToggle.addEventListener('click', toggleLanguage);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.leaveAppButton.addEventListener('click', leaveApp);
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

    elements.dailySummaryRefresh.addEventListener('click', async () => {
        elements.dailySummaryRefresh.disabled = true;
        try {
            await loadDailySummary(true);
        } finally {
            elements.dailySummaryRefresh.disabled = false;
        }
    });

    elements.dailySummaryToggle.addEventListener('click', () => {
        const isCollapsed = elements.dailySummaryCard.classList.toggle('is-collapsed');
        elements.dailySummaryToggle.textContent = t(isCollapsed ? 'showMore' : 'showLess');
    });

    elements.paginationPrev.addEventListener('click', () => {
        if (state.currentPage > 1) {
            goToPage(state.currentPage - 1);
        }
    });

    elements.paginationNext.addEventListener('click', () => {
        goToPage(state.currentPage + 1);
    });

    elements.paginationJumpInput.addEventListener('keydown', (event) => {
        if (event.key !== 'Enter') {
            return;
        }
        event.preventDefault();
        const page = parseInt(elements.paginationJumpInput.value, 10);
        if (Number.isInteger(page) && page >= 1) {
            goToPage(page);
        }
    });

    elements.communityNavButton.addEventListener('click', toggleCommunitySection);
    elements.communityBackButton.addEventListener('click', closeCommunitySection);
    elements.communityGetStartedButton.addEventListener('click', () => openAuthModal('register'));
    elements.communityLandingLoginButton.addEventListener('click', () => openAuthModal('login'));
    elements.communityLogoutButton.addEventListener('click', logoutCommunityUser);

    elements.authModalCloseButton.addEventListener('click', closeAuthModal);
    elements.authModalBackdrop.addEventListener('click', closeAuthModal);
    elements.authSwitchModeButton.addEventListener('click', () => openAuthModal(authMode === 'register' ? 'login' : 'register'));
    elements.authForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        elements.authSubmitButton.disabled = true;
        try {
            await submitAuth();
        } finally {
            elements.authSubmitButton.disabled = false;
        }
    });

    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape' && !elements.authModal.hidden) {
            closeAuthModal();
        }
    });

    elements.postComposerInput.addEventListener('input', () => {
        elements.postComposerCount.textContent = 280 - elements.postComposerInput.value.length;
    });

    elements.postComposer.addEventListener('submit', async (event) => {
        event.preventDefault();
        const content = elements.postComposerInput.value.trim();
        if (!content) {
            return;
        }

        elements.postComposerMessage.textContent = '';
        try {
            await submitPost(content, state.activeThreadId);
            elements.postComposerInput.value = '';
            elements.postComposerCount.textContent = '280';
        } catch (error) {
            elements.postComposerMessage.textContent = error instanceof Error ? error.message : t('unableToPost');
        }
    });

    elements.postThreadBackButton.addEventListener('click', closeThread);
}

async function init() {
    loadTheme();
    loadLanguage();
    wireEvents();
    wireLandingEvents();
    if (window.localStorage.getItem(enteredAppStorageKey) === '1') {
        enterApp();
    }
    loadReadState();
    loadFavoritesState();
    renderHelpTopics(elements.helpSearchInput.value);
    renderChatMessages();
    loadDailySummary();
    loadCurrentUser();
    loadCommunityTimeline();
    connectCommunityHub();
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
