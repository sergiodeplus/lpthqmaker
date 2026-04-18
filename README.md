# 🎨 Criador de HQ Maker (LPT)

Projeto desenvolvido para permitir que estudantes criem suas próprias histórias em quadrinhos de forma intuitiva, utilizando inteligência artificial para auxiliar no processo criativo.

## 🚀 Links do Projeto
- **Deploy (Surge):** [https://lpt-hqmaker.surge.sh](https://lpt-hqmaker.surge.sh)
- **Repositório GitHub:** [https://github.com/sergiodeplus/lpthqmaker.git](https://github.com/sergiodeplus/lpthqmaker.git)

## 🛠️ Stack Tecnológica
- **Framework:** Next.js 15+ (App Router)
- **Styling:** TailwindCSS 4, Lucide React (Ícones)
- **Canvas:** Fabric.js (Manipulação de imagens e HQ)
- **IA:** Google Gemini API (@google/genai)
- **Animações:** Motion (Framer Motion)
- **Deploy:** Surge.sh

## 📖 Como Rodar Localmente

**Pré-requisitos:** Node.js (v20+)

1. **Clonar o repositório:**
   ```bash
   git clone https://github.com/sergiodeplus/lpthqmaker.git
   cd lpthqmaker
   ```
2. **Instalar dependências:**
   ```bash
   npm install
   ```
3. **Configurar API Key:**
   Crie um arquivo `.env.local` e adicione sua chave:
   ```env
   NEXT_PUBLIC_GEMINI_API_KEY=sua_chave_aqui
   ```
4. **Iniciar o servidor de desenvolvimento:**
   ```bash
   npm run dev
   ```

## 📜 Histórico de Modificações (Changelog)
- **2026-04-18:**
  - Inicialização do repositório Git.
  - Configuração de build estático (`output: 'export'`).
  - Deploy realizado com sucesso no Surge.
  - Atualização do README com informações detalhadas.

