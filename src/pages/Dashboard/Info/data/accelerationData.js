// src/pages/Dashboard/Info/data/accelerationData.js

// Substitua APENAS a variável fundingPhases no seu arquivo accelerationData.js:

export const fundingPhases = [
  {
    id: 1, phase: "Mapeamento e Preparação", icon: "Map", color: "var(--cyber-blue)",
    description: "Editais de fomento (como FAPESP, FAPEMIG, Centelha, Finep) exigem que a startup tenha uma tese clara, CNPJ ativo e um problema real mapeado. É a fase de ler o edital inteiro, checar restrições de CNAE e tirar certidões negativas.",
    subItems: ["Leitura Crítica do Edital", "Adequação do CNAE", "Emissão de Certidões Negativas", "Mapeamento do Problema", "Validação da Tese de Inovação"],
    dataPlanner: {
      text: "Utilize a aba 'Lean Canvas' no Data-Planner para estruturar o Problema, Solução e Diferencial. É daqui que sairá o texto base da sua proposta governamental.",
      btnText: "Abrir Lean Canvas", route: "/dashboard/planning"
    },
    externalTools: {
      text: "Portais governamentais de fomento e ecossistemas de busca de editais ativos para submissão:",
      tools: ["Portal Gov.br", "Finep Inovação", "Fundações Estaduais (FAPs)"]
    }
  },
  {
    id: 2, phase: "Submissão da Proposta (Projeto)", icon: "FileText", color: "var(--neon-purple)",
    description: "Você precisará enviar o formulário do edital detalhando a inovação tecnológica. O avaliador quer saber o que a sua ferramenta tem de diferente, por que é arriscado (risco tecnológico) e como o dinheiro será alocado.",
    subItems: ["Formulário Técnico Oficial", "Orçamento Detalhado", "Cronograma Físico-Financeiro", "Currículo Lattes da Equipe", "Pitch Deck Anexo"],
    dataPlanner: {
      text: "Use o 'Data Room' para gerar seu One-Pager Público (Apresentação Executiva) e exporte em PDF para anexar à plataforma do edital.",
      btnText: "Gerar One-Pager", route: "/dashboard/dataroom"
    },
    externalTools: {
      text: "Plataformas para cadastro de pesquisadores e formatação de planilhas orçamentárias padrão:",
      tools: ["Plataforma Lattes", "Google Sheets", "Planilhas do Edital"]
    }
  },
  {
    id: 3, phase: "Avaliação e Pitch", icon: "Mic", color: "var(--alert-yellow)",
    description: "As bancas avaliadoras selecionam as melhores propostas escritas para uma apresentação oral (Pitch) de 3 a 5 minutos. Você defenderá sua capacidade de execução, o tamanho do mercado e responderá a uma sabatina técnica.",
    subItems: ["Treinamento de Pitch", "Defesa do Modelo de Receita", "Sabatina Técnica", "Comprovação de Mercado", "Apresentação de Protótipo"],
    dataPlanner: {
      text: "Os avaliadores vão questionar a viabilidade do negócio. Simule sua meta de receita mensal e ticket médio na aba 'Metas (MRR)' para apresentar números lógicos.",
      btnText: "Simular Ticket (MRR)", route: "/dashboard/planning"
    },
    externalTools: {
      text: "Programas de capacitação de Pitch e construção de apresentações visuais de alto impacto:",
      tools: ["Sebrae Startups", "Canva", "Pitch Deck Templates"]
    }
  },
  {
    id: 4, phase: "Contratação e Execução", icon: "Rocket", color: "var(--neon-green)",
    description: "Aprovado! Você precisará abrir uma conta bancária específica para o edital. O dinheiro cai e você tem prazos rígidos para entregar os marcos (milestones) do software. Editais não permitem mudar o escopo radicalmente sem aviso.",
    subItems: ["Abertura de Conta Específica", "Assinatura do Termo de Outorga", "Sprints de Desenvolvimento", "Entregas de Marcos Mínimos", "Gestão de Bolsistas"],
    dataPlanner: {
      text: "O escopo não pode falhar. Cadastre as tarefas obrigatórias no 'Kanban' e os Milestones de entrega na 'Timeline' em Configurações.",
      btnText: "Painel Ágil (Kanban)", route: "/dashboard/kanban"
    },
    externalTools: {
      text: "Bancos digitais amigáveis para contas PJ exclusivas e assinaturas de contratos públicos:",
      tools: ["Conta PJ Inter / Cora", "Assinatura Gov.br", "Docusign"]
    }
  },
  {
    id: 5, phase: "Prestação de Contas", icon: "ShieldAlert", color: "var(--alert-red)",
    description: "A fase mais crítica de todo o processo. Cada centavo gasto (servidores, bolsas, marketing) deve ser comprovado com notas fiscais. O desvio de finalidade obriga o fundador a devolver o dinheiro com juros.",
    subItems: ["Relatório Técnico Parcial/Final", "Relatório Financeiro Consolidado", "Cotação de 3 Fornecedores", "Emissão de Notas Fiscais", "Comprovantes de Transferência"],
    dataPlanner: {
      text: "Não perca o controle. Lance TODAS as saídas no 'Livro Caixa Estratégico' do Financeiro, usando a categoria 'Fomento' para espelhar a planilha do governo.",
      btnText: "Ir para Tesouraria", route: "/dashboard/financial"
    },
    externalTools: {
      text: "Sistemas contábeis focados em empresas de tecnologia e portais de convênio:",
      tools: ["Contabilizei", "Portal de Convênios (+Brasil)", "Contador Especializado"]
    }
  }
];

export const financePlaybook = {
  survival: {
    title: "A Regra de Ouro: Runway & Burn Rate",
    description: "Runway é o seu oxigênio. Se você tem R$ 100.000 em caixa e sua operação custa (queima) R$ 10.000/mês, seu Runway é de 10 meses. O objetivo principal do CEO é não deixar esse relógio zerar antes de captar a próxima rodada ou atingir o Break-even (ponto de equilíbrio).",
    plannerAction: { text: "Use a calculadora de Orçamento (Tríade) para prever gastos antes de contratar.", route: "/dashboard/planning" }
  },
  rubrics: [
    {
      id: 1, title: "Capital (CAPEX)", icon: "Monitor", color: "var(--cyber-blue)",
      rules: "Bens duráveis (Notebooks, Servidores físicos, Equipamentos). O dinheiro de edital usado aqui exige tombamento (patrimônio) e cotação comprovada de 3 fornecedores diferentes. O bem fica atrelado ao projeto até a prestação de contas final."
    },
    {
      id: 2, title: "Custeio (OPEX)", icon: "Server", color: "var(--neon-purple)",
      rules: "A máquina rodando. Hospedagem cloud (AWS, Vercel), licenças de software, marketing e contabilidade. ATENÇÃO: A nota fiscal DEVE ser emitida no CNPJ exato da startup, com data de emissão estritamente dentro do período de vigência do edital."
    },
    {
      id: 3, title: "Bolsas e RH", icon: "Users", color: "var(--alert-yellow)",
      rules: "Remuneração de pesquisadores e desenvolvedores. Em editais, as bolsas não geram vínculo CLT, mas o bolsista não pode ter outra fonte de renda incompatível e deve entregar relatórios técnicos mensais assinados comprovando o trabalho."
    }
  ],
  kpis: [
    { name: "CAC", fullName: "Custo de Aquisição", desc: "Quanto custa em marketing/vendas para trazer 1 cliente pagante." },
    { name: "LTV", fullName: "Lifetime Value", desc: "Quanto dinheiro o cliente deixa na empresa durante toda a vida útil dele." },
    { name: "MRR", fullName: "Receita Recorrente", desc: "O faturamento mensal previsível gerado por assinaturas ativas." },
    { name: "Churn", fullName: "Taxa de Cancelamento", desc: "A porcentagem de clientes que cancelam a assinatura todo mês." }
  ],
  compliance: {
    title: "Engenharia Tributária e Compliance",
    description: "Misturar conta PF (Pessoa Física) com PJ (Pessoa Jurídica) é o crime número 1 do fundador iniciante. Abra uma conta bancária PJ gratuita imediatamente. Além disso, defina com seu contador o regime tributário correto (Geralmente Simples Nacional ou Inova Simples) para não pagar impostos absurdos sobre a receita de software (SaaS).",
    plannerAction: { text: "Registre absolutamente cada centavo que entra e sai no Livro Caixa da Tesouraria.", route: "/dashboard/financial" }
  }
};

// O GIGANTE: ROADMAP SAAS BLUEPRINT
export const roadmapPhases = [
  {
    id: 1, phase: "Ideação (Idea)", icon: "Lightbulb", color: "var(--alert-yellow)",
    description: "O estágio zero. Não escreva nenhuma linha de código. O objetivo aqui é mapear uma dor de mercado que seja urgente, frequente e monetizável. A falha nesta fase gera produtos que ninguém quer comprar.",
    subItems: ["Descoberta de Problemas (Problem Discovery)", "Pesquisa de Mercado (Market Research)", "Seleção de Nicho (Niche Selection)", "Análise de Concorrentes (Competitor Analysis)", "Mapeamento de Oportunidades (Opportunity Mapping)"],
    dataPlanner: {
      text: "O Data-Planner é excelente para modelar o modelo de negócio base. Acesse o Planejamento e estruture tudo no Lean Canvas para ter a visão macro.",
      btnText: "Abrir Lean Canvas", route: "/dashboard/planning"
    },
    externalTools: {
      text: "Para pesquisas externas e formulários de pesquisa de mercado profunda, recomendamos ferramentas especialistas em dados brutos:",
      tools: ["Google Trends", "Typeform", "Similarweb"]
    }
  },
  {
    id: 2, phase: "Validação (Validation)", icon: "SearchCheck", color: "var(--cyber-blue)",
    description: "A prova de fogo. Você precisa provar que as pessoas pagariam pela sua solução antes de construí-la. Uma Landing Page simples com uma lista de espera ou venda antecipada (Pre-sales) separa achismos de métricas reais.",
    subItems: ["Entrevistas com Clientes (Customer Interviews)", "Teste de Landing Page (Landing Page Test)", "Lista de Espera (Waitlist)", "Pré-Venda (Pre Sales)", "Teste de Demanda (Demand Testing)"],
    dataPlanner: {
      text: "Documente os roteiros e as respostas das suas entrevistas com clientes na sua Base de Conhecimento (Wiki) para acesso da equipe.",
      btnText: "Acessar Wiki Corporativa", route: "/dashboard/infoprofile"
    },
    externalTools: {
      text: "O Data-Planner não cria sites públicos. Para colocar uma Landing Page no ar em horas e coletar e-mails, utilize construtores No-Code:",
      tools: ["Framer", "Carrd.co", "Webflow"]
    }
  },
  {
    id: 3, phase: "Planejamento (Planning)", icon: "Target", color: "var(--neon-purple)",
    description: "Com a ideia validada, chegou a hora de escopar. Qual é o Produto Mínimo Viável (MVP)? Defina o que entra e o que sai, calcule prazos, orçamentos e defina a arquitetura técnica base.",
    subItems: ["Roadmap do Produto (Product Roadmap)", "Priorização de Funcionalidades (Feature Prioritization)", "Escopo do MVP (MVP Scope)", "Stack Tecnológico (Tech Stack)", "Plano de Desenvolvimento (Development Plan)"],
    dataPlanner: {
      text: "O Data-Planner domina essa fase. Utilize a aba 'Planejamento' para Orçamentar o projeto, definir prazos usando a Tríade de Ferro e simular o MRR.",
      btnText: "Fazer Orçamento (Tríade)", route: "/dashboard/planning"
    },
    externalTools: {
      text: "Para fluxogramas visuais e diagramas de arquitetura de banco de dados complexos, conecte-se com lousas digitais infinitas:",
      tools: ["Miro", "Whimsical", "Draw.io"]
    }
  },
  {
    id: 4, phase: "Design", icon: "PenTool", color: "var(--alert-red)",
    description: "O design dita a usabilidade e a confiança. Antes do código, desenhe as telas (Wireframes), planeje o caminho do usuário (UX Flows) e crie um protótipo clicável. Evita retrabalho severo no desenvolvimento.",
    subItems: ["Wireframes", "Design de Interface (UI Design)", "Fluxos de Usuário (UX Flows)", "Protótipos (Prototype)", "Design System"],
    dataPlanner: {
      text: "Guarde os arquivos vetoriais pesados, logotipos e referências visuais da equipe de forma organizada e centralizada no Cloud Vault.",
      btnText: "Acessar Cloud Vault", route: "/dashboard/storage"
    },
    externalTools: {
      text: "O Data-Planner gere as tarefas, mas para desenhar telas e criar os protótipos navegáveis padrão do mercado, utilize as suítes de UI:",
      tools: ["Figma", "Canva", "Adobe XD"]
    }
  },
  {
    id: 5, phase: "Desenvolvimento (Development)", icon: "CodeSquare", color: "var(--neon-green)",
    description: "A construção de fato. Divisão rigorosa entre a lógica de servidor, banco de dados e a interface visual. Requer gestão estrita de tarefas para os desenvolvedores não perderem o foco do MVP.",
    subItems: ["Frontend", "Backend", "APIs", "Banco de Dados (Database)", "Autenticação (Authentication)", "Integrações (Integrations)"],
    dataPlanner: {
      text: "Sua guerra acontece aqui. Cadastre 100% das demandas técnicas, bugs e novas features no Kanban, atribuindo prazos e responsáveis claros.",
      btnText: "Painel Ágil (Kanban)", route: "/dashboard/kanban"
    },
    externalTools: {
      text: "Para codificação pura, repositório de código fonte e provedores de backend (BaaS):",
      tools: ["VS Code / Cursor", "GitHub", "Supabase"]
    }
  },
  {
    id: 6, phase: "Infraestrutura (Infrastructure)", icon: "Server", color: "var(--cyber-blue)",
    description: "Onde seu código vai morar. A nuvem. Configuração de servidores, integração contínua (CI/CD) para atualizações automáticas e garantia de que o banco de dados tem backups e segurança.",
    subItems: ["Hospedagem em Nuvem (Cloud Hosting)", "DevOps", "CI/CD", "Monitoramento (Monitoring)", "Segurança (Security)"],
    dataPlanner: {
      text: "A infraestrutura em nuvem queima muito caixa mensalmente. Registre todo custo de hospedagem no seu Livro Caixa para controlar a queima de capital.",
      btnText: "Auditoria Financeira", route: "/dashboard/financial"
    },
    externalTools: {
      text: "Alojamento moderno, robusto e escalável para aplicações e sites:",
      tools: ["Vercel", "AWS (Amazon Web Services)", "Cloudflare"]
    }
  },
  {
    id: 7, phase: "Testes (Testing)", icon: "Bug", color: "var(--alert-yellow)",
    description: "Um software quebra. O objetivo é quebrar antes do cliente ver. Testes de estresse, validação das regras de negócios e liberação para um grupo pequeno (Beta Testers) encontrar falhas que a equipe deixou passar.",
    subItems: ["Testes Unitários (Unit Testing)", "Testes de Integração (Integration Testing)", "Correção de Bugs (Bug Fixing)", "Testes de Performance", "Testes Beta (Beta Testing)"],
    dataPlanner: {
      text: "Encontrou um erro de integração? Abra imediatamente um card de 'Alta Prioridade' (Fogo) no painel de Demandas para os Devs mitigarem.",
      btnText: "Painel Ágil (Kanban)", route: "/dashboard/kanban"
    },
    externalTools: {
      text: "Sistemas para testes automatizados de código e monitoramento de API:",
      tools: ["Postman", "Jest", "Cypress"]
    }
  },
  {
    id: 8, phase: "Lançamento (Launch)", icon: "Rocket", color: "var(--neon-purple)",
    description: "Hora de mostrar o produto ao mundo. O lançamento oficial exige barulho. Campanhas coordenadas, convite aos usuários da lista de espera e caça brutal aos primeiros pagantes (Early Adopters).",
    subItems: ["Página de Lançamento (Landing Page)", "Product Hunt", "Usuários Beta (Beta Users)", "Early Adopters", "Lançamento Público (Public Release)"],
    dataPlanner: {
      text: "É aqui que os parceiros vão pedir os dados da sua empresa. Use o Data Room para baixar o seu 'One-Pager Público' e mandar em anexo nas campanhas.",
      btnText: "Baixar One-Pager", route: "/dashboard/dataroom"
    },
    externalTools: {
      text: "Para gerar visibilidade massiva e tráfego orgânico no dia 1:",
      tools: ["Product Hunt", "LinkedIn", "X (Twitter)"]
    }
  },
  {
    id: 9, phase: "Aquisição (Acquisition)", icon: "Magnet", color: "var(--neon-green)",
    description: "Não dependa de sorte. Crie uma máquina de tráfego. Como as pessoas encontram seu site? Estratégias orgânicas (SEO) e ativas (Cold Email, Influenciadores) para colocar gente na porta da sua loja.",
    subItems: ["Vitórias em SEO (SEO Wins)", "Marketing de Conteúdo", "Mídias Sociais", "E-mail Frio (Cold Email)", "Abordagem a Influenciadores", "Marketing de Afiliados"],
    dataPlanner: {
      text: "Mapeou um novo canal de vendas? Atualize a caixa 'Canais de Aquisição' no seu Lean Canvas para a equipe inteira focar no mesmo alvo.",
      btnText: "Atualizar Estratégia", route: "/dashboard/planning"
    },
    externalTools: {
      text: "Plataformas de pesquisa de palavras-chave, extração de contatos e disparo em massa:",
      tools: ["Apollo.io", "Ahrefs", "Instantly"]
    }
  },
  {
    id: 10, phase: "Distribuição (Distribution)", icon: "Network", color: "var(--cyber-blue)",
    description: "Multiplique seu alcance colocando seu software nas prateleiras dos outros. Diretórios de SaaS, integrações oficiais com ferramentas maiores ou fechamento de parcerias estratégicas B2B.",
    subItems: ["Diretórios (Directories)", "Marketplaces de SaaS", "Comunidades (Communities)", "Parcerias (Partnerships)", "Integrações Estratégicas"],
    dataPlanner: {
      text: "Defina marcos de parcerias na aba 'Marcos Históricos (Timeline)' em Configurações, para garantir que as integrações saiam na data correta.",
      btnText: "Definir Marcos (Timeline)", route: "/dashboard/infoprofile"
    },
    externalTools: {
      text: "Onde encontrar e dominar ecossistemas de distribuição tecnológica:",
      tools: ["G2", "Capterra", "Reddit / Discord Communities"]
    }
  },
  {
    id: 11, phase: "Conversão (Conversion)", icon: "Filter", color: "var(--alert-yellow)",
    description: "A pessoa visitou o site. E agora? Ela precisa passar o cartão. Essa fase otimiza o Funil de Vendas, refina a página de pagamento (Checkout) e testa a melhor forma de ofertar seu sistema (Free Trial ou Freemium).",
    subItems: ["Funil de Vendas (Sales Funnel)", "Teste Grátis (Free Trial)", "Modelo Freemium", "Estratégia de Preço", "Otimização de Checkout"],
    dataPlanner: {
      text: "Cuidado com o 'Ticket'. Simule na calculadora de MRR qual Ticket Médio você precisa cobrar no Checkout para a startup não quebrar.",
      btnText: "Simular Ticket (MRR)", route: "/dashboard/planning"
    },
    externalTools: {
      text: "As melhores gateways de pagamentos e checkouts de altíssima conversão do mercado:",
      tools: ["Stripe", "Hotmart", "Paddle"]
    }
  },
  {
    id: 12, phase: "Receita (Revenue)", icon: "DollarSign", color: "var(--neon-purple)",
    description: "Caixa é Rei! A empresa começou a capturar valor em formato de dinheiro recorrente. Estratégias para vender pacotes anuais, vender adicionais para os mesmos clientes (Upsells) e fechar contratos gigantes (Enterprise).",
    subItems: ["Assinaturas (Subscriptions)", "Vendas Adicionais (Upsells)", "Add-ons", "Planos Anuais (Annual Plans)", "Contratos Enterprise (Deals)"],
    dataPlanner: {
      text: "Acompanhe todo o dinheiro que está entrando pelo painel de Controle Financeiro. Lá você tem a visão de Lucro Real x Gasto em tempo real.",
      btnText: "Ir para Controle Financeiro", route: "/dashboard/financial"
    },
    externalTools: {
      text: "Ferramentas de assinatura, emissão de NFs e gestão de faturas complexas:",
      tools: ["Stripe Billing", "Chargebee", "Conta Azul"]
    }
  },
  {
    id: 13, phase: "Analytics", icon: "LineChart", color: "var(--cyber-blue)",
    description: "Decisões baseadas em achismos matam a empresa. Analytics significa observar o comportamento oculto do usuário. Onde eles clicam? Por que eles abandonam a tela? Testes A/B para descobrir qual cor ou texto vende mais.",
    subItems: ["Rastreamento de Usuário", "Análise de Funil (Funnel Analysis)", "Análise de Coorte (Cohort)", "Painel de KPIs", "Teste A/B (A/B Testing)"],
    dataPlanner: {
      text: "O Dashboard principal do Data-Planner já centraliza seus KPIs operacionais macro de forma automática no Overview.",
      btnText: "Ver Dashboard Geral", route: "/dashboard/overview"
    },
    externalTools: {
      text: "O Data-Planner foca na operação interna. Para espionar pixels e funis complexos do comportamento do seu cliente, utilize:",
      tools: ["Google Analytics 4", "PostHog", "Mixpanel"]
    }
  },
  {
    id: 14, phase: "Retenção (Retention)", icon: "HeartHandshake", color: "var(--alert-red)",
    description: "Vender é bom, mas o cliente continuar pagando é o que sustenta um SaaS. Combata o cancelamento (Churn) com um suporte impecável, e-mails automatizados e educando o cliente a usar a ferramenta desde o primeiro dia (Onboarding).",
    subItems: ["Onboarding de Usuário", "Automação de E-mail", "Suporte ao Cliente (Support)", "Adoção de Features", "Redução de Churn"],
    dataPlanner: {
      text: "O suporte encontrou um bug grave que afeta a retenção? Direcione imediatamente para o Kanban e cobre o Dev responsável para consertar.",
      btnText: "Abrir Kanban de Demandas", route: "/dashboard/kanban"
    },
    externalTools: {
      text: "Ferramentas focadas em disparo de réguas de relacionamento e tickets de atendimento ao consumidor:",
      tools: ["Intercom", "Zendesk", "ActiveCampaign"]
    }
  },
  {
    id: 15, phase: "Crescimento (Growth)", icon: "TrendingUp", color: "var(--neon-green)",
    description: "Aceleração exponencial. Crie incentivos para que seu cliente chame novos clientes (Programas de Indicação e Loops Virais). Construa uma comunidade em volta da sua marca. A ferramenta passa a crescer 'sozinha' (Product Led Growth).",
    subItems: ["Programas de Indicação (Referral)", "Construção de Comunidade", "Crescimento Liderado pelo Produto (PLG)", "Loops Virais", "Estratégia de Expansão"],
    dataPlanner: {
      text: "Se a estratégia deu certo, documente o padrão na Wiki de Perfil para toda a equipe de vendas copiar a operação.",
      btnText: "Documentar Estratégia na Wiki", route: "/dashboard/infoprofile"
    },
    externalTools: {
      text: "Para gerar links de afiliação e premiar promotores do seu SaaS de forma escalável:",
      tools: ["Rewardful", "PartnerStack"]
    }
  },
  {
    id: 16, phase: "Escala (Scaling)", icon: "Maximize", color: "var(--neon-purple)",
    description: "Seu sistema não depende mais só de você. Automatize processos manuais, contrate executivos fortes, consolide sistemas empresariais, expanda para outros países ou prepare a empresa para uma fusão/venda milionária (Exit).",
    subItems: ["Automação (Automation)", "Contratações (Hiring)", "Sistemas Complexos (Systems)", "Expansão Global", "Estratégia de Saída (Exit Strategy)"],
    dataPlanner: {
      text: "Ao escalar, novos líderes entrarão. Convide-os no Painel de Perfil e crie Workspaces separados no Storage para manter os diretores organizados.",
      btnText: "Gerenciar Equipe / Acessos", route: "/dashboard/infoprofile"
    },
    externalTools: {
      text: "Para integrar dezenas de plataformas sem código e automatizar contratações internacionais:",
      tools: ["Zapier / Make", "Deel", "LinkedIn Talent Solutions"]
    }
  }
];