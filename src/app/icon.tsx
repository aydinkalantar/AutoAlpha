import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '25%', // matches rounded-lg roughly on a 32x32
          backgroundImage: 'linear-gradient(to bottom right, #22d3ee, #9333ea)', // from-cyan-400 to-purple-600
        }}
      >
        <div
          style={{
            width: '37.5%', // 12px on 32px (w-3/w-8)
            height: '37.5%',
            backgroundColor: 'white',
            borderRadius: '12%', // rounded-sm
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
