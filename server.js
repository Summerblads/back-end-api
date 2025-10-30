// Importação dos pacotes necessários
import express from "express";
import pkg from "pg";
const { Pool } = pkg;
import dotenv from "dotenv";

// Inicializações
dotenv.config();

const app = express();

// Define a porta
const port = 3000;

// Middleware para aceitar JSON nas requisições
app.use(express.json());

// Variável para armazenar o pool de conexões
let pool = null;

// Função para conectar ao banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD, // Certifique-se de que essa variável está configurada no .env
    });
  }
  return pool;
}

// Rota raiz
app.get("/", async (req, res) => {
  console.log("Rota GET / solicitada");

  const db = conectarBD();
  let dbStatus = "ok";

  try {
    await db.query("SELECT 1");
  } catch (e) {
    dbStatus = `Erro ao conectar ao banco: ${e.message}`;
  }

  res.json({
    mensagem: "API para Questões e Usuários",
    autor: "Gabriel Dias Santos Silva",
    dbStatus: dbStatus,
  });
});

// GET - Todas as questões
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada");

  try {
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM questoes");
    res.json(resultado.rows);
  } catch (e) {
    console.error("Erro ao buscar questões:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

// GET - Questão por ID
app.get("/questoes/:id", async (req, res) => {
  console.log("Rota GET /questoes/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();
    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);

    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" });
    }

    res.json(resultado.rows[0]);
  } catch (e) {
    console.error("Erro ao buscar questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// POST - Criar nova questão
app.post("/questoes", async (req, res) => {
  console.log("Rota POST /questoes solicitada");

  try {
    const data = req.body;
    if (!data.enunciado || !data.disciplina || !data.tema || !data.nivel) {
      return res.status(400).json({
        erro: "Dados inválidos",
        mensagem:
          "Todos os campos (enunciado, disciplina, tema, nivel) são obrigatórios.",
      });
    }

    const db = conectarBD();

    const consulta =
      "INSERT INTO questoes (enunciado,disciplina,tema,nivel) VALUES ($1,$2,$3,$4)";
    const questao = [data.enunciado, data.disciplina, data.tema, data.nivel];
    await db.query(consulta, questao);
    res.status(201).json({ mensagem: "Questão criada com sucesso!" });
  } catch (e) {
    console.error("Erro ao inserir questão:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// PUT - Atualizar questão
app.put("/questoes/:id", async (req, res) => {
  console.log("Rota PUT /questoes solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();
    let consulta = "SELECT * FROM questoes WHERE id = $1";
    let resultado = await db.query(consulta, [id]);
    let questao = resultado.rows;

    if (questao.length === 0) {
      return res.status(404).json({ message: "Questão não encontrada" });
    }

    const data = req.body;

    data.enunciado = data.enunciado || questao[0].enunciado;
    data.disciplina = data.disciplina || questao[0].disciplina;
    data.tema = data.tema || questao[0].tema;
    data.nivel = data.nivel || questao[0].nivel;

    consulta =
      "UPDATE questoes SET enunciado = $1, disciplina = $2, tema = $3, nivel = $4 WHERE id = $5";
    await db.query(consulta, [
      data.enunciado,
      data.disciplina,
      data.tema,
      data.nivel,
      id,
    ]);

    res.status(200).json({ message: "Questão atualizada com sucesso!" });
  } catch (e) {
    console.error("Erro ao atualizar questão:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
    });
  }
});

// DELETE - Deletar questão
app.delete("/questoes/:id", async (req, res) => {
  console.log("Rota DELETE /questoes/:id solicitada");

  try {
    const id = req.params.id;
    const db = conectarBD();

    const resultado = await db.query("SELECT * FROM questoes WHERE id = $1", [id]);
    if (resultado.rows.length === 0) {
      return res.status(404).json({ mensagem: "Questão não encontrada" });
    }

    await db.query("DELETE FROM questoes WHERE id = $1", [id]);
    res.json({ mensagem: "Questão excluída com sucesso!" });
  } catch (e) {
    console.error("Erro ao excluir questão:", e);
    res.status(500).json({ erro: "Erro interno do servidor" });
  }
});

// Teste de conexão com o banco
app.get("/test-db", async (req, res) => {
  try {
    const db = conectarBD();
    const result = await db.query("SELECT NOW()");
    res.json({ dbTime: result.rows[0] });
  } catch (e) {
    res.status(500).json({ erro: e.message });
  }
});

// Inicia o servidor
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
});
