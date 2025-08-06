import React from 'react';

export const HomeIcon: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h7.5" />
  </svg>
);

export const HomeIconSolid: React.FC<{ className?: string }> = ({ className = "w-7 h-7" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M11.47 3.84a.75.75 0 011.06 0l8.69 8.69a.75.75 0 101.06-1.06l-8.689-8.69a2.25 2.25 0 00-3.182 0L2.47 11.47a.75.75 0 101.06 1.06l8.94-8.95z" />
    <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" />
  </svg>
);

export const SparklesIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={className}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456Z" />
    </svg>
);

export const PlayIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
  </svg>
);

export const PauseIcon: React.FC<{ className?: string }> = ({ className = "w-8 h-8" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1H8zm3 0a1 1 0 00-1 1v4a1 1 0 001 1h1a1 1 0 001-1V8a1 1 0 00-1-1h-1z" clipRule="evenodd" />
  </svg>
);

export const HeartIcon: React.FC<{ className?: string; isFilled?: boolean }> = ({ className = "w-8 h-8", isFilled = false }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill={isFilled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth={isFilled ? 0 : 1.5}>
        <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z" />
    </svg>
);

export const ExpandIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" >
    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M20.25 3.75v4.5m0-4.5h-4.5m4.5 0L15 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 20.25v-4.5m0 4.5h-4.5m4.5 0L15 15" />
  </svg>
);

export const ShrinkIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9V4.5M15 9h4.5M15 9l5.25-5.25M15 15v4.5M15 15h4.5M15 15l5.25 5.25" />
  </svg>
);

export const ArrowLeftIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
    </svg>
);

export const ArrowRightIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className={className}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
    </svg>
);

export const TrashIcon: React.FC<{ className?: string }> = ({ className = "w-5 h-5" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} viewBox="0 0 20 20" fill="currentColor">
    <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 012 0v6a1 1 0 11-2 0V8z" clipRule="evenodd" />
  </svg>
);

export const BrokenImageIcon: React.FC<{ className?: string }> = ({ className = "w-6 h-6" }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.872 14.62l-2.09-2.09a.75.75 0 00-1.061 1.061l2.09 2.09a.75.75 0 001.061-1.061z" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7.128 14.62l-2.09-2.09a.75.75 0 00-1.061 1.061l2.09 2.09a.75.75 0 001.06-1.06z" />
  </svg>
);

// === NEW 3D ICONS ===

const IconWrapper: React.FC<{ children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`relative ${className}`}>
        <div className="absolute top-0.5 left-0.5 w-full h-full bg-black/10 rounded-full blur-sm"></div>
        {children}
    </div>
);

export const HomeIcon3D: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <IconWrapper className={className}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="g1" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#ffc107"/><stop offset="1" stopColor="#ff9800"/></linearGradient></defs>
            <circle cx="12" cy="12" r="11" fill="url(#g1)"/>
            <path d="M12 5.432l8.159 8.159c.03.03.06.058.091.086v6.198c0 1.035-.84 1.875-1.875 1.875H15a.75.75 0 01-.75-.75v-4.5a.75.75 0 00-.75-.75h-3a.75.75 0 00-.75.75V21a.75.75 0 01-.75.75H5.625a1.875 1.875 0 01-1.875-1.875v-6.198a2.29 2.29 0 00.091-.086L12 5.43z" fill="#fff" opacity="0.8"/>
        </svg>
    </IconWrapper>
);

export const BookIcon3D: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <IconWrapper className={className}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="g2" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#4caf50"/><stop offset="1" stopColor="#8bc34a"/></linearGradient></defs>
            <circle cx="12" cy="12" r="11" fill="url(#g2)"/>
            <path d="M.24 6.082a1.5 1.5 0 01.995-1.491 9.026 9.026 0 0111.52 0 1.5 1.5 0 01.995 1.491v11.666a.75.75 0 01-1.298.524 8.98 8.98 0 00-10.916 0A.75.75 0 01.24 17.748V6.082zm12.01 0a1.5 1.5 0 01.995-1.491 9.026 9.026 0 0111.52 0 1.5 1.5 0 01.995 1.491v11.666a.75.75 0 01-1.298.524 8.98 8.98 0 00-10.916 0A.75.75 0 0112.25 17.748V6.082z" fill="#fff" opacity="0.8" transform="scale(0.8) translate(3, 3)"/>
        </svg>
    </IconWrapper>
);

export const UsersIcon3D: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <IconWrapper className={className}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="g3" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#2196f3"/><stop offset="1" stopColor="#64b5f6"/></linearGradient></defs>
            <circle cx="12" cy="12" r="11" fill="url(#g3)"/>
            <path d="M4.5 6.375a4.125 4.125 0 118.25 0 4.125 4.125 0 01-8.25 0zM14.25 8.625a3.375 3.375 0 116.75 0 3.375 3.375 0 01-6.75 0zM1.5 19.125a7.125 7.125 0 0114.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.12v-.003zM12.375 16.125a5.625 5.625 0 0111.25 0v.003l-.001.119a.75.75 0 01-.363.63 13.067 13.067 0 01-6.761 1.873c-2.472 0-4.786-.684-6.76-1.873a.75.75 0 01-.364-.63l-.001-.12v-.003z" fill="#fff" opacity="0.8" transform="scale(0.8) translate(3, 1)"/>
        </svg>
    </IconWrapper>
);

export const CogIcon3D: React.FC<{ className?: string }> = ({ className = "w-10 h-10" }) => (
    <IconWrapper className={className}>
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <defs><linearGradient id="g4" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#9c27b0"/><stop offset="1" stopColor="#e1bee7"/></linearGradient></defs>
            <circle cx="12" cy="12" r="11" fill="url(#g4)"/>
            <path fillRule="evenodd" d="M11.078 2.25c-.917 0-1.699.663-1.85 1.567L9.05 5.88c-.02.114-.065.223-.126.326a9.098 9.098 0 00-1.274 1.34l-.637-.425a1.875 1.875 0 00-2.25.042l-1.5 1.5a1.875 1.875 0 00-.042 2.25l.425.636a9.098 9.098 0 00-1.34 1.274c-.103.06-.198.12-.292.185l-2.03.826a1.875 1.875 0 00-1.567 1.85v2.344c0 .916.663 1.699 1.567 1.85l2.03.826c.094.065.19.125.292.185a9.098 9.098 0 001.34 1.274l-.425.637a1.875 1.875 0 00.042 2.25l1.5 1.5a1.875 1.875 0 002.25.042l.637-.425a9.098 9.098 0 001.274 1.34c.06.103.112.208.177.308l.826 2.03c.151.898.933 1.567 1.85 1.567h2.344c.916 0 1.699-.663 1.85-1.567l.826-2.03a9.06 9.06 0 00.177-.308 9.098 9.098 0 001.274-1.34l.637.425a1.875 1.875 0 002.25-.042l1.5-1.5a1.875 1.875 0 00.042-2.25l-.425-.637a9.098 9.098 0 001.34-1.274c.103-.06.198-.12.292-.185l2.03-.826a1.875 1.875 0 001.567-1.85v-2.344c0-.916-.663-1.699-1.567-1.85l-2.03-.826a9.06 9.06 0 00-.292-.185 9.098 9.098 0 00-1.34-1.274l.425-.637a1.875 1.875 0 00-.042-2.25l-1.5-1.5a1.875 1.875 0 00-2.25-.042l-.637.425a9.098 9.098 0 00-1.274-1.34c-.06-.103-.112-.208-.177-.308l-.826-2.03c-.151-.898-.933-1.567-1.85-1.567h-2.344zM12 15.75a3.75 3.75 0 100-7.5 3.75 3.75 0 000 7.5z" clipRule="evenodd" fill="#fff" opacity="0.8"/>
        </svg>
    </IconWrapper>
);

export const LoadingAnimationIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg" className={className}>
      <style>
        {`
          .cloud-main { fill: #fde68a; }
          .cloud-shadow { fill: #fcd34d; }
          @keyframes float {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-5px); }
          }
          .cloud-group { animation: float 4s ease-in-out infinite; }
          @keyframes z-fade {
            0% { opacity: 0; transform: translate(50px, 80px) scale(0.5); }
            20% { opacity: 1; transform: translate(55px, 70px) scale(0.6); }
            80% { opacity: 1; transform: translate(75px, 40px) scale(1); }
            100% { opacity: 0; transform: translate(80px, 30px) scale(1.2); }
          }
          .z1 { animation: z-fade 2s ease-out infinite; animation-delay: 0s; }
          .z2 { animation: z-fade 2s ease-out infinite; animation-delay: 0.5s; }
          .z3 { animation: z-fade 2s ease-out infinite; animation-delay: 1s; }
        `}
      </style>
      <g className="cloud-group">
        <path className="cloud-shadow" d="M81 94c-6-1-11-7-11-13 0-8 6-14 14-14 2 0 4 1 6 2 4-10-2-22-14-22 -11 0-17 7-20 12 -4-1-8-1-11 2 -9 6-10 18-3 25 3 4 8 6 13 6h32c3 0 6-1 7-3s2-6-3-7z" transform="translate(0, 5)"/>
        <path className="cloud-main" d="M81 89c-6-1-11-7-11-13 0-8 6-14 14-14 2 0 4 1 6 2 4-10-2-22-14-22 -11 0-17 7-20 12 -4-1-8-1-11 2 -9 6-10 18-3 25 3 4 8 6 13 6h32c3 0 6-1 7-3s2-6-3-7z"/>
      </g>
      <text className="z1" fill="#a78bfa" fontSize="12" fontWeight="bold">Z</text>
      <text className="z2" fill="#a78bfa" fontSize="12" fontWeight="bold">Z</text>
      <text className="z3" fill="#a78bfa" fontSize="12" fontWeight="bold">Z</text>
    </svg>
);