import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import {
  LayoutDashboard,
  Users,
  Shield,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Menu,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

interface DashboardMetrics {
  totalResponses: number;
  abandonmentRate: number;
  averageTime: number;
  sustainabilityIndex: number;
  environmentalIndex: number;
  socialIndex: number;
  economicIndex: number;
  categoriesData: { name: string; value: number }[];
  latestResponses: {
    id: string;
    name: string;
    date: string;
  }[];
  trendsData: {
    date: string;
    sustainability: number;
    environmental: number;
    social: number;
    economic: number;
  }[];
}

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selectedState, setSelectedState] = useState('');
  
  const [metrics, setMetrics] = useState<DashboardMetrics>({
    totalResponses: 0,
    abandonmentRate: 0,
    averageTime: 0,
    sustainabilityIndex: 0,
    environmentalIndex: 0,
    socialIndex: 0,
    economicIndex: 0,
    categoriesData: [],
    latestResponses: [],
    trendsData: [],
  });

  // Menu items da sidebar
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: Users, label: 'Usuários', path: '/users', active: false },
    { icon: Shield, label: 'Permissionamento', path: '/permissions', active: false },
    { icon: Settings, label: 'Configurações', path: '/settings', active: false },
  ];

  // Cores para o gráfico de pizza
  const COLORS = {
    Agro: '#f59e0b',
    Lavoura: '#10b981',
    Pecuária: '#ef4444',
  };

  // Buscar dados do Supabase
  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);

      // Buscar formulários
      const { data: forms, error: formsError } = await supabase
        .from('forms')
        .select(`
          *,
          personal_data (name, created_at),
          property_data (activity_types)
        `)
        .order('created_at', { ascending: false });

      if (formsError) throw formsError;

      if (forms && forms.length > 0) {
        // Calcular métricas
        const totalResponses = forms.length;
        const completedForms = forms.filter(f => f.status === 'completed').length;
        const abandonmentRate = Math.round(((totalResponses - completedForms) / totalResponses) * 100);
        
        // Calcular tempo médio (simulado por enquanto)
        const averageTime = 25;

        // Calcular índices médios
        const avgSustainability = Math.round(
          forms.reduce((acc, f) => acc + (f.sustainability_index || 0), 0) / forms.length
        );
        const avgEnvironmental = Math.round(
          forms.reduce((acc, f) => acc + (f.environmental_index || 0), 0) / forms.length
        );
        const avgSocial = Math.round(
          forms.reduce((acc, f) => acc + (f.social_index || 0), 0) / forms.length
        );
        const avgEconomic = Math.round(
          forms.reduce((acc, f) => acc + (f.economic_index || 0), 0) / forms.length
        );

        // Categorizar por tipo de atividade
        const categoryCounts: { [key: string]: number } = { Agro: 0, Lavoura: 0, Pecuária: 0 };
        forms.forEach((form) => {
          if (form.property_data?.activity_types) {
            form.property_data.activity_types.forEach((type: string) => {
              if (type.includes('agricultura') || type.includes('cultivo')) categoryCounts.Agro++;
              else if (type.includes('lavoura')) categoryCounts.Lavoura++;
              else if (type.includes('pecuária') || type.includes('gado')) categoryCounts.Pecuária++;
            });
          }
        });

        const categoriesData = Object.entries(categoryCounts).map(([name, value]) => ({
          name,
          value,
        }));

        // Últimas respostas
        const latestResponses = forms.slice(0, 4).map((form) => ({
          id: form.id,
          name: form.personal_data?.name || 'Anônimo',
          date: form.personal_data?.created_at
            ? new Date(form.personal_data.created_at).toLocaleDateString('pt-BR')
            : 'Data não disponível',
        }));

        // Dados de tendência (últimos 30 dias - simulado)
        const trendsData = Array.from({ length: 30 }, (_, i) => {
          const date = new Date();
          date.setDate(date.getDate() - (29 - i));
          return {
            date: date.toISOString().split('T')[0],
            sustainability: Math.floor(Math.random() * 20) + 55,
            environmental: Math.floor(Math.random() * 20) + 15,
            social: Math.floor(Math.random() * 20) + 45,
            economic: Math.floor(Math.random() * 20) + 35,
          };
        });

        setMetrics({
          totalResponses,
          abandonmentRate,
          averageTime,
          sustainabilityIndex: avgSustainability || 65,
          environmentalIndex: avgEnvironmental || 21,
          socialIndex: avgSocial || 55,
          economicIndex: avgEconomic || 47,
          categoriesData: categoriesData.length > 0 ? categoriesData : [
            { name: 'Agro', value: 19 },
            { name: 'Lavoura', value: 26 },
            { name: 'Pecuária', value: 7 },
          ],
          latestResponses,
          trendsData,
        });
      } else {
        // Dados simulados se não houver registros
        setMetrics({
          totalResponses: 200,
          abandonmentRate: 13,
          averageTime: 25,
          sustainabilityIndex: 65,
          environmentalIndex: 21,
          socialIndex: 55,
          economicIndex: 47,
          categoriesData: [
            { name: 'Agro', value: 19 },
            { name: 'Lavoura', value: 26 },
            { name: 'Pecuária', value: 7 },
          ],
          latestResponses: [
            { id: '1', name: 'Marcos Carvalho', date: '23/12/2024' },
            { id: '2', name: 'Jon Carter', date: '23/12/2024' },
            { id: '3', name: 'Reinaldo Campos E...', date: '21/12/2024' },
            { id: '4', name: 'João Silva Oliveira...', date: '20/12/2024' },
          ],
          trendsData: Array.from({ length: 30 }, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (29 - i));
            return {
              date: date.toISOString().split('T')[0],
              sustainability: Math.floor(Math.random() * 20) + 55,
              environmental: Math.floor(Math.random() * 20) + 15,
              social: Math.floor(Math.random() * 20) + 45,
              economic: Math.floor(Math.random() * 20) + 35,
            };
          }),
        });
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      toast({
        title: 'Erro ao carregar dados',
        description: 'Não foi possível carregar os dados do dashboard',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  // Mapa do Brasil SVG simplificado
  const BrazilMap = () => (
    <svg viewBox="0 0 500 500" className="w-full h-full">
      <g>
        {/* Norte - Amarelo */}
        <path
          d="M 150,50 L 350,50 L 350,150 L 150,150 Z"
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedState('Norte')}
        />
        
        {/* Nordeste - Laranja */}
        <path
          d="M 350,100 L 450,150 L 400,250 L 350,200 Z"
          fill="#fb923c"
          stroke="#ea580c"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedState('Nordeste')}
        />
        
        {/* Centro-Oeste - Amarelo */}
        <path
          d="M 150,150 L 350,150 L 350,300 L 150,300 Z"
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedState('Centro-Oeste')}
        />
        
        {/* Sudeste - Vermelho */}
        <path
          d="M 350,250 L 400,250 L 400,350 L 300,350 Z"
          fill="#ef4444"
          stroke="#dc2626"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedState('Sudeste')}
        />
        
        {/* Sul - Amarelo */}
        <path
          d="M 200,350 L 350,350 L 300,450 L 250,450 Z"
          fill="#fbbf24"
          stroke="#d97706"
          strokeWidth="2"
          className="cursor-pointer hover:opacity-80 transition-opacity"
          onClick={() => setSelectedState('Sul')}
        />
      </g>
    </svg>
  );

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
            <h1 className="text-2xl font-bold text-gray-900">Resumo</h1>
            <p className="text-gray-600">Tenha uma visão prática do formulário.</p>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Respostas nos formulários</CardDescription>
                <CardTitle className="text-3xl">{metrics.totalResponses}</CardTitle>
                <p className="text-sm text-green-600">
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Taxa de abandono</CardDescription>
                <CardTitle className="text-3xl">{metrics.abandonmentRate}</CardTitle>
                <p className="text-sm text-red-600">
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tempo médio de preenchimento</CardDescription>
                <CardTitle className="text-3xl">{metrics.averageTime} min</CardTitle>
                <p className="text-sm text-green-600">
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
            </Card>
          </div>

          {/* Charts and Map Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Pie Chart */}
            <Card>
              <CardHeader>
                <CardTitle>Tipo de categorias</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={metrics.categoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {metrics.categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex justify-center gap-6 mt-4">
                  {metrics.categoriesData.map((entry) => (
                    <div key={entry.name} className="flex items-center gap-2">
                      <div
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: COLORS[entry.name as keyof typeof COLORS] }}
                      />
                      <span className="text-sm text-gray-600">
                        {entry.name} {entry.value}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Map */}
            <Card>
              <CardHeader>
                <CardTitle>Mapa</CardTitle>
              </CardHeader>
              <CardContent className="h-[300px]">
                <BrazilMap />
                {selectedState && (
                  <p className="text-center text-sm text-gray-600 mt-2">
                    Região selecionada: {selectedState}
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Latest Responses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Últimas respostas</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/responses')}>
                  <ChevronRight size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {metrics.latestResponses.map((response) => (
                    <div key={response.id} className="flex justify-between items-center">
                      <span className="text-sm font-medium">{response.name}</span>
                      <span className="text-sm text-gray-500">{response.date}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Index Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Índice de sustentabilidade</CardDescription>
                <CardTitle className="text-3xl">{metrics.sustainabilityIndex}</CardTitle>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={metrics.trendsData.slice(-7)}>
                    <Line
                      type="monotone"
                      dataKey="sustainability"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Índice ambiental</CardDescription>
                <CardTitle className="text-3xl">{metrics.environmentalIndex}</CardTitle>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={metrics.trendsData.slice(-7)}>
                    <Line
                      type="monotone"
                      dataKey="environmental"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Índice social</CardDescription>
                <CardTitle className="text-3xl">{metrics.socialIndex}</CardTitle>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={metrics.trendsData.slice(-7)}>
                    <Line
                      type="monotone"
                      dataKey="social"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Índice econômico</CardDescription>
                <CardTitle className="text-3xl">{metrics.economicIndex}</CardTitle>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp size={14} />
                  +0.1% Últimos 30 dias
                </p>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={metrics.trendsData.slice(-7)}>
                    <Line
                      type="monotone"
                      dataKey="economic"
                      stroke="#10b981"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
