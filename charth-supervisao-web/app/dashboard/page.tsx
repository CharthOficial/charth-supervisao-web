"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  PieChart,
  Pie,
  Legend,
  ScatterChart,
  Scatter,
  LineChart,
  Line,
  ReferenceLine,
  CartesianGrid,
} from "recharts";
import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { listarAvaliacoes } from "../../lib/firestore-queries";
import { statusFromWeighted, computeSectionScores } from "../../lib/calculations";
import { formatarDataBR } from "../../lib/dateUtils";
import { STATUS_COLOR_MAP } from "../../lib/formConfig";
import {
  ultimaPorLoja,
  rankingPorLoja,
  contagemPorStatus,
  melhorLoja,
  mediaGeral,
  lojasEmAtencao,
  resumoPorLoja,
  mediasPorSecaoELoja,
  mediaGeralPorSecao,
  mapaDeCalor,
  piorLojaSecao,
  evolucaoMensalPorLoja,
} from "../../lib/dashboardHelpers";
import type { Avaliacao, Usuario } from "../../lib/types";

const CORES_LOJA = ["#1F1F1F", "#C9A0A0", "#6D6E71", "#B8B8B8", "#C8A24A", "#A66A3F"];

function CartaoMetrica({ titulo, valor, legenda }: { titulo: string; valor: string; legenda: string }) {
  return (
    <div className="metric-card">
      <div className="metric-card-kicker">{titulo}</div>
      <div className="metric-card-value">{valor}</div>
      <div className="small-muted">{legenda}</div>
    </div>
  );
}

/** Cor de fundo da célula do mapa de calor — replica a escala de cores
 *  SECTION_COLOR_SCALE do dashboard.py (vermelho no crítico, dourado no
 *  excelente), interpolação simples 0-10. */
function corMapaDeCalor(valor: number): string {
  const pontos: [number, string][] = [
    [0, "#9e3f45"],
    [5.5, "#b8875d"],
    [7.2, "#a66a3f"],
    [8.5, "#b8b8b8"],
    [10, "#c8a24a"],
  ];
  for (let i = 0; i < pontos.length - 1; i++) {
    const [v1, c1] = pontos[i];
    const [v2] = pontos[i + 1];
    if (valor <= v2 || i === pontos.length - 2) return valor <= v1 ? c1 : pontos[i + 1][1];
  }
  return pontos[pontos.length - 1][1];
}

export default function DashboardPage() {
  return <ProtectedRoute>{(usuario) => <ConteudoDashboard usuario={usuario} />}</ProtectedRoute>;
}

function ConteudoDashboard({ usuario }: { usuario: Usuario }) {
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [aba, setAba] = useState<"geral" | "lojas" | "secoes" | "evolucao">("geral");

  useEffect(() => {
    listarAvaliacoes(usuario).then((lista) => {
      setAvaliacoes(lista);
      setCarregando(false);
    });
  }, [usuario]);

  const ultimas = useMemo(() => ultimaPorLoja(avaliacoes), [avaliacoes]);
  const ranking = useMemo(() => rankingPorLoja(avaliacoes), [avaliacoes]);
  const distribuicaoStatus = useMemo(() => contagemPorStatus(ultimas), [ultimas]);
  const resumoLojas = useMemo(() => resumoPorLoja(avaliacoes), [avaliacoes]);
  const linhasSecao = useMemo(
    () => mediasPorSecaoELoja(avaliacoes, computeSectionScores),
    [avaliacoes]
  );
  const mediasSecao = useMemo(() => mediaGeralPorSecao(linhasSecao), [linhasSecao]);
  const heatmap = useMemo(() => mapaDeCalor(linhasSecao), [linhasSecao]);
  const piores = useMemo(() => piorLojaSecao(linhasSecao), [linhasSecao]);
  const evolucaoLinha = useMemo(
    () =>
      [...avaliacoes]
        .sort((a, b) => new Date(a.data).getTime() - new Date(b.data).getTime())
        .map((a) => ({ data: a.data, [a.lojaNome]: a.notaFinalPonderada })),
    [avaliacoes]
  );
  const evolucaoMensal = useMemo(() => evolucaoMensalPorLoja(avaliacoes), [avaliacoes]);
  const lojasUnicas = useMemo(() => Array.from(new Set(avaliacoes.map((a) => a.lojaNome))), [avaliacoes]);

  if (carregando) {
    return (
      <div className="layout-autenticado">
        <Sidebar usuario={usuario} />
        <main className="conteudo">Carregando...</main>
      </div>
    );
  }

  if (avaliacoes.length === 0) {
    return (
      <div className="layout-autenticado">
        <Sidebar usuario={usuario} />
        <main className="conteudo">
          <Header title="Dashboard Executivo" />
          <p>Ainda não existem avaliações salvas. Use o menu Nova Avaliação para registrar a primeira.</p>
        </main>
      </div>
    );
  }

  return (
    <div className="layout-autenticado">
      <Sidebar usuario={usuario} />
      <main className="conteudo">
        <Header title="Dashboard Executivo" subtitle="Visão gerencial de performance das lojas CHARTH." />

        <div style={{ display: "flex", gap: "1rem", marginBottom: "1.5rem" }}>
          <CartaoMetrica titulo="Média geral" valor={mediaGeral(avaliacoes).toFixed(2)} legenda="Média ponderada oficial" />
          <CartaoMetrica titulo="Avaliações" valor={String(avaliacoes.length)} legenda="Total no período" />
          <CartaoMetrica titulo="Melhor loja" valor={melhorLoja(avaliacoes)} legenda="Maior média no recorte" />
          <CartaoMetrica
            titulo="Lojas em atenção"
            valor={String(lojasEmAtencao(ultimas))}
            legenda="Atenção ou plano imediato"
          />
        </div>

        <p style={{ background: "#f3e8e6", padding: "0.75rem", borderRadius: 6 }}>
          Faixas de status: Excelência CHARTH ≥ 9, Loja Forte ≥ 8, Loja em Atenção ≥ 7, Plano de
          Ação Imediato abaixo de 7. As pendências ficam no menu <strong>Planos de Ação</strong>.
        </p>

        <div style={{ display: "flex", gap: "0.5rem", margin: "1.5rem 0" }}>
          {(["geral", "lojas", "secoes", "evolucao"] as const).map((a) => (
            <button key={a} onClick={() => setAba(a)} style={{ opacity: aba === a ? 1 : 0.5 }}>
              {{ geral: "Visão geral", lojas: "Lojas", secoes: "Seções", evolucao: "Evolução" }[a]}
            </button>
          ))}
        </div>

        {aba === "geral" && (
          <>
            <div style={{ display: "flex", gap: "2rem" }}>
              <div>
                <h2>Ranking de lojas</h2>
                <BarChart width={480} height={320} data={ranking}>
                  <XAxis dataKey="loja" />
                  <YAxis domain={[0, 10]} />
                  <Tooltip />
                  <Bar dataKey="media">
                    {ranking.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLOR_MAP[entry.status] ?? "#6D6E71"} />
                    ))}
                  </Bar>
                </BarChart>
              </div>

              <div>
                <h2>Status operacional</h2>
                <PieChart width={380} height={320}>
                  <Pie data={distribuicaoStatus} dataKey="quantidade" nameKey="status" innerRadius={60} outerRadius={110} label>
                    {distribuicaoStatus.map((entry, i) => (
                      <Cell key={i} fill={STATUS_COLOR_MAP[entry.status] ?? "#6D6E71"} />
                    ))}
                  </Pie>
                  <Legend />
                  <Tooltip />
                </PieChart>
              </div>
            </div>

            <h2>Última fotografia por loja</h2>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th align="left">Loja</th>
                  <th align="left">Última avaliação</th>
                  <th align="left">Gerente</th>
                  <th align="left">Média geral</th>
                  <th align="left">Status</th>
                </tr>
              </thead>
              <tbody>
                {[...ultimas]
                  .sort((a, b) => b.notaFinalPonderada - a.notaFinalPonderada)
                  .map((a) => (
                    <tr key={a.id}>
                      <td>{a.lojaNome}</td>
                      <td>{formatarDataBR(a.data)}</td>
                      <td>{a.gerente}</td>
                      <td>{a.notaFinalPonderada.toFixed(2)}</td>
                      <td>{statusFromWeighted(a.notaFinalPonderada)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {aba === "lojas" && (
          <>
            <h2>Comparativo por loja</h2>
            <ScatterChart width={700} height={420}>
              <CartesianGrid />
              <XAxis type="number" dataKey="avaliacoes" name="Avaliações" />
              <YAxis type="number" dataKey="mediaGeral" name="Média geral" domain={[0, 10]} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} />
              <Scatter data={resumoLojas} fill="#8884d8">
                {resumoLojas.map((r, i) => (
                  <Cell key={i} fill={STATUS_COLOR_MAP[r.statusMedio] ?? "#6D6E71"} />
                ))}
              </Scatter>
            </ScatterChart>

            <table style={{ width: "100%", borderCollapse: "collapse", marginTop: "1rem" }}>
              <thead>
                <tr>
                  <th align="left">Loja</th>
                  <th align="left">Média geral</th>
                  <th align="left">Avaliações</th>
                  <th align="left">Última avaliação</th>
                  <th align="left">Status médio</th>
                </tr>
              </thead>
              <tbody>
                {[...resumoLojas]
                  .sort((a, b) => b.mediaGeral - a.mediaGeral)
                  .map((r) => (
                    <tr key={r.loja}>
                      <td>{r.loja}</td>
                      <td>{r.mediaGeral.toFixed(2)}</td>
                      <td>{r.avaliacoes}</td>
                      <td>{formatarDataBR(r.ultimaAvaliacao)}</td>
                      <td>{r.statusMedio}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </>
        )}

        {aba === "secoes" && (
          <>
            <h2>Médias por seção</h2>
            <BarChart width={700} height={Math.max(320, mediasSecao.length * 50)} data={mediasSecao} layout="vertical">
              <XAxis type="number" domain={[0, 10]} />
              <YAxis type="category" dataKey="secao" width={220} />
              <Tooltip />
              <Bar dataKey="media">
                {mediasSecao.map((s, i) => (
                  <Cell key={i} fill={STATUS_COLOR_MAP[statusFromWeighted(s.media)] ?? "#6D6E71"} />
                ))}
              </Bar>
            </BarChart>

            <h2>Mapa de calor · loja × seção</h2>
            <div style={{ overflowX: "auto" }}>
              <table style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    <th style={{ padding: "0.4rem" }}></th>
                    {heatmap.secoes.map((s) => (
                      <th key={s} style={{ padding: "0.4rem", fontSize: 11, maxWidth: 90 }}>
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {heatmap.lojas.map((loja) => (
                    <tr key={loja}>
                      <td style={{ padding: "0.4rem", fontWeight: 700 }}>{loja}</td>
                      {heatmap.secoes.map((secao) => {
                        const v = heatmap.valores[loja]?.[secao];
                        return (
                          <td
                            key={secao}
                            style={{
                              padding: "0.4rem",
                              textAlign: "center",
                              background: v !== undefined ? corMapaDeCalor(v) : "#eee",
                              color: "#fff",
                              fontSize: 12,
                            }}
                          >
                            {v !== undefined ? v.toFixed(1) : "-"}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <h2>Pontos de atenção executivos</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
              {piores.map((p, i) => (
                <div key={i} className="metric-card">
                  <div className="metric-card-kicker">{p.loja}</div>
                  <div style={{ fontWeight: 700 }}>{p.secao}</div>
                  <div>{p.media.toFixed(2)}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {aba === "evolucao" && (
          <>
            <h2>Evolução da média ponderada</h2>
            <LineChart width={800} height={420} data={evolucaoLinha}>
              <CartesianGrid />
              <XAxis dataKey="data" tickFormatter={formatarDataBR} />
              <YAxis domain={[0, 10]} />
              <Tooltip labelFormatter={(d) => formatarDataBR(d as string)} />
              <Legend />
              <ReferenceLine y={9} stroke="#C9A0A0" strokeDasharray="4 4" label="Excelência CHARTH" />
              <ReferenceLine y={8} stroke="#6D6E71" strokeDasharray="4 4" label="Loja Forte" />
              <ReferenceLine y={7} stroke="#B8875D" strokeDasharray="4 4" label="Loja em Atenção" />
              {lojasUnicas.map((loja, i) => (
                <Line key={loja} type="monotone" dataKey={loja} stroke={CORES_LOJA[i % CORES_LOJA.length]} connectNulls dot />
              ))}
            </LineChart>

            <h2>Evolução mensal por loja</h2>
            <BarChart
              width={800}
              height={380}
              data={Array.from(new Set(evolucaoMensal.map((e) => e.mes)))
                .sort()
                .map((mes) => {
                  const linha: Record<string, string | number> = { mes };
                  for (const loja of lojasUnicas) {
                    const item = evolucaoMensal.find((e) => e.mes === mes && e.loja === loja);
                    linha[loja] = item ? item.media : 0;
                  }
                  return linha;
                })}
            >
              <XAxis dataKey="mes" />
              <YAxis domain={[0, 10]} />
              <Tooltip />
              <Legend />
              {lojasUnicas.map((loja, i) => (
                <Bar key={loja} dataKey={loja} fill={CORES_LOJA[i % CORES_LOJA.length]} />
              ))}
            </BarChart>
          </>
        )}

        <p style={{ color: "#666", marginTop: "1.5rem" }}>
          TODO: exportação CSV do dashboard ainda não portada (dá pra usar a exportação JSON em
          Configurações por enquanto).
        </p>
      </main>
    </div>
  );
}
