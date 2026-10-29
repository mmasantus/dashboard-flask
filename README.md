# Passagem de Turno MKTZAP 📱

Painel analítico moderno e consolidador operacional para processamento de relatórios MKTZAP, métricas por canal, ranking de acionamentos, exportação oficial para Word (.docx), cópia rápida para WhatsApp e **controle de acesso restrito de administrador** para a equipe **Experiência Brasil**.

---

## 🚀 Como subir no GitHub e fazer Deploy na Vercel

### 1. Subir para o GitHub

No seu terminal local, execute dentro da pasta do projeto:

```bash
git init
git add .
git commit -m "feat: Passagem de Turno MKTZAP com controle restrito de administrador"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/SEU_REPOSITORIO.git
git push -u origin main
```

---

### 2. Deploy na Vercel (1 Clique)

1. Acesse **[vercel.com](https://vercel.com)** e faça login com seu GitHub.
2. Clique em **"Add New..."** > **"Project"**.
3. Selecione o repositório que você acabou de subir no GitHub.
4. As configurações já estão pré-configuradas no arquivo `vercel.json`:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Clique em **"Deploy"**! Em menos de 1 minuto seu site estará no ar com link público HTTPS.

---

## 💻 Como Rodar Localmente no seu Computador

**Pré-requisitos:** Node.js (versão 18 ou superior)

1. Instale as dependências:
   ```bash
   npm install
   ```

2. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

3. Abra no navegador:
   `http://localhost:3000`

---

## 🔒 Sobre a Senha do Administrador (Experiência Brasil)

- **Senha Padrão Inicial:** `admin123`
- Ao clicar no botão **"Equipe Experiência Brasil"**, você pode:
  - Clicar em **"Entrar como Administrador"** para autenticar.
  - Clicar em **"Alterar Senha"** para configurar sua senha pessoal secreta.
  - A inclusão e exclusão de integrantes só é permitida após a validação da senha.
  - Botão **"Bloquear"** para retornar ao modo seguro de visualização.

---

## 📁 Tecnologias Utilizadas

- **React 19 & TypeScript**
- **Vite** (Build ultra-rápido)
- **Tailwind CSS**
- **SheetJS (`xlsx`)** (Leitura de planilhas `.xlsx`, `.xls`, `.csv`, `.html`)
- **Docx & FileSaver** (Geração e download de relatórios Word formatados)
- **Lucide Icons**
