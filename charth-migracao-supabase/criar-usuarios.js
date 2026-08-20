/**
 * Cria, de uma vez, os logins do Firebase Authentication + o documento
 * correspondente na coleção `usuarios` do Firestore — para a
 * supervisora genérica e uma gestora por loja.
 *
 * IMPORTANTE — edite a lista USUARIOS abaixo antes de rodar:
 *   - Troque os e-mails pelo domínio real da Charth (confirme se é
 *     @charth.com.br, @charth.com, ou outro).
 *   - Troque as senhas por senhas fortes e diferentes entre si — o
 *     valor abaixo é só um placeholder.
 *   - Se quiser nomear pela pessoa de verdade (ex: "Natasha") em vez de
 *     "Gestora Diamond", só trocar o campo `nome`.
 *
 * Uso:
 *   1. serviceAccountKey.json já deve estar nesta pasta (mesma da migração)
 *   2. npm install (já feito, se você rodou a migração)
 *   3. node criar-usuarios.js
 */

const path = require("path");
const admin = require("firebase-admin");

const CAMINHO_CHAVE = path.join(__dirname, "serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(require(CAMINHO_CHAVE)),
});

// EDITE AQUI antes de rodar — domínio e senhas são placeholders.
// Nomes de usuário (parte antes do @) confirmados na tabela `users`
// real do Supabase de produção — mantidos iguais de propósito, pra
// facilitar rastrear qual conta nova corresponde a qual usuário antigo.
const USUARIOS = [
  {
    email: "admin@charth.com.br",
    senha: "TrocarSenha000!",
    nome: "Admin CHARTH",
    perfil: "admin",
  },
  {
    email: "supervisora@charth.com.br",
    senha: "TrocarSenha123!",
    nome: "Supervisora",
    perfil: "supervisora",
  },
  {
    email: "gestora_cidade@charth.com.br",
    senha: "TrocarSenha456!",
    nome: "Gestora Cidade Jardim",
    perfil: "gestora",
    lojaVinculada: "Cidade Jardim",
  },
  {
    email: "gestora_vila@charth.com.br",
    senha: "TrocarSenha789!",
    nome: "Gestora Vila da Serra",
    perfil: "gestora",
    lojaVinculada: "Vila da Serra",
  },
  {
    email: "gestora_diamond@charth.com.br",
    senha: "TrocarSenha101!",
    nome: "Gestora Diamond",
    perfil: "gestora",
    lojaVinculada: "Diamond",
  },
  {
    email: "gestora_barigui@charth.com.br",
    senha: "TrocarSenha112!",
    nome: "Gestora Barigui",
    perfil: "gestora",
    lojaVinculada: "Barigui",
  },
  // Adicionados depois do lote inicial — segue o mesmo padrão: rode o
  // script de novo e só estes (e qualquer outro que você adicionar)
  // serão criados/atualizados; os que já existem continuam intactos.
  {
    email: "sylvia@charth.com.br",
    senha: "Ay!0aA",
    nome: "Sylvia",
    perfil: "admin",
  },
  {
    email: "marina.dias@charth.com.br",
    senha: "Tz1!G0",
    nome: "Marina Dias",
    perfil: "supervisora",
  },
];

async function main() {
  for (const u of USUARIOS) {
    try {
      const userRecord = await admin.auth().createUser({
        email: u.email,
        password: u.senha,
        displayName: u.nome,
      });

      const doc = { nome: u.nome, perfil: u.perfil, email: u.email };
      if (u.lojaVinculada) doc.lojaVinculada = u.lojaVinculada;

      await admin.firestore().collection("usuarios").doc(userRecord.uid).set(doc);

      console.log(`✅ ${u.email} criado (uid ${userRecord.uid}, perfil ${u.perfil})`);
    } catch (erro) {
      if (erro.code === "auth/email-already-exists") {
        // Já existe — em vez de só pular, atualiza a senha e o
        // documento pra garantir que fiquem exatamente como está na
        // lista USUARIOS acima. Torna o script seguro de rodar de
        // novo quantas vezes precisar (idempotente).
        try {
          const existente = await admin.auth().getUserByEmail(u.email);
          await admin.auth().updateUser(existente.uid, {
            password: u.senha,
            displayName: u.nome,
          });

          const doc = { nome: u.nome, perfil: u.perfil, email: u.email };
          if (u.lojaVinculada) doc.lojaVinculada = u.lojaVinculada;
          await admin.firestore().collection("usuarios").doc(existente.uid).set(doc);

          console.log(`🔄 ${u.email} já existia — senha e perfil atualizados (uid ${existente.uid}).`);
        } catch (erroAtualizacao) {
          console.error(`❌ ${u.email} existia, mas falhou ao atualizar: ${erroAtualizacao.message}`);
        }
      } else {
        console.error(`❌ Erro ao criar ${u.email}: ${erro.message}`);
      }
    }
  }
  console.log("\nConcluído. Lembre-se de anotar as senhas em local seguro (gerenciador de senhas), não neste arquivo.");
  process.exit(0);
}

main();
