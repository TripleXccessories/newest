/**
 * deviceDetect.js — Auto-detects device type, OS, browser, version, screen resolution.
 * Used by ScopeFinding forms to pre-fill environment metadata.
 */

export function detectDevice() {
  const ua = navigator.userAgent;
  const platform = navigator.platform || '';

  // Browser Detection
  let browser = 'other';
  let browserVersion = '';

  if (/Edg\//.test(ua)) {
    browser = 'edge';
    browserVersion = ua.match(/Edg\/([\d.]+)/)?.[1] || '';
  } else if (/OPR\/|Opera/.test(ua)) {
    browser = 'opera';
    browserVersion = ua.match(/(?:OPR|Opera)\/([\d.]+)/)?.[1] || '';
  } else if (/SamsungBrowser/.test(ua)) {
    browser = 'samsung_internet';
    browserVersion = ua.match(/SamsungBrowser\/([\d.]+)/)?.[1] || '';
  } else if (/Firefox\//.test(ua)) {
    browser = 'firefox';
    browserVersion = ua.match(/Firefox\/([\d.]+)/)?.[1] || '';
  } else if (/Safari\//.test(ua) && !/Chrome/.test(ua)) {
    browser = 'safari';
    browserVersion = ua.match(/Version\/([\d.]+)/)?.[1] || '';
  } else if (/Chrome\//.test(ua)) {
    browser = 'chrome';
    browserVersion = ua.match(/Chrome\/([\d.]+)/)?.[1] || '';
  }

  // OS / Device Detection
  let deviceType = 'other';
  let osVersion = '';

  const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
  const isAndroid = /Android/.test(ua);
  const isMac = /Macintosh|MacIntel/.test(platform) || /Mac OS X/.test(ua);
  const isWindows = /Win/.test(platform) || /Windows/.test(ua);
  const isLinux = /Linux/.test(platform) && !isAndroid;
  const isTablet = /iPad/.test(ua) || (isAndroid && !/Mobile/.test(ua));

  if (isIOS && isTablet) {
    deviceType = 'tablet_ios';
    osVersion = 'iPadOS ' + (ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
  } else if (isIOS) {
    deviceType = 'mobile_ios';
    osVersion = 'iOS ' + (ua.match(/OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '');
  } else if (isAndroid && isTablet) {
    deviceType = 'tablet_android';
    osVersion = 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
  } else if (isAndroid) {
    deviceType = 'mobile_android';
    osVersion = 'Android ' + (ua.match(/Android ([\d.]+)/)?.[1] || '');
  } else if (isMac) {
    deviceType = 'desktop_mac';
    const v = ua.match(/Mac OS X ([\d_]+)/)?.[1]?.replace(/_/g, '.') || '';
    osVersion = 'macOS ' + v;
  } else if (isWindows) {
    deviceType = 'desktop_windows';
    const nt = ua.match(/Windows NT ([\d.]+)/)?.[1] || '';
    const winMap = { '10.0': '10/11', '6.3': '8.1', '6.2': '8', '6.1': '7' };
    osVersion = 'Windows ' + (winMap[nt] || nt);
  } else if (isLinux) {
    deviceType = 'desktop_linux';
    osVersion = 'Linux';
  }

  const screenResolution = `${window.screen.width}x${window.screen.height}`;

  let deviceModel = '';
  if (isIOS) deviceModel = ua.match(/\(([^)]+)\)/)?.[1]?.split(';')[0] || 'Apple Device';
  else if (isAndroid) deviceModel = ua.match(/;\s*([^;)]+)\sBuild/)?.[1] || 'Android Device';
  else if (isMac) deviceModel = 'Mac';
  else if (isWindows) deviceModel = 'Windows PC';

  return { browser, browserVersion, deviceType, deviceModel, osVersion, screenResolution };
}

export function deviceLabel(deviceType) {
  const map = {
    mobile_ios: '📱 iOS Phone', mobile_android: '📱 Android Phone',
    tablet_ios: '📟 iPad', tablet_android: '📟 Android Tablet',
    desktop_windows: '🖥️ Windows PC', desktop_mac: '🍎 Mac',
    desktop_linux: '🐧 Linux', other: '❓ Unknown',
  };
  return map[deviceType] || deviceType;
}

export function browserLabel(browser) {
  const map = {
    chrome: 'Chrome', firefox: 'Firefox', safari: 'Safari', edge: 'Edge',
    brave: 'Brave', opera: 'Opera', samsung_internet: 'Samsung Internet', other: 'Other',
  };
  return map[browser] || browser;
}