import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/hooks/useDashboardData';
import { supabase } from '@/lib/supabase';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  TrendingUp,
  TrendingDown,
  Activity,
  BarChart3,
  ArrowUpRight,
  Clock,
  CheckCircle,
  AlertCircle,
  ChevronLeft,
  ChevronRight
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
  BarChart,
  Bar,
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
  
  // Usar o hook customizado para dados do dashboard
  const { data: dashboardData, loading, error, refresh } = useDashboardData();

  // Menu items da sidebar
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: true },
    { icon: FileText, label: 'Respostas', path: '/form-responses', active: false },
    { icon: Shield, label: 'Permissionamento', path: '/permissions', active: false },
    { icon: Settings, label: 'Configurações', path: '/settings', active: false },
  ];

  // Cores dinâmicas para o gráfico de pizza baseadas no tipo de atividade
  const getPieColor = (activityType: string) => {
    const colorMap: { [key: string]: string } = {
      'Agricultura': '#10b981',
      'Pecuária': '#ef4444',
      'Lavoura': '#f59e0b',
      'Integração': '#8b5cf6',
      'Mista': '#3b82f6',
      'default': '#6b7280'
    };
    return colorMap[activityType] || colorMap['default'];
  };

  // Mostrar erro se houver
  useEffect(() => {
    if (error) {
      toast({
        title: 'Erro ao carregar dados',
        description: error,
        variant: 'destructive',
      });
    }
  }, [error, toast]);

  // Preparar dados para exibição
  const metrics = dashboardData.generalMetrics || {
    total_formularios: 0,
    formularios_completos: 0,
    taxa_abandono: 0,
    tempo_medio_minutos: 0,
    indice_sustentabilidade_medio: 0,
    indice_economico_medio: 0,
    indice_social_medio: 0,
    indice_ambiental_medio: 0
  };

  // Formatar dados para gráficos
  const categoriesData = dashboardData.activityDistribution.map(item => ({
    name: item.activity_type,
    value: item.total,
    percentage: item.percentage
  }));

  // Formatar dados de tendência
  const trendsData = dashboardData.monthlyTrends.map(item => ({
    date: new Date(item.mes).toLocaleDateString('pt-BR', { month: 'short', year: 'numeric' }),
    sustainability: item.indice_sustentabilidade,
    environmental: item.indice_ambiental,
    social: item.indice_social,
    economic: item.indice_economico
  })).reverse();

  // Formatar últimas respostas
  const latestResponses = dashboardData.recentResponses.map(item => ({
    id: item.id,
    name: item.usuario_nome || 'Anônimo',
    property: item.propriedade_nome || 'Não informado',
    location: `${item.municipio || ''}, ${item.estado || ''}`.trim().replace(/^,\s*|,\s*$/g, ''),
    date: new Date(item.created_at).toLocaleDateString('pt-BR'),
    index: item.sustainability_index
  }));

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
            <h1 className="text-2xl font-bold text-gray-900">Resumo</h1>
            <p className="text-gray-600">Tenha uma visão prática do formulário.</p>
          </div>

          {/* Top Metrics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Respostas nos formulários</CardDescription>
                <CardTitle className="text-3xl">{metrics.total_formularios || 0}</CardTitle>
                {metrics.total_formularios_change && (
                  <p className={`text-sm flex items-center gap-1 ${metrics.total_formularios_change > 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {metrics.total_formularios_change > 0 ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                    {Math.abs(metrics.total_formularios_change)}% vs mês anterior
                  </p>
                )}
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Taxa de abandono</CardDescription>
                <CardTitle className="text-3xl">{metrics.taxa_abandono || 0}%</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {metrics.formularios_completos || 0} de {metrics.total_formularios || 0} completos
                </p>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardDescription>Tempo médio de preenchimento</CardDescription>
                <CardTitle className="text-3xl">{metrics.tempo_medio_minutos || 0} min</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Tempo real calculado
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
                      data={categoriesData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoriesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getPieColor(entry.name)} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-2 mt-4">
                  {categoriesData.map((item) => (
                    <div key={item.name} className="flex items-center gap-1">
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: getPieColor(item.name) }}
                      />
                      <span className="text-xs text-gray-600">
                        {item.name} ({item.percentage?.toFixed(1) || item.percentage}%)
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gráfico de Barras - Formulários por Estado */}
            <Card>
              <CardHeader>
                <CardTitle>Formulários por Estado</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={450}>
                  <BarChart data={dashboardData.regionalData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="estado" type="category" width={80} />
                    <Tooltip 
                      formatter={(value, name) => [
                        name === 'total_formularios' ? `${value} formulários` : `Índice: ${value}`,
                        name === 'total_formularios' ? 'Total' : 'Índice Médio'
                      ]}
                    />
                    <Bar 
                      dataKey="total_formularios" 
                      fill="#00703c" 
                      name="Total de Formulários"
                      radius={[0, 8, 8, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Latest Responses */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Últimas respostas</CardTitle>
                <Button variant="ghost" size="sm" onClick={() => navigate('/form-responses')}>
                  <ChevronRight size={16} />
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-0">
                  {latestResponses.map((response, index) => (
                    <div key={response.id}>
                      <div className="flex justify-between items-center py-3">
                        <div>
                          <p className="text-sm font-medium">{response.name}</p>
                          <p className="text-xs text-gray-500">{response.property} - {response.location}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{response.date}</p>
                          <p className="text-xs font-medium text-green-600">Índice: {response.index}</p>
                        </div>
                      </div>
                      {index < latestResponses.length - 1 && (
                        <div className="border-b border-green-200" />
                      )}
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
                <CardTitle className="text-3xl">{metrics.indice_sustentabilidade_medio || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={trendsData.slice(-7)}>
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
                <CardTitle className="text-3xl">{metrics.indice_ambiental_medio || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={trendsData.slice(-7)}>
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
                <CardTitle className="text-3xl">{metrics.indice_social_medio || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={trendsData.slice(-7)}>
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
                <CardTitle className="text-3xl">{metrics.indice_economico_medio || 0}</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={60}>
                  <LineChart data={trendsData.slice(-7)}>
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
