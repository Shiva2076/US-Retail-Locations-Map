interface ErrorBannerProps {
  message: string;
  onRetry: () => void;
}

export default function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <div
      style={{
        position: 'absolute',
        top: '10px',
        left: '50%',
        transform: 'translateX(-50%)',
        background: '#C62828',
        color: 'white',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        zIndex: 20,
        boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
        maxWidth: '480px',
      }}
    >
      <span>⚠ {message}</span>
      <button
        onClick={onRetry}
        style={{
          background: 'white',
          color: '#C62828',
          border: 'none',
          borderRadius: '4px',
          padding: '4px 12px',
          fontSize: '12px',
          fontWeight: '700',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        Retry
      </button>
    </div>
  );
}
