/*
  Resources and code inspired from several sources:

  https://codepen.io/OliverBalfour/post/procedural-generation-part-1-1d-perlin-noise
  https://www.scratchapixel.com/lessons/procedural-generation-virtual-worlds/procedural-patterns-noise-part-1/creating-simple-1D-noise
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

export const lerp = (y0: number, y1: number, t: number) => {
  return y0 + t * (y1 - y0);
};

export const cerp = (y0: number, y1: number, t: number) => {
  const tRemapCosine = -0.5 * Math.cos(t * Math.PI) + 0.5;
  return lerp(y0, y1, tRemapCosine);
};

export const smoothStep = (y0: number, y1: number, t: number) =>
  lerp(y0, y1, t * t * (3 - 2 * t));

export class ValueNoise1D {
  private readonly vertices: number[];
  private static readonly maxVertices = 10;

  constructor() {
    const seed = Math.floor(Math.random() * RNG.M);
    const rng = new RNG(seed);
    this.vertices = Array(ValueNoise1D.maxVertices)
      .fill(null)
      .map((_) => rng.rand());
  }

  at(x: number) {
    const xMin = Math.floor(x) % ValueNoise1D.maxVertices;
    const xMax = (xMin + 1) % ValueNoise1D.maxVertices;
    const t = x - xMin;
    return lerp(this.vertices[xMin], this.vertices[xMax], t);
  }
}
