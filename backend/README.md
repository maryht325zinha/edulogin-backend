# EduLogin Backend 🔐

Backend seguro para o sistema EduLogin, construído com Node.js, Express, Prisma e PostgreSQL.

## 🚀 Tecnologias

- **Node.js** + **Express**: Framework web.
- **Prisma**: ORM moderno para banco de dados.
- **PostgreSQL**: Banco de dados relacional.
- **JWT**: Autenticação stateless.
- **Bcrypt**: Hashing de senhas.
- **AES-256**: Criptografia segura para credenciais armazenadas.

## 📂 Estrutura

- `src/controllers`: Lógica das rotas (Auth, Sites, Credentials).
- `src/middlewares`: Autenticação e validação.
- `src/utils`: Criptografia e instância do banco.
- `prisma/`: Schema do banco e script de seed.

## 🛠️ Configuração

1. **Instale as dependências**:
   ```bash
   cd backend
   npm install
   ```

2. **Configure o Banco de Dados**:
   - Crie um banco PostgreSQL local ou use um serviço como Supabase/Neon.
   - Edite o arquivo `.env` e coloque a URL de conexão em `DATABASE_URL`.
   - Exemplo:
     ```env
     DATABASE_URL="postgresql://user:password@localhost:5432/edulogin"
     ```

3. **Gere o cliente Prisma**:
   ```bash
   npx prisma generate
   ```

4. **Prepare o Banco (Migração)**:
   ```bash
   npx prisma db push
   ```

5. **Popule com os Sites iniciais**:
   ```bash
   npx prisma db seed
   ```

## ▶️ Rodando

- **Desenvolvimento**:
  ```bash
  npm run dev
  ```
  O servidor rodará em `http://localhost:3000`.

- **Produção**:
  ```bash
  npm run build
  npm start
  ```

## 🔐 Segurança Implementada

- **Senhas de Usuário**: Hash com `bcryptjs` (salt rounds padrão).
- **Credenciais de Sites**: Criptografia AES-256-CBC com chave de 32 bytes e IV aleatório.
- **Autenticação**: Tokens JWT com expiração.
- **Isolamento**: Cada usuário só acessa seus próprios dados (`where: { user_id: req.user.id }`).

## 📡 Rotas da API

### Auth
- `POST /api/auth/register`: Cria conta.
- `POST /api/auth/login`: Retorna token JWT.
- `GET /api/auth/me`: Dados do usuário logado.

### Sites
- `GET /api/sites`: Lista todos os sistemas educacionais disponíveis.

### Credentials
- `GET /api/credentials`: Lista credenciais do usuário (senhas descriptografadas).
- `POST /api/credentials`: Salva nova credencial (senha é criptografada antes de salvar).
- `PUT /api/credentials/:id`: Atualiza login ou senha.
- `DELETE /api/credentials/:id`: Remove uma credencial.
