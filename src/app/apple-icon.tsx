import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 180, height: 180 };
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
          borderRadius: '25%', 
          backgroundImage: 'linear-gradient(to bottom right, #22d3ee, #9333ea)', // from-cyan-400 to-purple-600
        }}
      >
        <div
          style={{
            width: '37.5%', 
            height: '37.5%',
            backgroundColor: 'white',
            borderRadius: '12%', 
            transform: 'rotate(45deg)',
          }}
        />
      </div>
    ),
    { ...size }
  );
}
