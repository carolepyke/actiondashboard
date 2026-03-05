// storage.js — drop-in replacement for window.storage
// Personal data uses localStorage, shared data uses localStorage with a shared key prefix
// For true multi-user sharing, replace SHARED_PREFIX keys with your own backend or JSONBin

const PERSONAL_PREFIX = "spa_personal_";
const SHARED_PREFIX   = "spa_shared_";

export const storage = {
  async get(key, shared = false) {
    try {
      const k = (shared ? SHARED_PREFIX : PERSONAL_PREFIX) + key;
      const value = localStorage.getItem(k);
      if (value === null) throw new Error("not found");
      return { key, value, shared };
    } catch (e) {
      throw e;
    }
  },
  async set(key, value, shared = false) {
    try {
      const k = (shared ? SHARED_PREFIX : PERSONAL_PREFIX) + key;
      localStorage.setItem(k, value);
      return { key, value, shared };
    } catch (e) {
      throw e;
    }
  },
  async delete(key, shared = false) {
    const k = (shared ? SHARED_PREFIX : PERSONAL_PREFIX) + key;
    localStorage.removeItem(k);
    return { key, deleted: true, shared };
  }
};
