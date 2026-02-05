import { useState, useEffect } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import LoadingCalculation from "@/components/LoadingCalculation";
import { getFormResults } from "@/lib/submitForm";
import { supabase } from "@/lib/supabase";
import { ArrowRight, DollarSign, ThumbsUp, Cloud, BarChart3, Users, Leaf, TrendingUp, CheckCircle } from "lucide-react";

interface FormDataResult {
  id: string;
  indice_economico?: number;
  indice_social?: number;
  indice_ambiental?: number;
  indice_sustentabilidade?: number;
  personal_data?: any[];
  property_data?: any[];
  economic_data?: any[];
  social_data?: any[];
  environmental_data?: any[];
}

const ResultsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [formData, setFormData] = useState<FormDataResult | null>(null);
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const loadFormData = async () => {
      try {
        setIsLoading(true);
        
        // Se há um ID na URL, buscar dados do formulário específico
        if (id) {
          const { data: formData, error: formError } = await supabase
            .from('forms')
            .select('*, personal_data(*), property_data(*), economic_data(*), social_data(*), environmental_data(*)')
            .eq('id', id)
            .single();

          if (formError) {
            console.error('Erro ao buscar dados do formulário:', formError);
          } else {
            setFormData(formData);
          }
        }
        
        // Simular tempo de processamento para mostrar a animação
        setTimeout(() => {
          setIsLoading(false);
        }, 2000);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        setIsLoading(false);
      }
    };

    loadFormData();
  }, [id]);

  if (isLoading) {
    return <LoadingCalculation />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <img src="/Logo.png" alt="Embrapa" className="h-12" />
        </div>
      </div>

      {/* Main Content Container */}
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Hero Section */}
        <div className="bg-white rounded-3xl shadow-sm p-8 mb-8">
          <div className="flex items-center justify-between mb-8">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold text-[#008247] mb-4">
                Resumo da Sustentabilidade<br />da Propriedade
              </h1>
              <p className="text-gray-600 text-sm">
                Confira os indicadores de desempenho econômico, social e ambiental<br />
                relacionados à sua propriedade.
              </p>
            </div>
            <img 
              src="/imagem_1.png" 
              alt="Sustentabilidade" 
              className="w-48 h-48 object-contain"
            />
          </div>

          {/* Main Score Card */}
          <div className="bg-[#D1FADF] rounded-2xl p-8">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">
              Seus índices de sustentabilidade
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Visualize seu desempenho e identifique oportunidades para melhorar de forma sustentável.
            </p>
            
            <div className="bg-white rounded-xl p-6">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-[#008247] rounded-full flex items-center justify-center">
                  <BarChart3 className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-4xl font-bold text-[#008247]">
                    {formData?.indice_sustentabilidade ? `${Math.round(formData.indice_sustentabilidade)}/100` : '0/100'}
                  </div>
                  <div className="text-gray-600">Índice de sustentabilidade</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-[#008247] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    4% do faturamento é destinado a financiamentos
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-[#008247] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    8% dos seus funcionários recebem abaixo da média do seu estado
                  </span>
                </div>
                <div className="flex items-start gap-2">
                  <ArrowRight className="w-5 h-5 text-[#008247] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-700">
                    Baixo percentual de matéria orgânica no solo
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Três indicadores */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#008247] rounded-full flex items-center justify-center">
                    <DollarSign className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-[#008247]">{formData?.indice_economico ? Math.round(formData.indice_economico) : 0}</span>
                  <span className="text-gray-500">/100</span>
                </div>
                <div className="text-sm text-gray-600">Índice econômico</div>
              </div>
              <img src="/imagem_coluna_verde.png" alt="Econômico" className="w-24 h-24 object-contain" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#FDB022] rounded-full flex items-center justify-center">
                    <ThumbsUp className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-[#FDB022]">{formData?.indice_social ? Math.round(formData.indice_social) : 0}</span>
                  <span className="text-gray-500">/100</span>
                </div>
                <div className="text-sm text-gray-600">Índice social</div>
              </div>
              <img src="/imagem_coluna_amarelo.png" alt="Social" className="w-24 h-24 object-contain" />
            </div>
          </Card>

          <Card className="p-6 bg-white border-0 shadow-sm">
            <div className="flex items-center justify-between h-full">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 bg-[#D92D20] rounded-full flex items-center justify-center">
                    <Cloud className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-3xl font-bold text-[#D92D20]">{formData?.indice_ambiental ? `${Math.round(formData.indice_ambiental)}/100` : '0/100'}</span>
                  <span className="text-gray-500">/100</span>
                </div>
                <div className="text-sm text-gray-600">Índice ambiental</div>
              </div>
              <img src="/imagem_coluna_vermelho.png" alt="Ambiental" className="w-24 h-24 object-contain" />
            </div>
          </Card>
        </div>

        {/* Comparação Regional */}
        <Card className="p-8 mb-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">
            Comparação Regional
          </h2>
          <p className="text-sm text-gray-600 mb-6">
            Veja sua propriedade se compara às médias regionais e nacionais.
          </p>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Meu índice</div>
              <div className="h-32 flex items-end justify-center">
                <div className="w-20 bg-[#008247] rounded-t" style={{ height: `${formData?.indice_economico || 0}%` }}></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">Índice econômico</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Índice Social</div>
              <div className="h-32 flex items-end justify-center">
                <div className="w-20 bg-blue-500 rounded-t" style={{ height: `${formData?.indice_social || 0}%` }}></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">Índice social</div>
            </div>

            <div className="text-center">
              <div className="text-sm text-gray-600 mb-2">Índice de meu estado</div>
              <div className="h-32 flex items-end justify-center">
                <div className="w-20 bg-[#D92D20] rounded-t" style={{ height: `${formData?.indice_ambiental || 0}%` }}></div>
              </div>
              <div className="text-sm text-gray-600 mt-2">Índice ambiental</div>
            </div>
          </div>

          <div className="flex items-center justify-end mt-4 text-sm text-gray-500">
            <span className="mr-2">▲</span>
            Classificação em indicadores dos: IBGE, SEEG & IGTG
          </div>
        </Card>

        {/* Como melhorar */}
        <div className="bg-[#F0FAF4] rounded-3xl p-12 mb-8">
          <div className="flex items-start justify-between mb-10">
            <div className="max-w-lg">
              <h2 className="text-4xl font-bold text-[#008247] mb-4">
                Como melhorar os meus<br />índices de sustentabilidade?
              </h2>
              <p className="text-gray-600 text-base">
                Descubra ações práticas para elevar o desempenho econômico, social e<br />
                ambiental da sua propriedade.
              </p>
            </div>
            <img src="/imagem 4.png" alt="Melhoria" className="w-64 h-64 object-contain" />
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {/* Coluna Econômica */}
            <Card className="p-8 border border-gray-200 bg-white shadow-sm">
              <div className="mb-6">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#008247]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 text-lg leading-tight">
                  Aumente seu índice<br />econômico e fortaleça<br />suas finanças!
                </h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#008247] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    <strong className="font-semibold">{formData?.economic_data?.[0]?.financing_percentage ? `${formData.economic_data[0].financing_percentage}% do faturamento é destinado a financiamentos` : '4% do faturamento é destinado a financiamentos'}</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#008247] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    Custo de produção da propriedade é R$ {formData?.economic_data?.[0]?.production_cost?.toLocaleString('pt-BR') || '0'},00.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#008247] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    A propriedade tem o valor total de R$ 1.000,00.
                  </span>
                </div>
              </div>
              <div className="mt-auto">
                <button className="text-[#008247] text-sm font-medium flex items-center gap-2 hover:underline">
                  <ArrowRight className="w-4 h-4" />
                  Saiba mais sobre práticas econômicas
                </button>
              </div>
            </Card>

            {/* Coluna Social */}
            <Card className="p-8 border border-gray-200 bg-white shadow-sm">
              <div className="mb-6">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#008247]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 text-lg leading-tight">
                  Eleve seu índice social e<br />destaque a sua<br />propriedade!
                </h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#FDB022] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    <strong className="font-semibold">X% dos seus funcionários recebem abaixo da média do seu estado</strong>
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#FDB022] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    O custo de mão de obra é de R$ 1.000,00.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#FDB022] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    Média salarial dos funcionários é abaixo da média.
                  </span>
                </div>
              </div>
              <div className="mt-auto">
                <button className="text-[#008247] text-sm font-medium flex items-center gap-2 hover:underline">
                  <ArrowRight className="w-4 h-4" />
                  Saiba mais sobre ações sociais
                </button>
              </div>
            </Card>

            {/* Coluna Ambiental */}
            <Card className="p-8 border border-gray-200 bg-white shadow-sm">
              <div className="mb-6">
                <div className="w-8 h-8 flex items-center justify-center mb-4">
                  <svg className="w-8 h-8 text-[#008247]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
                <h3 className="font-semibold text-gray-700 text-lg leading-tight">
                  Aprimore seu índice<br />ambiental, contribua para<br />um futuro sustentável!
                </h3>
              </div>
              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#D92D20] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    Baixo percentual de matéria orgânica no solo.
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#D92D20] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    Uso de combustível é maior do que a média
                  </span>
                </div>
                <div className="flex items-start gap-3">
                  <ArrowRight className="w-5 h-5 text-[#D92D20] mt-0.5 flex-shrink-0" />
                  <span className="text-sm text-gray-600">
                    A energia elétrica utilizada é acima do percentual médio.
                  </span>
                </div>
              </div>
              <div className="mt-auto">
                <button className="text-[#008247] text-sm font-medium flex items-center gap-2 hover:underline">
                  <ArrowRight className="w-4 h-4" />
                  Saiba mais sobre ações ambientais
                </button>
              </div>
            </Card>
          </div>
        </div>

        {/* Footer CTA */}
        <div className="bg-gradient-to-r from-green-50 to-green-100 rounded-2xl p-8 text-center">
          <img src="/imagem_2.png" alt="Sustentabilidade" className="w-32 h-32 mx-auto mb-6" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Pequenas mudanças geram grandes impactos na
          </h2>
          <h2 className="text-2xl font-bold text-[#00703c] mb-6">
            sustentabilidade da sua propriedade.
          </h2>
          <Button
            onClick={() => navigate("/tips")}
            className="bg-[#00703c] hover:bg-[#005a30] text-white px-8 py-3"
          >
            Explorar Todas as Dicas
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>

        {/* Botão voltar ao início */}
        <div className="text-center mt-8">
          <Button
            onClick={() => navigate("/")}
            variant="outline"
            className="border-[#00703c] text-[#00703c] hover:bg-[#00703c] hover:text-white"
          >
            Novo Formulário
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ResultsPage;
