"use client";

import ProtectedRoute from "../../components/ProtectedRoute";
import Sidebar from "../../components/Sidebar";
import Header from "../../components/Header";
import { BONUS_CONFIG } from "../../lib/formConfig";
import { computeBonus, managerGoldValue } from "../../lib/calculations";

export default function BonificacaoPage() {
  return (
    <ProtectedRoute perfisPermitidos={["admin", "supervisora"]}>
      {(usuario) => (
        <div className="layout-autenticado">
          <Sidebar usuario={usuario} />
          <main className="conteudo">
            <Header title="Bonificação por avaliação" subtitle="Extra do rebuild — não existe como página no app original." />

            <p style={{ background: "#e7f3ff", padding: "0.75rem", borderRadius: 4 }}>
              Cálculo confirmado em <code>src/calculations.py</code>{" "}
              (<code>compute_bonus</code>), usando os critérios de{" "}
              <code>BONUS_CONFIG</code>. O código original marca esta função
              como mantida "por compatibilidade" — o formulário atual pode
              não exibir isso ao salvar uma avaliação (por isso o campo{" "}
              <code>bonus</code> é salvo vazio). Existe também uma segunda
              estrutura, <code>BONUS_RULES</code>, com valores trimestrais e
              bônus por Ouro consecutivo — provavelmente usada em outro
              lugar (talvez <code>dashboard.py</code>, ainda não visto)
              para o fechamento trimestral, não para o bônus por avaliação
              individual mostrado aqui.
            </p>

            <h2>Critérios (BONUS_CONFIG)</h2>
            <pre>{JSON.stringify(BONUS_CONFIG, null, 2)}</pre>

            <h2>Como funciona</h2>
            <ul>
              <li>
                <strong>Ouro</strong>: nota ponderada ≥ 8,5, Resultados ≥ 8,8,
                Gestão ≥ 8,5, pior das 6 seções ponderadas ≥ 8,0, e sem falta
                grave disciplinar. Valor da gerente escalonado por{" "}
                <code>managerGoldValue</code>: R$ 5.000 (≥9,5) / R$ 4.200
                (≥9,0) / R$ 3.500 (≥8,5).
              </li>
              <li>
                <strong>Prata</strong>: nota ponderada ≥ 8,0, Resultados ≥
                8,3, Gestão ≥ 8,0, pior seção ≥ 7,5. Valor fixo: R${" "}
                {BONUS_CONFIG.silver.managerValue.toLocaleString("pt-BR")}.
              </li>
              <li>
                <strong>Bronze</strong>: só nota ponderada ≥{" "}
                {BONUS_CONFIG.bronzeMinWeightedScore} — critério único
                (o próprio código original avisa que o briefing não
                definiu critérios completos de Bronze). Valor fixo: R${" "}
                {BONUS_CONFIG.bronzeManagerValueOption.toLocaleString("pt-BR")}.
              </li>
            </ul>

            <p>
              TODO: puxar avaliações reais via{" "}
              <code>lib/firestore-queries.ts</code>, rodar{" "}
              <code>computeBonus</code> para cada uma e listar o resultado
              por loja/período. A função e os valores já estão prontos em{" "}
              <code>lib/calculations.ts</code> — falta só a tela de
              listagem.
            </p>
          </main>
        </div>
      )}
    </ProtectedRoute>
  );
}
