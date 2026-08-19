/**
 * Utilitários para trabalhar com datas "puras" (YYYY-MM-DD, sem hora) —
 * como `evaluation_date`/`data` e `deadline`/`prazo` no app.
 *
 * BUG QUE ISTO EVITA: `new Date("2026-07-28")` é interpretado pelo
 * JavaScript como meia-noite em UTC. Ao exibir com `toLocaleDateString`,
 * o navegador converte para o fuso local — e como o Brasil está atrás
 * de UTC (UTC-3), a data "volta" um dia (meia-noite UTC do dia 28 já é
 * 21h do dia 27 em horário de Brasília). Encontramos esse bug de verdade
 * ao migrar dados do Supabase: uma avaliação de 28/07 apareceu como
 * 27/07 no Histórico.
 *
 * A correção: montar o Date a partir de ano/mês/dia separados, que o
 * JavaScript interpreta como horário LOCAL (não UTC), eliminando o
 * deslocamento independente do fuso horário de quem estiver usando o app.
 */

export function parseDataLocal(dataISO: string): Date {
  const [ano, mes, dia] = dataISO.split("-").map(Number);
  return new Date(ano, (mes || 1) - 1, dia || 1);
}

export function formatarDataBR(dataISO: string | undefined | null): string {
  if (!dataISO) return "";
  try {
    return parseDataLocal(dataISO).toLocaleDateString("pt-BR");
  } catch {
    return dataISO;
  }
}

/** Meia-noite local de hoje — para comparar com prazos sem o mesmo bug. */
export function hojeLocal(): Date {
  const agora = new Date();
  return new Date(agora.getFullYear(), agora.getMonth(), agora.getDate());
}
