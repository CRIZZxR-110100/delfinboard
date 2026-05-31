import { API_URL, getHeaders } from '../services/api';

// CLAVE PÚBLICA VAPID EXACTA GENERADA POR EL BACKEND
const PUBLIC_VAPID_KEY = 'BN3871iVKGT1C6rMV0kfHM62YrqPP-YqXgu0L0pJrJhk7Lc5P5k9nqUaw8UGHAhVe56EPCt0PvsH-Cu0jS8ApRI';

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/\-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function requestNotificationPermissionAndSubscribe() {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.warn('El navegador no soporta Service Workers o Notificaciones Push');
    return false;
  }

  try {
    // Pedir permiso
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.warn('Permiso de notificaciones denegado');
      return false;
    }

    // Registrar el service worker
    const register = await navigator.serviceWorker.register('/sw.js');
    console.log('Service Worker registrado correctamente.');

    // Suscribirse
    const subscription = await register.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY)
    });

    // Enviar la suscripción al backend
    const response = await fetch(`${API_URL}/user/notifications/subscribe`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(subscription)
    });

    if (!response.ok) {
      throw new Error('Error al guardar la suscripción en el servidor');
    }

    console.log('Suscripción enviada con éxito');
    return true;

  } catch (error) {
    console.error('Error al suscribir a notificaciones:', error);
    return false;
  }
}
