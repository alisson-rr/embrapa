import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import { useToast } from '../components/ui/use-toast';
import { 
  LayoutDashboard, 
  FileText, 
  Shield, 
  Settings, 
  LogOut, 
  Menu, 
  X,
  Search,
  ChevronDown,
  Eye,
  Trash2,
  Filter,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

interface FormResponse {
  id: string;
  user_name: string;
  property_name: string;
  property_type: string;
  location: string;
  created_at: string;
  form_id: string;
}

export function FormResponsesPage() {
  const navigate = useNavigate();
  const { signOut } = useAuth();
  const { toast } = useToast();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [responses, setResponses] = useState<FormResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // Carregar respostas do formulário
  useEffect(() => {
    fetchFormResponses();
  }, [currentPage, itemsPerPage, searchTerm]);

  const fetchFormResponses = async () => {
    try {
      setLoading(true);
      
      // Query base usando a VIEW
      let query = supabase
        .from('form_responses_view')
        .select('*', { count: 'exact' });

      // Adicionar busca se houver termo
      if (searchTerm) {
        query = query.or(`nome_usuario.ilike.%${searchTerm}%,nome_fazenda.ilike.%${searchTerm}%`);
      }

      // Ordenação por data
      query = query.order('data_resposta', { ascending: false });

      // Paginação
      const start = (currentPage - 1) * itemsPerPage;
      const end = start + itemsPerPage - 1;
      query = query.range(start, end);

      const { data, error, count } = await query;

      if (error) {
        throw error;
      }

      // Transformar dados para o formato esperado
      const formattedResponses: FormResponse[] = (data || []).map(item => ({
        id: item.form_id,
        user_name: item.nome_usuario || 'N/A',
        property_name: item.nome_fazenda || 'N/A',
        property_type: item.sistema_producao || item.tipo_pecuaria || 'N/A',
        location: item.localizacao || 'N/A',
        created_at: item.data_formatada || 'N/A',
        form_id: item.form_id
      }));

      setResponses(formattedResponses);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Erro ao buscar respostas:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar as respostas',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleViewResponse = (formId: string) => {
    // Navegar para a página de resultado
    navigate(`/result/${formId}`);
  };

  const handleDeleteResponse = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta resposta?')) {
      try {
        const { error } = await supabase
          .from('forms')
          .delete()
          .eq('id', id);

        if (error) throw error;

        toast({
          title: 'Sucesso',
          description: 'Resposta excluída com sucesso',
        });

        fetchFormResponses();
      } catch (error) {
        console.error('Erro ao excluir resposta:', error);
        toast({
          title: 'Erro',
          description: 'Não foi possível excluir a resposta',
          variant: 'destructive',
        });
      }
    }
  };

  // Menu items da sidebar
  const menuItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard', active: false },
    { icon: FileText, label: 'Respostas', path: '/form-responses', active: true },
    { icon: Shield, label: 'Permissionamento', path: '/permissions', active: false },
    { icon: Settings, label: 'Configurações', path: '/settings', active: false },
  ];

  const totalPages = Math.ceil(totalCount / itemsPerPage);

  // Função para gerar os números das páginas a serem exibidos
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisible = 5;
    
    let start = Math.max(1, currentPage - 2);
    let end = Math.min(totalPages, start + maxVisible - 1);
    
    if (end - start < maxVisible - 1) {
      start = Math.max(1, end - maxVisible + 1);
    }
    
    for (let i = start; i <= end; i++) {
      pageNumbers.push(i);
    }
    
    return pageNumbers;
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

      {/* Mobile Sidebar */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          mobileMenuOpen ? 'block' : 'hidden'
        }`}
      >
        <div className="fixed inset-0 bg-black/50" onClick={() => setMobileMenuOpen(false)} />
        <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
          <div className="p-6">
            <div className="flex items-center justify-between mb-8">
              <img src="/Logo.png" alt="Embrapa" className="h-8" />
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X size={24} />
              </button>
            </div>

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

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="flex items-center justify-between px-6 py-4">
            <div className="flex items-center">
              <button
                onClick={() => setMobileMenuOpen(true)}
                className="lg:hidden mr-4"
              >
                <Menu className="h-6 w-6 text-gray-600" />
              </button>
              <div>
                <h1 className="text-2xl font-semibold text-gray-800">
                  Respostas nos formulários
                </h1>
                <p className="text-sm text-gray-500 mt-1">Usuários que preencheram o formulário</p>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6">
          <div className="bg-white rounded-lg shadow">
            {/* Search and Filter Bar */}
            <div className="p-6 border-b">
              <div className="flex flex-col sm:flex-row gap-4">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Pesquisar por nome do perfil"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Filtrar
                  </Button>
                </div>
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center gap-1">
                        Nome do usuário
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center gap-1">
                        Nome da fazenda
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center gap-1">
                        Tipo de propriedade
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center gap-1">
                        Localização
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      <button className="flex items-center gap-1">
                        Data
                        <ChevronDown className="h-3 w-3" />
                      </button>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Carregando...
                      </td>
                    </tr>
                  ) : responses.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 text-center text-gray-500">
                        Nenhuma resposta encontrada
                      </td>
                    </tr>
                  ) : (
                    responses.map((response) => (
                      <tr key={response.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {response.user_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {response.property_name}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {response.property_type}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {response.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {response.created_at}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleViewResponse(response.form_id)}
                              className="p-2 text-gray-400 hover:text-[#00703c] hover:bg-gray-100 rounded transition-colors"
                              title="Visualizar resultado"
                            >
                              <Eye className="h-4 w-4" />
                            </button>
                            <button
                              onClick={() => handleDeleteResponse(response.id)}
                              className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded transition-colors"
                              title="Excluir"
                            >
                              <Trash2 className="h-4 w-4" />
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
            <div className="px-6 py-4 border-t">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Itens por página:</span>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="border border-gray-300 rounded px-3 py-1 text-sm"
                  >
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>

                {totalCount > 0 && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setCurrentPage(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      ←
                    </button>

                    {getPageNumbers().map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 text-sm rounded ${
                          currentPage === page
                            ? 'bg-[#00703c] text-white'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {page}
                      </button>
                    ))}

                    {totalPages > 5 && currentPage < totalPages - 2 && (
                      <>
                        <span className="px-2 text-gray-400">...</span>
                        <button
                          onClick={() => setCurrentPage(totalPages)}
                          className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded"
                        >
                          {totalPages}
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => setCurrentPage(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="px-3 py-1 text-sm text-gray-600 hover:bg-gray-100 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      →
                    </button>
                  </div>
                )}

                <span className="text-sm text-gray-600">
                  Total: {totalCount}
                </span>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
