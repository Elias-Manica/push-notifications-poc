import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import indexedDBService from './services/indexedDB';
import apiService from './services/api';
import firebaseService from './services/firebase';

function App() {
  const [session, setSession] = useState(null);
  const [deviceId, setDeviceId] = useState(null);
  const [fcmToken, setFcmToken] = useState(null);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Carregar estado inicial
  useEffect(() => {
    loadInitialState();
  }, []);

  // Configurar listener de mensagens FCM
  useEffect(() => {
    firebaseService.onMessage((payload) => {
      setNotification({
        type: 'success',
        message: `Notificação recebida: ${payload.notification?.body || 'Nova mensagem'}`
      });
      setTimeout(() => setNotification(null), 5000);
    });
  }, []);

  const loadInitialState = async () => {
    try {
      setLoading(true);
      
      // Carregar device_id ou criar novo
      let device = await indexedDBService.getDeviceId();
      if (!device) {
        device = uuidv4();
        await indexedDBService.saveDeviceId(device);
      }
      setDeviceId(device);

      // Carregar sessão salva
      const savedSession = await indexedDBService.getSession();
      if (savedSession) {
        setSession(savedSession);
        // Notificar SW sobre a sessão
        await notifyServiceWorker('SESSION_UPDATE', savedSession);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar estado inicial:', error);
      showNotification('error', 'Erro ao carregar dados salvos');
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ type, message });
    setTimeout(() => setNotification(null), 5000);
  };

  const notifyServiceWorker = async (type, data) => {
    try {
      if ('serviceWorker' in navigator) {
        // Aguardar o service worker estar pronto
        const registration = await navigator.serviceWorker.ready;
        
        if (registration.active) {
          console.log(`📤 Enviando para SW: ${type}`, data);
          registration.active.postMessage({ type, data });
        } else {
          console.warn('⚠️ Service Worker não está ativo');
        }
      }
    } catch (error) {
      console.error('❌ Erro ao comunicar com Service Worker:', error);
    }
  };

  const login = async (userId, accountId) => {
    try {
      setLoading(true);

      // Obter token FCM
      const token = await firebaseService.getFCMToken();
      setFcmToken(token);

      // Registrar token no backend
      await apiService.registerToken({
        fcm_token: token,
        device_id: deviceId,
        user_id: userId,
        notification_consent_status: 'granted'
      });

      // Salvar sessão
      const newSession = { user_id: userId, account_id: accountId };
      await indexedDBService.saveSession(newSession);
      setSession(newSession);

      // Notificar SW
      await notifyServiceWorker('SESSION_UPDATE', newSession);

      showNotification('success', `Logado como Usuário ${userId} (Conta ${accountId})`);
    } catch (error) {
      console.error('❌ Erro no login:', error);
      showNotification('error', 'Erro ao fazer login');
    } finally {
      setLoading(false);
    }
  };

  const changeProfile = async (newAccountId) => {
    if (!session) return;

    try {
      setLoading(true);

      const newSession = { ...session, account_id: newAccountId };
      await indexedDBService.saveSession(newSession);
      setSession(newSession);

      // Notificar SW
      await notifyServiceWorker('SESSION_UPDATE', newSession);

      showNotification('success', `Perfil alterado para Conta ${newAccountId}`);
    } catch (error) {
      console.error('❌ Erro ao trocar perfil:', error);
      showNotification('error', 'Erro ao trocar perfil');
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);

      // Remover token do backend (se existir)
      if (deviceId) {
        try {
          const result = await apiService.removeToken(deviceId);
          if (result.alreadyRemoved) {
            console.log('ℹ️ Token já estava removido');
          }
        } catch (error) {
          // Se falhar ao remover token, continua o logout mesmo assim
          console.warn('⚠️ Não foi possível remover token do backend:', error.message);
        }
      }

      // Limpar sessão
      await indexedDBService.clearSession();
      setSession(null);
      setFcmToken(null);

      // Notificar SW
      await notifyServiceWorker('LOGOUT');

      showNotification('success', 'Logout realizado com sucesso');
    } catch (error) {
      console.error('❌ Erro no logout:', error);
      showNotification('error', 'Erro ao fazer logout');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="header">
          <h1 className="title">Push Notifications PoC</h1>
          <div className="loading"></div>
          <p>Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container">
      <div className="header">
        <h1 className="title">Push Notifications PoC</h1>
        <p className="subtitle">Teste de notificações com FCM e Service Worker</p>
      </div>

      {/* Notificação de feedback */}
      {notification && (
        <div className={`notification ${notification.type === 'error' ? 'error' : ''}`}>
          {notification.message}
        </div>
      )}

      {/* Status da sessão */}
      <div className={`status ${session ? 'logged-in' : 'logged-out'}`}>
        {session ? (
          <div>
            <strong>✅ Logado</strong> - Usuário: {session.user_id} | Conta: {session.account_id}
            {fcmToken && <div>🔑 Token FCM: {fcmToken.substring(0, 20)}...</div>}
          </div>
        ) : (
          <div>
            <strong>❌ Deslogado</strong> - Faça login para receber notificações
          </div>
        )}
      </div>

      {/* Informações do dispositivo */}
      {deviceId && (
        <div className="user-info">
          <h3>📱 Dispositivo</h3>
          <p><strong>Device ID:</strong> {deviceId}</p>
          <p><strong>Status:</strong> {session ? 'Conectado' : 'Desconectado'}</p>
        </div>
      )}

      {/* Botões de ação */}
      <div className="button-group">
        {!session ? (
          <>
            <button 
              className="btn btn-primary" 
              onClick={() => login('user-a', 'account-x')}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : ''}
              Login como Usuário A (Conta X)
            </button>
            
            <button 
              className="btn btn-primary" 
              onClick={() => login('user-b', 'account-y')}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : ''}
              Login como Usuário B (Conta Y)
            </button>
          </>
        ) : (
          <>
            <button 
              className="btn btn-warning" 
              onClick={() => changeProfile('account-z')}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : ''}
              Trocar para Conta Z
            </button>
            
            <button 
              className="btn btn-danger" 
              onClick={logout}
              disabled={loading}
            >
              {loading ? <span className="loading"></span> : ''}
              Logout
            </button>
          </>
        )}
      </div>

      {/* Instruções */}
      <div className="user-info">
        <h3>📋 Como testar:</h3>
        <ol style={{ marginLeft: '1rem', marginTop: '0.5rem' }}>
          <li>Faça login como um usuário</li>
          <li>Clique em "Enviar Notificação de Teste"</li>
          <li>Troque de perfil e teste novamente</li>
          <li>Faça logout e teste (não deve receber)</li>
          <li>Recarregue a página para testar persistência</li>
        </ol>
      </div>
    </div>
  );
}

export default App;
