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
    communityPage: 1,
    communityHasMorePosts: true,
    communityLoadingMore: false,
    activeThreadId: null,
    viewedProfileUsername: null,
    notifications: [],
    unreadNotificationCount: 0,
    notificationsPage: 1,
    notificationsHasMore: true,
    profilePosts: [],
};

const CATEGORY_FILTER_PREFIX = 'category:';

const elements = {
    sidebar: document.getElementById('sidebarDrawer'),
    backdrop: document.getElementById('drawerBackdrop'),
    menuButton: document.getElementById('menuButton'),
    userMenu: document.getElementById('userMenu'),
    userMenuTrigger: document.getElementById('userMenuTrigger'),
    userMenuDropdown: document.getElementById('userMenuDropdown'),
    userMenuAvatar: document.getElementById('userMenuAvatar'),
    userMenuProfileAvatar: document.getElementById('userMenuProfileAvatar'),
    moreMenu: document.getElementById('moreMenu'),
    moreMenuTrigger: document.getElementById('moreMenuTrigger'),
    moreMenuDropdown: document.getElementById('moreMenuDropdown'),
    notificationMenu: document.getElementById('notificationMenu'),
    notificationTrigger: document.getElementById('notificationTrigger'),
    notificationDropdown: document.getElementById('notificationDropdown'),
    notificationBadge: document.getElementById('notificationBadge'),
    notificationList: document.getElementById('notificationList'),
    notificationEmptyMessage: document.getElementById('notificationEmptyMessage'),
    notificationViewAllButton: document.getElementById('notificationViewAllButton'),
    notificationMarkAllReadButton: document.getElementById('notificationMarkAllReadButton'),
    notificationsSection: document.getElementById('notificationsSection'),
    notificationsBackButton: document.getElementById('notificationsBackButton'),
    notificationsList: document.getElementById('notificationsList'),
    notificationsEmptyMessage: document.getElementById('notificationsEmptyMessage'),
    notificationsLoadMoreButton: document.getElementById('notificationsLoadMoreButton'),
    langToggle: document.getElementById('langToggle'),
    langToggleLabel: document.getElementById('langToggleLabel'),
    themeToggle: document.getElementById('themeToggle'),
    searchInput: document.getElementById('searchInput'),
    refreshAllButton: document.getElementById('refreshAllButton'),
    addFeedForm: document.getElementById('addFeedForm'),
    feedUrlInput: document.getElementById('feedUrlInput'),
    feedFormMessage: document.getElementById('feedFormMessage'),
    feedList: document.getElementById('feedList'),
    exploreFeedsButton: document.getElementById('exploreFeedsButton'),
    exploreFeedsModal: document.getElementById('exploreFeedsModal'),
    exploreFeedsModalBackdrop: document.getElementById('exploreFeedsModalBackdrop'),
    exploreFeedsModalCloseButton: document.getElementById('exploreFeedsModalCloseButton'),
    exploreFeedsBody: document.getElementById('exploreFeedsBody'),
    exploreFeedsEmpty: document.getElementById('exploreFeedsEmpty'),
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
    profileNavButton: document.getElementById('profileNavButton'),
    profileBackButton: document.getElementById('profileBackButton'),
    profileSection: document.getElementById('profileSection'),
    profileCover: document.getElementById('profileCover'),
    profileEditButton: document.getElementById('profileEditButton'),
    profileFollowButton: document.getElementById('profileFollowButton'),
    profileMoreMenu: document.getElementById('profileMoreMenu'),
    profileMoreButton: document.getElementById('profileMoreButton'),
    profileMoreDropdown: document.getElementById('profileMoreDropdown'),
    profileBlockMenuItem: document.getElementById('profileBlockMenuItem'),
    profileReportMenuItem: document.getElementById('profileReportMenuItem'),
    profileAvatar: document.getElementById('profileAvatar'),
    profileUsername: document.getElementById('profileUsername'),
    profileSubtitle: document.getElementById('profileSubtitle'),
    profileStatPosts: document.getElementById('profileStatPosts'),
    profileStatLikes: document.getElementById('profileStatLikes'),
    profileStatReplies: document.getElementById('profileStatReplies'),
    profileStatFollowers: document.getElementById('profileStatFollowers'),
    profileStatFollowing: document.getElementById('profileStatFollowing'),
    userSearchSuggestions: document.getElementById('userSearchSuggestions'),
    profileAboutType: document.getElementById('profileAboutType'),
    profileBio: document.getElementById('profileBio'),
    profileSocialLinks: document.getElementById('profileSocialLinks'),
    profileShareButton: document.getElementById('profileShareButton'),
    profileBlockedUsersButton: document.getElementById('profileBlockedUsersButton'),
    blockedUsersModal: document.getElementById('blockedUsersModal'),
    blockedUsersModalBackdrop: document.getElementById('blockedUsersModalBackdrop'),
    blockedUsersModalCloseButton: document.getElementById('blockedUsersModalCloseButton'),
    blockedUsersSubtitle: document.getElementById('blockedUsersSubtitle'),
    blockedUsersSearchInput: document.getElementById('blockedUsersSearchInput'),
    blockedUsersList: document.getElementById('blockedUsersList'),
    blockedUsersEmpty: document.getElementById('blockedUsersEmpty'),
    blockedUsersDoneButton: document.getElementById('blockedUsersDoneButton'),
    profileRecentPosts: document.getElementById('profileRecentPosts'),
    profileEmptyMessage: document.getElementById('profileEmptyMessage'),
    profileEditModal: document.getElementById('profileEditModal'),
    profileEditModalBackdrop: document.getElementById('profileEditModalBackdrop'),
    profileEditModalCloseButton: document.getElementById('profileEditModalCloseButton'),
    profileEditAvatarPreview: document.getElementById('profileEditAvatarPreview'),
    profileEditCoverPreview: document.getElementById('profileEditCoverPreview'),
    profileAvatarFileInput: document.getElementById('profileAvatarFileInput'),
    profileAvatarUploadMessage: document.getElementById('profileAvatarUploadMessage'),
    profileCoverFileInput: document.getElementById('profileCoverFileInput'),
    profileCoverUploadMessage: document.getElementById('profileCoverUploadMessage'),
    profileEditUsernameInput: document.getElementById('profileEditUsernameInput'),
    profileEditBioInput: document.getElementById('profileEditBioInput'),
    profileAddLinkButton: document.getElementById('profileAddLinkButton'),
    profileSocialLinkRows: document.getElementById('profileSocialLinkRows'),
    profileEditMessage: document.getElementById('profileEditMessage'),
    profileEditCancelButton: document.getElementById('profileEditCancelButton'),
    profileEditSaveButton: document.getElementById('profileEditSaveButton'),
    socialLinkRowTemplate: document.getElementById('socialLinkRowTemplate'),
    communityAuthStatus: document.getElementById('communityAuthStatus'),
    communityUsername: document.getElementById('communityUsername'),
    communityLogoutButton: document.getElementById('communityLogoutButton'),
    communityLanding: document.getElementById('communityLanding'),
    communityApp: document.getElementById('communityApp'),
    communityGetStartedButton: document.getElementById('communityGetStartedButton'),
    communityLandingLoginButton: document.getElementById('communityLandingLoginButton'),
    communityComposeButton: document.getElementById('communityComposeButton'),
    postComposerModal: document.getElementById('postComposerModal'),
    postComposerModalBackdrop: document.getElementById('postComposerModalBackdrop'),
    postComposerCloseButton: document.getElementById('postComposerCloseButton'),
    postComposer: document.getElementById('postComposer'),
    postComposerInput: document.getElementById('postComposerInput'),
    postComposerCount: document.getElementById('postComposerCount'),
    postComposerMessage: document.getElementById('postComposerMessage'),
    postComposerSubmitButton: document.getElementById('postComposerSubmitButton'),
    postComposerReplyBanner: document.getElementById('postComposerReplyBanner'),
    postComposerReplyTarget: document.getElementById('postComposerReplyTarget'),
    postComposerCancelReplyButton: document.getElementById('postComposerCancelReplyButton'),
    postComposerAttachImageButton: document.getElementById('postComposerAttachImageButton'),
    postComposerImageFileInput: document.getElementById('postComposerImageFileInput'),
    postComposerImagePreview: document.getElementById('postComposerImagePreview'),
    postComposerImagePreviewImg: document.getElementById('postComposerImagePreviewImg'),
    postComposerImageRemoveButton: document.getElementById('postComposerImageRemoveButton'),
    postComposerAttachFileButton: document.getElementById('postComposerAttachFileButton'),
    postComposerFileInput: document.getElementById('postComposerFileInput'),
    postComposerFilePreview: document.getElementById('postComposerFilePreview'),
    postComposerFilePreviewName: document.getElementById('postComposerFilePreviewName'),
    postComposerFileRemoveButton: document.getElementById('postComposerFileRemoveButton'),
    postFeed: document.getElementById('postFeed'),
    postFeedLoadMoreButton: document.getElementById('postFeedLoadMoreButton'),
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
    guestBanner: document.getElementById('guestBanner'),
    guestBannerSignupButton: document.getElementById('guestBannerSignupButton'),
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
        // No account required to start reading — a guest session is created
        // transparently on the first API call. Signing up is opt-in from here on.
        enterApp();
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
        openUserMenu: 'Open menu',
        yourProfile: 'Your profile',
        moreOptions: 'More options',
        searchPlaceholder: 'Search articles or feeds',
        searchGroupFeeds: 'Feeds',
        searchGroupArticles: 'Articles',
        searchGroupProfiles: 'Profiles',
        searchFollowingBadge: 'Following',
        noSearchResults: 'No matches found.',
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
        signUpForAi: 'Sign up for a free account to use AI features.',
        guestBanner: 'Browsing as a guest — sign up to save your data and unlock AI features.',
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
        loadMorePosts: 'Load more',
        loadingMorePosts: 'Loading…',
        createPost: 'Create post',
        replyingTo: 'Replying to',
        cancelReply: 'Cancel reply',
        attachImage: 'Attach image',
        removeImage: 'Remove image',
        unableToUploadImage: 'Unable to upload image right now.',
        attachFile: 'Attach file',
        removeFile: 'Remove file',
        unableToUploadFile: 'Unable to upload file right now.',
        attachedFile: 'Attached file',
        sharePost: 'Share post',
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
        openUserMenu: 'فتح القائمة',
        yourProfile: 'ملفك الشخصي',
        moreOptions: 'خيارات إضافية',
        searchPlaceholder: 'ابحث في المقالات أو المصادر',
        searchGroupFeeds: 'المصادر',
        searchGroupArticles: 'المقالات',
        searchGroupProfiles: 'الملفات الشخصية',
        searchFollowingBadge: 'متابَع',
        noSearchResults: 'لا توجد نتائج مطابقة.',
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
        signUpForAi: 'أنشئ حسابًا مجانيًا لاستخدام ميزات الذكاء الاصطناعي.',
        guestBanner: 'أنت تتصفح كضيف — أنشئ حسابًا لحفظ بياناتك واستخدام ميزات الذكاء الاصطناعي.',
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
        loadMorePosts: 'عرض المزيد',
        loadingMorePosts: 'جارٍ التحميل…',
        createPost: 'إنشاء منشور',
        replyingTo: 'الرد على',
        cancelReply: 'إلغاء الرد',
        attachImage: 'إرفاق صورة',
        removeImage: 'إزالة الصورة',
        unableToUploadImage: 'تعذر رفع الصورة الآن.',
        attachFile: 'إرفاق ملف',
        removeFile: 'إزالة الملف',
        unableToUploadFile: 'تعذر رفع الملف الآن.',
        attachedFile: 'ملف مرفق',
        sharePost: 'مشاركة المنشور',
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
        elements.langToggleLabel.textContent = t('switchToEnglish');
        elements.langToggle.setAttribute('aria-label', t('switchToEnglishAria'));
    } else {
        elements.langToggleLabel.textContent = t('switchToArabic');
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
            card.dataset.articleId = article.id;
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
let pendingPostImageUrl = null;
let pendingPostFileUrl = null;
let pendingPostFileName = null;

function updateReplyBanner() {
    if (state.activeThreadId && activeThread) {
        elements.postComposerReplyBanner.hidden = false;
        elements.postComposerReplyTarget.textContent = `@${activeThread.post.authorUsername}`;
    } else {
        elements.postComposerReplyBanner.hidden = true;
    }
}

function clearPostComposerImage() {
    pendingPostImageUrl = null;
    elements.postComposerImageFileInput.value = '';
    elements.postComposerImagePreview.hidden = true;
    elements.postComposerImagePreviewImg.src = '';
}

function clearPostComposerFile() {
    pendingPostFileUrl = null;
    pendingPostFileName = null;
    elements.postComposerFileInput.value = '';
    elements.postComposerFilePreview.hidden = true;
    elements.postComposerFilePreviewName.textContent = '';
}

function openPostComposerModal() {
    updateReplyBanner();
    elements.postComposerModal.hidden = false;
    elements.postComposerInput.focus();
}

function closePostComposerModal() {
    elements.postComposerModal.hidden = true;
    elements.postComposerMessage.textContent = '';
}

function openCommunitySection() {
    closeDrawer();
    elements.readerSection.hidden = true;
    elements.profileSection.hidden = true;
    elements.notificationsSection.hidden = true;
    elements.communitySection.hidden = false;
    elements.profileNavButton.setAttribute('aria-pressed', 'false');
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

function openProfileSection(username) {
    closeDrawer();
    elements.readerSection.hidden = true;
    elements.communitySection.hidden = true;
    elements.notificationsSection.hidden = true;
    elements.profileSection.hidden = false;
    elements.communityNavButton.setAttribute('aria-pressed', 'false');
    elements.profileNavButton.setAttribute('aria-pressed', 'true');
    document.body.classList.add('community-open');
    renderProfile(username);
}

function closeProfileSection() {
    elements.readerSection.hidden = false;
    elements.profileSection.hidden = true;
    elements.profileNavButton.setAttribute('aria-pressed', 'false');
    document.body.classList.remove('community-open');
}

function toggleProfileSection() {
    if (elements.profileSection.hidden) {
        openProfileSection();
    } else {
        closeProfileSection();
    }
}

async function openNotificationsSection() {
    closeDrawer();
    hideNotificationDropdown();
    elements.readerSection.hidden = true;
    elements.communitySection.hidden = true;
    elements.profileSection.hidden = true;
    elements.notificationsSection.hidden = false;
    document.body.classList.add('community-open');
    await loadNotificationsPage(1);
    if (state.unreadNotificationCount > 0) {
        markAllNotificationsRead();
    }
}

function closeNotificationsSection() {
    elements.readerSection.hidden = false;
    elements.notificationsSection.hidden = true;
    document.body.classList.remove('community-open');
}

function applyProfileCover(coverUrl) {
    if (coverUrl) {
        elements.profileCover.style.setProperty('--profile-cover-image', `url("${coverUrl}")`);
        elements.profileCover.classList.add('has-cover-image');
    } else {
        elements.profileCover.style.removeProperty('--profile-cover-image');
        elements.profileCover.classList.remove('has-cover-image');
    }
}

function renderHeaderAvatar() {
    const user = state.currentUser;
    [elements.userMenuAvatar, elements.userMenuProfileAvatar].forEach((avatar) => {
        avatar.innerHTML = '';
        if (!user) {
            avatar.style.background = '';
            avatar.textContent = '?';
            return;
        }
        avatar.style.background = avatarColorFor(user.username);
        if (user.avatarUrl) {
            const img = document.createElement('img');
            img.src = user.avatarUrl;
            img.alt = '';
            avatar.append(img);
        } else {
            avatar.textContent = user.username.charAt(0).toUpperCase();
        }
    });
}

function applyProfileAvatar(username, avatarUrl) {
    elements.profileAvatar.innerHTML = '';
    elements.profileAvatar.style.background = avatarColorFor(username);
    if (avatarUrl) {
        const img = document.createElement('img');
        img.src = avatarUrl;
        img.alt = '';
        elements.profileAvatar.append(img);
    } else {
        elements.profileAvatar.textContent = username.charAt(0).toUpperCase();
    }
}

function setFollowButtonState(isFollowing) {
    elements.profileFollowButton.classList.toggle('is-following', isFollowing);
    elements.profileFollowButton.setAttribute('aria-label', isFollowing ? 'Following' : 'Follow');
    elements.profileFollowButton.title = isFollowing ? 'Following' : 'Follow';
    elements.profileFollowButton.querySelector('i').className = isFollowing
        ? 'bi bi-person-check-fill'
        : 'bi bi-person-plus-fill';
}

function setBlockMenuItemState(isBlocked) {
    elements.profileBlockMenuItem.classList.toggle('is-active', isBlocked);
    elements.profileBlockMenuItem.querySelector('i').className = isBlocked
        ? 'bi bi-slash-circle-fill'
        : 'bi bi-slash-circle';
    elements.profileBlockMenuItem.lastChild.textContent = isBlocked ? ' Unblock' : ' Block';
}

function updateFollowBlockButtons(profileUser, isOwnProfile) {
    const canAct = !isOwnProfile && isSignedIn();

    elements.profileFollowButton.hidden = isOwnProfile;
    elements.profileFollowButton.disabled = !canAct;
    setFollowButtonState(Boolean(profileUser.isFollowedByViewer));
    elements.profileFollowButton.title = canAct
        ? (profileUser.isFollowedByViewer ? 'Following' : 'Follow')
        : 'Sign in to follow this user';

    elements.profileMoreMenu.hidden = isOwnProfile;
    elements.profileBlockMenuItem.disabled = !canAct;
    elements.profileReportMenuItem.disabled = !canAct;
    setBlockMenuItemState(Boolean(profileUser.isBlockedByViewer));
    hideProfileMoreDropdown();
}

function showDropdownMenu(dropdown, trigger) {
    dropdown.hidden = false;
    trigger.setAttribute('aria-expanded', 'true');
}

function hideDropdownMenu(dropdown, trigger) {
    dropdown.hidden = true;
    trigger.setAttribute('aria-expanded', 'false');
}

function toggleDropdownMenu(dropdown, trigger) {
    if (dropdown.hidden) {
        showDropdownMenu(dropdown, trigger);
    } else {
        hideDropdownMenu(dropdown, trigger);
    }
}

function hideUserMenu() {
    hideDropdownMenu(elements.userMenuDropdown, elements.userMenuTrigger);
}

function hideMoreMenu() {
    hideDropdownMenu(elements.moreMenuDropdown, elements.moreMenuTrigger);
}

function hideNotificationDropdown() {
    hideDropdownMenu(elements.notificationDropdown, elements.notificationTrigger);
}

function hideProfileMoreDropdown() {
    elements.profileMoreDropdown.hidden = true;
    elements.profileMoreButton.setAttribute('aria-expanded', 'false');
}

function toggleProfileMoreDropdown() {
    const willOpen = elements.profileMoreDropdown.hidden;
    elements.profileMoreDropdown.hidden = !willOpen;
    elements.profileMoreButton.setAttribute('aria-expanded', String(willOpen));
}

async function toggleFollowCurrentProfile() {
    const username = state.viewedProfileUsername;
    if (!username || !isSignedIn()) return;

    const isFollowing = elements.profileFollowButton.classList.contains('is-following');
    elements.profileFollowButton.disabled = true;
    try {
        const response = await fetch(`/api/users/${encodeURIComponent(username)}/follow`, {
            method: isFollowing ? 'DELETE' : 'POST',
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error || 'Could not update follow status.');
        }
        const result = await response.json();
        setFollowButtonState(result.isFollowing);
        elements.profileStatFollowers.textContent = result.followerCount;
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Could not update follow status.', 'error');
    } finally {
        elements.profileFollowButton.disabled = false;
    }
}

let userSearchDebounceTimer = null;
let userSearchRequestToken = 0;
let cachedUserResults = [];

function matchFeeds(query) {
    const q = query.toLowerCase();
    return state.feeds.filter((feed) => (feed.title || '').toLowerCase().includes(q)).slice(0, 5);
}

function matchArticles(query) {
    const q = query.toLowerCase();
    return state.articles.filter((article) => (article.title || '').toLowerCase().includes(q)).slice(0, 5);
}

function queueSearchSuggestions(rawQuery) {
    const query = rawQuery.trim();
    if (userSearchDebounceTimer) {
        window.clearTimeout(userSearchDebounceTimer);
    }

    if (query.length < 2) {
        hideUserSearchSuggestions();
        cachedUserResults = [];
        return;
    }

    renderSearchSuggestions({ feeds: matchFeeds(query), articles: matchArticles(query), users: cachedUserResults });
    userSearchDebounceTimer = window.setTimeout(() => runUserSearch(query), 250);
}

async function runUserSearch(query) {
    const requestToken = ++userSearchRequestToken;
    let results = [];
    try {
        const response = await fetch(`/api/users/search?q=${encodeURIComponent(query)}`);
        results = response.ok ? await response.json() : [];
    } catch {
        results = [];
    }

    // A newer keystroke already queued another request; drop this stale response.
    if (requestToken !== userSearchRequestToken) return;

    cachedUserResults = results;
    renderSearchSuggestions({ feeds: matchFeeds(query), articles: matchArticles(query), users: results });
}

function buildSuggestionGroup(label, items) {
    const group = document.createElement('div');
    group.className = 'search__suggestions-group';

    const heading = document.createElement('p');
    heading.className = 'search__suggestions-heading';
    heading.textContent = label;

    group.append(heading, ...items);
    return group;
}

function buildFeedSuggestion(feed) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search__suggestion';

    const icon = document.createElement('span');
    icon.className = 'search__suggestion-avatar search__suggestion-avatar--icon';
    const faviconUrl = getFaviconUrl(feed);
    if (faviconUrl) {
        const img = document.createElement('img');
        img.src = faviconUrl;
        img.alt = '';
        icon.append(img);
    } else {
        icon.innerHTML = '<i class="bi bi-rss" aria-hidden="true"></i>';
    }

    const name = document.createElement('span');
    name.className = 'search__suggestion-name';
    name.textContent = feed.title || t('untitledFeed');

    button.append(icon, name);
    button.addEventListener('click', () => {
        hideUserSearchSuggestions();
        elements.searchInput.value = '';
        state.search = '';
        state.selectedFeedId = feed.id;
        render();
        if (window.innerWidth < 768) {
            closeDrawer();
        }
    });

    return button;
}

function buildArticleSuggestion(article) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search__suggestion';

    const icon = document.createElement('span');
    icon.className = 'search__suggestion-avatar search__suggestion-avatar--icon';
    icon.innerHTML = '<i class="bi bi-file-earmark-text" aria-hidden="true"></i>';

    const name = document.createElement('span');
    name.className = 'search__suggestion-name';
    name.textContent = article.title || t('untitledArticle');

    button.append(icon, name);
    button.addEventListener('click', () => {
        hideUserSearchSuggestions();
        state.selectedFeedId = 'all';
        state.search = article.title || '';
        elements.searchInput.value = state.search;
        render();
        highlightArticleCard(article.id);
    });

    return button;
}

function buildUserSuggestion(user) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'search__suggestion';

    const avatar = document.createElement('span');
    avatar.className = 'search__suggestion-avatar';
    avatar.style.background = avatarColorFor(user.username);
    if (user.avatarUrl) {
        const img = document.createElement('img');
        img.src = user.avatarUrl;
        img.alt = '';
        avatar.append(img);
    } else {
        avatar.textContent = user.username.charAt(0).toUpperCase();
    }

    const name = document.createElement('span');
    name.className = 'search__suggestion-name';
    name.textContent = user.username;

    button.append(avatar, name);

    if (user.isFollowedByViewer) {
        const badge = document.createElement('span');
        badge.className = 'search__suggestion-following';
        badge.textContent = t('searchFollowingBadge');
        button.append(badge);
    }

    button.addEventListener('click', () => {
        hideUserSearchSuggestions();
        elements.searchInput.value = '';
        openProfileSection(user.username);
    });

    return button;
}

function renderSearchSuggestions({ feeds, articles, users }) {
    const host = elements.userSearchSuggestions;
    host.innerHTML = '';

    if (!feeds.length && !articles.length && !users.length) {
        const empty = document.createElement('p');
        empty.className = 'search__suggestions-empty';
        empty.textContent = t('noSearchResults');
        host.append(empty);
        host.hidden = false;
        return;
    }

    if (feeds.length) {
        host.append(buildSuggestionGroup(t('searchGroupFeeds'), feeds.map(buildFeedSuggestion)));
    }
    if (articles.length) {
        host.append(buildSuggestionGroup(t('searchGroupArticles'), articles.map(buildArticleSuggestion)));
    }
    if (users.length) {
        host.append(buildSuggestionGroup(t('searchGroupProfiles'), users.map(buildUserSuggestion)));
    }

    host.hidden = false;
}

function highlightArticleCard(articleId) {
    requestAnimationFrame(() => {
        const cardEl = elements.articleFeed.querySelector(`[data-article-id="${articleId}"]`);
        if (!cardEl) return;
        cardEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
        cardEl.classList.add('article-card--search-highlight');
        window.setTimeout(() => cardEl.classList.remove('article-card--search-highlight'), 1600);
    });
}

function hideUserSearchSuggestions() {
    elements.userSearchSuggestions.hidden = true;
    elements.userSearchSuggestions.innerHTML = '';
}

async function toggleBlockCurrentProfile() {
    const username = state.viewedProfileUsername;
    hideProfileMoreDropdown();
    if (!username || !isSignedIn()) return;

    const isBlocked = elements.profileBlockMenuItem.classList.contains('is-active');
    if (!isBlocked && !window.confirm(`Block ${username}? They won't be able to follow you, and any existing follow between you will be removed.`)) {
        return;
    }

    elements.profileBlockMenuItem.disabled = true;
    try {
        const response = await fetch(`/api/users/${encodeURIComponent(username)}/block`, {
            method: isBlocked ? 'DELETE' : 'POST',
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error || 'Could not update block status.');
        }
        const result = await response.json();
        setBlockMenuItemState(result.isBlocked);
        if (result.isBlocked) {
            setFollowButtonState(false);
            renderProfile(username);
        }
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Could not update block status.', 'error');
    } finally {
        elements.profileBlockMenuItem.disabled = false;
    }
}

async function reportCurrentProfile() {
    const username = state.viewedProfileUsername;
    hideProfileMoreDropdown();
    if (!username || !isSignedIn()) return;

    if (!window.confirm(`Report ${username} to the moderators?`)) {
        return;
    }

    try {
        const response = await fetch(`/api/users/${encodeURIComponent(username)}/report`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({}),
        });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error || 'Could not submit report.');
        }
        showToast('Thanks — this profile has been reported to the moderators.', 'success');
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Could not submit report.', 'error');
    }
}

async function renderProfile(username) {
    const targetUsername = username || state.currentUser?.username;
    if (!targetUsername) {
        elements.profileUsername.textContent = '';
        elements.profileSubtitle.textContent = 'Log in to see your profile.';
        elements.profileAboutType.textContent = '';
        elements.profileEditButton.hidden = true;
        elements.profileBlockedUsersButton.hidden = true;
        elements.profileFollowButton.hidden = true;
        elements.profileMoreMenu.hidden = true;
        state.profilePosts = [];
        elements.profileRecentPosts.innerHTML = '';
        applyProfileCover(null);
        elements.profileEmptyMessage.hidden = false;
        elements.profileEmptyMessage.textContent = 'Log in to see your profile.';
        return;
    }

    const isOwnProfile = Boolean(state.currentUser) && targetUsername === state.currentUser.username;
    state.viewedProfileUsername = targetUsername;

    let profileUser = isOwnProfile ? state.currentUser : null;
    if (!profileUser) {
        try {
            const response = await fetch(`/api/users/${encodeURIComponent(targetUsername)}`);
            profileUser = response.ok ? await response.json() : null;
        } catch {
            profileUser = null;
        }
    }

    if (!profileUser) {
        elements.profileUsername.textContent = targetUsername;
        elements.profileSubtitle.textContent = 'This user could not be found.';
        elements.profileAboutType.textContent = '';
        elements.profileEditButton.hidden = true;
        elements.profileBlockedUsersButton.hidden = true;
        elements.profileFollowButton.hidden = true;
        elements.profileMoreMenu.hidden = true;
        state.profilePosts = [];
        elements.profileRecentPosts.innerHTML = '';
        applyProfileCover(null);
        elements.profileEmptyMessage.hidden = false;
        elements.profileEmptyMessage.textContent = '';
        return;
    }

    applyProfileAvatar(profileUser.username, profileUser.avatarUrl);
    applyProfileCover(profileUser.coverUrl);
    elements.profileUsername.textContent = profileUser.username;
    elements.profileSubtitle.textContent = profileUser.isGuest ? 'Guest account' : 'Community member';
    elements.profileEditButton.hidden = !isOwnProfile;
    elements.profileBlockedUsersButton.hidden = !isOwnProfile || !isSignedIn();
    elements.profileStatFollowers.textContent = profileUser.followerCount ?? 0;
    elements.profileStatFollowing.textContent = profileUser.followingCount ?? 0;
    updateFollowBlockButtons(profileUser, isOwnProfile);

    // A written bio replaces the generic placeholder sentence rather than sitting
    // alongside it — otherwise editing your bio never actually clears the old default.
    if (profileUser.bio) {
        elements.profileBio.textContent = profileUser.bio;
        elements.profileBio.hidden = false;
        elements.profileAboutType.textContent = '';
        elements.profileAboutType.hidden = true;
    } else {
        elements.profileBio.textContent = '';
        elements.profileBio.hidden = true;
        elements.profileAboutType.textContent = profileUser.isGuest
            ? 'Browsing as a guest — sign up to keep this profile permanently.'
            : 'Registered member of the RSS Reader community.';
        elements.profileAboutType.hidden = false;
    }

    elements.profileSocialLinks.innerHTML = '';
    (profileUser.socialLinks || []).forEach((link) => {
        const anchor = document.createElement('a');
        anchor.className = 'profile-card__social-link';
        anchor.href = link.url;
        anchor.target = '_blank';
        anchor.rel = 'noopener noreferrer';
        anchor.title = link.url;
        anchor.innerHTML = `<i class="bi ${socialIconClass(link.platform)}" aria-hidden="true"></i>`;
        elements.profileSocialLinks.append(anchor);
    });

    let posts = [];
    try {
        const response = await fetch(`/api/users/${encodeURIComponent(profileUser.username)}/posts?page=1`);
        if (response.ok) {
            posts = await response.json();
        }
    } catch {
        posts = [];
    }

    elements.profileStatPosts.textContent = posts.length;
    elements.profileStatLikes.textContent = posts.reduce((sum, post) => sum + totalReactionCount(post), 0);
    elements.profileStatReplies.textContent = posts.reduce((sum, post) => sum + post.replyCount, 0);

    state.profilePosts = posts.slice(0, 6);
    renderProfilePosts();
}

function renderProfilePosts() {
    elements.profileRecentPosts.innerHTML = '';
    if (state.profilePosts.length === 0) {
        elements.profileEmptyMessage.hidden = false;
        elements.profileEmptyMessage.textContent = "This user hasn't posted anything yet.";
    } else {
        elements.profileEmptyMessage.hidden = true;
        state.profilePosts.forEach((post) => {
            elements.profileRecentPosts.append(buildPostCard(post));
        });
    }
}

function applyEditPreviewImage(previewEl, imageUrl) {
    if (imageUrl) {
        previewEl.style.backgroundImage = `url("${imageUrl}")`;
    } else {
        previewEl.style.backgroundImage = '';
    }
}

function addSocialLinkRow(platform, url) {
    const node = elements.socialLinkRowTemplate.content.firstElementChild.cloneNode(true);
    const iconEl = node.querySelector('.social-link-row__icon i');
    const platformSelect = node.querySelector('.social-link-row__platform');
    const urlInput = node.querySelector('.social-link-row__url');

    platformSelect.value = platform && SOCIAL_PLATFORM_ICONS[platform] ? platform : 'website';
    urlInput.value = url || '';
    iconEl.className = `bi ${socialIconClass(platformSelect.value)}`;

    platformSelect.addEventListener('change', () => {
        iconEl.className = `bi ${socialIconClass(platformSelect.value)}`;
    });
    node.querySelector('.social-link-row__remove').addEventListener('click', () => node.remove());

    elements.profileSocialLinkRows.append(node);
}

function collectSocialLinksFromForm() {
    return Array.from(elements.profileSocialLinkRows.querySelectorAll('.social-link-row'))
        .map((row) => ({
            platform: row.querySelector('.social-link-row__platform').value,
            url: row.querySelector('.social-link-row__url').value.trim(),
        }))
        .filter((link) => link.url.length > 0);
}

async function shareProfile() {
    const username = state.viewedProfileUsername || state.currentUser?.username;
    if (!username) return;

    const url = `${window.location.origin}/profile/${encodeURIComponent(username)}`;
    try {
        await navigator.clipboard.writeText(url);
        showToast('Profile link copied to clipboard.', 'success');
    } catch {
        window.prompt('Copy this profile link:', url);
    }
}

async function sharePost(postId) {
    const url = `${window.location.origin}/posts/${postId}`;
    try {
        await navigator.clipboard.writeText(url);
        showToast(t('linkCopied'), 'success');
    } catch {
        window.prompt('Copy this post link:', url);
    }
}

function openProfileEditModal() {
    const user = state.currentUser;
    if (!user) return;

    elements.profileAvatarUploadMessage.textContent = '';
    elements.profileCoverUploadMessage.textContent = '';
    elements.profileEditMessage.textContent = '';
    elements.profileEditMessage.removeAttribute('data-tone');
    elements.profileAvatarFileInput.value = '';
    elements.profileCoverFileInput.value = '';

    applyEditPreviewImage(elements.profileEditAvatarPreview, user.avatarUrl);
    applyEditPreviewImage(elements.profileEditCoverPreview, user.coverUrl);
    elements.profileEditUsernameInput.value = user.username;
    elements.profileEditBioInput.value = user.bio || '';

    elements.profileSocialLinkRows.innerHTML = '';
    (user.socialLinks || []).forEach((link) => addSocialLinkRow(link.platform, link.url));

    elements.profileEditModal.hidden = false;
}

function closeProfileEditModal() {
    elements.profileEditModal.hidden = true;
}

let cachedBlockedUsers = [];

function buildBlockedUserRow(user) {
    const row = document.createElement('div');
    row.className = 'blocked-users-modal__row';
    row.dataset.username = user.username;

    const avatar = document.createElement('span');
    avatar.className = 'blocked-users-modal__avatar';
    avatar.style.background = avatarColorFor(user.username);
    if (user.avatarUrl) {
        const img = document.createElement('img');
        img.src = user.avatarUrl;
        img.alt = '';
        avatar.append(img);
    } else {
        avatar.textContent = user.username.charAt(0).toUpperCase();
    }

    const info = document.createElement('div');
    info.className = 'blocked-users-modal__info';
    const name = document.createElement('p');
    name.className = 'blocked-users-modal__name';
    name.textContent = user.username;
    const handle = document.createElement('p');
    handle.className = 'blocked-users-modal__handle';
    handle.textContent = `@${user.username}`;
    info.append(name, handle);

    const unblockButton = document.createElement('button');
    unblockButton.type = 'button';
    unblockButton.className = 'blocked-users-modal__unblock-btn';
    unblockButton.title = 'Unblock';
    unblockButton.setAttribute('aria-label', `Unblock ${user.username}`);
    unblockButton.innerHTML = '<i class="bi bi-dash-circle-fill" aria-hidden="true"></i>';
    unblockButton.addEventListener('click', () => unblockUserFromList(user.username, row));

    row.append(avatar, info, unblockButton);
    return row;
}

function renderBlockedUsersList(filterQuery = '') {
    const query = filterQuery.trim().toLowerCase();
    const filtered = query
        ? cachedBlockedUsers.filter((u) => u.username.toLowerCase().includes(query))
        : cachedBlockedUsers;

    elements.blockedUsersList.innerHTML = '';
    filtered.forEach((user) => elements.blockedUsersList.append(buildBlockedUserRow(user)));

    elements.blockedUsersEmpty.hidden = filtered.length > 0;
    elements.blockedUsersEmpty.textContent = cachedBlockedUsers.length === 0
        ? "You haven't blocked anyone."
        : 'No blocked users match your search.';
    elements.blockedUsersSubtitle.textContent = `Manage blocked users (${cachedBlockedUsers.length} total)`;
}

async function unblockUserFromList(username, row) {
    row.classList.add('is-removing');
    try {
        const response = await fetch(`/api/users/${encodeURIComponent(username)}/block`, { method: 'DELETE' });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            throw new Error(body?.error || 'Could not unblock this user.');
        }
        cachedBlockedUsers = cachedBlockedUsers.filter((u) => u.username !== username);
        renderBlockedUsersList(elements.blockedUsersSearchInput.value);

        if (state.viewedProfileUsername === username) {
            setBlockMenuItemState(false);
        }
    } catch (error) {
        row.classList.remove('is-removing');
        showToast(error instanceof Error ? error.message : 'Could not unblock this user.', 'error');
    }
}

async function openBlockedUsersModal() {
    elements.blockedUsersSearchInput.value = '';
    elements.blockedUsersModal.hidden = false;
    elements.blockedUsersList.innerHTML = '';
    elements.blockedUsersSubtitle.textContent = 'Loading…';

    try {
        const response = await fetch('/api/users/me/blocked');
        cachedBlockedUsers = response.ok ? await response.json() : [];
    } catch {
        cachedBlockedUsers = [];
    }

    renderBlockedUsersList();
}

function closeBlockedUsersModal() {
    elements.blockedUsersModal.hidden = true;
}

async function saveProfileEdits() {
    const username = elements.profileEditUsernameInput.value.trim();
    const bio = elements.profileEditBioInput.value.trim();
    const socialLinks = collectSocialLinksFromForm();

    elements.profileEditMessage.textContent = 'Saving...';
    elements.profileEditMessage.removeAttribute('data-tone');
    elements.profileEditSaveButton.disabled = true;

    try {
        const response = await fetch('/api/users/me', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, bio, socialLinks }),
        });

        if (!response.ok) {
            const body = await response.json().catch(() => null);
            elements.profileEditMessage.textContent = body?.error || 'Could not save your profile.';
            elements.profileEditMessage.setAttribute('data-tone', 'error');
            return;
        }

        state.currentUser = await response.json();
        renderHeaderAvatar();
        await renderProfile(state.currentUser.username);
        closeProfileEditModal();
        showToast('Profile updated.', 'success');
    } catch {
        elements.profileEditMessage.textContent = 'Could not save your profile. Check your connection and try again.';
        elements.profileEditMessage.setAttribute('data-tone', 'error');
    } finally {
        elements.profileEditSaveButton.disabled = false;
    }
}

async function uploadProfileImage(endpoint, file, messageEl) {
    messageEl.textContent = 'Uploading...';
    messageEl.removeAttribute('data-tone');
    try {
        const formData = new FormData();
        formData.append('file', file);
        const response = await fetch(endpoint, { method: 'POST', body: formData });
        if (!response.ok) {
            const body = await response.json().catch(() => null);
            messageEl.textContent = body?.error || 'Upload failed.';
            messageEl.setAttribute('data-tone', 'error');
            return;
        }
        state.currentUser = await response.json();
        applyProfileAvatar(state.currentUser.username, state.currentUser.avatarUrl);
        applyProfileCover(state.currentUser.coverUrl);
        renderHeaderAvatar();
        applyEditPreviewImage(elements.profileEditAvatarPreview, state.currentUser.avatarUrl);
        applyEditPreviewImage(elements.profileEditCoverPreview, state.currentUser.coverUrl);
        messageEl.textContent = 'Updated.';
        messageEl.setAttribute('data-tone', 'success');
    } catch {
        messageEl.textContent = 'Upload failed. Check your connection and try again.';
        messageEl.setAttribute('data-tone', 'error');
    }
}

// Community posting (like/reply/delete) still requires a real account; browsing
// and feed-reading do not. Guests get a real `currentUser` row, just flagged isGuest.
function isSignedIn() {
    return Boolean(state.currentUser) && !state.currentUser.isGuest;
}

function renderAuthStatus() {
    const loggedIn = isSignedIn();
    elements.communityAuthStatus.hidden = !loggedIn;
    elements.communityLanding.hidden = loggedIn;
    elements.communityApp.hidden = !loggedIn;
    if (loggedIn) {
        elements.communityUsername.textContent = state.currentUser.username;
    }
    elements.guestBanner.hidden = !state.currentUser?.isGuest;
    renderHeaderAvatar();
}

async function loadCurrentUser() {
    try {
        const response = await fetch('/api/auth/me');
        state.currentUser = response.ok ? await response.json() : null;
    } catch {
        state.currentUser = null;
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

const SOCIAL_PLATFORM_ICONS = {
    facebook: 'bi-facebook',
    twitter: 'bi-twitter-x',
    instagram: 'bi-instagram',
    youtube: 'bi-youtube',
    tiktok: 'bi-tiktok',
    linkedin: 'bi-linkedin',
    github: 'bi-github',
    website: 'bi-link-45deg',
};

function socialIconClass(platform) {
    return SOCIAL_PLATFORM_ICONS[platform] || SOCIAL_PLATFORM_ICONS.website;
}

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
    if (post.authorAvatarUrl) {
        const img = document.createElement('img');
        img.src = post.authorAvatarUrl;
        img.alt = '';
        avatar.append(img);
    } else {
        avatar.textContent = post.authorUsername.charAt(0).toUpperCase();
        avatar.style.background = avatarColorFor(post.authorUsername);
    }
    const openAuthorProfile = () => openProfileSection(post.authorUsername);
    avatar.addEventListener('click', openAuthorProfile);
    const authorEl = node.querySelector('.post-card__author');
    authorEl.textContent = post.authorUsername;
    authorEl.addEventListener('click', openAuthorProfile);
    node.querySelector('.post-card__time').textContent = formatPostTime(post.createdAt);
    const contentEl = node.querySelector('.post-card__content');
    contentEl.textContent = post.content;
    const imageEl = node.querySelector('.post-card__image');
    if (post.imageUrl) {
        imageEl.src = post.imageUrl;
        imageEl.hidden = false;
    }
    const fileEl = node.querySelector('.post-card__file');
    if (post.fileUrl) {
        fileEl.href = post.fileUrl;
        fileEl.download = post.fileName || '';
        fileEl.querySelector('.post-card__file-name').textContent = post.fileName || t('attachedFile');
        fileEl.hidden = false;
    }
    node.querySelector('.post-card__reply-count span').textContent = t('replyCount', { count: post.replyCount });
    node.querySelector('.post-card__reply-count').addEventListener('click', () => openThread(post.id));

    wireReactionControl(node, post);

    node.querySelector('.post-card__share').addEventListener('click', () => sharePost(post.id));

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

const REACTIONS = {
    Like: { icon: 'bi-hand-thumbs-up-fill', color: '#1877f2' },
    Love: { icon: 'bi-heart-fill', color: '#f33e58' },
    Haha: { icon: 'bi-emoji-laughing-fill', color: '#f7b125' },
    Wow: { icon: 'bi-emoji-astonished-fill', color: '#f7b125' },
    Sad: { icon: 'bi-emoji-frown-fill', color: '#f7b125' },
    Angry: { icon: 'bi-emoji-angry-fill', color: '#e9710f' },
};

function totalReactionCount(post) {
    return Object.values(post.reactionCounts || {}).reduce((sum, n) => sum + n, 0);
}

function topReactionTypes(post, limit = 3) {
    return Object.entries(post.reactionCounts || {})
        .filter(([, count]) => count > 0)
        .sort((a, b) => b[1] - a[1])
        .slice(0, limit)
        .map(([type]) => type);
}

function updateReactionButton(node, post) {
    const reactButton = node.querySelector('.post-card__react-button');
    const iconEl = node.querySelector('.post-card__react-icon');

    const current = post.currentUserReaction && REACTIONS[post.currentUserReaction];
    iconEl.className = `post-card__react-icon bi ${current ? current.icon : 'bi-hand-thumbs-up'}`;
    reactButton.style.color = current ? current.color : '';
    reactButton.classList.toggle('post-card__react-button--active', Boolean(current));

    updateReactionSummary(node, post);
}

function updateReactionSummary(node, post) {
    const summary = node.querySelector('.post-card__reactions-summary');
    const iconsEl = node.querySelector('.post-card__reactions-summary-icons');
    const countEl = node.querySelector('.post-card__reactions-summary-count');

    const total = totalReactionCount(post);
    if (total === 0) {
        summary.hidden = true;
        return;
    }

    iconsEl.innerHTML = '';
    for (const type of topReactionTypes(post, 3)) {
        const reaction = REACTIONS[type];
        if (!reaction) continue;
        const badge = document.createElement('span');
        badge.className = 'post-card__reactions-summary-icon';
        badge.style.background = reaction.color;
        const icon = document.createElement('i');
        icon.className = `bi ${reaction.icon}`;
        badge.append(icon);
        iconsEl.append(badge);
    }
    countEl.textContent = total;
    summary.hidden = false;
}

function wireReactionControl(node, post) {
    const wrapper = node.querySelector('.post-card__reaction');
    const reactButton = node.querySelector('.post-card__react-button');
    const picker = node.querySelector('.post-card__reaction-picker');

    updateReactionButton(node, post);
    reactButton.disabled = !isSignedIn();

    let hideTimer = null;
    let longPressTimer = null;
    let longPressTriggered = false;

    const showPicker = () => {
        if (reactButton.disabled) return;
        clearTimeout(hideTimer);
        picker.hidden = false;
    };
    const scheduleHide = () => {
        clearTimeout(hideTimer);
        hideTimer = setTimeout(() => { picker.hidden = true; }, 300);
    };

    wrapper.addEventListener('mouseenter', showPicker);
    wrapper.addEventListener('mouseleave', scheduleHide);

    reactButton.addEventListener('touchstart', () => {
        longPressTriggered = false;
        longPressTimer = setTimeout(() => {
            longPressTriggered = true;
            showPicker();
        }, 400);
    }, { passive: true });

    reactButton.addEventListener('touchend', () => {
        clearTimeout(longPressTimer);
    });

    reactButton.addEventListener('touchmove', () => {
        clearTimeout(longPressTimer);
    });

    reactButton.addEventListener('click', () => {
        if (longPressTriggered) {
            longPressTriggered = false;
            return;
        }
        picker.hidden = true;
        toggleReaction(post.id, post.currentUserReaction || 'Like');
    });

    for (const option of picker.querySelectorAll('.post-card__reaction-option')) {
        option.addEventListener('click', () => {
            picker.hidden = true;
            toggleReaction(post.id, option.dataset.reaction);
        });
    }
}

const COMMUNITY_PAGE_SIZE = 20;

function renderPostFeed() {
    elements.postFeed.innerHTML = '';

    if (state.communityPosts.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        const body = document.createElement('p');
        body.textContent = t('noPostsYet');
        empty.append(body);
        elements.postFeed.append(empty);
    } else {
        for (const post of state.communityPosts) {
            elements.postFeed.append(buildPostCard(post));
        }
    }

    elements.postFeedLoadMoreButton.hidden = !state.communityHasMorePosts;
}

async function loadCommunityTimeline() {
    try {
        const response = await fetch(`/api/posts?page=1`);
        if (!response.ok) {
            throw new Error(`Post request failed (${response.status})`);
        }
        const posts = await response.json();
        state.communityPosts = posts;
        state.communityPage = 1;
        state.communityHasMorePosts = posts.length === COMMUNITY_PAGE_SIZE;
        renderPostFeed();
    } catch (error) {
        showToast(error instanceof Error ? error.message : t('unableToLoadPosts'), 'error');
    }
}

async function loadMoreCommunityPosts() {
    if (state.communityLoadingMore || !state.communityHasMorePosts) {
        return;
    }

    state.communityLoadingMore = true;
    elements.postFeedLoadMoreButton.disabled = true;
    elements.postFeedLoadMoreButton.textContent = t('loadingMorePosts');

    try {
        const nextPage = state.communityPage + 1;
        const response = await fetch(`/api/posts?page=${nextPage}`);
        if (!response.ok) {
            throw new Error(`Post request failed (${response.status})`);
        }
        const posts = await response.json();
        state.communityPosts.push(...posts);
        state.communityPage = nextPage;
        state.communityHasMorePosts = posts.length === COMMUNITY_PAGE_SIZE;
        renderPostFeed();
    } catch (error) {
        showToast(error instanceof Error ? error.message : t('unableToLoadPosts'), 'error');
    } finally {
        state.communityLoadingMore = false;
        elements.postFeedLoadMoreButton.disabled = false;
        elements.postFeedLoadMoreButton.textContent = t('loadMorePosts');
    }
}

async function submitPost(content, parentPostId, imageUrl, fileUrl, fileName) {
    const response = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            content,
            parentPostId: parentPostId ?? null,
            imageUrl: imageUrl ?? null,
            fileUrl: fileUrl ?? null,
            fileName: fileName ?? null,
        }),
    });

    if (!response.ok) {
        const message = response.status === 400 ? t('postEmptyOrTooLong') : t('unableToPost');
        throw new Error(message);
    }

    return response.json();
}

async function uploadPostImage(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/posts/image', { method: 'POST', body: formData });
    if (!response.ok) {
        throw new Error(t('unableToUploadImage'));
    }
    const data = await response.json();
    return data.url;
}

async function uploadPostFile(file) {
    const formData = new FormData();
    formData.append('file', file);
    const response = await fetch('/api/posts/file', { method: 'POST', body: formData });
    if (!response.ok) {
        const data = await response.json().catch(() => null);
        throw new Error(data?.error || t('unableToUploadFile'));
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
    // Replying/viewing a thread only has visible UI inside the community section
    // (#postThread lives there) - reachable from post cards on the profile page too,
    // so make sure that section is actually the one showing first.
    if (elements.communitySection.hidden) {
        openCommunitySection();
    }

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

function handleReactionUpdate({ postId, reactionCounts }) {
    const feedPost = state.communityPosts.find((p) => p.id === postId);
    if (feedPost) {
        feedPost.reactionCounts = reactionCounts;
        renderPostFeed();
    }

    if (activeThread) {
        const threadPost = activeThread.post.id === postId
            ? activeThread.post
            : activeThread.replies.find((p) => p.id === postId);
        if (threadPost) {
            threadPost.reactionCounts = reactionCounts;
            renderThread();
        }
    }

    const profilePost = state.profilePosts.find((p) => p.id === postId);
    if (profilePost) {
        profilePost.reactionCounts = reactionCounts;
        if (!elements.profileSection.hidden) renderProfilePosts();
    }
}

async function toggleReaction(postId, reactionType) {
    if (!isSignedIn()) {
        return;
    }

    try {
        const response = await fetch(`/api/posts/${postId}/react`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ reactionType }),
        });
        if (!response.ok) {
            return;
        }
        const { reactionCounts, currentUserReaction } = await response.json();

        const feedPost = state.communityPosts.find((p) => p.id === postId);
        if (feedPost) {
            feedPost.reactionCounts = reactionCounts;
            feedPost.currentUserReaction = currentUserReaction;
            renderPostFeed();
        }

        if (activeThread) {
            const threadPost = activeThread.post.id === postId
                ? activeThread.post
                : activeThread.replies.find((p) => p.id === postId);
            if (threadPost) {
                threadPost.reactionCounts = reactionCounts;
                threadPost.currentUserReaction = currentUserReaction;
                renderThread();
            }
        }

        const profilePost = state.profilePosts.find((p) => p.id === postId);
        if (profilePost) {
            profilePost.reactionCounts = reactionCounts;
            profilePost.currentUserReaction = currentUserReaction;
            if (!elements.profileSection.hidden) renderProfilePosts();
        }
    } catch {
        // best-effort; the reaction buttons simply reflect the last-known state
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

    const profilePost = state.profilePosts.find((p) => p.id === updated.id);
    if (profilePost) {
        profilePost.content = updated.content;
    }
}

function handlePostEdited(post) {
    applyPostUpdate(post);
    renderPostFeed();
    renderThread();
    if (!elements.profileSection.hidden) renderProfilePosts();
}

async function deletePost(postId) {
    if (!isSignedIn()) {
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

    const profilePost = state.profilePosts.find((p) => p.id === postId);
    state.profilePosts = state.profilePosts.filter((p) => p.id !== postId);
    if (profilePost && !elements.profileSection.hidden) {
        renderProfilePosts();
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

/* ---------- Notifications ---------- */

const NOTIFICATION_ICONS = {
    Reaction: 'bi-heart-fill',
    Reply: 'bi-chat-fill',
    Follow: 'bi-person-plus-fill',
};

function notificationText(n) {
    switch (n.type) {
        case 'Reaction':
            return `reacted to your post`;
        case 'Reply':
            return `replied to your post`;
        case 'Follow':
            return `started following you`;
        default:
            return 'interacted with you';
    }
}

function updateNotificationBadge(count) {
    state.unreadNotificationCount = count;
    elements.notificationBadge.hidden = count <= 0;
    elements.notificationBadge.textContent = count > 99 ? '99+' : String(count);
}

function buildNotificationRow(n) {
    const row = document.createElement('div');
    row.className = 'notification-item' + (n.isRead ? '' : ' notification-item--unread');

    const avatar = document.createElement('span');
    avatar.className = 'notification-item__avatar';
    if (n.actorAvatarUrl) {
        const img = document.createElement('img');
        img.src = n.actorAvatarUrl;
        img.alt = '';
        avatar.append(img);
    } else {
        avatar.textContent = n.actorUsername.charAt(0).toUpperCase();
        avatar.style.background = avatarColorFor(n.actorUsername);
    }

    const icon = document.createElement('span');
    icon.className = 'notification-item__icon';
    icon.innerHTML = `<i class="bi ${NOTIFICATION_ICONS[n.type] || 'bi-bell-fill'}" aria-hidden="true"></i>`;

    const body = document.createElement('div');
    body.className = 'notification-item__body';
    const text = document.createElement('p');
    text.className = 'notification-item__text';
    const strong = document.createElement('strong');
    strong.textContent = n.actorUsername;
    text.append(strong, document.createTextNode(' ' + notificationText(n)));
    const time = document.createElement('time');
    time.className = 'notification-item__time';
    time.textContent = formatPostTime(n.createdAt);
    body.append(text, time);

    row.append(avatar, icon, body);
    row.addEventListener('click', () => handleNotificationClick(n));
    return row;
}

async function handleNotificationClick(n) {
    hideNotificationDropdown();
    if (!n.isRead) {
        markNotificationRead(n.id);
    }
    if (n.type === 'Follow') {
        openProfileSection(n.actorUsername);
    } else if (n.postId) {
        openCommunitySection();
        openThread(n.postId);
    }
}

function renderNotificationDropdown() {
    elements.notificationList.innerHTML = '';
    const recent = state.notifications.slice(0, 5);
    elements.notificationEmptyMessage.hidden = recent.length > 0;
    for (const n of recent) {
        elements.notificationList.append(buildNotificationRow(n));
    }
}

function renderNotificationsPage() {
    elements.notificationsList.innerHTML = '';
    elements.notificationsEmptyMessage.hidden = state.notifications.length > 0;
    for (const n of state.notifications) {
        elements.notificationsList.append(buildNotificationRow(n));
    }
    elements.notificationsLoadMoreButton.hidden = !state.notificationsHasMore;
}

async function loadUnreadCount() {
    try {
        const response = await fetch('/api/notifications/unread-count');
        if (!response.ok) return;
        const body = await response.json();
        updateNotificationBadge(body.unreadCount);
    } catch {
        // best-effort; badge just won't update this pass
    }
}

async function loadRecentNotifications() {
    try {
        const response = await fetch('/api/notifications?page=1');
        if (!response.ok) return;
        const body = await response.json();
        state.notifications = body.items;
        updateNotificationBadge(body.unreadCount);
        renderNotificationDropdown();
    } catch {
        // best-effort; dropdown just won't populate this pass
    }
}

async function loadNotificationsPage(page) {
    try {
        const response = await fetch(`/api/notifications?page=${page}`);
        if (!response.ok) return;
        const body = await response.json();
        state.notifications = page === 1 ? body.items : state.notifications.concat(body.items);
        state.notificationsPage = page;
        state.notificationsHasMore = body.hasMore;
        updateNotificationBadge(body.unreadCount);
        renderNotificationsPage();
    } catch (error) {
        showToast(error instanceof Error ? error.message : 'Unable to load notifications.', 'error');
    }
}

async function markNotificationRead(id) {
    const n = state.notifications.find((item) => item.id === id);
    if (n) n.isRead = true;
    try {
        await fetch(`/api/notifications/${id}/read`, { method: 'POST' });
        await loadUnreadCount();
    } catch {
        // best-effort
    }
}

async function markAllNotificationsRead() {
    for (const n of state.notifications) n.isRead = true;
    renderNotificationDropdown();
    if (!elements.notificationsSection.hidden) renderNotificationsPage();
    try {
        await fetch('/api/notifications/read-all', { method: 'POST' });
        updateNotificationBadge(0);
    } catch {
        // best-effort
    }
}

function handleIncomingNotification({ notification, unreadCount }) {
    state.notifications = [notification, ...state.notifications];
    updateNotificationBadge(unreadCount);
    if (!elements.notificationDropdown.hidden) renderNotificationDropdown();
    if (!elements.notificationsSection.hidden) renderNotificationsPage();
}

async function connectCommunityHub() {
    try {
        communityHubConnection = new signalR.HubConnectionBuilder()
            .withUrl('/hubs/community')
            .withAutomaticReconnect()
            .build();
        communityHubConnection.on('NewPost', handleIncomingPost);
        communityHubConnection.on('PostReacted', handleReactionUpdate);
        communityHubConnection.on('PostDeleted', handlePostDeleted);
        communityHubConnection.on('PostEdited', handlePostEdited);
        communityHubConnection.on('Notification', handleIncomingNotification);
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
        return true;
    }

    let message = t('unableToAddFeed');
    try {
        const body = await response.json();
        message = body?.error || message;
    } catch {
        // keep fallback message
    }

    showToast(getFriendlyFeedError(message, t('unableToAddFeed')), 'error');
    return false;
}

/* ---------- Explore feeds ---------- */

function buildExploreFeedsGroup(category, suggestions) {
    const group = document.createElement('div');
    group.className = 'explore-feeds-group';

    const heading = document.createElement('h4');
    heading.className = 'explore-feeds-group__heading';
    heading.textContent = category;
    group.append(heading);

    const list = document.createElement('div');
    list.className = 'explore-feeds-group__list';

    for (const suggestion of suggestions) {
        const card = document.createElement('div');
        card.className = 'explore-feed-card';

        const info = document.createElement('div');
        info.className = 'explore-feed-card__info';
        const title = document.createElement('strong');
        title.textContent = suggestion.title;
        const site = document.createElement('span');
        site.className = 'explore-feed-card__site';
        site.textContent = suggestion.siteUrl || suggestion.url;
        info.append(title, site);

        const subscribeButton = document.createElement('button');
        subscribeButton.type = 'button';
        subscribeButton.className = 'explore-feed-card__subscribe';
        subscribeButton.textContent = 'Subscribe';
        subscribeButton.addEventListener('click', async () => {
            subscribeButton.disabled = true;
            subscribeButton.textContent = 'Adding…';
            const success = await addFeed(suggestion.url);
            if (success) {
                subscribeButton.textContent = 'Subscribed';
                subscribeButton.classList.add('is-subscribed');
            } else {
                subscribeButton.disabled = false;
                subscribeButton.textContent = 'Subscribe';
            }
        });

        card.append(info, subscribeButton);
        list.append(card);
    }

    group.append(list);
    return group;
}

async function openExploreFeedsModal() {
    elements.exploreFeedsModal.hidden = false;
    elements.exploreFeedsBody.innerHTML = '<p class="explore-feeds-modal__loading">Loading suggestions…</p>';
    elements.exploreFeedsEmpty.hidden = true;

    try {
        const response = await fetch('/api/feeds/suggestions');
        const suggestions = response.ok ? await response.json() : [];

        elements.exploreFeedsBody.innerHTML = '';
        elements.exploreFeedsEmpty.hidden = suggestions.length > 0;

        const byCategory = new Map();
        for (const suggestion of suggestions) {
            if (!byCategory.has(suggestion.category)) byCategory.set(suggestion.category, []);
            byCategory.get(suggestion.category).push(suggestion);
        }
        for (const [category, items] of byCategory) {
            elements.exploreFeedsBody.append(buildExploreFeedsGroup(category, items));
        }
    } catch (error) {
        elements.exploreFeedsBody.innerHTML = '';
        showToast(error instanceof Error ? error.message : 'Unable to load feed suggestions.', 'error');
    }
}

function closeExploreFeedsModal() {
    elements.exploreFeedsModal.hidden = true;
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
            elements.dailySummaryBody.textContent = response.status === 403 ? t('signUpForAi') : t('summaryUnavailable');
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
    elements.userMenuTrigger.addEventListener('click', () => {
        toggleDropdownMenu(elements.userMenuDropdown, elements.userMenuTrigger);
    });
    elements.userMenuDropdown.addEventListener('click', (event) => {
        if (event.target.closest('.user-menu__item')) {
            hideUserMenu();
        }
    });

    elements.moreMenuTrigger.addEventListener('click', () => {
        toggleDropdownMenu(elements.moreMenuDropdown, elements.moreMenuTrigger);
    });
    elements.moreMenuDropdown.addEventListener('click', (event) => {
        if (event.target.closest('.user-menu__item')) {
            hideMoreMenu();
        }
    });

    elements.notificationTrigger.addEventListener('click', () => {
        const willOpen = elements.notificationDropdown.hidden;
        toggleDropdownMenu(elements.notificationDropdown, elements.notificationTrigger);
        if (willOpen) loadRecentNotifications();
    });
    elements.notificationViewAllButton.addEventListener('click', openNotificationsSection);
    elements.notificationMarkAllReadButton.addEventListener('click', markAllNotificationsRead);
    elements.notificationsBackButton.addEventListener('click', closeNotificationsSection);
    elements.notificationsLoadMoreButton.addEventListener('click', () => {
        loadNotificationsPage(state.notificationsPage + 1);
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('#userMenu')) {
            hideUserMenu();
        }
        if (!event.target.closest('#moreMenu')) {
            hideMoreMenu();
        }
        if (!event.target.closest('#notificationMenu')) {
            hideNotificationDropdown();
        }
    });
    window.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            hideUserMenu();
            hideMoreMenu();
            hideNotificationDropdown();
            closeBlockedUsersModal();
        }
    });
    elements.langToggle.addEventListener('click', toggleLanguage);
    elements.themeToggle.addEventListener('click', toggleTheme);
    elements.leaveAppButton.addEventListener('click', leaveApp);
    elements.guestBannerSignupButton.addEventListener('click', () => openAuthModal('register'));
    elements.searchInput.addEventListener('input', (event) => {
        state.search = event.target.value;
        renderArticles();
        updateViewStatus();
        queueSearchSuggestions(event.target.value);
    });

    elements.searchInput.addEventListener('focus', () => {
        if (elements.searchInput.value.trim()) {
            queueSearchSuggestions(elements.searchInput.value);
        }
    });

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.search')) {
            hideUserSearchSuggestions();
        }
    });

    document.addEventListener('click', (event) => {
        if (event.target.closest('.post-card__reaction')) return;
        for (const openPicker of document.querySelectorAll('.post-card__reaction-picker:not([hidden])')) {
            openPicker.hidden = true;
        }
    });

    elements.profileFollowButton.addEventListener('click', toggleFollowCurrentProfile);
    elements.profileMoreButton.addEventListener('click', toggleProfileMoreDropdown);
    elements.profileBlockMenuItem.addEventListener('click', toggleBlockCurrentProfile);
    elements.profileReportMenuItem.addEventListener('click', reportCurrentProfile);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.profile-card__more-menu')) {
            hideProfileMoreDropdown();
        }
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

    elements.exploreFeedsButton.addEventListener('click', openExploreFeedsModal);
    elements.exploreFeedsModalCloseButton.addEventListener('click', closeExploreFeedsModal);
    elements.exploreFeedsModalBackdrop.addEventListener('click', closeExploreFeedsModal);

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
            closeExploreFeedsModal();
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
    elements.profileNavButton.addEventListener('click', toggleProfileSection);
    elements.profileBackButton.addEventListener('click', closeProfileSection);
    elements.profileShareButton.addEventListener('click', shareProfile);
    elements.profileEditButton.addEventListener('click', openProfileEditModal);
    elements.profileEditModalCloseButton.addEventListener('click', closeProfileEditModal);
    elements.profileEditModalBackdrop.addEventListener('click', closeProfileEditModal);

    elements.profileBlockedUsersButton.addEventListener('click', openBlockedUsersModal);
    elements.blockedUsersModalCloseButton.addEventListener('click', closeBlockedUsersModal);
    elements.blockedUsersModalBackdrop.addEventListener('click', closeBlockedUsersModal);
    elements.blockedUsersDoneButton.addEventListener('click', closeBlockedUsersModal);
    elements.blockedUsersSearchInput.addEventListener('input', (event) => {
        renderBlockedUsersList(event.target.value);
    });
    elements.profileEditCancelButton.addEventListener('click', closeProfileEditModal);
    elements.profileEditSaveButton.addEventListener('click', saveProfileEdits);
    elements.profileAddLinkButton.addEventListener('click', () => addSocialLinkRow('website', ''));
    elements.profileAvatarFileInput.addEventListener('change', () => {
        const file = elements.profileAvatarFileInput.files[0];
        if (file) uploadProfileImage('/api/users/me/avatar', file, elements.profileAvatarUploadMessage);
    });
    elements.profileCoverFileInput.addEventListener('change', () => {
        const file = elements.profileCoverFileInput.files[0];
        if (file) uploadProfileImage('/api/users/me/cover', file, elements.profileCoverUploadMessage);
    });
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
        if (event.key !== 'Escape') return;
        if (!elements.authModal.hidden) {
            closeAuthModal();
        }
        if (!elements.profileEditModal.hidden) {
            closeProfileEditModal();
        }
        if (!elements.postComposerModal.hidden) {
            closePostComposerModal();
        }
    });

    elements.postComposerInput.addEventListener('input', () => {
        elements.postComposerCount.textContent = 280 - elements.postComposerInput.value.length;
    });

    elements.communityComposeButton.addEventListener('click', openPostComposerModal);
    elements.postComposerCloseButton.addEventListener('click', closePostComposerModal);
    elements.postComposerModalBackdrop.addEventListener('click', closePostComposerModal);
    elements.postComposerCancelReplyButton.addEventListener('click', () => {
        closeThread();
        updateReplyBanner();
    });

    elements.postComposerAttachImageButton.addEventListener('click', () => elements.postComposerImageFileInput.click());
    elements.postComposerImageRemoveButton.addEventListener('click', clearPostComposerImage);
    elements.postComposerImageFileInput.addEventListener('change', async () => {
        const file = elements.postComposerImageFileInput.files[0];
        if (!file) return;

        elements.postComposerMessage.textContent = '';
        try {
            pendingPostImageUrl = await uploadPostImage(file);
            elements.postComposerImagePreviewImg.src = pendingPostImageUrl;
            elements.postComposerImagePreview.hidden = false;
        } catch (error) {
            elements.postComposerImageFileInput.value = '';
            elements.postComposerMessage.textContent = error instanceof Error ? error.message : t('unableToUploadImage');
        }
    });

    elements.postComposerAttachFileButton.addEventListener('click', () => elements.postComposerFileInput.click());
    elements.postComposerFileRemoveButton.addEventListener('click', clearPostComposerFile);
    elements.postComposerFileInput.addEventListener('change', async () => {
        const file = elements.postComposerFileInput.files[0];
        if (!file) return;

        elements.postComposerMessage.textContent = '';
        try {
            const uploaded = await uploadPostFile(file);
            pendingPostFileUrl = uploaded.url;
            pendingPostFileName = uploaded.fileName;
            elements.postComposerFilePreviewName.textContent = pendingPostFileName;
            elements.postComposerFilePreview.hidden = false;
        } catch (error) {
            elements.postComposerFileInput.value = '';
            elements.postComposerMessage.textContent = error instanceof Error ? error.message : t('unableToUploadFile');
        }
    });

    elements.postComposer.addEventListener('submit', async (event) => {
        event.preventDefault();
        const content = elements.postComposerInput.value.trim();
        if (!content && !pendingPostImageUrl && !pendingPostFileUrl) {
            return;
        }

        elements.postComposerMessage.textContent = '';
        elements.postComposerSubmitButton.disabled = true;
        try {
            await submitPost(content, state.activeThreadId, pendingPostImageUrl, pendingPostFileUrl, pendingPostFileName);
            elements.postComposerInput.value = '';
            elements.postComposerCount.textContent = '280';
            clearPostComposerImage();
            clearPostComposerFile();
            closePostComposerModal();
        } catch (error) {
            elements.postComposerMessage.textContent = error instanceof Error ? error.message : t('unableToPost');
        } finally {
            elements.postComposerSubmitButton.disabled = false;
        }
    });

    elements.postThreadBackButton.addEventListener('click', closeThread);

    elements.postFeedLoadMoreButton.addEventListener('click', loadMoreCommunityPosts);
}

async function init() {
    loadTheme();
    loadLanguage();
    wireEvents();
    wireLandingEvents();

    // A shared profile link ("/profile/{username}") always drops the visitor straight
    // into the app on that profile, even on a first visit that never clicked "Start reading".
    const sharedProfileMatch = window.location.pathname.match(/^\/profile\/([^/]+)\/?$/);
    // Same idea for a shared post link ("/posts/{id}") - opens straight into that thread.
    const sharedPostMatch = window.location.pathname.match(/^\/posts\/([^/]+)\/?$/);
    if (sharedProfileMatch || sharedPostMatch || window.localStorage.getItem(enteredAppStorageKey) === '1') {
        enterApp();
    }

    loadReadState();
    loadFavoritesState();
    renderHelpTopics(elements.helpSearchInput.value);
    renderChatMessages();
    // Awaited first and alone: an anonymous visitor's guest session (and its seeded
    // starter feeds) is created transparently on whichever API call reaches the server
    // first. If several requests fired at once here with no cookie yet, each would mint
    // its own separate guest and only one would "win" the browser's cookie jar. Running
    // this one alone first means every later call in this function reuses that same guest.
    await loadCurrentUser();
    if (sharedProfileMatch) {
        openProfileSection(decodeURIComponent(sharedProfileMatch[1]));
    } else if (sharedPostMatch && isSignedIn()) {
        openCommunitySection();
        openThread(decodeURIComponent(sharedPostMatch[1]));
    }
    loadDailySummary();
    loadCommunityTimeline();
    loadUnreadCount();
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
