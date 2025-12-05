import { supabase } from './supabaseClient';

export const authService = {
  // --- CADASTRO (Mantido igual, mas garantindo que o logoUrl seja salvo) ---
  async registerStartup({ email, password, companyName, cnpj, ceoName, logoFile }) {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (authError) throw authError;
      if (!authData.user) throw new Error("Erro ao criar usuário no Auth.");

      const userId = authData.user.id;
      let logoUrl = null;

      // Upload Logo
      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile);

        if (!uploadError) {
          const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
          logoUrl = urlData.publicUrl;
        }
      }

      // Cria Startup
      const { data: startupData, error: startupError } = await supabase
        .from('startups')
        .insert([{ 
            name: companyName, 
            cnpj: cnpj, 
            owner_id: userId,
            logo_url: logoUrl 
        }])
        .select()
        .single();

      if (startupError) throw startupError;

      // Atualiza Profile
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: ceoName,
          role: 'CEO',
          startup_id: startupData.id,
          is_active: true
        })
        .eq('id', userId);

      if (profileError) throw profileError;

      return { user: authData.user, startup: startupData };

    } catch (error) {
      console.error("Erro crítico no cadastro:", error);
      throw error;
    }
  },

  // --- LOGIN (ATUALIZADO PARA PUXAR LOGO E CNPJ) ---
  async login({ email, password }) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      // Busca perfil + DADOS DA STARTUP
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select(`
          id, full_name, role, startup_id,
          startups (name, logo_url, cnpj)
        `)
        .eq('id', data.user.id)
        .single();

      if (profileError) console.warn("Erro ao buscar perfil", profileError);

      // Salva TUDO no localStorage para a Navbar usar
      const sessionData = {
        name: profileData?.full_name,
        role: profileData?.role,
        startup_id: profileData?.startup_id,
        startupName: profileData?.startups?.name,
        startupCnpj: profileData?.startups?.cnpj,    // <--- Salva CNPJ
        startupLogo: profileData?.startups?.logo_url // <--- Salva Logo
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