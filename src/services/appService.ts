import { supabase } from './supabaseClient';
import { authService } from './authService';

// ============================================================================
// INTERFACES (Tipagens)
// ============================================================================
export interface KPIStats {
  budgetTotal: number;
  spentTotal: number;
  incomeTotal: number;
  burnRate: string | number;
  roiProjected: string | number;
  teamCount: number;
}

export interface OverviewData {
  kpis: KPIStats;
  projects: any[];
  demands: any[];
  meetings: any[];
  ideas: any[];
  transactions: any[];
  profiles: any[];
}

export interface ProfileData {
  user: any;
  team: any[];
  notes: any[];
  milestones: any[];
}

// ============================================================================
// APP SERVICE
// ============================================================================
export const appService = {
  
  _getStartupId(): string {
    const id = authService.getStartupId();
    if (!id) throw new Error("Sessão expirada. Por favor, faça login novamente.");
    return id;
  },

  // --- 1. OVERVIEW (DASHBOARD PRINCIPAL) ---
  async getFullOverview(): Promise<OverviewData> {
    const startupId = this._getStartupId();
    
    console.log('%c[DATA-PLANNER] Buscando dados consolidados do Overview...', 'color: #00e5ff;');

    // Busca Paralela Otimizada
    const [
      { data: projects },
      { data: demands },
      { data: transactions },
      { data: meetings },
      { data: ideas },
      { data: profiles }
    ] = await Promise.all([
      supabase.from('projects').select('*').eq('startup_id', startupId),
      supabase.from('demands').select('*, profiles(full_name), projects(title)').eq('startup_id', startupId).order('due_date', { ascending: true }),
      supabase.from('transactions').select('*').eq('startup_id', startupId).order('created_at', { ascending: false }),
      supabase.from('meetings').select('*').eq('startup_id', startupId).gte('meeting_date', new Date().toISOString()).order('meeting_date', { ascending: true }),
      supabase.from('ideas').select('*').eq('startup_id', startupId).eq('status', 'pending').order('created_at', { ascending: false }),
      supabase.from('profiles').select('id, full_name, role').eq('startup_id', startupId)
    ]);

    // --- CÁLCULOS FINANCEIROS ROBUSTOS ---
    const totalBudget = projects?.reduce((acc, p) => acc + (p.budget_estimated || 0), 0) || 0;
    
    // Soma Despesas
    const spentTotal = transactions?.filter(t => t.type === 'expense').reduce((acc, t) => acc + t.amount, 0) || 0;
    
    // Soma Receitas
    const incomeTotal = transactions?.filter(t => t.type === 'income').reduce((acc, t) => acc + t.amount, 0) || 0;
    
    // Cálculo ROI Real: (Lucro Líquido / Custo) * 100
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
  async getProjects(): Promise<any[]> {
    const startupId = this._getStartupId();
    const { data } = await supabase.from('projects').select('*').eq('startup_id', startupId).order('created_at', { ascending: false });
    return data || [];
  },

  async createProjectWithDemands(projectData: any, initialDemands: any[]): Promise<any> {
    const startupId = this._getStartupId();
    
    const { data: project, error: projError } = await supabase
      .from('projects')
      .insert([{ ...projectData, startup_id: startupId, status: 'active', budget_spent: 0 }])
      .select().single();
    
    if (projError) throw projError;

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

  async updateProject(projectId: string, updates: any) {
    const { error } = await supabase.from('projects').update(updates).eq('id', projectId);
    if (error) throw error;
  },

  async deleteProject(projectId: string) {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);
    if (error) throw error;
  },

  // --- 3. DEMANDAS (KANBAN) ---
  async getDemands(projectId?: string): Promise<any[]> {
    const startupId = this._getStartupId();
    let query = supabase.from('demands').select('*, profiles(full_name), projects(title)').eq('startup_id', startupId);
    
    if (projectId) {
        query = query.eq('project_id', projectId);
    }
    
    const { data } = await query;
    return data || [];
  },

  async createDemand(data: any) {
    const startupId = this._getStartupId();
    const { error } = await supabase.from('demands').insert([{ ...data, startup_id: startupId }]);
    if (error) throw error;
  },

  async updateDemandStatus(id: string, status: string) {
    const { error } = await supabase.from('demands').update({ status }).eq('id', id);
    if (error) throw error;
  },
  
  async updateDemand(id: string, updates: any) {
    const { error } = await supabase.from('demands').update(updates).eq('id', id);
    if (error) throw error;
  },

  async deleteDemand(id: string) {
    const { error } = await supabase.from('demands').delete().eq('id', id);
    if (error) throw error;
  },


  // --- 4. FINANCEIRO ---
  async createTransaction(data: any) {
    const startupId = this._getStartupId();
    const { error } = await supabase.from('transactions').insert([{ ...data, startup_id: startupId }]);
    if (error) throw error;
  },

  async deleteTransaction(id: string) {
    const { error } = await supabase.from('transactions').delete().eq('id', id);
    if (error) throw error;
  },

  // --- 5. OUTROS (Reuniões e Ideias) ---
  async createMeeting(data: any) {
    const startupId = this._getStartupId();
    const { error } = await supabase.from('meetings').insert([{ ...data, startup_id: startupId }]);
    if (error) throw error;
  },

  async deleteMeeting(id: string) {
    const { error } = await supabase.from('meetings').delete().eq('id', id);
    if (error) throw error;
  },

  async createIdea(content: string, authorName: string) {
    const startupId = this._getStartupId();
    const { error } = await supabase.from('ideas').insert([{ 
      content, 
      author_name: authorName, 
      startup_id: startupId,
      status: 'pending' 
    }]);
    if (error) throw error;
  },

  async updateIdeaStatus(id: string, status: string) {
    const { error } = await supabase.from('ideas').update({ status }).eq('id', id);
    if (error) throw error;
  },

  // --- 6. STORAGE (ARQUIVOS) ---
  async getFiles(parentId: string | null = null): Promise<any[]> {
    const startupId = this._getStartupId();
    
    let query = supabase
      .from('storage_files')
      .select('*')
      .eq('startup_id', startupId)
      .order('is_folder', { ascending: false })
      .order('name', { ascending: true });

    if (parentId) {
      query = query.eq('parent_id', parentId);
    } else {
      query = query.is('parent_id', null);
    }

    const { data, error } = await query;
    if (error) console.error("Erro ao buscar arquivos:", error);
    return data || [];
  },

  async createFolder(name: string, parentId: string | null = null) {
    const startupId = this._getStartupId();
    const { error } = await supabase.from('storage_files').insert([{
      startup_id: startupId,
      parent_id: parentId,
      name: name,
      is_folder: true,
      file_type: 'folder',
      size_text: '-'
    }]);
    if (error) throw error;
  },

  async uploadFile(fileObj: File, parentId: string | null = null) {
    const startupId = this._getStartupId();
    
    // Sanitização de Nome (Remove Acentos e Caracteres Especiais)
    const nomeSemAcento = fileObj.name.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const nomeLimpo = nomeSemAcento.replace(/[^a-zA-Z0-9.\-_]/g, '_');
    
    const filePath = `${startupId}/${Date.now()}-${nomeLimpo}`;
    
    const { error: uploadError } = await supabase.storage
      .from('startup_files') 
      .upload(filePath, fileObj, {
        cacheControl: '3600',
        upsert: false,
        contentType: fileObj.type
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('startup_files').getPublicUrl(filePath);

    // Identificação de Metadados Visuais
    let type = 'other';
    const nameLower = fileObj.name.toLowerCase();
    
    if (nameLower.endsWith('.pdf')) type = 'pdf';
    else if (nameLower.match(/\.(jpg|jpeg|png|gif|svg|webp)$/)) type = 'image';
    else if (nameLower.match(/\.(mp4|mov|avi|mkv)$/)) type = 'video';
    else if (nameLower.match(/\.(zip|rar|7z|tar)$/)) type = 'zip';
    else if (nameLower.match(/\.(js|jsx|css|html|json|ts|sql)$/)) type = 'code';
    else if (nameLower.match(/\.(xlsx|csv|pbix|docx|pptx)$/)) type = 'bi';

    const sizeMB = (fileObj.size / 1024 / 1024).toFixed(2) + ' MB';

    // Salva URL funcional, mas exibe nome bonito no DB
    const { error: dbError } = await supabase.from('storage_files').insert([{
      startup_id: startupId,
      parent_id: parentId,
      name: fileObj.name, 
      is_folder: false,
      file_url: urlData.publicUrl,
      file_type: type,
      size_text: sizeMB
    }]);

    if (dbError) throw dbError;
  },

  async deleteFile(fileId: string, fileUrl: string, isFolder: boolean) {
    if (!isFolder && fileUrl) {
      try {
        const path = fileUrl.split('/startup_files/')[1]; 
        if (path) {
          await supabase.storage.from('startup_files').remove([path]);
        }
      } catch (e) {
        console.warn("Erro ao apagar arquivo no bucket. Removendo apenas registro.", e);
      }
    }
    const { error } = await supabase.from('storage_files').delete().eq('id', fileId);
    if (error) throw error;
  },

  // --- 7. GESTÃO DE PERFIL E EQUIPE ---
  async getProfileData(): Promise<ProfileData> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error("Sessão de usuário não encontrada na Auth API");

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select(`*, startups:startup_id ( name, cnpj, description, logo_url, cnae, legal_status, address )`)
      .eq('id', user.id)
      .single();
    // -----------------------------------------------------------

    if (profileError) throw profileError;
    

    const { data: team } = await supabase
      .from('team_members')
      .select('*')
      .eq('startup_id', profile.startup_id);

    const { data: notes } = await supabase
      .from('wiki_notes')
      .select('*')
      .eq('startup_id', profile.startup_id)
      .order('created_at', { ascending: false });

    const { data: milestones } = await supabase
      .from('milestones')
      .select('*')
      .eq('startup_id', profile.startup_id)
      .order('due_date', { ascending: true });

    return { 
      user: profile, 
      team: team || [], 
      notes: notes || [], 
      milestones: milestones || [] 
    };
  },

  async addTeamMember(memberData: any, startupId: string) {
    const { error } = await supabase.from('team_members').insert([{
      startup_id: startupId,
      name: memberData.name,
      role: memberData.role,
      email: memberData.email
    }]);
    if (error) throw error;
  },

  async deleteMember(memberId: string) {
    const { error } = await supabase.from('team_members').delete().eq('id', memberId);
    if (error) throw error;
  },

  async updateStartupInfo(startupId: string, updates: any) {
    const { error } = await supabase.from('startups').update(updates).eq('id', startupId);
    if (error) throw error;
  },
  
  async updateUserProfile(updates: any) {
    const { data: { user } } = await supabase.auth.getUser();
    if(!user) throw new Error("Usuário não autenticado");
    const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
    if (error) throw error;
  },

  async uploadStartupLogo(file: File, startupId: string): Promise<string> {
    const fileExt = file.name.split('.').pop();
    const fileName = `${startupId}-${Date.now()}.${fileExt}`;
    const filePath = `logos/${fileName}`;
    
    // Certifique-se que o bucket se chama 'logos' no painel do Supabase
    const { error: uploadError } = await supabase.storage.from('logos').upload(filePath, file);
    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from('logos').getPublicUrl(filePath);
    
    await this.updateStartupInfo(startupId, { logo_url: urlData.publicUrl });
    
    return urlData.publicUrl;
  },
  
  async createNote(noteData: any) {
     const { data: { user } } = await supabase.auth.getUser();
     if(!user) throw new Error("Usuário não autenticado");

     const { data: profile } = await supabase.from('profiles').select('startup_id').eq('id', user.id).single();
     if(!profile) throw new Error("Perfil vinculado não encontrado");

     const { error } = await supabase.from('wiki_notes').insert([{ 
         startup_id: profile.startup_id, 
         title: noteData.title, 
         content: noteData.content 
     }]);
     if (error) throw error;
  },

  async deleteNote(id: string) {
    const { error } = await supabase.from('wiki_notes').delete().eq('id', id);
    if (error) throw error;
  },

  async createMilestone(milestoneData: any) {
     const { data: { user } } = await supabase.auth.getUser();
     if(!user) throw new Error("Usuário não autenticado");

     const { data: profile } = await supabase.from('profiles').select('startup_id').eq('id', user.id).single();
     
     const { error } = await supabase.from('milestones').insert([{ 
         startup_id: profile?.startup_id, 
         ...milestoneData 
     }]);
     if (error) throw error;
  },

  async deleteMilestone(id: string) {
    const { error } = await supabase.from('milestones').delete().eq('id', id);
    if (error) throw error;
  },

  

  // --- 8. LEAN CANVAS ---
  async getLeanCanvas(): Promise<any> {
    const startupId = this._getStartupId();
    const { data, error } = await supabase
      .from('lean_canvas')
      .select('*')
      .eq('startup_id', startupId)
      .single();

    // O erro 'PGRST116' significa que não achou nada (startup nova sem canvas), isso é normal e ignoramos.
    if (error && error.code !== 'PGRST116') { 
      console.error("Erro ao buscar Lean Canvas:", error);
    }
    return data;
  },

  async saveLeanCanvas(canvasData: any) {
    const startupId = this._getStartupId();
    
    // Mapeando do padrão camelCase (Frontend) para snake_case (Banco de Dados)
    const payload = {
      startup_id: startupId,
      problem: canvasData.problem,
      solution: canvasData.solution,
      value_prop: canvasData.valueProp,
      advantage: canvasData.advantage,
      segments: canvasData.segments,
      metrics: canvasData.metrics,
      channels: canvasData.channels,
      costs: canvasData.costs,
      revenue: canvasData.revenue,
      updated_at: new Date().toISOString()
    };

    // Upsert: Atualiza se já tiver um Canvas, Insere se for o primeiro
    const { error } = await supabase
      .from('lean_canvas')
      .upsert(payload, { onConflict: 'startup_id' });

    if (error) throw error;
  },


  // --- 9. ZONA DE PERIGO (EXCLUSÃO DE CONTA) ---
  async deleteStartup(): Promise<void> {
    const startupId = this._getStartupId();
    
    // Deleta a startup. Como você configurou "ON DELETE CASCADE" no banco,
    // todas as demandas, projetos, arquivos, etc, serão deletados junto automaticamente!
    const { error } = await supabase
      .from('startups')
      .delete()
      .eq('id', startupId);

    if (error) throw error;
    
    // Limpa o cache do navegador após a exclusão para deslogar o usuário
    localStorage.removeItem('user_data');
    await supabase.auth.signOut();
  },

  async logoutUser() {
    await supabase.auth.signOut();
    localStorage.removeItem('user_data'); // Limpa a sessão do navegador
  },

  // --- 10. DATA ROOM & PITCH PUBLICO ---
  async getStartupPitch(): Promise<any> {
    const startupId = this._getStartupId();
    const { data, error } = await supabase
      .from('pitch_decks')
      .select('*')
      .eq('startup_id', startupId)
      .maybeSingle();

    if (error && error.code !== 'PGRST116') {
      console.error("Erro ao buscar Pitch Deck:", error);
    }
    return data;
  },

  async saveStartupPitch(pitchData: any): Promise<void> {
    const startupId = this._getStartupId();
    const payload = {
      startup_id: startupId,
      elevator_pitch: pitchData.elevatorPitch,
      problem: pitchData.problem,
      solution: pitchData.solution,
      target_market: pitchData.target,
      differential: pitchData.differential,
      updated_at: new Date().toISOString()
    };

    const { error } = await supabase
      .from('pitch_decks')
      .upsert(payload, { onConflict: 'startup_id' });

    if (error) throw error;
  },

  async deleteStartupPitch(): Promise<void> {
    const startupId = this._getStartupId();
    const { error } = await supabase.from('pitch_decks').delete().eq('startup_id', startupId);
    if (error) throw error;
  }

}; // <-- Fim do appService



