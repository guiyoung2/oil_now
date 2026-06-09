// Bessel 1841 ellipsoid
const BESSEL_A = 6377397.155;
const BESSEL_F = 1 / 299.1528128;
const BESSEL_B = BESSEL_A * (1 - BESSEL_F);
const BESSEL_E2 = 2 * BESSEL_F - BESSEL_F ** 2;

// KATEC TM projection parameters
const LAT0 = 38 * (Math.PI / 180);
const LNG0 = 128 * (Math.PI / 180);
const K0 = 0.9999;
const E0 = 400000;
const N0 = 600000;

// Tokyo datum → WGS84 Molodensky 3-parameter shift
const DX = -146.43;
const DY = 507.89;
const DZ = 681.46;

// WGS84 ellipsoid
const WGS84_A = 6378137.0;
const WGS84_F = 1 / 298.257223563;

// Meridian arc length from equator to φ on Bessel ellipsoid (Snyder series)
function meridianArc(phi: number): number {
  const e2 = BESSEL_E2;
  return BESSEL_A * (
    (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256) * phi
    - (3 * e2 / 8 + 3 * e2 ** 2 / 32 + 45 * e2 ** 3 / 1024) * Math.sin(2 * phi)
    + (15 * e2 ** 2 / 256 + 45 * e2 ** 3 / 1024) * Math.sin(4 * phi)
    - (35 * e2 ** 3 / 3072) * Math.sin(6 * phi)
  );
}

// TM inverse projection: KATEC (E, N) → Bessel (φ, λ) in radians
function tmInverse(E: number, N: number): [number, number] {
  const e2 = BESSEL_E2;
  const M0 = meridianArc(LAT0);
  const M = M0 + (N - N0) / K0;

  const e1 = (1 - Math.sqrt(1 - e2)) / (1 + Math.sqrt(1 - e2));
  const mu = M / (BESSEL_A * (1 - e2 / 4 - 3 * e2 ** 2 / 64 - 5 * e2 ** 3 / 256));

  const phi1 = mu
    + (3 * e1 / 2 - 27 * e1 ** 3 / 32) * Math.sin(2 * mu)
    + (21 * e1 ** 2 / 16 - 55 * e1 ** 4 / 32) * Math.sin(4 * mu)
    + (151 * e1 ** 3 / 96) * Math.sin(6 * mu)
    + (1097 * e1 ** 4 / 512) * Math.sin(8 * mu);

  const sinPhi1 = Math.sin(phi1);
  const cosPhi1 = Math.cos(phi1);
  const tanPhi1 = Math.tan(phi1);

  const N1 = BESSEL_A / Math.sqrt(1 - e2 * sinPhi1 ** 2);
  const R1 = BESSEL_A * (1 - e2) / (1 - e2 * sinPhi1 ** 2) ** 1.5;
  const T1 = tanPhi1 ** 2;
  const C1 = (e2 / (1 - e2)) * cosPhi1 ** 2;
  const D = (E - E0) / (N1 * K0);

  const phi = phi1 - (N1 * tanPhi1 / R1) * (
    D ** 2 / 2
    - (5 + 3 * T1 + 10 * C1 - 4 * C1 ** 2 - 9 * (e2 / (1 - e2))) * D ** 4 / 24
    + (61 + 90 * T1 + 298 * C1 + 45 * T1 ** 2 - 252 * (e2 / (1 - e2)) - 3 * C1 ** 2) * D ** 6 / 720
  );

  const lambda = LNG0 + (
    D
    - (1 + 2 * T1 + C1) * D ** 3 / 6
    + (5 - 2 * C1 + 28 * T1 - 3 * C1 ** 2 + 8 * (e2 / (1 - e2)) + 24 * T1 ** 2) * D ** 5 / 120
  ) / cosPhi1;

  return [phi, lambda];
}

// Molodensky datum shift: Bessel/Tokyo → WGS84
function molodenskyShift(phi: number, lambda: number): [number, number] {
  const e2 = BESSEL_E2;
  const sinPhi = Math.sin(phi);
  const cosPhi = Math.cos(phi);
  const sinLam = Math.sin(lambda);
  const cosLam = Math.cos(lambda);

  const N = BESSEL_A / Math.sqrt(1 - e2 * sinPhi ** 2);
  const M = BESSEL_A * (1 - e2) / (1 - e2 * sinPhi ** 2) ** 1.5;
  const da = WGS84_A - BESSEL_A;
  const df = WGS84_F - BESSEL_F;

  const dPhi = (
    -DX * sinPhi * cosLam
    - DY * sinPhi * sinLam
    + DZ * cosPhi
    + da * (N * e2 * sinPhi * cosPhi) / BESSEL_A
    + df * (M * (BESSEL_A / BESSEL_B) + N * (BESSEL_B / BESSEL_A)) * sinPhi * cosPhi
  ) / M;

  const dLambda = (-DX * sinLam + DY * cosLam) / (N * cosPhi);

  return [phi + dPhi, lambda + dLambda];
}

export function katecToWgs84(x: number, y: number): { lat: number; lng: number } {
  const [phiBessel, lambdaBessel] = tmInverse(x, y);
  const [phiWgs84, lambdaWgs84] = molodenskyShift(phiBessel, lambdaBessel);
  return {
    lat: phiWgs84 * (180 / Math.PI),
    lng: lambdaWgs84 * (180 / Math.PI),
  };
}
