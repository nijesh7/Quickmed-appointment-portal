/**
 * Database Adapter Bridge
 *
 * Redirects to Firebase Firestore module (firebase.js).
 */

const firebase = require('./firebase');

module.exports = {
  initialize: async () => firebase.initialize(),
  getDb: () => firebase.getDb(),
  getMode: () => firebase.getMode(),
  // Stubs for backward compatibility
  getConnection: async () => ({
    execute: async () => { throw new Error('Oracle DB has been converted to Firebase Firestore. Use getDb() instead.'); },
    close: async () => {}
  }),
  close: async () => {}
};
