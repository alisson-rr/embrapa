import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  Plus,
  ChevronDown,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';

interface Profile {
  user_id: string;
  name: string;
  email: string;
  phone: string;
  is_manager: boolean;
  created_at: string;
  updated_at: string;
}

const PermissionsPage = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('Perfil');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);
  
  // Form data for new user
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // isManager sempre true (removido checkbox)
  });
  
  // Password validations
  const [validations, setValidations] = useState({
    passwordsMatch: false,
    minLength: false,
    hasNumber: false,
    hasUpperCase: false,
  });

  // Menu items da sidebar
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: false },
    { icon: FileText, label: 'Respostas', path: '/form-responses', active: false },
    { icon: Shield, label: 'Permissionamento', path: '/permissions', active: true },
    { icon: Settings, label: 'Configurações', path: '/settings', active: false },
  ];

  // Validar senha em tempo real
  useEffect(() => {
    const { password, confirmPassword } = formData;

    setValidations({
      passwordsMatch: password === confirmPassword && password.length > 0,
      minLength: password.length >= 6,
      hasNumber: /\d/.test(password),
      hasUpperCase: /[A-Z]/.test(password),
    });
  }, [formData.password, formData.confirmPassword]);

  // Carregar profiles com is_manager = true
  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoading(true);
        console.log('🔍 Buscando profiles com is_manager = true...');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('is_manager', true) // Buscar apenas gerenciadores
          .order('created_at', { ascending: false });

        console.log('📊 Resultado da busca:', { data, error });

        if (error) {
          console.error('❌ Erro na query:', error);
          throw error;
        }

        console.log(`✅ Encontrados ${data?.length || 0} gerenciadores`);
        setProfiles(data || []);
        setFilteredProfiles(data || []);
      } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        toast({
          title: 'Erro ao carregar dados',
          description: 'Não foi possível carregar os perfis de gerenciadores',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProfiles();
  }, []); // Removido toast das dependências para evitar loop infinito

  // Filtrar profiles baseado na busca
  useEffect(() => {
    let filtered = profiles;

    if (searchTerm) {
      filtered = profiles.filter(profile =>
        profile.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        profile.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredProfiles(filtered);
    setCurrentPage(1); // Reset para primeira página ao filtrar
  }, [searchTerm, profiles]);

  // Paginação
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentProfiles = filteredProfiles.slice(startIndex, endIndex);

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    
    console.log('🚀 Iniciando criação de usuário...', {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      isManager: true // Sempre true
    });
    
    // Verificar se todas as validações passaram
    const allValid = Object.values(validations).every((v) => v === true);
    if (!allValid) {
      console.log('❌ Validações falharam:', validations);
      toast({
        title: 'Dados inválidos',
        description: 'Por favor, verifique todos os campos e requisitos de senha',
        variant: 'destructive',
      });
      return;
    }

    try {
      setModalLoading(true);
      console.log('⏳ Iniciando processo de criação...');

      // 1. Registrar usuário usando signUp
      console.log('📝 Criando usuário no Supabase Auth...');
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: {
            name: formData.name,
            phone: formData.phone,
          }
        }
      });

      console.log('🔍 Resposta do signUp:', { authData, authError });

      if (authError) {
        console.error('❌ Erro no signUp:', authError);
        throw authError;
      }
      
      if (!authData.user) {
        console.error('❌ Usuário não foi criado');
        throw new Error('Falha ao criar usuário - dados não retornados');
      }

      console.log('✅ Usuário criado com UUID:', authData.user.id);

      // 2. Criar perfil na tabela profiles usando o UUID do usuário criado
      console.log('📝 Criando perfil na tabela profiles...');
      const profileData = {
        user_id: authData.user.id,
        name: formData.name,
        email: formData.email,
        phone: formData.phone || null,
        is_manager: true, // Sempre true para gerenciadores
      };
      
      console.log('📊 Dados do perfil a serem inseridos:', profileData);

      const { data: profileInsertData, error: profileError } = await supabase
        .from('profiles')
        .insert(profileData)
        .select();

      console.log('🔍 Resposta da inserção do perfil:', { profileInsertData, profileError });

      if (profileError) {
        console.error('❌ Erro ao criar perfil:', profileError);
        toast({
          title: 'Erro ao criar perfil',
          description: `Usuário foi criado, mas houve erro no perfil: ${profileError.message}`,
          variant: 'destructive',
        });
        return;
      }

      console.log('✅ Perfil criado com sucesso!');

      // 3. Mostrar mensagem de sucesso
      toast({
        title: 'Usuário criado com sucesso!',
        description: `${formData.name} foi registrado como gerenciador. Email de confirmação enviado para ${formData.email}`,
      });

      console.log('🎉 Processo concluído com sucesso!');

      // 4. Resetar formulário e fechar modal
      console.log('🔄 Resetando formulário e fechando modal...');
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      
      // Fechar modal após pequeno delay para mostrar o toast
      setTimeout(() => {
        setIsModalOpen(false);
        console.log('✅ Modal fechado');
      }, 1000);

      // 5. Recarregar lista de profiles
      console.log('🔄 Recarregando lista de profiles...');
      const { data: updatedProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_manager', true) // Buscar apenas gerenciadores
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('⚠️ Erro ao recarregar profiles:', fetchError);
      } else {
        console.log('✅ Lista atualizada:', updatedProfiles);
        setProfiles(updatedProfiles || []);
        setFilteredProfiles(updatedProfiles || []);
      }

    } catch (error: any) {
      console.error('💥 Erro geral no processo:', error);
      toast({
        title: 'Erro ao criar usuário',
        description: error.message || 'Não foi possível criar o usuário. Verifique o console para mais detalhes.',
        variant: 'destructive',
      });
    } finally {
      setModalLoading(false);
      console.log('🏁 Processo finalizado (loading = false)');
    }
  };

  const handleEditProfile = (profile: Profile) => {
    console.log('✏️ Editando perfil:', profile);
    setEditingProfile(profile);
    setFormData({
      name: profile.name,
      email: profile.email, // Será bloqueado
      phone: profile.phone || '',
      password: '', // Vazio para edição
      confirmPassword: '',
    });
    setIsModalOpen(true);
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!editingProfile) return;
    
    console.log('🔄 Atualizando perfil:', editingProfile.user_id);
    
    try {
      setModalLoading(true);
      
      // Atualizar apenas nome e telefone
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone || null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', editingProfile.user_id);
      
      if (error) throw error;
      
      toast({
        title: 'Perfil atualizado!',
        description: `${formData.name} foi atualizado com sucesso`,
      });
      
      // Fechar modal e resetar
      setIsModalOpen(false);
      setEditingProfile(null);
      setFormData({
        name: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
      });
      
      // Recarregar lista
      const { data: updatedProfiles, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('is_manager', true)
        .order('created_at', { ascending: false });
      
      if (!fetchError) {
        setProfiles(updatedProfiles || []);
        setFilteredProfiles(updatedProfiles || []);
      }
      
    } catch (error: any) {
      console.error('Erro ao atualizar perfil:', error);
      toast({
        title: 'Erro ao atualizar',
        description: error.message || 'Não foi possível atualizar o perfil',
        variant: 'destructive',
      });
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar Desktop */}
      <aside
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white border-r border-gray-200 transition-all duration-300 hidden lg:block`}
      >
        <div className="p-6">
          <div className="flex items-center justify-between mb-8">
            <img
              src="/Logo.png"
              alt="Embrapa"
              className={`${sidebarOpen ? 'h-8' : 'h-6'} transition-all`}
            />
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-gray-400 hover:text-gray-600"
            >
              {sidebarOpen ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
            </button>
          </div>

          <nav className="space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  item.active
                    ? 'bg-[#00703c] text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <item.icon size={20} />
                {sidebarOpen && <span>{item.label}</span>}
              </button>
            ))}
          </nav>

          <div className={`absolute bottom-6 ${sidebarOpen ? 'left-6 right-6' : 'left-3 right-3'}`}>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
            >
              <LogOut size={20} />
              {sidebarOpen && <span>Sair</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Menu Button */}
      <button
        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 bg-white rounded-lg shadow-lg"
      >
        {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Sidebar */}
      {mobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-40 flex">
          <div className="fixed inset-0 bg-black bg-opacity-50" onClick={() => setMobileMenuOpen(false)} />
          <aside className="relative w-64 bg-white">
            <div className="p-6">
              <img src="/Logo.png" alt="Embrapa" className="h-8 mb-8" />

              <nav className="space-y-2">
                {menuItems.map((item) => (
                  <button
                    key={item.path}
                    onClick={() => {
                      navigate(item.path);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-[#00703c] text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <item.icon size={20} />
                    <span>{item.label}</span>
                  </button>
                ))}
              </nav>

              <div className="absolute bottom-6 left-6 right-6">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-3 px-3 py-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <LogOut size={20} />
                  <span>Sair</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold text-gray-800">
              Permissionamento
            </h1>
            <p className="text-gray-600">Gerencie os usuários que têm acesso à plataforma de administradores.</p>
          </div>

          {/* Filters and Search */}
          <div className="bg-white rounded-lg border border-gray-200 p-6 mb-6">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    type="text"
                    placeholder="Pesquisar por nome do perfil"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Filter Dropdown */}
                <div className="relative">
                  <select
                    value={filterType}
                    onChange={(e) => setFilterType(e.target.value)}
                    className="appearance-none bg-white border border-gray-300 rounded-md px-4 py-2 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#00703c] focus:border-transparent"
                  >
                    <option value="Perfil">Filtrar por nome</option>
                    <option value="Gerenciadores">Gerenciadores</option>
                  </select>
                  <ChevronDown className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                </div>

                {/* Removido: Filter Buttons não são mais necessários */}
              </div>

              {/* New Profile Button */}
              <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-[#00703c] hover:bg-[#005a30] text-white">
                    <Plus size={16} className="mr-2" />
                    Novo perfil
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle>{editingProfile ? 'Editar Perfil' : 'Criar Novo Gerenciador'}</DialogTitle>
                    <DialogDescription>
                      {editingProfile 
                        ? 'Edite as informações do perfil. E-mail não pode ser alterado.'
                        : 'Adicione um novo usuário com permissões de gerenciador à plataforma.'
                      }
                    </DialogDescription>
                  </DialogHeader>
                  
                  <form onSubmit={editingProfile ? handleUpdateProfile : handleCreateUser} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          placeholder="Digite o nome completo"
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">E-mail *</Label>
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          placeholder="usuario@embrapa.br"
                          required
                          disabled={!!editingProfile}
                          className={editingProfile ? 'bg-gray-100 cursor-not-allowed' : ''}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="phone">Telefone</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => {
                          // Formatação automática do telefone
                          let value = e.target.value.replace(/\D/g, ''); // Remove tudo que não é número
                          
                          if (value.length <= 11) {
                            // Aplica máscara: (11) 9 9999-9999
                            value = value.replace(/(\d{2})(\d)/, '($1) $2');
                            value = value.replace(/(\d{4})(\d)/, '$1-$2');
                            
                            setFormData({ ...formData, phone: value });
                          }
                        }}
                        placeholder="(11) 9 9999-9999"
                        maxLength={15}
                      />
                    </div>
                    
                    {!editingProfile && (
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="password">Senha *</Label>
                          <Input
                            id="password"
                            type="password"
                            value={formData.password}
                            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            placeholder="••••••••••••••••"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="confirmPassword">Confirmar senha *</Label>
                          <Input
                            id="confirmPassword"
                            type="password"
                            value={formData.confirmPassword}
                            onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                            placeholder="••••••••••••••••"
                            required
                          />
                        </div>
                      </div>
                    )}
                    
                    {/* Validações de senha - apenas para criação */}
                    {!editingProfile && (
                      <div className="space-y-2 text-sm bg-gray-50 p-3 rounded-lg">
                        <p className="font-medium text-gray-700 mb-2">Requisitos da senha:</p>
                        <div className={`flex items-center gap-2 ${validations.passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                          {validations.passwordsMatch ? '✓' : '○'}
                          <span>As senhas são iguais</span>
                        </div>
                        <div className={`flex items-center gap-2 ${validations.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                          {validations.minLength ? '✓' : '○'}
                          <span>Contém no mínimo 6 caracteres</span>
                        </div>
                        <div className={`flex items-center gap-2 ${validations.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                          {validations.hasNumber ? '✓' : '○'}
                          <span>Contém pelo menos 1 número</span>
                        </div>
                        <div className={`flex items-center gap-2 ${validations.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                          {validations.hasUpperCase ? '✓' : '○'}
                          <span>Contém pelo menos uma letra maiúscula</span>
                        </div>
                      </div>
                    )}
                    
                    {/* Removido: texto sobre gerenciador */}
                    
                    <DialogFooter>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsModalOpen(false);
                          setEditingProfile(null);
                          setFormData({
                            name: '',
                            email: '',
                            phone: '',
                            password: '',
                            confirmPassword: '',
                          });
                        }}
                        disabled={modalLoading}
                      >
                        Cancelar
                      </Button>
                      <Button
                        type="submit"
                        className="bg-[#00703c] hover:bg-[#005a30]"
                        disabled={modalLoading || (!editingProfile && !Object.values(validations).every((v) => v))}
                      >
                        {modalLoading 
                          ? (editingProfile ? 'Salvando...' : 'Criando...') 
                          : (editingProfile ? 'Salvar alterações' : 'Criar usuário')
                        }
                      </Button>
                    </DialogFooter>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">
                      Nome
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">
                      E-mail
                    </th>
                    <th className="text-left px-6 py-4 text-sm font-medium text-gray-900">
                      Telefone
                    </th>
                    <th className="text-right px-6 py-4 text-sm font-medium text-gray-900">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Carregando perfis...
                      </td>
                    </tr>
                  ) : currentProfiles.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                        Nenhum perfil de gerenciador encontrado
                      </td>
                    </tr>
                  ) : (
                    currentProfiles.map((profile) => (
                      <tr key={profile.user_id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 text-sm font-medium text-gray-900">
                          {profile.name}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {profile.email}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {profile.phone || '-'}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button 
                              onClick={() => handleEditProfile(profile)}
                              className="p-2 text-gray-400 hover:text-[#00703c] transition-colors"
                            >
                              <Edit size={16} />
                            </button>
                            <button className="p-2 text-gray-400 hover:text-red-600 transition-colors">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!loading && filteredProfiles.length > 0 && (
              <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <span>Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => setItemsPerPage(Number(e.target.value))}
                    className="border border-gray-300 rounded px-2 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-600">
                    Total: {filteredProfiles.length}
                  </span>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                      disabled={currentPage === 1}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft size={16} />
                    </button>

                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                        let pageNum;
                        if (totalPages <= 5) {
                          pageNum = i + 1;
                        } else if (currentPage <= 3) {
                          pageNum = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                          pageNum = totalPages - 4 + i;
                        } else {
                          pageNum = currentPage - 2 + i;
                        }

                        return (
                          <button
                            key={pageNum}
                            onClick={() => setCurrentPage(pageNum)}
                            className={`w-8 h-8 text-sm rounded ${
                              currentPage === pageNum
                                ? 'bg-[#00703c] text-white'
                                : 'text-gray-600 hover:bg-gray-100'
                            }`}
                          >
                            {pageNum}
                          </button>
                        );
                      })}
                    </div>

                    <button
                      onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                      disabled={currentPage === totalPages}
                      className="p-2 text-gray-400 hover:text-gray-600 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default PermissionsPage;
