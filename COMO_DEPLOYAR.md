# Como Colocar Seu App Financeiro Online

Para colocar a sua aplicação no ar gratuitamente, o jeito mais fácil e recomendado para projetos em Next.js é através da plataforma **Vercel** (criadora do próprio Next.js).

Como estamos utilizando um banco de dados local (`SQLite`), as plataformas *Serverless* como a Vercel não conseguem manter esse arquivo salvo (pois elas recriam os servidores a cada requisição).

Portanto, o plano recomendado envolve 2 passos principais:
1. Hospedar o Banco de Dados na nuvem
2. Hospedar o Código na Vercel

---

## Passo 1: Hospedar o Banco de Dados (Gratuito)

Recomendo utilizar o **Neon** (Postgres) ou **Supabase**. Ambos oferecem um excelente plano gratuito e se integram perfeitamente com o *Prisma*.

### Como fazer:
1. Crie uma conta no [Neon](https://neon.tech/) ou [Supabase](https://supabase.com/).
2. Crie um novo projeto/banco de dados.
3. Copie a `Connection String` (URL do banco de dados). Ela será algo como: 
   `postgresql://usuario:senha@host.neon.tech/nome_do_banco?sslmode=require`

### Ajuste no seu código (quando for fazer isso):
Teremos que mudar no seu arquivo `prisma/schema.prisma` de `provider = "sqlite"` para `provider = "postgresql"`. Tudo continuará funcionando igual.

---

## Passo 2: Enviar o Código para o GitHub

Para o passo a seguir dar certo, o seu projeto precisa estar salvo no GitHub.

### Alternativa 1: Usando o Visual Studio Code (Mais Fácil)
1. No menu lateral esquerdo do VS Code, clique no ícone de **Controle do Código-Fonte** (o terceiro ícone, que se parece com uma árvore de ramificações).
2. Clique no botão **"Publish to GitHub"** (Em português: *Publicar no GitHub*).
3. O VS Code pode pedir que você entre na sua conta do GitHub. Faça o login.
4. Escolha a opção **"Publish to GitHub private repository"** se quiser manter o código só para você.
5. Selecione os arquivos para salvar (o VS Code marcará todos por padrão) e clique em **OK**.
6. Pronto! O projeto está no GitHub e um link aparecerá no canto inferior direito.

### Alternativa 2: Usando o Terminal (Git)
Se você já tem o Git instalado, abra o terminal na pasta do projeto e rode:

```bash
git init
git add .
git commit -m "Meu primeiro commit Financeiro"
```
Depois, vá no site do GitHub, crie um novo repositório vazio e rode os comandos que eles te mostrarem, que serão parecidos com isso:
```bash
git branch -M main
git remote add origin https://github.com/SeuUsuario/seu-repositorio.git
git push -u origin main
```

---

## Passo 3: Hospedar o Código na Vercel (Gratuito)

### Como Hospedar:
1. Crie uma conta no [GitHub](https://github.com/), caso não tenha.
2. Acesse a [Vercel](https://vercel.com/) e faça login usando a sua conta do GitHub.
3. Clique em **"Add New"** > **"Project"**.
4. Autorize a Vercel a ler seus repositórios do GitHub e selecione o repositório do seu **App Financeiro**.
5. Na tela de configuração (*Configure Project*), vá até a seção **Environment Variables** (Variáveis de Ambiente) e adicione as seguintes chaves que você já tem no seu arquivo `.env`:
   - Name: `DATABASE_URL` | Value: *(Cole aqui a URL que você pegou do Neon/Supabase)*
   - Name: `JWT_SECRET` | Value: `minha_chave_super_secreta_financeira_123` (Ou outra chave segura que você escolher).
6. Clique em **Deploy**.

Pronto! Em cerca de 2 minutos, a Vercel vai instalar os pacotes, gerar o banco e te entregar um link público (ex: `https://meu-app-financeiro.vercel.app`) para você acessar de qualquer lugar e do celular! 🚀

> **Quer que eu já prepare o código para você migrar do SQLite local para o PostgreSQL na nuvem?**
