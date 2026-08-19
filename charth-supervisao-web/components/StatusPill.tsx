import { scoreStatus } from "../lib/calculations";

/** Espelha score_badge() de src/ui.py — usa scoreStatus (score_status),
 *  não scoreBadgeDashboard. São faixas/cores diferentes por design (ver
 *  nota em lib/calculations.ts); esta é a versão "oficial" da biblioteca
 *  de UI, mesmo sem termos confirmado ainda onde ela é chamada no app
 *  original. */
export default function StatusPill({ score }: { score: number }) {
  const { label, color } = scoreStatus(score);
  return (
    <span className="status-pill" style={{ background: color }}>
      {label} · {score.toFixed(2)}
    </span>
  );
}
