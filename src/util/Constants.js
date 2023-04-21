'use strict';

const WhatsWebURL = 'https://web.whatsapp.com/';

const DefaultOptions = {
    product: 'firefox',
    puppeteer: {
        headless: true,
        defaultViewport: null
    },
    authTimeoutMs: 0,
    qrMaxRetries: 0,
    takeoverOnConflict: false,
    takeoverTimeoutMs: 0,
    userAgent: 'MozillMozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36a/5.0 (Macintosh; Intel Mac OS X 10_14_0) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4951.67 Safari/537.36',
    ffmpegPath: 'ffmpeg',
    ignoreHTTPSErrors: true,
    bypassCSP: false
};

/**
 * Client status
 * @readonly
 * @enum {number}
 */
const Status = {
    INITIALIZING: 0,
    AUTHENTICATING: 1,
    READY: 3
};

/**
 * Events that can be emitted by the client
 * @readonly
 * @enum {string}
 */
const Events = {
    AUTHENTICATED: 'authenticated',
    AUTHENTICATION_FAILURE: 'auth_failure',
    READY: 'ready',
    CHAT_REMOVED: 'chat_removed',
    CHAT_ARCHIVED: 'chat_archived',
    MESSAGE_RECEIVED: 'message',
    MESSAGE_CREATE: 'message_create',
    MESSAGE_REVOKED_EVERYONE: 'message_revoke_everyone',
    MESSAGE_REVOKED_ME: 'message_revoke_me',
    MESSAGE_ACK: 'message_ack',
    UNREAD_COUNT: 'unread_count',
    MESSAGE_REACTION: 'message_reaction',
    MEDIA_UPLOADED: 'media_uploaded',
    CONTACT_CHANGED: 'contact_changed',
};

export { WhatsWebURL, DefaultOptions, Status, Events };
