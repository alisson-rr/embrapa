# Configuração do Sistema Embrapa

## 📋 Pré-requisitos

- Node.js 18+ instalado
- Conta no Supabase
- Git (opcional)

## 🚀 Configuração Inicial

### 1. Instalação de Dependências

```bash
npm install
```

### 2. Configuração das Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com as seguintes variáveis:

```env
VITE_SUPABASE_URL=https://skmedtgbqmdhwsfooxwy.supabase.co
VITE_SUPABASE_ANON_KEY=sua_chave_anonima_aqui
```

**Nota:** As credenciais do Supabase já estão configuradas no projeto.

### 3. Configuração do Banco de Dados Supabase

#### Passo 1: Acessar o Supabase Dashboard

1. Acesse [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Faça login com sua conta
3. Selecione o projeto: `skmedtgbqmdhwsfooxwy`

#### Passo 2: Criar a Tabela de Perfis

1. No menu lateral, clique em **SQL Editor**
2. Clique em **New Query**
3. Copie e cole o conteúdo do arquivo [`docs/setup-profiles-table.sql`](./setup-profiles-table.sql)
4. Clique em **Run** para executar o script

Este script irá:
- Criar a tabela `profiles` para armazenar informações dos usuários
- Configurar Row Level Security (RLS) para segurança
- Criar políticas de acesso
- Adicionar triggers para atualização automática de timestamps

#### Passo 3: Criar Usuário de Teste (Opcional)

Para testar o sistema sem precisar de e-mail real:

1. No Supabase Dashboard, vá em **Authentication** > **Users**
2. Clique em **Add User**
3. Preencha:
   - **Email:** `teste@embrapa.com`
   - **Password:** `Teste123` (deve ter no mínimo 6 caracteres, 1 número, 1 maiúscula)
4. Marque a opção **Auto Confirm User** (para não precisar confirmar e-mail)
5. Clique em **Create User**

Agora você pode fazer login com:
- **E-mail:** `teste@embrapa.com`
- **Senha:** `Teste123`

### 4. Executar o Projeto

```bash
npm run dev
```

O projeto estará disponível em: `http://localhost:8080`

## 🎯 Funcionalidades Disponíveis

### Autenticação
- ✅ Login com e-mail e senha
- ✅ Recuperação de senha
- ✅ Redefinição de senha
- ✅ Logout

### Dashboard
- ✅ Métricas de formulários
- ✅ Gráficos de categorias
- ✅ Mapa interativo do Brasil
- ✅ Índices de sustentabilidade

### Configurações
- ✅ Edição de perfil (nome, e-mail, telefone)
- ✅ Alteração de senha com validações em tempo real
- ✅ Navegação entre abas

### Formulários
- ✅ Dados pessoais
- ✅ Informações da propriedade
- ✅ Dados econômicos
- ✅ Dados sociais
- ✅ Dados ambientais
- ✅ Resultados com índices calculados

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

1. **profiles** - Perfis de usuários
   - Armazena nome, e-mail e telefone
   - Vinculado ao user_id do auth.users

2. **forms** - Formulários de sustentabilidade
   - Armazena submissões completas
   - Contém índices calculados

3. **personal_data** - Dados pessoais dos formulários
4. **property_data** - Dados das propriedades
5. **economic_data** - Dados econômicos
6. **social_data** - Dados sociais
7. **environmental_data** - Dados ambientais

Veja o schema completo em [`docs/supabase-schema.md`](./supabase-schema.md)

## 🔒 Segurança

### Row Level Security (RLS)

Todas as tabelas têm RLS habilitado, garantindo que:
- Usuários só podem ver seus próprios dados
- Não é possível acessar dados de outros usuários
- Políticas de segurança são aplicadas automaticamente

### Validações

- **Senha:**
  - Mínimo 6 caracteres
  - Pelo menos 1 número
  - Pelo menos 1 letra maiúscula
  - Sem caracteres especiais

- **E-mail:**
  - Deve ser único na tabela profiles
  - Formato válido de e-mail

## 🛠️ Comandos Úteis

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Preview do build
npm run preview

# Linter
npm run lint
```

## 📱 Rotas da Aplicação

### Públicas
- `/` - Login
- `/forgot-password` - Recuperação de senha
- `/reset-password` - Redefinição de senha

### Protegidas (Requer autenticação)
- `/dashboard` - Dashboard principal
- `/settings` - Configurações de perfil
- `/form` - Início do formulário
- `/property-info` - Informações da propriedade
- `/economic-info` - Informações econômicas
- `/social-info` - Informações sociais
- `/environmental-info` - Informações ambientais
- `/results` - Resultados do formulário

## 🎨 Tecnologias Utilizadas

- **React 18** - Framework frontend
- **TypeScript** - Tipagem estática
- **Vite** - Build tool
- **TailwindCSS** - Estilização
- **Shadcn/ui** - Componentes UI
- **Supabase** - Backend as a Service
- **React Router** - Roteamento
- **Recharts** - Gráficos
- **Lucide React** - Ícones

## 🐛 Troubleshooting

### Erro: "Missing Supabase environment variables"
- Verifique se o arquivo `.env` existe na raiz do projeto
- Confirme se as variáveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` estão definidas

### Erro: "Invalid login credentials"
- Verifique se o usuário foi criado no Supabase
- Confirme se o e-mail foi confirmado (ou use Auto Confirm User)
- Verifique se a senha atende aos requisitos mínimos

### Erro ao salvar perfil: "permission denied"
- Verifique se o RLS está configurado corretamente
- Execute o script `setup-profiles-table.sql` novamente
- Confirme se o usuário está autenticado

### Tabela profiles não existe
- Execute o script SQL em `docs/setup-profiles-table.sql`
- Verifique se está conectado ao projeto correto no Supabase

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a documentação em `docs/`
2. Consulte os logs no console do navegador
3. Verifique os logs do Supabase Dashboard

## 📄 Licença

Este projeto é propriedade da Embrapa.
