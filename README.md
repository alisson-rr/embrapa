# Formulário Embrapa

Aplicação web para coleta de dados pessoais e informações agropecuárias da Embrapa.

## Tecnologias utilizadas

Este projeto foi construído com:

- **Vite** - Build tool e dev server
- **TypeScript** - Linguagem de programação
- **React** - Framework frontend
- **shadcn-ui** - Biblioteca de componentes
- **Tailwind CSS** - Framework CSS
- **Supabase** - Backend e autenticação

## Como executar o projeto

Pré-requisitos: Node.js e npm instalados

```sh
# 1. Clone o repositório
git clone <URL_DO_REPOSITORIO>

# 2. Navegue até o diretório do projeto
cd embrapa

# 3. Instale as dependências
npm install

# 4. Configure as variáveis de ambiente
# Copie o arquivo .env.example para .env e preencha com suas credenciais do Supabase
cp .env.example .env

# 5. Inicie o servidor de desenvolvimento
npm run dev
```

O projeto estará disponível em `http://localhost:8080`

## Scripts disponíveis

- `npm run dev` - Inicia o servidor de desenvolvimento
- `npm run build` - Gera o build de produção
- `npm run preview` - Visualiza o build de produção
- `npm run lint` - Executa o linter

## Estrutura do projeto

- `/src/components` - Componentes React reutilizáveis
- `/src/pages` - Páginas da aplicação
- `/src/contexts` - Contextos React (FormContext, AuthContext)
- `/src/hooks` - Hooks customizados
- `/src/lib` - Configurações e utilitários (Supabase)
- `/src/assets` - Imagens e outros recursos estáticos
- `/public` - Arquivos públicos estáticos

## Autenticação

O projeto utiliza Supabase para autenticação. Para configurar:

1. Crie uma conta no [Supabase](https://supabase.com)
2. Crie um novo projeto
3. Copie a URL do projeto e a chave anon para o arquivo `.env`
4. Configure a autenticação por e-mail/senha no painel do Supabase

### Funcionalidades de autenticação:

- **Login opcional** - Usuários podem fazer login ou usar o formulário diretamente
- **Logout** - Encerramento de sessão
- **Recuperação de senha** - Envio de e-mail para redefinição
- **Rotas públicas** - Todas as páginas do formulário são acessíveis sem autenticação
- **Persistência de sessão** - Sessão mantida entre recarregamentos

### Rotas da aplicação:

- `/` - Página de login (opcional)
- `/forgot-password` - Recuperação de senha
- `/form` - **Dados pessoais** (primeira etapa - acesso público)
- `/property-info` - Informações da propriedade (acesso público)
- `/economic-info` - Dados econômicos (acesso público)
- `/social-info` - Informações sociais (acesso público)
- `/environmental-info` - Dados ambientais (acesso público)
