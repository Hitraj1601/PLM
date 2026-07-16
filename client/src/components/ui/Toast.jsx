import toast, { Toaster } from 'react-hot-toast';

export default function Toast() {
  return (
    <Toaster
      position="top-right"
      containerStyle={{ zIndex: 99999 }}
    >
      {(t) => (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            background: '#131929',
            color: '#e2e8f0',
            border: '1px solid #1E293B',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 14px',
            opacity: t.visible ? 1 : 0,
            transition: 'opacity 0.2s ease',
            maxWidth: '360px',
            minWidth: '220px',
            boxShadow: '0 4px 24px rgba(0,0,0,0.5)',
            animation: t.visible
              ? 'toastIn 0.25s cubic-bezier(0.34,1.56,0.64,1)'
              : 'toastOut 0.2s ease forwards',
          }}
        >
          {/* Icon */}
          {t.type === 'success' && (
            <span style={{ color: '#2dd4bf', fontSize: '18px', flexShrink: 0 }}>✓</span>
          )}
          {t.type === 'error' && (
            <span style={{ color: '#f87171', fontSize: '18px', flexShrink: 0 }}>✗</span>
          )}
          {t.type === 'loading' && (
            <span style={{ color: '#94a3b8', fontSize: '16px', flexShrink: 0 }}>⏳</span>
          )}
          {/* Message */}
          <span style={{ flex: 1, lineHeight: 1.4 }}>{t.message}</span>
          {/* Close Button */}
          <button
            onClick={() => toast.dismiss(t.id)}
            title="Dismiss"
            aria-label="Dismiss notification"
            style={{
              background: 'transparent',
              border: 'none',
              color: '#64748b',
              cursor: 'pointer',
              fontSize: '20px',
              lineHeight: 1,
              padding: '0 4px',
              marginLeft: '2px',
              flexShrink: 0,
              transition: 'color 0.15s',
              fontWeight: 300,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e2e8f0')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#64748b')}
          >
            ×
          </button>
        </div>
      )}
    </Toaster>
  );
}
