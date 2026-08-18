import React, { useState } from 'react';
import { FaPlay, FaLink, FaEraser } from 'react-icons/fa';

// ── helpers ──────────────────────────────────────────────────────────────────

const toEmbedSrc = (url) => {
    if (!url) return '';
    url = url.trim();

    // Bunny.net  →  /embed/LIB/ID
    if (url.includes('mediadelivery.net') || url.includes('bunny.net')) {
        const m = url.match(/(?:play|embed)\/(\d+)\/([a-z0-9-]+)/i);
        if (m) return `https://iframe.mediadelivery.net/embed/${m[1]}/${m[2]}?autoplay=false&loop=false&muted=false&preload=true&responsive=true`;
        return url;
    }

    // Streamable
    if (url.includes('streamable.com')) {
        const m = url.match(/streamable\.com\/(?:e\/)?([a-zA-Z0-9]+)/);
        return m ? `https://streamable.com/e/${m[1]}` : url;
    }

    // YouTube
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
        const m = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return m ? `https://www.youtube.com/embed/${m[1]}?rel=0` : url;
    }

    // اي رابط آخر نجربه مباشرة كـ iframe
    return url;
};

const SAMPLES = [
    { label: 'Bunny.net (play)',  url: 'https://player.mediadelivery.net/play/722731/f33fdbfa-c329-4f58-8bba-646d35075eaa' },
    { label: 'Bunny.net (embed)', url: 'https://player.mediadelivery.net/embed/722731/3ecab382-cf9f-4374-b71d-696f3943f1e7?autoplay=true&loop=true&muted=true&preload=true&responsive=true' },
    { label: 'Streamable',        url: 'https://streamable.com/e/4k6x0z' },
    { label: 'YouTube',           url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' },
];

// ── Component ─────────────────────────────────────────────────────────────────

export default function TestVdTest() {
    const [inputUrl, setInputUrl] = useState('');
    const [embedSrc, setEmbedSrc]   = useState('');

    const handlePlay = (e) => {
        e?.preventDefault();
        setEmbedSrc(toEmbedSrc(inputUrl));
    };

    const handleSample = (url) => {
        setInputUrl(url);
        setEmbedSrc(toEmbedSrc(url));
    };

    return (
        <div style={{
            minHeight: '100vh',
            backgroundColor: '#0b0f19',
            color: '#f8fafc',
            fontFamily: 'system-ui, sans-serif',
            padding: '40px 20px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}>
            <div style={{ maxWidth: '900px', width: '100%' }}>

                {/* ── Title ── */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                    <h1 style={{
                        fontSize: '2rem',
                        fontWeight: '800',
                        margin: '0 0 8px 0',
                        background: 'linear-gradient(135deg,#fff 0%,#D4AF37 100%)',
                        WebkitBackgroundClip: 'text',
                        WebkitTextFillColor: 'transparent',
                    }}>
                        🧪 Video Embed Tester
                    </h1>
                    <p style={{ color: '#94a3b8', margin: 0 }}>
                        ضع رابط الفيديو وانقر عرض — الفيديو يُشغَّل بقالب Bunny.net القياسي (16/9)
                    </p>
                </div>

                {/* ── Input Card ── */}
                <div style={{
                    backgroundColor: 'rgba(15,23,42,0.85)',
                    backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.1)',
                    borderRadius: '16px',
                    padding: '24px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
                    marginBottom: '28px',
                }}>
                    <form onSubmit={handlePlay} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

                        <label style={{ fontSize: '0.9rem', fontWeight: '600', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <FaLink style={{ color: '#D4AF37' }} /> رابط الفيديو:
                        </label>

                        {/* URL input + button */}
                        <div style={{ display: 'flex', gap: '10px' }}>
                            <div style={{ position: 'relative', flex: 1 }}>
                                <input
                                    type="text"
                                    value={inputUrl}
                                    onChange={(e) => setInputUrl(e.target.value)}
                                    placeholder="https://player.mediadelivery.net/embed/... أو أي رابط"
                                    style={{
                                        width: '100%',
                                        padding: '14px 40px 14px 16px',
                                        backgroundColor: '#0f172a',
                                        border: '1px solid rgba(212,175,55,0.3)',
                                        borderRadius: '10px',
                                        color: '#fff',
                                        fontSize: '0.95rem',
                                        outline: 'none',
                                        direction: 'ltr',
                                        boxSizing: 'border-box',
                                    }}
                                />
                                {inputUrl && (
                                    <button
                                        type="button"
                                        onClick={() => { setInputUrl(''); setEmbedSrc(''); }}
                                        style={{
                                            position: 'absolute', right: '12px', top: '50%',
                                            transform: 'translateY(-50%)',
                                            background: 'none', border: 'none',
                                            color: '#64748b', cursor: 'pointer', padding: '4px',
                                        }}
                                    >
                                        <FaEraser />
                                    </button>
                                )}
                            </div>

                            <button
                                type="submit"
                                style={{
                                    display: 'inline-flex', alignItems: 'center', gap: '8px',
                                    padding: '0 24px',
                                    backgroundColor: '#D4AF37', color: '#0f172a',
                                    border: 'none', borderRadius: '10px',
                                    fontWeight: '700', fontSize: '0.95rem',
                                    cursor: 'pointer',
                                    boxShadow: '0 4px 15px rgba(212,175,55,0.3)',
                                    whiteSpace: 'nowrap',
                                }}
                            >
                                <FaPlay size={14} /> عرض الفيديو
                            </button>
                        </div>

                        {/* Sample links */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                            <span style={{ fontSize: '0.82rem', color: '#94a3b8' }}>أمثلة:</span>
                            {SAMPLES.map((s, i) => (
                                <button
                                    key={i}
                                    type="button"
                                    onClick={() => handleSample(s.url)}
                                    style={{
                                        padding: '4px 12px', borderRadius: '6px',
                                        backgroundColor: 'rgba(212,175,55,0.1)',
                                        border: '1px solid rgba(212,175,55,0.25)',
                                        color: '#D4AF37', fontSize: '0.8rem', cursor: 'pointer',
                                    }}
                                >
                                    {s.label}
                                </button>
                            ))}
                        </div>

                    </form>
                </div>

                {/* ── Video Player  ──
                    Same template as Bunny.net:
                    position:relative  +  paddingTop:56.25%
                    iframe: position:absolute, top:0, width:100%, height:100%
                ── */}
                {embedSrc ? (
                    <div>
                        {/* رابط embed المُستخدَم */}
                        <div style={{
                            marginBottom: '10px',
                            fontSize: '0.78rem',
                            color: '#64748b',
                            wordBreak: 'break-all',
                            direction: 'ltr',
                        }}>
                            🔗 <span style={{ color: '#94a3b8' }}>{embedSrc}</span>
                        </div>

                        {/* الحاوية 16/9 */}
                        <div style={{
                            position: 'relative',
                            paddingTop: '56.25%',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '1px solid rgba(212,175,55,0.3)',
                            boxShadow: '0 15px 40px rgba(0,0,0,0.7)',
                            backgroundColor: '#000',
                        }}>
                            <iframe
                                key={embedSrc}           /* إعادة mount عند تغيير الرابط */
                                src={embedSrc}
                                loading="lazy"
                                allow="accelerometer;gyroscope;autoplay;encrypted-media;picture-in-picture;fullscreen;"
                                allowFullScreen={true}
                                style={{
                                    border: 0,
                                    position: 'absolute',
                                    top: 0,
                                    left: 0,
                                    width: '100%',
                                    height: '100%',
                                }}
                            />
                        </div>
                    </div>
                ) : (
                    <div style={{
                        height: '340px',
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', justifyContent: 'center',
                        color: '#334155',
                        border: '2px dashed rgba(212,175,55,0.2)',
                        borderRadius: '16px',
                        gap: '12px',
                        fontSize: '0.95rem',
                    }}>
                        <span style={{ fontSize: '3rem' }}>🎬</span>
                        <span>أدخل رابط الفيديو وانقر <strong style={{ color: '#D4AF37' }}>عرض الفيديو</strong></span>
                    </div>
                )}

            </div>
        </div>
    );
}
