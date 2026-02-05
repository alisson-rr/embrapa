import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { formatForAPI, formatForDisplay } from "@/lib/decimalUtils";

interface PropertyInfoFormData {
  // 4 perguntas básicas
  totalArea: string;
  productionArea: string;
  productionSystem: string;
  productionSystemDetail: string;
  systemUsageTime: string;
  // Cards de seleção
  activityTypes: string[];
  // Perguntas condicionais - Lavoura
  crops: Array<{
    name: string;
    plantingMonth: string;
    areaPercentage: string;
  }>;
  useCoverCrop: string;
  coverCropTypes: string;
  // Perguntas condicionais - Pecuária
  pastureTypes: string;
  pastureSpecies: string;
  useSilage: string;
  silageHectares: string;
  // Perguntas condicionais - Floresta
  forestSpecies: string;
  forestArea: string;
  // Perguntas finais
  permanentProtectionArea: string;
  legalReserveArea: string;
}

interface PropertyInfoFormProps {
  onSubmit: (data: PropertyInfoFormData) => void;
  initialData?: Partial<PropertyInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
}

const PropertyInfoForm = ({ onSubmit, initialData = {}, onValidationChange }: PropertyInfoFormProps) => {
  const [formData, setFormData] = useState<PropertyInfoFormData>({
    totalArea: initialData.totalArea || "150,50",
    productionArea: initialData.productionArea || "120,25",
    productionSystem: initialData.productionSystem || "lavoura",
    productionSystemDetail: initialData.productionSystemDetail || "",
    systemUsageTime: initialData.systemUsageTime || "10",
    activityTypes: initialData.activityTypes || ["lavoura"],
    crops: initialData.crops || [{ name: "Soja", plantingMonth: "10", areaPercentage: "80" }],
    useCoverCrop: initialData.useCoverCrop || "sim",
    coverCropTypes: initialData.coverCropTypes || "Aveia, Nabo Forrageiro",
    pastureTypes: initialData.pastureTypes || "",
    pastureSpecies: initialData.pastureSpecies || "",
    useSilage: initialData.useSilage || "",
    silageHectares: initialData.silageHectares || "",
    forestSpecies: initialData.forestSpecies || "",
    forestArea: initialData.forestArea || "",
    permanentProtectionArea: initialData.permanentProtectionArea || "15,00",
    legalReserveArea: initialData.legalReserveArea || "30,00",
  });

  // Função auxiliar para converter string com vírgula para número
  const parseArea = (value: string): number => {
    if (!value) return 0;
    return parseFloat(value.replace(',', '.')) || 0;
  };

  // Validação de áreas: produção + reserva + APP ≤ total
  const totalArea = parseArea(formData.totalArea);
  const productionArea = parseArea(formData.productionArea);
  const appArea = parseArea(formData.permanentProtectionArea);
  const reserveArea = parseArea(formData.legalReserveArea);
  const sumAreas = productionArea + appArea + reserveArea;
  const isAreaValid = totalArea === 0 || sumAreas <= totalArea;

  // Validação inteligente - valida apenas campos visíveis/obrigatórios
  useEffect(() => {
    // 1. Validar 4 perguntas básicas (sempre obrigatórias)
    const basicQuestionsValid = !!(
      formData.totalArea &&
      formData.productionArea &&
      formData.productionSystem &&
      formData.systemUsageTime &&
      // Se for Pecuária ou ILPF, precisa ter detalhe (lavoura e floresta não precisam)
      (formData.productionSystem === 'lavoura' || formData.productionSystem === 'floresta' || formData.productionSystemDetail)
    );

    // 2. Validar que pelo menos 1 card foi selecionado
    const hasActivitySelected = formData.activityTypes.length > 0;

    // 3. Validar campos condicionais APENAS dos cards selecionados
    let conditionalFieldsValid = true;

    // Se Lavoura foi selecionada, validar que tem pelo menos 1 cultura OU marcou que não usa cultura de cobertura
    if (formData.activityTypes.includes("lavoura")) {
      const hasAtLeastOneCrop = formData.crops.length > 0 && 
        formData.crops.some(crop => crop.name && crop.plantingMonth && crop.areaPercentage);
      const coverCropAnswered = formData.useCoverCrop !== "";
      conditionalFieldsValid = conditionalFieldsValid && (hasAtLeastOneCrop || coverCropAnswered);
    }

    // Se Pecuária foi selecionada, validar que tem tipo de pastagem
    if (formData.activityTypes.includes("pecuaria")) {
      const hasPastureInfo = formData.pastureTypes !== "";
      conditionalFieldsValid = conditionalFieldsValid && hasPastureInfo;
    }

    // Se Floresta foi selecionada, validar que tem espécies OU área
    if (formData.activityTypes.includes("floresta")) {
      const hasForestInfo = formData.forestSpecies !== "" || formData.forestArea !== "";
      conditionalFieldsValid = conditionalFieldsValid && hasForestInfo;
    }

    // Se nenhum card foi selecionado, campos condicionais não precisam validação
    if (formData.activityTypes.length === 0) {
      conditionalFieldsValid = true;
    }

    // Validação final: perguntas básicas + pelo menos 1 card + campos condicionais + áreas válidas
    const isValid = basicQuestionsValid && hasActivitySelected && conditionalFieldsValid && isAreaValid;
    
    onValidationChange?.(isValid);
  }, [formData, onValidationChange, isAreaValid]);

  const handleInputChange = (field: keyof PropertyInfoFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAreaChange = (field: keyof PropertyInfoFormData, value: string) => {
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleProductionSystemChange = (value: string) => {
    setFormData(prev => ({ 
      ...prev, 
      productionSystem: value,
      productionSystemDetail: ""
    }));
  };

  const handleActivityTypeToggle = (activityType: string) => {
    const newActivityTypes = formData.activityTypes.includes(activityType)
      ? formData.activityTypes.filter(type => type !== activityType)
      : [...formData.activityTypes, activityType];
    
    setFormData(prev => ({ ...prev, activityTypes: newActivityTypes }));
  };

  const addCrop = () => {
    setFormData(prev => ({
      ...prev,
      crops: [...prev.crops, { name: "", plantingMonth: "", areaPercentage: "" }]
    }));
  };

  const updateCrop = (index: number, field: string, value: string) => {
    const newCrops = [...formData.crops];
    newCrops[index] = { ...newCrops[index], [field]: value };
    setFormData(prev => ({ ...prev, crops: newCrops }));
  };

  const removeCrop = (index: number) => {
    setFormData(prev => ({
      ...prev,
      crops: prev.crops.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Converte números decimais para formato da API (ponto)
    const apiData = {
      ...formData,
      totalArea: formatForAPI(formData.totalArea),
      productionArea: formatForAPI(formData.productionArea),
      systemUsageTime: formatForAPI(formData.systemUsageTime),
      silageHectares: formatForAPI(formData.silageHectares),
      forestArea: formatForAPI(formData.forestArea),
      permanentProtectionArea: formatForAPI(formData.permanentProtectionArea),
      legalReserveArea: formatForAPI(formData.legalReserveArea),
      // Converte áreas percentuais das culturas
      crops: formData.crops.map(crop => ({
        ...crop,
        areaPercentage: formatForAPI(crop.areaPercentage)
      }))
    };
    onSubmit(apiData);
  };

  const activityOptions = [
    { id: "lavoura", name: "Lavoura", image: "/lavoura.png" },
    { id: "pecuaria", name: "Pecuária", image: "/Pecuaria.png" },
    { id: "floresta", name: "Floresta", image: "/Floresta.png" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ========================================== */}
      {/* PARTE 1: 4 PERGUNTAS BÁSICAS */}
      {/* ========================================== */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">Caracterização da Propriedade</h3>
          <p className="text-sm text-gray-500 mt-1">Informações básicas sobre área e sistema de produção</p>
        </div>

        {/* Tamanho total da propriedade */}
        <div className="space-y-2">
          <Label htmlFor="totalArea" className="text-base font-medium text-foreground">
            Qual é o tamanho total da propriedade? (ha)
          </Label>
          <Input
            id="totalArea"
            type="text"
            value={formData.totalArea}
            onChange={(e) => handleAreaChange("totalArea", e.target.value)}
            placeholder="Ex: 100,50"
            className="form-input"
            required
          />
        </div>

        {/* Área utilizada para produção */}
        <div className="space-y-2">
          <Label htmlFor="productionArea" className="text-base font-medium text-foreground">
            Qual é o tamanho da área utilizada para produção? (ha)
          </Label>
          <Input
            id="productionArea"
            type="text"
            value={formData.productionArea}
            onChange={(e) => handleAreaChange("productionArea", e.target.value)}
            placeholder="Ex: 80,25"
            className="form-input"
            required
          />
        </div>

        {/* Sistema de produção */}
        <div className="space-y-2">
          <Label htmlFor="productionSystem" className="text-base font-medium text-foreground">
            Qual é o sistema de produção?
          </Label>
          <Select 
            value={formData.productionSystem} 
            onValueChange={handleProductionSystemChange}
            required
          >
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione o sistema de produção" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
              <SelectItem value="lavoura" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                Lavoura
              </SelectItem>
              <SelectItem value="pecuaria" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                Pecuária
              </SelectItem>
              <SelectItem value="floresta" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                Floresta
              </SelectItem>
              <SelectItem value="ilpf" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                ILPF
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* 3.1 Detalhamento para Pecuária */}
        {formData.productionSystem === 'pecuaria' && (
          <div className="space-y-2 pl-6 border-l-2 border-primary/30">
            <Label htmlFor="productionSystemDetail" className="text-base font-medium text-foreground">
              Tipo de pecuária:
            </Label>
            <Select 
              value={formData.productionSystemDetail} 
              onValueChange={(value) => handleInputChange("productionSystemDetail", value)}
              required
            >
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
                <SelectItem value="cria" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  Cria
                </SelectItem>
                <SelectItem value="recria" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  Recria
                </SelectItem>
                <SelectItem value="engorda" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  Engorda
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* 3.2 Detalhamento para ILPF */}
        {formData.productionSystem === 'ilpf' && (
          <div className="space-y-2 pl-6 border-l-2 border-primary/30">
            <Label htmlFor="productionSystemDetail" className="text-base font-medium text-foreground">
              Tipo de integração:
            </Label>
            <Select 
              value={formData.productionSystemDetail} 
              onValueChange={(value) => handleInputChange("productionSystemDetail", value)}
              required
            >
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Selecione o tipo de integração" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
                <SelectItem value="ilf" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  ILF - Integração Lavoura-Floresta
                </SelectItem>
                <SelectItem value="ilp" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  ILP - Integração Lavoura-Pecuária
                </SelectItem>
                <SelectItem value="pf" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  PF - Pecuária-Floresta
                </SelectItem>
                <SelectItem value="ilpf" className="text-base cursor-pointer hover:bg-accent focus:bg-accent">
                  ILPF - Integração Lavoura-Pecuária-Floresta
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Tempo utilizando o sistema */}
        <div className="space-y-2">
          <Label htmlFor="systemUsageTime" className="text-base font-medium text-foreground">
            Há quanto tempo utiliza esse sistema de produção? (em anos)
          </Label>
          <Input
            id="systemUsageTime"
            type="number"
            value={formData.systemUsageTime}
            onChange={(e) => handleInputChange("systemUsageTime", e.target.value)}
            placeholder="Ex: 5"
            className="form-input"
            min="0"
            max="100"
            required
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* PARTE 2: CARDS DE SELEÇÃO */}
      {/* ========================================== */}
      <div className="space-y-4">
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">Estratégia do uso da terra</h3>
          <p className="text-sm text-gray-500 mt-1">Selecione um ou mais tipos de atividade</p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {activityOptions.map((activity) => (
            <Card
              key={activity.id}
              className={`p-4 cursor-pointer transition-all duration-200 hover:shadow-md ${
                formData.activityTypes.includes(activity.id)
                  ? 'ring-2 ring-primary bg-primary/5'
                  : 'hover:bg-gray-50'
              }`}
              onClick={() => handleActivityTypeToggle(activity.id)}
            >
              <div className="text-center space-y-3">
                <div className="flex justify-center">
                  <img
                    src={activity.image}
                    alt={activity.name}
                    className="w-20 h-20 object-contain"
                  />
                </div>
                <p className="font-medium text-gray-700">{activity.name}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* ========================================== */}
      {/* PARTE 3: PERGUNTAS CONDICIONAIS POR TIPO */}
      {/* ========================================== */}

      {/* 5.1 LAVOURA */}
      {formData.activityTypes.includes("lavoura") && (
        <div className="space-y-6 p-6 bg-gray-50 rounded-2xl">
          <h4 className="text-base font-semibold text-primary">Lavoura</h4>
          
          {/* Culturas plantadas */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label className="text-base font-medium">Quais culturas foram plantadas?</Label>
              <Button type="button" onClick={addCrop} variant="outline" size="sm">
                + Adicionar Cultura
              </Button>
            </div>
            
            {formData.crops.map((crop, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-white rounded-lg">
                <div>
                  <Label className="text-sm">Cultura</Label>
                  <Input
                    value={crop.name}
                    onChange={(e) => updateCrop(index, 'name', e.target.value)}
                    placeholder="Ex: Soja"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Mês de plantio</Label>
                  <Input
                    type="number"
                    value={crop.plantingMonth}
                    onChange={(e) => updateCrop(index, 'plantingMonth', e.target.value)}
                    placeholder="Ex: 10"
                    min="1"
                    max="12"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-sm">Área (ha)</Label>
                  <Input
                    value={crop.areaPercentage}
                    onChange={(e) => updateCrop(index, 'areaPercentage', e.target.value)}
                    placeholder="Ex: 50,00"
                    className="mt-1"
                  />
                </div>
                <div className="flex items-end">
                  <Button 
                    type="button" 
                    onClick={() => removeCrop(index)} 
                    variant="destructive" 
                    size="sm"
                    className="w-full"
                  >
                    Remover
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {/* Cultura de cobertura */}
          <div className="space-y-2">
            <Label htmlFor="useCoverCrop">Usou cultura de cobertura?</Label>
            <Select 
              value={formData.useCoverCrop} 
              onValueChange={(value) => handleInputChange("useCoverCrop", value)}
            >
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.useCoverCrop === 'sim' && (
            <div className="space-y-2">
              <Label htmlFor="coverCropTypes">Quais culturas de cobertura?</Label>
              <Input
                id="coverCropTypes"
                value={formData.coverCropTypes}
                onChange={(e) => handleInputChange("coverCropTypes", e.target.value)}
                placeholder="Ex: Aveia, Azevém"
                className="form-input"
              />
            </div>
          )}
        </div>
      )}

      {/* 5.2 PECUÁRIA */}
      {formData.activityTypes.includes("pecuaria") && (
        <div className="space-y-6 p-6 bg-gray-50 rounded-2xl">
          <h4 className="text-base font-semibold text-primary">Pecuária</h4>
          
          <div className="space-y-2">
            <Label htmlFor="pastureTypes">Quais os tipos de pastagem plantados? (identificar a espécie e a cultivar)</Label>
            <Input
              id="pastureTypes"
              value={formData.pastureTypes}
              onChange={(e) => handleInputChange("pastureTypes", e.target.value)}
              placeholder="Ex: Brachiaria brizantha cv. Marandu"
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="useSilage">Usa Silagem ou capineira?</Label>
            <Select 
              value={formData.useSilage} 
              onValueChange={(value) => handleInputChange("useSilage", value)}
            >
              <SelectTrigger className="form-input">
                <SelectValue placeholder="Selecione" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="sim">Sim</SelectItem>
                <SelectItem value="nao">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {formData.useSilage === 'sim' && (
            <div className="space-y-2">
              <Label htmlFor="silageHectares">Quantos hectares?</Label>
              <Input
                id="silageHectares"
                type="text"
                value={formData.silageHectares}
                onChange={(e) => handleAreaChange("silageHectares", e.target.value)}
                placeholder="Ex: 10,50"
                className="form-input"
              />
            </div>
          )}
        </div>
      )}

      {/* 5.3 FLORESTA */}
      {formData.activityTypes.includes("floresta") && (
        <div className="space-y-6 p-6 bg-gray-50 rounded-2xl">
          <h4 className="text-base font-semibold text-primary">Floresta</h4>
          
          <div className="space-y-2">
            <Label htmlFor="forestSpecies">Qual(is) espécies plantadas?</Label>
            <Input
              id="forestSpecies"
              value={formData.forestSpecies}
              onChange={(e) => handleInputChange("forestSpecies", e.target.value)}
              placeholder="Ex: Eucalipto, Pinus"
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="forestArea">Qual é a área da floresta no sistema? (ha)</Label>
            <Input
              id="forestArea"
              type="text"
              value={formData.forestArea}
              onChange={(e) => handleAreaChange("forestArea", e.target.value)}
              placeholder="Ex: 15,00"
              className="form-input"
            />
          </div>
        </div>
      )}

      {/* ========================================== */}
      {/* PARTE 4: PERGUNTAS FINAIS (APP E RESERVA) */}
      {/* ========================================== */}
      <div className={`space-y-6 p-6 rounded-2xl border-2 ${!isAreaValid ? 'bg-red-50 border-red-300' : 'bg-blue-50 border-blue-200'}`}>
        <h4 className="text-base font-semibold text-primary">Áreas de Preservação</h4>
        
        {/* Aviso de validação de áreas */}
        {!isAreaValid && (
          <div className="p-3 bg-red-100 border border-red-400 rounded-lg text-red-700 text-sm">
            <strong>⚠️ Atenção:</strong> A soma das áreas ({sumAreas.toFixed(2).replace('.', ',')} ha) excede a área total da propriedade ({totalArea.toFixed(2).replace('.', ',')} ha).
            <br />
            <span className="text-xs">Produção ({productionArea.toFixed(2).replace('.', ',')}) + APP ({appArea.toFixed(2).replace('.', ',')}) + Reserva ({reserveArea.toFixed(2).replace('.', ',')}) = {sumAreas.toFixed(2).replace('.', ',')} ha</span>
          </div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="permanentProtectionArea">Qual é o tamanho da Área de Proteção Permanente? (ha)</Label>
            <Input
              id="permanentProtectionArea"
              type="text"
              value={formData.permanentProtectionArea}
              onChange={(e) => handleAreaChange("permanentProtectionArea", e.target.value)}
              placeholder="Ex: 90,75"
              className="form-input"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="legalReserveArea">Qual é o tamanho da área de Reserva Legal? (ha)</Label>
            <Input
              id="legalReserveArea"
              type="text"
              value={formData.legalReserveArea}
              onChange={(e) => handleAreaChange("legalReserveArea", e.target.value)}
              placeholder="Ex: 20,00"
              className="form-input"
            />
          </div>
        </div>
      </div>

      {/* Hidden submit button */}
      <Button type="submit" className="hidden" />
    </form>
  );
};

export default PropertyInfoForm;
