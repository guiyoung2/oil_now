// 좌표 변환 단일 출처는 supabase/functions/_shared/coord.ts (fix.md #11).
// Edge Function(Deno)이 실제 사용처이므로 본문은 _shared에 두고, 여기서 re-export만 한다.
export { wgs84ToKatec, katecToWgs84 } from "../../supabase/functions/_shared/coord.ts";
