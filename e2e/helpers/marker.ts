export function makeMarker(feature: string): string {
  return `[atd:${feature}] ${Date.now().toString(36)}`;
}