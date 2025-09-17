/**
 * Service Worker para Push Notifications
 * 
 * Gerencia sessão do usuário e filtragem de notificações
 */

const DB_NAME = 'pushNotificationsDB';
const DB_VERSION = 1;
const SESSION_STORE = 'session';

// Estado da sessão atual
let currentSession = null;

// Inicializar IndexedDB no Service Worker
async function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => {
      console.error('❌ SW: Erro ao abrir IndexedDB:', request.error);
      reject(request.error);
    };

    request.onsuccess = () => {
      console.log('✅ SW: IndexedDB inicializada');
      resolve(request.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      
      if (!db.objectStoreNames.contains(SESSION_STORE)) {
        const sessionStore = db.createObjectStore(SESSION_STORE, { keyPath: 'id' });
        sessionStore.createIndex('user_id', 'user_id', { unique: false });
      }
    };
  });
}

// Ler sessão atual do IndexedDB
async function loadCurrentSession() {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction([SESSION_STORE], 'readonly');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.get('current');

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        currentSession = request.result;
        console.log('📋 SW: Sessão carregada:', currentSession);
        resolve(currentSession);
      };

      request.onerror = () => {
        console.error('❌ SW: Erro ao ler sessão:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ SW: Erro ao carregar sessão:', error);
    return null;
  }
}

// Salvar sessão no IndexedDB
async function saveCurrentSession(session) {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.put({ id: 'current', ...session });

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        currentSession = session;
        console.log('✅ SW: Sessão salva:', session);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ SW: Erro ao salvar sessão:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ SW: Erro ao salvar sessão:', error);
  }
}

// Limpar sessão do IndexedDB
async function clearCurrentSession() {
  try {
    const db = await initIndexedDB();
    const transaction = db.transaction([SESSION_STORE], 'readwrite');
    const store = transaction.objectStore(SESSION_STORE);
    const request = store.delete('current');

    return new Promise((resolve, reject) => {
      request.onsuccess = () => {
        currentSession = null;
        console.log('✅ SW: Sessão removida');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ SW: Erro ao remover sessão:', request.error);
        reject(request.error);
      };
    });
  } catch (error) {
    console.error('❌ SW: Erro ao remover sessão:', error);
  }
}

// Verificar se deve exibir a notificação
function shouldShowNotification(payload) {
  console.log('🔍 SW: Verificando notificação:', {
    currentSession,
    payloadData: payload.data,
    payloadNotification: payload.notification
  });

  // Se não há sessão ativa, descartar todas as notificações
  if (!currentSession) {
    console.log('🚫 SW: Nenhuma sessão ativa, descartando notificação');
    return false;
  }

  // Verificar se há dados customizados (user_id, account_id)
  const { user_id, account_id } = payload.data || {};
  
  if (!user_id || !account_id) {
    console.log('🚫 SW: Payload inválido (faltam user_id ou account_id), descartando notificação');
    return false;
  }

  // Verificar correspondência com a sessão atual
  const shouldShow = 
    user_id === currentSession.user_id && 
    account_id === currentSession.account_id;

  console.log('🔍 SW: Verificando correspondência:', {
    payload: { user_id, account_id },
    currentSession,
    userMatch: user_id === currentSession.user_id,
    accountMatch: account_id === currentSession.account_id,
    shouldShow
  });

  return shouldShow;
}

// Evento de instalação do Service Worker
self.addEventListener('install', (event) => {
  console.log('🔧 SW: Instalando Service Worker');
  self.skipWaiting();
});

// Evento de ativação do Service Worker
self.addEventListener('activate', (event) => {
  console.log('🚀 SW: Ativando Service Worker');
  event.waitUntil(
    loadCurrentSession().then(() => {
      self.clients.claim();
    })
  );
});

// Evento de push (notificação recebida)
self.addEventListener('push', (event) => {
  console.log('📨 SW: Push recebido');

  try {
    const payload = event.data ? event.data.json() : {};
    console.log('📋 SW: Payload da notificação:', payload);

    if (shouldShowNotification(payload)) {
      // Usar dados do Firebase ou fallback para dados customizados
      const notificationData = payload.notification || payload.notification_payload || {};
      
      const notificationOptions = {
        body: notificationData.body || 'Nova notificação',
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: 'firebase-notification',
        data: payload.data || {},
        actions: [
          {
            action: 'view',
            title: 'Ver',
            icon: '/vite.svg'
          },
          {
            action: 'dismiss',
            title: 'Dispensar',
            icon: '/vite.svg'
          }
        ]
      };

      event.waitUntil(
        self.registration.showNotification(
          notificationData.title || 'Push Notifications PoC',
          notificationOptions
        )
      );

      console.log('✅ SW: Notificação exibida');
    } else {
      console.log('🚫 SW: Notificação descartada (não corresponde à sessão atual)');
    }
  } catch (error) {
    console.error('❌ SW: Erro ao processar push:', error);
  }
});

// Evento de clique na notificação
self.addEventListener('notificationclick', (event) => {
  console.log('👆 SW: Clique na notificação:', event.action);

  event.notification.close();

  if (event.action === 'view') {
    event.waitUntil(
      self.clients.openWindow('/')
    );
  }
});

// Comunicação com o frontend via postMessage
self.addEventListener('message', (event) => {
  console.log('💬 SW: Mensagem recebida do frontend:', event.data);

  const { type, data } = event.data;

  switch (type) {
    case 'SESSION_UPDATE':
      console.log('🔄 SW: Atualizando sessão:', data);
      // Atualizar sessão imediatamente na memória
      currentSession = data;
      console.log('✅ SW: Sessão atualizada na memória:', currentSession);
      
      // Salvar no IndexedDB
      saveCurrentSession(data).then(() => {
        console.log('✅ SW: Sessão salva no IndexedDB');
      }).catch(error => {
        console.error('❌ SW: Erro ao salvar sessão:', error);
      });
      break;
    
    case 'LOGOUT':
      console.log('🚪 SW: Fazendo logout');
      // Limpar sessão imediatamente da memória
      currentSession = null;
      console.log('✅ SW: Sessão removida da memória');
      
      // Limpar do IndexedDB
      clearCurrentSession().then(() => {
        console.log('✅ SW: Logout realizado com sucesso');
      }).catch(error => {
        console.error('❌ SW: Erro ao limpar sessão:', error);
      });
      break;
    
    default:
      console.log('❓ SW: Tipo de mensagem desconhecido:', type);
  }
});

// Carregar sessão na inicialização
loadCurrentSession().then((session) => {
  if (session) {
    currentSession = session;
    console.log('✅ SW: Sessão inicial carregada:', currentSession);
  } else {
    console.log('ℹ️ SW: Nenhuma sessão inicial encontrada');
  }
}).catch(error => {
  console.error('❌ SW: Erro ao carregar sessão inicial:', error);
});
