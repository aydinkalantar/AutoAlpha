import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const size = { width: 32, height: 32 };
export const contentType = 'image/png';

export default function Icon() {
  return new ImageResponse(
    (
      <div
        tw="flex items-center justify-center w-full h-full rounded-[20%] bg-gradient-to-br from-cyan-400 to-purple-600"
      >
        <div
          tw="w-[37.5%] h-[37.5%] bg-white rounded-[12%] rotate-45"
        />
      </div>
    ),
    { ...size }
  );
}
