/*
  Resources and code inspired from several sources:

  https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/procedural-patterns-noise-part-1/creating-simple-1D-noise
  https://jameshfisher.com/2017/10/15/1d-perlin-noise/
  https://codepen.io/OliverBalfour/post/procedural-generation-part-1-1d-perlin-noise
*/

/*
  RNG PRNG
  Constants lifted off wiki to give a period of M before sequence repeats

  https://en.wikipedia.org/wiki/Linear_congruential_generator#cite_note-Steele20-3
*/
export class RNG {
  static readonly M = Math.pow(2, 32);
  private static readonly A = 1664525;
  private static readonly C = 1013904223;
  private x: number;

  constructor(seed: number) {
    if (seed >= RNG.M) throw new Error(`seed value must be less than ${RNG.M}`);
    this.x = seed;
  }

  rand() {
    this.x = (RNG.A * this.x + RNG.C) % RNG.M;
    return this.x / RNG.M;
  }
}

export const lerp = (y0: number, y1: number, t: number): number => {
  if (t < 0 || t > 1) {
    throw new Error(`lerp t val ${t} must be between 0 and 1`);
  }
  return y0 + t * (y1 - y0);
};

// cosine interp
export const cos = (y0: number, y1: number, t: number): number => {
  const tRemap = -0.5 * Math.cos(t * Math.PI) + 0.5;
  return lerp(y0, y1, tRemap);
};

// smooth step interp
export const smoothstep = (y0: number, y1: number, t: number): number => {
  const tRemap = t * t * (3 - 2 * t);
  return lerp(y0, y1, tRemap);
};

export const decel = (y0: number, y1: number, t: number): number => {
  const tRemap = 1 - (1 - t) * (1 - t);
  return lerp(y0, y1, tRemap);
};

type Interpolate = (p0: number, p1: number, t: number) => number;

export class PerlinNoise1D<T extends Interpolate> {
  private readonly vertices: number[];
  private static readonly maxVertices = 256;
  private static readonly maxVerticesMask = PerlinNoise1D.maxVertices - 1;

  constructor(private interpolate: T) {
    const seed = Math.floor(Math.random() * RNG.M);
    const rng = new RNG(seed);
    this.vertices = Array(PerlinNoise1D.maxVertices)
      .fill(null)
      .map((_) => 2 * rng.rand() - 1);
  }

  get vertexArray() {
    return this.vertices;
  }

  at(x: number) {
    const xi = Math.floor(x);
    const xMin = xi & PerlinNoise1D.maxVerticesMask;
    const xMax = (xMin + 1) & PerlinNoise1D.maxVerticesMask;
    const dist = x - xi;
    const slopeMin = this.vertices[xMin];
    const slopeMax = this.vertices[xMax];
    const posMin = dist * slopeMin;
    const posMax = -(1 - dist) * slopeMax;
    return this.interpolate(posMin, posMax, dist);
  }
}

const dist = (n1: number, n2: number) => {
  return Math.abs(n2 - n1);
};

export const map = (
  val: number,
  low1: number,
  high1: number,
  low2: number,
  high2: number
) => {
  if (val < low1 || val > high1) {
    throw new Error(
      `val ${val} must be between low1 ${low1} and high1 ${high1}`
    );
  }
  if (low1 > high1 || low2 > high2) {
    throw new Error(
      "low1 must be less than high1. low2 must be less than high2"
    );
  }
  return (Math.abs(val - low1) / dist(high1, low1)) * dist(high2, low2) + low2;
};
