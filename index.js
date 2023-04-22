/*
© whatsapp-web.js
re-developed by: Amirul Dev
contact:
- ig: @amirul.dev
- github: amiruldev20
- wa: 0851574894460
*/

'use strict';

import * as Constants from './src/util/Constants';

// Exporting all modules
export { default as Client } from './src/Client';
export { default as version } from './package.json';

// Func
export { default as Chat } from './src/func/Chat';
export { default as PrivateChat } from './src/func/PrivateChat';
export { default as GroupChat } from './src/func/GroupChat';
export { default as Message } from './src/func/Message';
export { default as MessageMedia } from './src/func/MessageMedia';
export { default as Contact } from './src/func/Contact';
export { default as PrivateContact } from './src/func/PrivateContact';
export { default as BusinessContact } from './src/func/BusinessContact';
export { default as ClientInfo } from './src/func/ClientInfo';
export { default as Location } from './src/func/Location';
export { default as ProductMetadata } from './src/func/ProductMetadata';
export { default as List } from './src/func/List';
export { default as Buttons } from './src/func/Buttons';

// Auth 
export { default as NoAuth } from './src/auth/NoAuth';
export { default as LocalAuth } from './src/auth/LocalAuth';
export { default as RemoteAuth } from './src/auth/RemoteAuth';
export { default as LegacySessionAuth } from './src/auth/LegacySessionAuth';

// Export constants as well
export { Constants };
