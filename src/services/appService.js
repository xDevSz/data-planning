import { supabase } from './supabaseClient';
import { authService } from './authService';

export const appService = {
  _getStartupId() {
    const id = authService.getStartupId();
    if (!id) throw new Error("ID da Startup não encontrado. Faça login novamente.");
    return id;
  },

  // --- 1. OVERVIEW (Busca tudo de uma vez) ---
  async getFullOverview() {
    const startupId = this._getStartupId();
    
    // Busca Paralela otimizada
    const [
      { data: projects },
      { data: demands },
      { data: transactions },
      { data: meetings },
      { data: ideas },
      { data: profiles } // Mudado de count para data para pegar membros reais
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('startup_id', startupId),
      supabase.from('demands').select('*, profiles(full_name), projects(title)').eq('startup_id', startupId).order('due_date', { ascending: true }),
      supabase.from('transactions').select('*').eq('startup_id', startupId).order('created_at', { ascending: false }),
      supabase.from('meetings').select('*').eq('startup_id', startupId).gte('meeting_date', new Date().toISOString()).order('meeting_date', { ascending: true }),
      supabase.from('ideas').select('*').eq('startup_id', startupId).eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, role').eq('startup_id', startupId)
    ]);

    // --- CÁLCULOS FINANCEIROS CORRIGIDOS ---
    const totalBudget = projects?.reduce((acc, p) => acc + (p.budget_estimated || 0), 0) || 0;
    
    // 1. Soma Despesas
    const spentTotal = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0;
    
    // 2. Soma Receitas
    const incomeTotal = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 0;
    
    // 3. Cálculo ROI Real: (Lucro / Custo) * 100
    let roi = 0;
    if (spentTotal > 0) {
        roi = ((incomeTotal - spentTotal) / spentTotal) * 100;
    }

    return {
      kpis: {
        budgetTotal: totalBudget,
        spentTotal: spentTotal,
        incomeTotal: incomeTotal, 
        burnRate: totalBudget > 0 ? ((spentTotal / totalBudget) * 100).toFixed(1) : 0,
        roiProjected: roi.toFixed(1),
        teamCount: profiles?.length || 1
      },
      projects: projects || [],
      demands: demands || [],
      meetings: meetings || [],
      ideas: ideas || [],
      transactions: transactions || [],
      profiles: profiles || []
    };
  },

  // --- 2. PLANEJAMENTO & PROJETOS ---
  async getProjects() {
    const startupId = this._getStartupId();
    const { data } = await supabase.from('projects').select('*').eq('startup_id', startupId).order('created_at', { ascending: false });
    return data || [];
  },

  async createProjectWithDemands(projectData, initialDemands) {
    const startupId = this._getStartupId();
    
    // 1. Cria Projeto
    const { data: project, error: projError } = await supabase
      .from('projects')
      .insert([{ ...projectData, startup_id: startupId, status: 'active', budget_spent: 0 }])
      .select().single();
    
    if (projError) throw projError;

    // 2. Cria Demandas Iniciais
    if (initialDemands && initialDemands.length > 0) {
      const demandsToInsert = initialDemands.map(d => ({
        project_id: project.id,
        startup_id: startupId,
        title: d.title,
        status: 'todo',
        priority: 'medium'
      }));
      await supabase.from('demands').insert(demandsToInsert);
    }
    return project;
  },

  async updateProject(projectId, updates) {
    return await supabase.from('projects').update(updates).eq('id', projectId);
  },

  async deleteProject(projectId) {
    return await supabase.from('projects').delete().eq('id', projectId);
  },

  // --- 3. DEMANDAS (KANBAN) ---
  async getDemands(projectId) {
    const startupId = this._getStartupId();
    let query = supabase.from('demands').select('*, profiles(full_name), projects(title)').eq('startup_id', startupId);
    if (projectId) query = query.eq('project_id', projectId);
    const { data } = await query;
    return data || [];
  },

  async createDemand(data) {
    const startupId = this._getStartupId();
    return await supabase.from('demands').insert([{ ...data, startup_id: startupId }]);
  },

  async updateDemandStatus(id, status) {
    return await supabase.from('demands').update({ status }).eq('id', id);
  },
  
  async updateDemand(id, updates) {
    return await supabase.from('demands').update(updates).eq('id', id);
  },

  async deleteDemand(id) {
    return await supabase.from('demands').delete().eq('id', id);
  },

  // --- 4. FINANCEIRO ---
  async createTransaction(data) {
    const startupId = this._getStartupId();
    return await supabase.from('transactions').insert([{ ...data, startup_id: startupId }]);
  },

  async deleteTransaction(id) {
    return await supabase.from('transactions').delete().eq('id', id);
  },

  // --- 5. OUTROS (Reuniões e Ideias) ---
  async createMeeting(data) {
    const startupId = this._getStartupId();
    return await supabase.from('meetings').insert([{ ...data, startup_id: startupId }]);
  },

  async deleteMeeting(id) {
    return await supabase.from('meetings').delete().eq('id', id);
  },

  async createIdea(content, authorName) {
    const startupId = this._getStartupId();
    return await supabase.from('ideas').insert([{ 
      content, 
      author_name: authorName, 
      startup_id: startupId,
      status: 'pending' 
    }]);
  },

  async updateIdeaStatus(id, status) {
    return await supabase.from('ideas').update({ status }).eq('id', id);
  },

  // --- STORAGE (ARQUIVOS) ---
  
  // 1. Listar Arquivos (com filtro de pasta)
  async getFiles(parentId = null) {
    const startupId = this._getStartupId();
    
    let query = supabase
      .from('storage_files')
      .select('*')
      .eq('startup_id', startupId)
      .order('is_folder', { ascending: false }) // Pastas primeiro
      .order('name', { ascending: true });      // Ordem alfabética

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null); // Raiz (onde parent_id é vazio)
    }

    const { data, error } = await query;
    if (error) console.error("Erro ao buscar arquivos:", error);
    return data || [];
  },

  // 2. Criar Pasta
  async createFolder(name, parentId = null) {
    const startupId = this._getStartupId();
    return await supabase.from('storage_files').insert([{
      startup_id: startupId,
      parent_id: parentId,
      name: name,
      is_folder: true,
      file_type: 'folder',
      size_text: '-'
    }]);
  },

// 3. Upload de Arquivo Real (COM LIMPEZA DE NOME ROBUSTA)
  async uploadFile(fileObj, parentId = null) {
    const startupId = this._getStartupId();
    
    // --- SANITIZAÇÃO (LIMPEZA) DO NOME ---
    // 1. Remove acentos (Ex: "Ação" -> "Acao")
    const nomeSemAcento = fileObj.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    
    // 2. Remove espaços e caracteres especiais (Parenteses, %, etc), mantendo apenas letras, numeros, ponto, traço e underline
    const nomeLimpo = nomeSemAcento.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    // 3. Monta o caminho final
    const filePath = `${startupId}/${Date.now()}-${nomeLimpo}`;
    
    console.log("Tentando subir:", filePath); // Log para debug

    // A. Envia para o Storage
    const { error: uploadError } = await supabase.storage
      .from('startup_files') 
      .upload(filePath, fileObj, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileObj.type // Importante para PDF
      });

    if (uploadError) {
        console.error("Erro detalhado do Supabase:", uploadError);
        throw uploadError;
    }

    // B. Pega a URL Pública
    const { data: urlData } = supabase.storage
      .from('startup_files')
      .getPublicUrl(filePath);

    // C. Detecta tipo de arquivo para o ícone (Visual)
    let type = 'other';
    const nameLower = fileObj.name.toLowerCase(); // Usa o nome original para detectar tipo
    
    if (nameLower.endsWith('.pdf')) type = 'pdf';
    else if (nameLower.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) type = 'image';
    else if (nameLower.match(/\.(mp4|mov|avi|mkv)$/)) type = 'video';
    else if (nameLower.match(/\.(zip|rar|7z|tar)$/)) type = 'zip';
    else if (nameLower.match(/\.(js|jsx|css|html|json|ts|sql)$/)) type = 'code';
    else if (nameLower.match(/\.(xlsx|csv|pbix|docx|pptx)$/)) type = 'bi';

    const sizeMB = (fileObj.size / 1024 / 1024).toFixed(2) + ' MB';

    // D. Salva metadados no Banco de Dados (Salvamos o nome ORIGINAL para o usuário ver bonito, mas a URL aponta para o nome limpo)
    return await supabase.from('storage_files').insert([{
      startup_id: startupId,
      parent_id: parentId,
      name: fileObj.name, // <--- Aqui salvamos "Apresentação.pdf" (Bonito)
      is_folder: false,
      file_url: urlData.publicUrl, // <--- Aqui o link é "Apresentacao.pdf" (Funcional)
      file_type: type,
      size_text: sizeMB
    }]);
  },

  // 4. Excluir Arquivo ou Pasta
  async deleteFile(fileId, fileUrl, isFolder) {
    // Se for arquivo, tenta apagar do Bucket primeiro
    if (!isFolder && fileUrl) {
      try {
        // Extrai o caminho relativo da URL: ".../startup_files/UUID/arquivo.pdf" -> "UUID/arquivo.pdf"
        const path = fileUrl.split('/startup_files/')[1]; 
        if (path) {
          await supabase.storage.from('startup_files').remove([path]);
        }
      } catch (e) {
        console.warn("Erro ao apagar do bucket, removendo apenas do banco.", e);
      }
    }
    // Remove registro do banco
    return await supabase.from('storage_files').delete().eq('id', fileId);
  }


};