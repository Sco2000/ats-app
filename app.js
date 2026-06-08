// ============================================================================
// APP - Main Application Entry Point
// Handles initialization, user data, and global state management
// ============================================================================

import { Bus } from './utils/event/index';
import { nativeService } from './utils/apis/native';

/**
 * EventBus State Keys
 * Add your app-specific state keys here
 * @constant
 */
const STATE_KEYS = {
  APP_INITIALIZED: 'app.initialized',
  APP_LOADING: 'app.loading',
  NETWORK_CONNECTED: 'network.connected',
  NETWORK_TYPE: 'network.type',
  USER_DATA: 'user.data',
  USER_NAME: 'user.name',
};

const DESTINATIONS = [
  {
    id: 1,
    image: '/assets/images/img.jpg',
    title: 'Dakar',
    subtitle: 'Île de Gorée',
    price: '29 500 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: true,
    loading: false,
    tags: ['all', 'dakar'],
    city: 'Dakar',
  },
  {
    id: 2,
    image: '/assets/images/img.jpg',
    title: 'Gorée',
    subtitle: 'Île de Gorée',
    price: '197 000 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: true,
    loading: false,
    tags: ['all', 'dakar'],
    city: 'Gorée',
  },
  {
    id: 3,
    image: '/assets/images/img.jpg',
    title: 'Bord de mer',
    subtitle: 'Île de Ngor',
    price: '28 500 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: false,
    loading: false,
    tags: ['all', 'dakar'],
    city: 'Dakar',
  },
  {
    id: 4,
    image: '/assets/images/img.jpg',
    title: 'Lac Rose',
    subtitle: 'Lac Retba',
    price: '15 000 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: false,
    loading: false,
    tags: ['all', 'saly', 'sine-saloum'],
    city: 'Retba',
  },
  {
    id: 5,
    image: '/assets/images/img.jpg',
    title: 'Île de Gorée',
    subtitle: 'Île de Gorée',
    price: '20 000 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: true,
    loading: false,
    tags: ['all', 'dakar'],
    city: 'Gorée',
  },
  {
    id: 6,
    image: '/assets/images/img.jpg',
    title: 'Ranch de Bandia',
    subtitle: 'Bandia',
    price: '35 000 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: false,
    loading: false,
    tags: ['all', 'saly'],
    city: 'Bandia',
  },
  {
    id: 7,
    image: '/assets/images/img.jpg',
    title: 'Saly',
    subtitle: 'Saly Portudal',
    price: '42 000 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: false,
    loading: false,
    tags: ['all', 'saly'],
    city: 'Saly',
  },
  {
    id: 8,
    image: '/assets/images/img.jpg',
    title: ' Saloum',
    subtitle: 'Saloum',
    price: '54 000 FCFA',
    buttonLabel: 'Details',
    buttonClass: 'btn-details',
    like: false,
    loading: false,
    tags: ['all', 'sine-saloum'],
    city: 'Sine Saloum',
  },
];

const RESERVATIONS = [
  {
    id: 1,
    image: '/assets/images/img.jpg',
    title: 'Lac Rose',
    subtitle: 'Lac Retba',
    dateLabel: '15 Mars 2026',
    travelersLabel: '2 voyageurs',
    price: '15 000 FCFA',
    reference: 'ATS7XK2P',
    status: 'upcoming',
    statusLabel: 'À venir',
    actionLabel: 'Gérer la réservation',
    showAction: true,
  },
  {
    id: 2,
    image: '/assets/images/img.jpg',
    title: 'Île de Gorée',
    subtitle: 'Île de Gorée',
    dateLabel: '8 Fév 2026',
    travelersLabel: '3 voyageurs',
    price: '20 000 FCFA',
    reference: 'ATS4MN9K',
    status: 'done',
    statusLabel: 'Terminé',
    actionLabel: 'Voir la réservation',
    showAction: false,
  },
  {
    id: 3,
    image: '/assets/images/img.jpg',
    title: 'Bord de mer',
    subtitle: 'Île de Ngor',
    dateLabel: '22 Mars 2026',
    travelersLabel: '4 voyageurs',
    price: '28 500 FCFA',
    reference: 'ATS3PL7M',
    status: 'upcoming',
    statusLabel: 'À venir',
    actionLabel: 'Gérer la réservation',
    showAction: true,
  },
  {
    id: 4,
    image: '/assets/images/img.jpg',
    title: 'Ranch de Bandia',
    subtitle: 'Bandia',
    dateLabel: '28 Fév 2026',
    travelersLabel: '2 voyageurs',
    price: '35 000 FCFA',
    reference: 'ATS8WQ4N',
    status: 'upcoming',
    statusLabel: 'À venir',
    actionLabel: 'Gérer la réservation',
    showAction: true,
  },
];

/**
 * EventBus Event Names
 * Add your app-specific events here
 * @constant
 */
const EVENTS = {
  USER_LOADED: 'user.loaded',
  USER_NOT_FOUND: 'user.not_found',
  DATA_REFRESH: 'data.refresh',
  NETWORK_CHANGE: 'network.change',
  APP_ERROR: 'app.error',
};

App({
  /**
   * App launch handler
   * Stores initialization as a promise - pages await it when they need data
   * Pattern: non-blocking launch, no race conditions
   */
  onLaunch() {
    console.log('[App] Launching...');

    // Bus.setDebug(true);
    Bus.setState(STATE_KEYS.APP_LOADING, true);
    Bus.setState(STATE_KEYS.APP_INITIALIZED, false);

    // Force-update check: mini programs are cached on-device,
    // without this users can be stuck on stale versions indefinitely
    this.checkForUpdates();

    // Network status: track connectivity so pages/services can react
    this.setupNetworkListener();

    // Store init as a promise - pages can: await getApp().globalData.initPromise
    this.globalData.initPromise = this.initializeApp()
      .catch((error) => {
        console.error('[App] Initialization failed:', error);
      })
      .finally(() => {
        Bus.setState(STATE_KEYS.APP_LOADING, false);
      });
  },

  /**
   * Main initialization flow
   * Customize this for your app's startup sequence:
   * 1. Get user info from native layer
   * 2. Load user data from API
   * 3. Setup background tasks
   */
  async initializeApp() {
    // Step 1: Get user info from native layer (with retry + backoff)
    const userInfos = await nativeService.getUserInfos()
      .catch((error) => {
        console.warn('[App] getUserInfos failed:', error.message);
        return { msisdn: null, fullName: null };
      });

    const { msisdn, fullName } = userInfos;

    if (!msisdn) {
      console.log('[App] No user found, emitting user.not_found');
      Bus.emit(EVENTS.USER_NOT_FOUND);
      // Optionally redirect to onboarding:
      // wx.reLaunch({ url: '/pages/onboarding/index' });
      return;
    }

    // Store user info in EventBus
    Bus.setState(STATE_KEYS.USER_DATA, { msisdn, fullName });
    Bus.setState(STATE_KEYS.USER_NAME, fullName);
    console.log('[App] User:', fullName, '| ID:', msisdn);

    // Step 2: Load additional data (customize for your app)
    // await this.loadUserData(msisdn);

    // Mark app as initialized
    Bus.setState(STATE_KEYS.APP_INITIALIZED, true);
    Bus.emit(EVENTS.USER_LOADED);

    console.log('[App] Initialization complete');
  },

  /**
   * App show handler - resume background tasks
   */
  onShow() {
    if (Bus.getState(STATE_KEYS.APP_INITIALIZED)) {
      // Resume background tasks here (e.g., periodic data refresh)
    }
  },

  /**
   * App hide handler - cleanup timers and listeners
   */
  onHide() {
    // Cleanup background tasks here (e.g., clear intervals)
  },

  // ==========================================================================
  // ERROR HANDLERS
  // ==========================================================================

  /**
   * Global JS error handler
   * Catches uncaught synchronous errors from any page or component
   * @param {string} msg - Error message
   */
  onError(msg) {
    console.error('[App] Uncaught error:', msg);
    Bus.emit(EVENTS.APP_ERROR, { type: 'error', message: msg });
    // TODO: send to your error monitoring service
  },

  /**
   * Unhandled Promise rejection handler
   * Catches forgotten .catch() on Promises anywhere in the app
   * @param {Object} res - { reason, promise }
   */
  onUnhandledRejection(res) {
    console.error('[App] Unhandled rejection:', res.reason);
    Bus.emit(EVENTS.APP_ERROR, { type: 'unhandledRejection', reason: res.reason });
    // TODO: send to your error monitoring service
  },

  /**
   * 404 handler — user navigates to a page that doesn't exist
   * @param {Object} res - { path, query, isEntryPage }
   */
  onPageNotFound(res) {
    console.warn('[App] Page not found:', res.path);
    wx.redirectTo({ url: '/pages/index/index' });
  },

  // ==========================================================================
  // UPDATE MANAGER
  // ==========================================================================

  /**
   * Checks for a new version and forces an update if available.
   * Mini programs are cached on-device — without this, users may stay
   * on an old version until the cache naturally expires.
   */
  checkForUpdates() {
    if (!wx.getUpdateManager) return; // Not supported in all environments

    const updateManager = wx.getUpdateManager();

    updateManager.onCheckForUpdate((res) => {
      if (res.hasUpdate) {
        console.log('[App] New version available');
      }
    });

    updateManager.onUpdateReady(() => {
      wx.showModal({
        title: 'Update Available',
        content: 'A new version is ready. Restart to apply the update.',
        showCancel: false,
        success: () => {
          updateManager.applyUpdate();
        },
      });
    });

    updateManager.onUpdateFailed(() => {
      console.warn('[App] Update download failed');
    });
  },

  // ==========================================================================
  // NETWORK STATUS
  // ==========================================================================

  /**
   * Monitors network connectivity changes and stores status in EventBus.
   * Pages can subscribe to STATE_KEYS.NETWORK_CONNECTED to react to
   * online/offline transitions (e.g., show banner, queue requests).
   */
  setupNetworkListener() {
    // Get initial status
    wx.getNetworkType({
      success: (res) => {
        Bus.setState(STATE_KEYS.NETWORK_TYPE, res.networkType);
        Bus.setState(STATE_KEYS.NETWORK_CONNECTED, res.networkType !== 'none');
      },
    });

    // Listen for changes
    wx.onNetworkStatusChange((res) => {
      console.log('[App] Network changed:', res.networkType, '| connected:', res.isConnected);
      Bus.setState(STATE_KEYS.NETWORK_TYPE, res.networkType);
      Bus.setState(STATE_KEYS.NETWORK_CONNECTED, res.isConnected);
      Bus.emit(EVENTS.NETWORK_CHANGE, {
        type: res.networkType,
        connected: res.isConnected,
      });
    });
  },

  /**
   * Global data accessible via getApp().globalData
   */
  globalData: {
    /** @type {EventBus} Event bus for cross-page communication */
    eventBus: Bus,

    /** @type {Promise} Resolves when app initialization completes */
    initPromise: null,

    /** State keys for convenience */
    STATE_KEYS,

    /** Event names for convenience */
    EVENTS,

    DESTINATIONS,
    RESERVATIONS,
  },
});
