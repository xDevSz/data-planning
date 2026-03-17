import { supabase } from './supabaseClient';

interface RegisterParams {
  email: string;
  password?: string;
  companyName: string;
  cnpj: string;
  ceoName: string;
  cnae?: string;
  address?: string;
  legalStatus?: string;
  logoFile?: File | null;
}

export const authService = {
  
  async checkCnpjExists(cnpj: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('startups')
      .select('id')
      .eq('cnpj', cnpj)
      .maybeSingle();
      
    if (error && error.code !== 'PGRST116') {
        console.error("Erro ao verificar CNPJ:", error);
    }
    return !!data;
  },

  async registerStartup(params: RegisterParams) {
    try {
      // 1. Pré-checagem: O CNPJ já existe?
      if (params.cnpj) {
        const cnpjExists = await this.checkCnpjExists(params.cnpj);
        if (cnpjExists) {
            throw new Error("CNPJ_EXISTS");
        }
      }

      // 2. Criação do Usuário no Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: params.email,
        password: params.password || '', // Pode ser gerada aleatoriamente se for invite
      });

      if (authError) {
          if (authError.message.includes('User already registered')) {
              throw new Error("EMAIL_EXISTS");
          }
          throw authError;
      }
      
      if (!authData.user) throw new Error("Erro desconhecido ao criar usuário.");

      const userId = authData.user.id;
      let logoUrl = null;

      // 3. Upload da Logo (Opcional)
      if (params.logoFile) {
        const fileExt = params.logoFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, params.logoFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
          logoUrl = urlData.publicUrl;
        }
      }

      // 4. Inserção na tabela Startups (com os dados novos)
      const { data: startupData, error: startupError } = await supabase
        .from('startups')
        .insert([{ 
            name: params.companyName, 
            cnpj: params.cnpj, 
            owner_id: userId,
            logo_url: logoUrl,
            cnae: params.cnae,
            address: params.address,
            legal_status: params.legalStatus
        }])
        .select()
        .single();

      if (startupError) {
          // Fallback caso a checagem paralela falhe e o banco acuse unique constraint
          if (startupError.code === '23505') throw new Error("CNPJ_EXISTS");
          throw startupError;
      }

      // 5. Atualização do Profile do Usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: params.ceoName,
          role: 'CEO',
          startup_id: startupData.id,
          is_active: true
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { user: authData.user, startup: startupData };

    } catch (error: any) {
      console.error("[Backend] Erro no registro:", error);
      throw error;
    }
  },

  async login({ email, password }: any) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Busca perfil + DADOS EXTRAS DA STARTUP
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, full_name, role, startup_id,
          startups (name, logo_url, cnpj, cnae, address, legal_status)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) console.warn("Erro ao buscar perfil", profileError);

      const startup = Array.isArray(profileData?.startups) ? profileData?.startups[0] : profileData?.startups;

      // Salva no LocalStorage para a Aplicação consumir
      const sessionData = {
        name: profileData?.full_name,
        role: profileData?.role,
        startup_id: profileData?.startup_id,
        startupName: startup?.name,
        startupCnpj: startup?.cnpj,
        startupLogo: startup?.logo_url,
        startupCnae: startup?.cnae,
        startupAddress: startup?.address,
        startupStatus: startup?.legal_status
      };

      localStorage.setItem('user_data', JSON.stringify(sessionData));

      return { session: data.session, user: data.user, profile: sessionData };

    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  getStartupId() {
    const data = localStorage.getItem('user_data');
    if (!data) return null;
    return JSON.parse(data).startup_id;
  }
};