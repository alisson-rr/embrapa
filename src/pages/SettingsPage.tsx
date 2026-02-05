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
  Eye,
  EyeOff,
  Check,
  Circle,
  UserCircle,
  ChevronLeft,
  ChevronRight,
  CircleAlert
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';

interface ProfileData {
  name: string;
  email: string;
  phone: string;
}

const SettingsPage = () => {
  const navigate = useNavigate();
  const { user, profile, signOut, updatePassword, refreshProfile } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'account' | 'password'>('account');
  const [loading, setLoading] = useState(false);

  // Profile form state
  const [profileData, setProfileData] = useState<ProfileData>({
    name: '',
    email: '',
    phone: '',
  });

  // Password form state
  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: '',
  });
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    { icon: Shield, label: 'Permissionamento', path: '/permissions', active: false },
    { icon: Settings, label: 'Configurações', path: '/settings', active: true },
  ];

  // Carregar perfil do cache quando o componente monta
  useEffect(() => {
    if (profile && profile.name) {
      // Só atualizar se realmente há dados diferentes
      const newData = {
        name: profile.name || '',
        email: profile.email || '',
        phone: profile.phone || '',
      };
      
      // Verificar se os dados realmente mudaram
      if (JSON.stringify(profileData) !== JSON.stringify(newData)) {
        setProfileData(newData);
      }
    }
  }, [profile?.name, profile?.email, profile?.phone]); // Dependências específicas

  // Validar senha em tempo real
  useEffect(() => {
    const { newPassword, confirmPassword } = passwordData;

    setValidations({
      passwordsMatch: newPassword === confirmPassword && newPassword.length > 0,
      minLength: newPassword.length >= 6,
      hasNumber: /\d/.test(newPassword),
      hasUpperCase: /[A-Z]/.test(newPassword),
    });
  }, [passwordData]);


  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);

      const { error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          email: profileData.email,
          phone: profileData.phone,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', user.id);

      if (error) throw error;

      // Atualizar cache do perfil
      await refreshProfile();
      
      toast({
        title: 'Perfil atualizado!',
        description: 'Suas informações foram salvas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar perfil:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Não foi possível salvar suas informações',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    // Verificar se todas as validações passaram
    const allValid = Object.values(validations).every((v) => v === true);
    if (!allValid) {
      toast({
        title: 'Senha inválida',
        description: 'Por favor, atenda a todos os requisitos de senha',
        variant: 'destructive',
      });
      return;
    }

    try {
      setLoading(true);

      const { error } = await updatePassword(passwordData.newPassword);

      if (error) throw error;

      toast({
        title: 'Senha alterada!',
        description: 'Sua senha foi atualizada com sucesso.',
      });

      // Limpar formulário
      setPasswordData({ newPassword: '', confirmPassword: '' });
    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      toast({
        title: 'Erro ao alterar senha',
        description: 'Não foi possível alterar sua senha',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/login');
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

          <div className="absolute bottom-6 left-6 right-6">
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
            <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
            <p className="text-gray-600">Configure o seu perfil</p>
          </div>

          {/* Tabs */}
          <div className="mb-6 border-b border-gray-200">
            <div className="flex gap-4">
              <button
                onClick={() => setActiveTab('account')}
                className={`pb-4 px-4 font-medium transition-colors ${
                  activeTab === 'account'
                    ? 'text-[#00703c] border-b-2 border-[#00703c]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Informações da conta
              </button>
              <button
                onClick={() => setActiveTab('password')}
                className={`pb-4 px-4 font-medium transition-colors ${
                  activeTab === 'password'
                    ? 'text-[#00703c] border-b-2 border-[#00703c]'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Alterar senha
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <Card className="max-w-2xl">
            <CardContent className="pt-6">
              {/* Aba: Informações da conta */}
              {activeTab === 'account' && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nome</Label>
                    <Input
                      id="name"
                      type="text"
                      value={profileData.name}
                      onChange={(e) =>
                        setProfileData({ ...profileData, name: e.target.value })
                      }
                      placeholder="Digite seu nome"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) =>
                        setProfileData({ ...profileData, email: e.target.value })
                      }
                      placeholder="Digite seu e-mail"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="phone">Telefone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileData.phone}
                      onChange={(e) =>
                        setProfileData({ ...profileData, phone: e.target.value })
                      }
                      placeholder="(11) 9 9656-2121"
                    />
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-[#00703c] hover:bg-[#005a30]"
                      disabled={loading}
                    >
                      {loading ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                </form>
              )}

              {/* Aba: Alterar senha */}
              {activeTab === 'password' && (
                <form onSubmit={handleChangePassword} className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">Digite a nova senha</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordData.newPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, newPassword: e.target.value })
                        }
                        placeholder="••••••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showNewPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirme a nova senha</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordData.confirmPassword}
                        onChange={(e) =>
                          setPasswordData({ ...passwordData, confirmPassword: e.target.value })
                        }
                        placeholder="••••••••••••••••"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                      >
                        {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                  </div>

                  {/* Validações */}
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center gap-2 ${validations.passwordsMatch ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.passwordsMatch ? <Check size={16} /> : <CircleAlert size={16} />}
                      <span>As senhas são iguais</span>
                    </div>
                    <div className={`flex items-center gap-2 ${validations.minLength ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.minLength ? <Check size={16} /> : <CircleAlert size={16} />}
                      <span>Contém no mínimo 6 caracteres</span>
                    </div>
                    <div className={`flex items-center gap-2 ${validations.hasNumber ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.hasNumber ? <Check size={16} /> : <CircleAlert size={16} />}
                      <span>Contém pelo menos 1 número</span>
                    </div>
                    <div className={`flex items-center gap-2 ${validations.hasUpperCase ? 'text-green-600' : 'text-gray-500'}`}>
                      {validations.hasUpperCase ? <Check size={16} /> : <CircleAlert size={16} />}
                      <span>Contém pelo menos uma letra maiúscula</span>
                    </div>
                    {/* Removido: validação de caracteres especiais */}
                  </div>

                  <div className="flex justify-end">
                    <Button
                      type="submit"
                      className="bg-[#00703c] hover:bg-[#005a30]"
                      disabled={loading || !Object.values(validations).every((v) => v)}
                    >
                      {loading ? 'Salvando...' : 'Salvar alterações'}
                    </Button>
                  </div>
                </form>
              )}
            </CardContent>
          </Card>

          {/* User Info Footer */}
          <div className="mt-8 flex items-center gap-3 text-sm">
            <div className="w-10 h-10 rounded-full bg-[#00703c] flex items-center justify-center text-white font-semibold">
              {profileData.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium text-gray-900">{profileData.name}</p>
              <p className="text-gray-500">Master</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default SettingsPage;
