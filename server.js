// Importação dos pacotes necessários
import pkg from "pg";        // Pacote do PostgreSQL
import dotenv from "dotenv"; // Pacote para carregar variáveis de ambiente
import express from "express"; // Pacote do Express

// Inicializa o Express
const app = express();

// Define a porta
const port = 3000;

// Carrega e processa o arquivo .env
dotenv.config();

// Utiliza a classe Pool do PostgreSQL para configurar a conexão
const { Pool } = pkg;

// Variável para armazenar o pool de conexões
let pool = null;

// Função para conectar ao banco de dados
function conectarBD() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.URL_BD, // Pega a URL do banco da variável de ambiente
    });
  }
  return pool;
}

// Rota raiz do servidor
app.get("/", async (req, res) => {
  console.log("Rota GET / solicitada");

  let dbStatus = "ok";  // Inicializa o status da conexão com o banco

  try {
    const db = conectarBD(); // Conecta ao banco de dados
    await db.query("SELECT 1"); // Teste simples para garantir conexão
  } catch (e) {
    dbStatus = `Erro ao conectar ao banco de dados: ${e.message}`;
  }

  res.json({
    message: "API para tecido",    
    author: "Cristiane Martins Silva",
    statusBD: dbStatus,              
  });
});

// Rota para retornar todas as questões cadastradas
app.get("/questoes", async (req, res) => {
  console.log("Rota GET /questoes solicitada");

  try {
    const db = conectarBD(); // Conecta ao banco de dados
    const resultado = await db.query("SELECT * FROM questoes");  // Consulta todas as questões no banco
    const dados = resultado.rows; // Extrai os dados

    res.json(dados);  // Retorna os dados em JSON
  } catch (e) {
    console.error("Erro ao buscar questões:", e);
    res.status(500).json({
      erro: "Erro interno do servidor",
      mensagem: "Não foi possível buscar as questões",
    });
  }
});

// Inicia o servidor na porta especificada
app.listen(port, () => {
  console.log(`Serviço rodando na porta: ${port}`);
});
