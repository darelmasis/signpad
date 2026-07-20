/**
 * Detecta si el dispositivo es móvil
 */
export function isMobileDevice() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (typeof window !== 'undefined' && window.innerWidth <= 768);
}

/**
 * Bloquea la orientación a landscape (horizontal)
 */
export async function lockOrientationToLandscape() {
  try {
    // Screen Orientation API (estándar)
    if (screen.orientation && screen.orientation.lock) {
      await screen.orientation.lock('landscape');
      return true;
    }
    // iOS Safari
    else if (screen.lockOrientation) {
      screen.lockOrientation('landscape');
      return true;
    }
    // Firefox
    else if (screen.mozLockOrientation) {
      screen.mozLockOrientation('landscape');
      return true;
    }
    // Chrome/Opera antiguos
    else if (screen.msLockOrientation) {
      screen.msLockOrientation('landscape');
      return true;
    }
    return false;
  } catch (error) {
    console.warn('SignPad: No se pudo bloquear la orientación', error);
    return false;
  }
}

/**
 * Desbloquea la orientación
 */
export async function unlockOrientation() {
  try {
    // Screen Orientation API (estándar)
    if (screen.orientation && screen.orientation.unlock) {
      screen.orientation.unlock();
      return true;
    }
    // iOS Safari
    else if (screen.unlockOrientation) {
      screen.unlockOrientation();
      return true;
    }
    // Firefox
    else if (screen.mozUnlockOrientation) {
      screen.mozUnlockOrientation();
      return true;
    }
    // Chrome/Opera antiguos
    else if (screen.msUnlockOrientation) {
      screen.msUnlockOrientation();
      return true;
    }
    return false;
  } catch (error) {
    console.warn('SignPad: No se pudo desbloquear la orientación', error);
    return false;
  }
}
