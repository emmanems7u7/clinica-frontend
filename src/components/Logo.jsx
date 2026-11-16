// Logo de la clínica (SVG, sin imágenes externas).
export default function Logo({ size = 40, className = '' }) {
  return (
    <svg className={`logo ${className}`} width={size} height={size} viewBox="0 0 64 64" role="img" aria-label="Clínica">
      <defs>
        <linearGradient id="lg-bg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#3b82f6" />
          <stop offset="1" stopColor="#10b981" />
        </linearGradient>
      </defs>
      <rect width="64" height="64" rx="18" fill="url(#lg-bg)" />
      <path
        d="M32 17C28.5 14.5 22 14 18.5 18C15 22 16 28 18 33C19.6 37 20 42 21.5 47C22.4 50 25.5 50.4 27 47.6C28.6 44.5 29.4 40 32 40C34.6 40 35.4 44.5 37 47.6C38.5 50.4 41.6 50 42.5 47C44 42 44.4 37 46 33C48 28 49 22 45.5 18C42 14 35.500 14.500 32 17Z"
        fill="#fff"
      />
      <path d="M23 22c1.600-1.800 4-2 6-1" stroke="#93c5fd" strokeWidth="2.200" strokeLinecap="round" fill="none" />
    </svg>
  )
}
