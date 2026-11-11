import React, { useEffect, useState } from 'react';
import { detectVideoDownloaderExtensions, startExtensionObserver } from '../services/extensionDetector';

export default function ExtensionBlocker() {
  const [detection, setDetection] = useState({ detected: false, name: '', detail: '' });
  const [isScanning, setIsScanning] = useState(false);

  const runDetection = async (isManual = false) => {
    if (isManual) setIsScanning(true);
    try {
      const res = await detectVideoDownloaderExtensions();
      if (res && res.detected) {
        setDetection(res);
        document.body.style.overflow = 'hidden';
      } else {
        setDetection((prev) => (prev.detected ? { detected: false, name: '', detail: '' } : prev));
        document.body.style.overflow = 'auto';
      }
    } catch (e) {
      console.error('Extension detection error:', e);
    } finally {
      if (isManual) setIsScanning(false);
    }
  };

  useEffect(() => {
    // Initial check on mount
    runDetection();

    // Periodic interval to catch IDM when video loads/hovers
    const intervalId = setInterval(() => {
      runDetection();
    }, 1000);

    // Attach listeners to videos on page
    const handleVideoEvent = () => runDetection();
    const attachVideoListeners = () => {
      const videos = document.querySelectorAll('video');
      videos.forEach(v => {
        v.addEventListener('play', handleVideoEvent);
        v.addEventListener('playing', handleVideoEvent);
        v.addEventListener('mouseenter', handleVideoEvent);
        v.addEventListener('mouseover', handleVideoEvent);
      });
    };

    attachVideoListeners();

    // Continuous MutationObserver to detect DOM injections instantly
    const stopObserver = startExtensionObserver((res) => {
      if (res && res.detected) {
        setDetection(res);
        document.body.style.overflow = 'hidden';
      }
    });

    return () => {
      clearInterval(intervalId);
      stopObserver();
      document.body.style.overflow = 'auto';
    };
  }, []);

  if (!detection.detected) {
    return null;
  }

  return (
    <div
      id="extension-blocker-root"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#090d16',
        backgroundImage: 'radial-gradient(circle at 50% 30%, rgba(225, 29, 72, 0.15), transparent 70%)',
        zIndex: 9999999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        boxSizing: 'border-box',
        direction: 'rtl',
        fontFamily: 'Cairo, Tajawal, system-ui, -apple-system, sans-serif',
      }}
    >
      <div
        style={{
          maxWidth: '560px',
          width: '100%',
          backgroundColor: '#111827',
          border: '1px solid rgba(225, 29, 72, 0.4)',
          borderRadius: '20px',
          padding: '36px 28px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(225, 29, 72, 0.2)',
          textAlign: 'center',
          color: '#f8fafc',
          backdropFilter: 'blur(16px)',
        }}
      >
        {/* Warning Shield Icon */}
        <div
          style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            backgroundColor: 'rgba(225, 29, 72, 0.15)',
            border: '2px solid rgba(225, 29, 72, 0.6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 24px auto',
            boxShadow: '0 0 20px rgba(225, 29, 72, 0.3)',
          }}
        >
          <svg
            width="42"
            height="42"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <line x1="12" y1="8" x2="12" y2="12" />
            <line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        </div>

        {/* Title */}
        <h2
          style={{
            fontSize: '24px',
            fontWeight: '700',
            color: '#ffffff',
            margin: '0 0 12px 0',
            lineHeight: '1.4',
          }}
        >
          تم قفل الموقع : اكتشاف إضافة تحميل (Extension IDM)
        </h2>

        {/* Subtitle / Details */}
        <p
          style={{
            fontSize: '15px',
            color: '#94a3b8',
            lineHeight: '1.6',
            margin: '0 0 24px 0',
          }}
        >
          تم كشف إضافة ملحقة بالمتصفح تعمل على تحميل الفيديوهات أو اعتراض البث ({detection.name || 'IDM Extension'}). لحماية محتوى المنصة، يجب حذف أو تعطيل هذه الإضافة لتتمكن من فتح الموقع.
        </p>

        {/* Step-by-Step Instructions */}
        <div
          style={{
            backgroundColor: 'rgba(15, 23, 42, 0.8)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '18px 20px',
            textAlign: 'right',
            margin: '0 0 28px 0',
            fontSize: '14px',
            color: '#cbd5e1',
            lineHeight: '1.8',
          }}
        >
          <div style={{ fontWeight: '600', color: '#fb7185', marginBottom: '8px' }}>
            🛠️ خطوات فتح الموقع وإزالة القفل:
          </div>
          <ol style={{ margin: 0, paddingRight: '20px' }}>
            <li>افتح إعدادات الإضافات في متصفحك (مثل <code>chrome://extensions</code>).</li>
            <li>قم بتعطيل أو حذف إضافة <strong>IDM (Internet Download Manager)</strong> أو أي إضافة <strong>Video Downloader</strong>.</li>
            <li>قم بإعادة تحديث هذه الصفحة بالضغط على الزر أدناه أو <code>F5</code>.</li>
          </ol>
        </div>

        {/* Action Button */}
        <button
          onClick={async () => {
            await runDetection(true);
            const res = await detectVideoDownloaderExtensions();
            if (!res || !res.detected) {
              window.location.reload();
            }
          }}
          disabled={isScanning}
          style={{
            width: '100%',
            padding: '14px 24px',
            backgroundColor: '#e11d48',
            color: '#ffffff',
            border: 'none',
            borderRadius: '12px',
            fontSize: '16px',
            fontWeight: '600',
            cursor: isScanning ? 'wait' : 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(225, 29, 72, 0.4)',
          }}
          onMouseOver={(e) => (e.currentTarget.style.backgroundColor = '#f43f5e')}
          onMouseOut={(e) => (e.currentTarget.style.backgroundColor = '#e11d48')}
        >
          {isScanning ? 'جاري الفحص الآن...' : 'إعادة الفحص وإعادة التحميل 🔄'}
        </button>
      </div>
    </div>
  );
}
