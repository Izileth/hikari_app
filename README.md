# Hikari App

![Hikari App Icon](./assets/images/icon.png)

Um aplicativo móvel completo desenvolvido com React Native, Expo e Supabase, integrando funcionalidades sociais e financeiras para ajudar os usuários a gerenciar suas finanças e compartilhar seu progresso.

## ✨ Funcionalidades

*   **Autenticação de Usuário**: Cadastro e login seguros com Supabase Auth.
*   **Feed Social**: Crie, edite e visualize posts no feed.
*   **Interações Sociais**: Curta, comente e siga outros usuários.
*   **Perfil de Usuário**: Visualize e edite perfis, com biografia e foto.
*   **Gestão Financeira**:
    *   Gerencie contas e categorias financeiras.
    *   Registre e acompanhe transações.
    *   Visualize dashboards financeiros com gráficos.
    *   Defina metas financeiras.
*   **UI Temática**: Suporte a temas claro e escuro.
*   **Estilização com NativeWind**: Use classes do Tailwind CSS para um desenvolvimento de UI rápido e consistente.

## 🚀 Tecnologias Utilizadas

*   **Frontend**:
    *   [React Native](https://reactnative.dev/)
    *   [Expo](https://expo.dev/)
    *   [TypeScript](https://www.typescriptlang.org/)
    *   [NativeWind](https://www.nativewind.dev/) (Tailwind CSS para React Native)
    *   [React Navigation](https://reactnavigation.org/) para roteamento.
*   **Backend**:
    *   [Supabase](https://supabase.io/) - Banco de dados, autenticação e armazenamento.
*   **Linting & Formatação**:
    *   [ESLint](https://eslint.org/)

## 📂 Estrutura de Pastas

A estrutura do projeto está organizada da seguinte forma:

```
/
├── app/                # Arquivos de rota e telas (Expo Router)
│   ├── (auth)/         # Rotas de autenticação
│   └── (tabs)/         # Rotas principais após login
├── assets/             # Imagens e outros recursos estáticos
├── components/         # Componentes reutilizáveis da UI
│   ├── financials/     # Componentes para a seção financeira
│   ├── profile/        # Componentes para a seção de perfil
│   ├── social/         # Componentes para a seção social
│   └── ui/             # Componentes de UI genéricos (ícones, botões, etc.)
├── constants/          # Constantes do aplicativo (cores, temas)
├── context/            # Provedores de contexto React (Auth, Financials, etc.)
├── hooks/              # Hooks reutilizáveis
├── lib/                # Configuração de clientes (Supabase) e tipos
├── migrations/         # Migrações do banco de dados Supabase
└── scripts/            # Scripts de utilidade para o projeto
```

## ⚙️ Começando

Siga estas instruções para configurar e executar o projeto em seu ambiente de desenvolvimento local.

### Pré-requisitos

*   [Node.js](https://nodejs.org/) (versão LTS)
*   [Yarn](https://yarnpkg.com/) ou [npm](https://www.npmjs.com/)
*   [Expo Go](https://expo.dev/go) app em seu dispositivo móvel (iOS ou Android)
*   Uma conta [Supabase](https://supabase.com/) e um projeto criado.

### Instalação

1.  **Clone o repositório:**
    ```bash
    git clone <URL_DO_SEU_REPOSITORIO>
    cd hikari_app
    ```

2.  **Instale as dependências:**
    ```bash
    npm install
    # ou
    yarn install
    ```

3.  **Configure as variáveis de ambiente:**
    *   Renomeie o arquivo `.env.example` para `.env`.
    *   Adicione suas chaves de API do Supabase ao arquivo `.env`:
        ```
        EXPO_PUBLIC_SUPABASE_URL=SUA_SUPABASE_URL
        EXPO_PUBLIC_SUPABASE_ANON_KEY=SUA_SUPABASE_ANON_KEY
        ```

4.  **Aplique as migrações do banco de dados:**
    *   Configure a CLI do Supabase e aplique as migrações localizadas na pasta `migrations/`. Consulte a [documentação do Supabase](https://supabase.com/docs/guides/cli) para mais detalhes.

### Executando o Projeto

1.  **Inicie o servidor de desenvolvimento Expo:**
    ```bash
    npm start
    # ou
    yarn start
    ```

2.  **Abra o aplicativo:**
    *   Escaneie o código QR com o aplicativo Expo Go em seu celular.
    *   Ou pressione `w` no terminal para abrir no seu navegador web, `a` para Android (emulador) ou `i` para iOS (simulador).

## 📜 Scripts Disponíveis

No diretório do projeto, você pode executar:

*   `npm start`: Inicia o servidor de desenvolvimento Expo.
*   `npm run android`: Inicia o aplicativo no emulador Android.
*   `npm run ios`: Inicia o aplicativo no simulador iOS.
*   `npm run web`: Inicia o aplicativo em um navegador web.
*   `npm run lint`: Executa o linter para verificar erros no código.

## 🤝 Contribuindo

Contribuições são o que tornam a comunidade de código aberto um lugar incrível para aprender, inspirar e criar. Qualquer contribuição que você fizer será **muito apreciada**.

1.  Faça um *Fork* do Projeto
2.  Crie sua *Branch* de Funcionalidade (`git checkout -b feature/AmazingFeature`)
3.  Faça o *Commit* de suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4.  Faça o *Push* para a *Branch* (`git push origin feature/AmazingFeature`)
5.  Abra um *Pull Request*

## 📄 Licença

Distribuído sob a Licença MIT. Veja `LICENSE` para mais informações.