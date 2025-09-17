/**
 * IndexedDB Service
 * 
 * Gerencia persistência de device_id e sessão do usuário
 */

const DB_NAME = 'pushNotificationsDB';
const DB_VERSION = 1;
const SESSION_STORE = 'session';
const DEVICE_STORE = 'device';

class IndexedDBService {
  constructor() {
    this.db = null;
  }

  async init() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(DB_NAME, DB_VERSION);

      request.onerror = () => {
        console.error('❌ Erro ao abrir IndexedDB:', request.error);
        reject(request.error);
      };

      request.onsuccess = () => {
        this.db = request.result;
        console.log('✅ IndexedDB inicializada');
        resolve(this.db);
      };

      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // ObjectStore para sessão atual
        if (!db.objectStoreNames.contains(SESSION_STORE)) {
          const sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
          sessionStore.createIndex('user_id', 'user_id', { unique: false });
        }

        // ObjectStore para device_id
        if (!db.objectStoreNames.contains(DEVICE_STORE)) {
          const deviceStore = db.createObjectStore(DEVICE_STORE, { keyPath: 'id' });
        }
      };
    });
  }

  async getSession() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SESSION_STORE], 'readonly');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.get('current');

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('❌ Erro ao ler sessão:', request.error);
        reject(request.error);
      };
    });
  }

  async saveSession(session) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.put({ id: 'current', ...session });

      request.onsuccess = () => {
        console.log('✅ Sessão salva:', session);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao salvar sessão:', request.error);
        reject(request.error);
      };
    });
  }

  async clearSession() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([SESSION_STORE], 'readwrite');
      const store = transaction.objectStore(SESSION_STORE);
      const request = store.delete('current');

      request.onsuccess = () => {
        console.log('✅ Sessão removida');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao remover sessão:', request.error);
        reject(request.error);
      };
    });
  }

  async getDeviceId() {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DEVICE_STORE], 'readonly');
      const store = transaction.objectStore(DEVICE_STORE);
      const request = store.get('device');

      request.onsuccess = () => {
        resolve(request.result?.device_id || null);
      };

      request.onerror = () => {
        console.error('❌ Erro ao ler device_id:', request.error);
        reject(request.error);
      };
    });
  }

  async saveDeviceId(deviceId) {
    if (!this.db) await this.init();
    
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction([DEVICE_STORE], 'readwrite');
      const store = transaction.objectStore(DEVICE_STORE);
      const request = store.put({ id: 'device', device_id: deviceId });

      request.onsuccess = () => {
        console.log('✅ Device ID salvo:', deviceId);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Erro ao salvar device_id:', request.error);
        reject(request.error);
      };
    });
  }
}

// Instância singleton
const indexedDBService = new IndexedDBService();

export default indexedDBService;
