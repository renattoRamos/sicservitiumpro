# 💼 Servitium - Gestão de Funcionários (CPR/CMA SUL)

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=flat&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=flat&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/typescript-%23007ACC.svg?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?style=flat&logo=supabase&logoColor=white)](https://supabase.io/)
[![Capacitor](https://img.shields.io/badge/Capacitor-119EFF?style=flat&logo=capacitor&logoColor=white)](https://capacitorjs.com/)

**Servitium** é uma plataforma profissional de gerenciamento de recursos humanos projetada especificamente para as coordenações **CPR** e **CMA SUL**. O sistema oferece uma solução robusta para o controle de funcionários, acompanhamento de férias e integração de comunicações corporativas.

---

## 🚀 Principais Funcionalidades

- **👥 Gestão de Funcionários**: Cadastro completo com dados contratuais, especialidades, lotações e escalas de trabalho.
- **📅 Controle de Férias**: Planejamento anual de férias com sistema de alertas para notificações antecipadas.
- **📊 Dashboard de Dados**: Visualizações analíticas dos status de férias e distribuição de funcionários.
- **📱 PWA & Mobile**: Suporte nativo a Progressive Web App (PWA) e mobile (Android/iOS) via Capacitor.
- **📞 Agenda Corporativa**: Acesso rápido a contatos de coordenação e links externos essenciais.
- **📥 Importação/Exportação**: Suporte para manipulação de dados via arquivos XLSX e CSV (PapaParse).

---

## 🛠️ Tecnologias Utilizadas

### Frontend
- **Framework**: React 18 com Vite
- **Estilização**: Tailwind CSS & Shadcn UI
- **Animações**: Framer Motion
- **Gerenciamento de Estado**: TanStack Query (React Query)
- **Roteamento**: React Router DOM v6
- **Gráficos**: Recharts

### Backend & Integração
- **Database / Auth**: Supabase
- **PWA**: `vite-plugin-pwa` para suporte offline e instalação.
- **Utils**: `date-fns`, `papaparse`, `xlsx`, `zod`.

### Mobile
- **Capacitor**: Bridge para aplicações nativas Android e iOS.

---

## ⚙️ Configuração do Ambiente

### Pré-requisitos
- [Node.js](https://nodejs.org/) (versão >= 18)
- [npm](https://www.npmjs.com/) ou [bun](https://bun.sh/)

### Instalação

1. Clone o repositório:
   ```bash
   git clone [url-do-repositorio]
   cd gestaoservitiumcmacprsul
   ```

2. Instale as dependências:
   ```bash
   npm install
   # ou
   bun install
   ```

3. Configure as variáveis de ambiente:
   Crie um arquivo `.env` na raiz ou atualize o cliente Supabase em `src/integrations/supabase/client.ts`.

---

## 🖥️ Scripts Disponíveis

| Comando | Descrição |
| :--- | :--- |
| `npm run dev` | Inicia o servidor de desenvolvimento Vite (Porta 8080) |
| `npm run build` | Compila o projeto para produção |
| `npm run lint` | Executa o linter para verificar erros de código |
| `npm run preview` | Visualiza o build de produção localmente |

---

## 📱 Desenvolvimento Mobile

O projeto utiliza **Capacitor** para deploy em dispositivos móveis.

### Comandos Mobile
- **Sincronizar Web com Nativo**: `npx cap sync`
- **Abrir Android Studio**: `npx cap open android`
- **Abrir Xcode**: `npx cap open ios`

---

## 📦 Deploy

- **Web**: Compatível com Vercel, Netlify ou qualquer servidor estático (configurações incluídas em `vercel.json` e `netlify.toml`).
- **PWA**: O service worker é gerado automaticamente no build, permitindo a instalação do sistema no mobile/desktop via navegador.

---

## 📄 Licença

Este projeto é de uso privado e restrito às coordenações CPR e CMA SUL.

---

> Desenvolvido com foco em eficiência operacional e gestão estratégica de equipes.
