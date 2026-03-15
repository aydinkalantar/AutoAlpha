import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const sizeParam = searchParams.get('size') || '192';
  const size = parseInt(sizeParam, 10);

  return new ImageResponse(
    (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '100%',
          height: '100%',
          borderRadius: '25%', // matches rounded-lg roughly
          backgroundImage: 'linear-gradient(to bottom right, #22d3ee, #9333ea)', // from-cyan-400 to-purple-600
        }}
      >
        <div
          style={{
            fontSize: `${size * 0.7}px`, // Roughly proportional to the container size
            color: 'white',
            fontWeight: 'bold',
            lineHeight: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            paddingBottom: `${size * 0.05}px`, // Visual center adjustment for alpha
          }}
        >
          α
        </div>
      </div>
    ),
    { 
        width: size, 
        height: size, 
        status: 200,
        headers: {
            'Cache-Control': 'public, max-age=31536000, immutable'
        }
    }
  );
}
