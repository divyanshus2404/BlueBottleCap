'use client';

import Lottie from 'lottie-react';

const heroAnimation = {
  v: '5.7.4',
  fr: 30,
  ip: 0,
  op: 120,
  w: 200,
  h: 200,
  nm: 'Hero Spark',
  ddd: 0,
  assets: [],
  layers: [
    {
      ddd: 0,
      ind: 1,
      ty: 4,
      nm: 'Circle Stroke',
      sr: 1,
      ks: {
        o: { a: 0, k: 100 },
        r: {
          a: 1,
          k: [
            { t: 0, s: [0], e: [360], i: { x: [0.667], y: [1] }, o: { x: [0.333], y: [0] } },
            { t: 120, s: [360], e: [720] },
          ],
        },
        p: { a: 0, k: [100, 100, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'el',
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [120, 120] },
          nm: 'Ellipse Path 1',
        },
        {
          ty: 'st',
          c: { a: 0, k: [0.239, 0.486, 0.894, 1] },
          w: { a: 0, k: 12 },
          lc: 2,
          lj: 2,
          nm: 'Stroke 1',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
    {
      ddd: 0,
      ind: 2,
      ty: 4,
      nm: 'Glow Dot',
      sr: 1,
      ks: {
        o: { a: 1, k: [{ t: 0, s: [30], e: [100] }, { t: 60, s: [100], e: [30] }, { t: 120, s: [30], e: [100] }] },
        r: { a: 0, k: 0 },
        p: { a: 0, k: [100, 30, 0] },
        a: { a: 0, k: [0, 0, 0] },
        s: { a: 0, k: [100, 100, 100] },
      },
      shapes: [
        {
          ty: 'el',
          p: { a: 0, k: [0, 0] },
          s: { a: 0, k: [18, 18] },
          nm: 'Ellipse Path 1',
        },
        {
          ty: 'fl',
          c: { a: 0, k: [0.149, 0.608, 0.929, 1] },
          o: { a: 0, k: 100 },
          r: 1,
          nm: 'Fill 1',
        },
      ],
      ip: 0,
      op: 120,
      st: 0,
      bm: 0,
    },
  ],
};

export function LottieHero() {
  return (
    <div className="pointer-events-none mx-auto h-[240px] w-[240px] sm:h-[280px] sm:w-[280px]">
      <Lottie animationData={heroAnimation} loop autoplay />
    </div>
  );
}
