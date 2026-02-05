import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";

interface PropertyInfoFormData {
  propertyName: string;
  municipality: string;
  state: string;
  totalArea: string;
  productionArea: string;
  permanentProtectionArea: string;
  legalReserveArea: string;
  activityTypes: string[];
  integrationSystemType: string;
  livestockType: string;
  productionSystem: string;
  systemUsageTime: string;
  dailyDescription: string;
  pastureTypes: string[];
  useSilage: string;
  hectares: string;
  // Dados do rebanho
  cattleCount: string;
  heiferCount: string;
  bullCount: string;
  calfCount: string;
  bullCalfCount: string;
  // Peso vivo médio
  cattleWeight: string;
  heiferWeight: string;
  bullWeight: string;
  calfWeight: string;
  bullCalfWeight: string;
  // Ganho de peso médio por dia
  heiferWeightGain: string;
  bullWeightGain: string;
  calfWeightGain: string;
  // Digestibilidade da dieta
  cattleDigestibility: string;
  heiferDigestibility: string;
  bullDigestibility: string;
  calfDigestibility: string;
  bullCalfDigestibility: string;
  // Taxa de prenhez
  pregnancyRate: string;
  // Fração do tempo no confinamento
  cattleConfinement: string;
  heiferConfinement: string;
  bullConfinement: string;
  calfConfinement: string;
  bullCalfConfinement: string;
  // Fração do tempo na pastagem
  cattlePasture: string;
  heiferPasture: string;
  bullPasture: string;
  calfPasture: string;
  bullCalfPasture: string;
}

interface PropertyInfoFormProps {
  onSubmit: (data: PropertyInfoFormData) => void;
  initialData?: Partial<PropertyInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
}

const PropertyInfoForm = ({ onSubmit, initialData = {}, onValidationChange }: PropertyInfoFormProps) => {
  const [formData, setFormData] = useState<PropertyInfoFormData>({
    propertyName: "",
    municipality: "",
    state: "",
    totalArea: "",
    productionArea: "",
    permanentProtectionArea: "",
    legalReserveArea: "",
    activityTypes: [],
    integrationSystemType: "",
    livestockType: "",
    productionSystem: "",
    systemUsageTime: "",
    dailyDescription: "",
    pastureTypes: [],
    useSilage: "",
    hectares: "",
    cattleCount: "",
    heiferCount: "",
    bullCount: "",
    calfCount: "",
    bullCalfCount: "",
    cattleWeight: "",
    heiferWeight: "",
    bullWeight: "",
    calfWeight: "",
    bullCalfWeight: "",
    heiferWeightGain: "",
    bullWeightGain: "",
    calfWeightGain: "",
    cattleDigestibility: "",
    heiferDigestibility: "",
    bullDigestibility: "",
    calfDigestibility: "",
    bullCalfDigestibility: "",
    pregnancyRate: "",
    cattleConfinement: "",
    heiferConfinement: "",
    bullConfinement: "",
    calfConfinement: "",
    bullCalfConfinement: "",
    cattlePasture: "",
    heiferPasture: "",
    bullPasture: "",
    calfPasture: "",
    bullCalfPasture: "",
    ...initialData,
  });

  // Removido newPastureType pois agora são opções fixas

  // Check initial validation
  useEffect(() => {
    const isValid = !!(formData.propertyName && formData.municipality && formData.state && formData.totalArea && formData.activityTypes.length > 0);
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof PropertyInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNumberKeyPress = (e: React.KeyboardEvent) => {
    if (!/[0-9.]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
      e.preventDefault();
    }
  };

  const handleAreaChange = (field: keyof PropertyInfoFormData, value: string) => {
    // Permite apenas números e ponto decimal, com até 2 casas decimais
    const regex = /^\d*\.?\d{0,2}$/;
    if (value === '' || regex.test(value)) {
      setFormData(prev => ({ ...prev, [field]: value }));
    }
  };

  const handleActivityTypeToggle = (activityType: string) => {
    const newActivityTypes = formData.activityTypes.includes(activityType)
      ? formData.activityTypes.filter(type => type !== activityType)
      : [...formData.activityTypes, activityType];
    
    setFormData(prev => ({
      ...prev,
      activityTypes: newActivityTypes
    }));
  };

  const handlePastureTypeToggle = (pastureType: string) => {
    const currentTypes = formData.pastureTypes;
    const newTypes = currentTypes.includes(pastureType)
      ? currentTypes.filter(type => type !== pastureType)
      : [...currentTypes, pastureType];
    
    setFormData(prev => ({
      ...prev,
      pastureTypes: newTypes
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const activityOptions = [
    { id: "lavoura", name: "Lavoura", image: "/lavoura.png" },
    { id: "pecuaria", name: "Pecuária", image: "/Pecuaria.png" },
    { id: "floresta", name: "Floresta", image: "/Floresta.png" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Informações básicas da propriedade */}
      <div className="space-y-6">
        <div>
          <Label htmlFor="propertyName">Nome da propriedade</Label>
          <Input
            id="propertyName"
            value={formData.propertyName}
            onChange={(e) => handleInputChange("propertyName", e.target.value)}
            placeholder="Ex: Fazenda Boa Vista"
            className="mt-2"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="municipality">Município</Label>
            <Input
              id="municipality"
              value={formData.municipality}
              onChange={(e) => handleInputChange("municipality", e.target.value)}
              placeholder="Ex: São Paulo"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="state">Estado</Label>
            <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="AC">Acre</SelectItem>
                <SelectItem value="AL">Alagoas</SelectItem>
                <SelectItem value="AP">Amapá</SelectItem>
                <SelectItem value="AM">Amazonas</SelectItem>
                <SelectItem value="BA">Bahia</SelectItem>
                <SelectItem value="CE">Ceará</SelectItem>
                <SelectItem value="DF">Distrito Federal</SelectItem>
                <SelectItem value="ES">Espírito Santo</SelectItem>
                <SelectItem value="GO">Goiás</SelectItem>
                <SelectItem value="MA">Maranhão</SelectItem>
                <SelectItem value="MT">Mato Grosso</SelectItem>
                <SelectItem value="MS">Mato Grosso do Sul</SelectItem>
                <SelectItem value="MG">Minas Gerais</SelectItem>
                <SelectItem value="PA">Pará</SelectItem>
                <SelectItem value="PB">Paraíba</SelectItem>
                <SelectItem value="PR">Paraná</SelectItem>
                <SelectItem value="PE">Pernambuco</SelectItem>
                <SelectItem value="PI">Piauí</SelectItem>
                <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                <SelectItem value="RN">Rio Grande do Norte</SelectItem>
                <SelectItem value="RS">Rio Grande do Sul</SelectItem>
                <SelectItem value="RO">Rondônia</SelectItem>
                <SelectItem value="RR">Roraima</SelectItem>
                <SelectItem value="SC">Santa Catarina</SelectItem>
                <SelectItem value="SP">São Paulo</SelectItem>
                <SelectItem value="SE">Sergipe</SelectItem>
                <SelectItem value="TO">Tocantins</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="totalArea">Qual o tamanho total da propriedade? (ha)</Label>
            <Input
              id="totalArea"
              type="text"
              value={formData.totalArea}
              onChange={(e) => handleAreaChange("totalArea", e.target.value)}
              placeholder="Ex: 100.50"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="productionArea">Qual o tamanho total da área utilizada para produção? (ha)</Label>
            <Input
              id="productionArea"
              type="text"
              value={formData.productionArea}
              onChange={(e) => handleAreaChange("productionArea", e.target.value)}
              placeholder="Ex: 10.25"
              className="mt-2"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="permanentProtectionArea">Qual é o tamanho da Área de Proteção Permanente?</Label>
            <Input
              id="permanentProtectionArea"
              type="text"
              value={formData.permanentProtectionArea}
              onChange={(e) => handleAreaChange("permanentProtectionArea", e.target.value)}
              placeholder="Ex: 90.75"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="legalReserveArea">Qual é o tamanho da Área de Reserva Legal?</Label>
            <Input
              id="legalReserveArea"
              type="text"
              value={formData.legalReserveArea}
              onChange={(e) => handleAreaChange("legalReserveArea", e.target.value)}
              placeholder="Ex: 0.00"
              className="mt-2"
            />
          </div>
        </div>
      </div>

      {/* Tipos de atividade */}
      <div className="space-y-4">
        <Label>Selecione um ou mais tipos de atividade para a sua propriedade.</Label>
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

      {/* Sistema de Integração */}
      {formData.activityTypes.length > 1 && (
        <div>
          <Label htmlFor="integrationSystemType">Selecione o tipo da sua propriedade</Label>
          <Select value={formData.integrationSystemType} onValueChange={(value) => handleInputChange("integrationSystemType", value)}>
            <SelectTrigger className="mt-2">
              <SelectValue placeholder="Selecione o sistema de integração" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ilf">ILF (Integração Lavoura-Floresta)</SelectItem>
              <SelectItem value="ilp">ILP (Integração Lavoura-Pecuária)</SelectItem>
              <SelectItem value="ipf">IPF (Integração Pecuária-Floresta)</SelectItem>
              <SelectItem value="ilpf">ILPF (Integração Lavoura-Pecuária-Floresta)</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}

      {/* Seção de informações adicionais */}
      {formData.activityTypes.length > 0 && (
        <div className="space-y-6 p-6 bg-gray-50 rounded-2xl">
          <div>
            <Label htmlFor="livestockType">Qual o tipo de pecuária?</Label>
            <Select value={formData.livestockType} onValueChange={(value) => handleInputChange("livestockType", value)}>
              <SelectTrigger className="mt-2">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="corte">Pecuária de corte</SelectItem>
                <SelectItem value="leite">Pecuária de leite</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Campo condicional para sistema de produção quando pecuária de corte */}
          {formData.livestockType === "corte" && (
            <div>
              <Label htmlFor="productionSystem">Qual o sistema de produção? Pecuária de corte</Label>
              <Select value={formData.productionSystem || ""} onValueChange={(value) => handleInputChange("productionSystem", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione o sistema" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cria">Cria</SelectItem>
                  <SelectItem value="recria">Recria</SelectItem>
                  <SelectItem value="engorda">Engorda</SelectItem>
                  <SelectItem value="cria-recria">Cria e recria</SelectItem>
                  <SelectItem value="ciclo-completo">Ciclo completo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="systemUsageTime">Há quanto tempo utiliza esse sistema de produção?</Label>
            <Input
              id="systemUsageTime"
              value={formData.systemUsageTime}
              onChange={(e) => handleInputChange("systemUsageTime", e.target.value)}
              placeholder="Ex: 1 ano"
              className="mt-2"
            />
          </div>

          <div>
            <Label htmlFor="dailyDescription">Dê uma breve descrição da forma como utiliza a terra no dia a dia.</Label>
            <Textarea
              id="dailyDescription"
              value={formData.dailyDescription}
              onChange={(e) => handleInputChange("dailyDescription", e.target.value)}
              placeholder="O dia a dia é marcado por uma rotina de atividades que combinam trabalho, lazer e responsabilidades..."
              className="mt-2 min-h-[100px]"
            />
          </div>

          <div>
            <Label>Quais os tipos de pastagem plantados?</Label>
            <div className="mt-2 space-y-3">
              <div className="flex flex-col space-y-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pastureTypes.includes("Pastagens nativas")}
                    onChange={() => handlePastureTypeToggle("Pastagens nativas")}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Pastagens nativas</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.pastureTypes.includes("Pastagens plantadas")}
                    onChange={() => handlePastureTypeToggle("Pastagens plantadas")}
                    className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary focus:ring-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Pastagens plantadas</span>
                </label>
              </div>
              
              {/* Mostrar seleções atuais */}
              {formData.pastureTypes.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.pastureTypes.map((pastureType) => (
                    <span
                      key={pastureType}
                      className="inline-flex items-center px-3 py-1 bg-primary/10 text-primary rounded-full text-sm"
                    >
                      {pastureType}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="useSilage">Usa silagem ou capineira?</Label>
              <Select value={formData.useSilage} onValueChange={(value) => handleInputChange("useSilage", value)}>
                <SelectTrigger className="mt-2">
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="silagem">Silagem</SelectItem>
                  <SelectItem value="capineira">Capineira</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="hectares">Quantos hectares? (ha)</Label>
              <Input
                id="hectares"
                type="number"
                value={formData.hectares}
                onChange={(e) => handleInputChange("hectares", e.target.value)}
                onKeyPress={handleNumberKeyPress}
                placeholder="Ex: 10"
                className="mt-2"
              />
            </div>
          </div>

          {/* Dados do rebanho - Número de animais */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Dados do rebanho - Nº de animais</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cattleCount">Vacas leiteiras:</Label>
                <Input
                  id="cattleCount"
                  type="number"
                  value={formData.cattleCount}
                  onChange={(e) => handleInputChange("cattleCount", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 20"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="heiferCount">Novilhas:</Label>
                <Input
                  id="heiferCount"
                  type="number"
                  value={formData.heiferCount}
                  onChange={(e) => handleInputChange("heiferCount", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 10"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullCount">Novilhos:</Label>
                <Input
                  id="bullCount"
                  type="number"
                  value={formData.bullCount}
                  onChange={(e) => handleInputChange("bullCount", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 10"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calfCount">Bezerros:</Label>
                <Input
                  id="calfCount"
                  type="number"
                  value={formData.calfCount}
                  onChange={(e) => handleInputChange("calfCount", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 50"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullCalfCount">Touros/Bois:</Label>
                <Input
                  id="bullCalfCount"
                  type="number"
                  value={formData.bullCalfCount}
                  onChange={(e) => handleInputChange("bullCalfCount", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 20"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Dados do rebanho - Peso vivo médio */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Dados do rebanho - Peso vivo médio</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cattleWeight">Vacas leiteiras:</Label>
                <Input
                  id="cattleWeight"
                  type="number"
                  value={formData.cattleWeight}
                  onChange={(e) => handleInputChange("cattleWeight", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 200"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="heiferWeight">Novilhas:</Label>
                <Input
                  id="heiferWeight"
                  type="number"
                  value={formData.heiferWeight}
                  onChange={(e) => handleInputChange("heiferWeight", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 100"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullWeight">Novilhos:</Label>
                <Input
                  id="bullWeight"
                  type="number"
                  value={formData.bullWeight}
                  onChange={(e) => handleInputChange("bullWeight", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 100"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calfWeight">Bezerros:</Label>
                <Input
                  id="calfWeight"
                  type="number"
                  value={formData.calfWeight}
                  onChange={(e) => handleInputChange("calfWeight", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 50"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullCalfWeight">Touros/Bois:</Label>
                <Input
                  id="bullCalfWeight"
                  type="number"
                  value={formData.bullCalfWeight}
                  onChange={(e) => handleInputChange("bullCalfWeight", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 200"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Dados do rebanho - Ganho de peso médio por dia */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Dados do rebanho - Ganho de peso médio por dia</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="heiferWeightGain">Novilhas:</Label>
                <Input
                  id="heiferWeightGain"
                  type="number"
                  value={formData.heiferWeightGain}
                  onChange={(e) => handleInputChange("heiferWeightGain", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullWeightGain">Novilhos:</Label>
                <Input
                  id="bullWeightGain"
                  type="number"
                  value={formData.bullWeightGain}
                  onChange={(e) => handleInputChange("bullWeightGain", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="calfWeightGain">Bezerros:</Label>
                <Input
                  id="calfWeightGain"
                  type="number"
                  value={formData.calfWeightGain}
                  onChange={(e) => handleInputChange("calfWeightGain", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Dados do rebanho - Digestibilidade da dieta */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Dados do rebanho - Digestibilidade da dieta</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cattleDigestibility">Vacas leiteiras:</Label>
                <Input
                  id="cattleDigestibility"
                  type="number"
                  value={formData.cattleDigestibility}
                  onChange={(e) => handleInputChange("cattleDigestibility", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 2"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="heiferDigestibility">Novilhas:</Label>
                <Input
                  id="heiferDigestibility"
                  type="number"
                  value={formData.heiferDigestibility}
                  onChange={(e) => handleInputChange("heiferDigestibility", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullDigestibility">Novilhos:</Label>
                <Input
                  id="bullDigestibility"
                  type="number"
                  value={formData.bullDigestibility}
                  onChange={(e) => handleInputChange("bullDigestibility", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calfDigestibility">Bezerros:</Label>
                <Input
                  id="calfDigestibility"
                  type="number"
                  value={formData.calfDigestibility}
                  onChange={(e) => handleInputChange("calfDigestibility", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullCalfDigestibility">Touros/Bois:</Label>
                <Input
                  id="bullCalfDigestibility"
                  type="number"
                  value={formData.bullCalfDigestibility}
                  onChange={(e) => handleInputChange("bullCalfDigestibility", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 1"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Taxa de prenhez */}
          <div>
            <Label htmlFor="pregnancyRate">Dados do rebanho - Taxa de prenhez</Label>
            <div className="mt-2">
              <Label htmlFor="pregnancyRate">Vacas leiteiras:</Label>
              <Input
                id="pregnancyRate"
                type="number"
                value={formData.pregnancyRate}
                onChange={(e) => handleInputChange("pregnancyRate", e.target.value)}
                onKeyPress={handleNumberKeyPress}
                placeholder="Ex.: 50"
                className="mt-2"
              />
            </div>
          </div>

          {/* Fração do tempo no confinamento */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Dados do rebanho - Fração do tempo no confinamento <span className="text-sm font-normal">(a soma deve ser 1)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cattleConfinement">Vacas leiteiras:</Label>
                <Input
                  id="cattleConfinement"
                  type="number"
                  step="0.1"
                  value={formData.cattleConfinement}
                  onChange={(e) => handleInputChange("cattleConfinement", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="heiferConfinement">Novilhas:</Label>
                <Input
                  id="heiferConfinement"
                  type="number"
                  step="0.1"
                  value={formData.heiferConfinement}
                  onChange={(e) => handleInputChange("heiferConfinement", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullConfinement">Novilhos:</Label>
                <Input
                  id="bullConfinement"
                  type="number"
                  step="0.1"
                  value={formData.bullConfinement}
                  onChange={(e) => handleInputChange("bullConfinement", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calfConfinement">Bezerros:</Label>
                <Input
                  id="calfConfinement"
                  type="number"
                  step="0.1"
                  value={formData.calfConfinement}
                  onChange={(e) => handleInputChange("calfConfinement", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullCalfConfinement">Touros/Bois:</Label>
                <Input
                  id="bullCalfConfinement"
                  type="number"
                  step="0.1"
                  value={formData.bullCalfConfinement}
                  onChange={(e) => handleInputChange("bullCalfConfinement", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
            </div>
          </div>

          {/* Fração do tempo na pastagem */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-primary">Dados do rebanho - Fração do tempo na pastagem <span className="text-sm font-normal">(a soma deve ser 1)</span></h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="cattlePasture">Vacas leiteiras:</Label>
                <Input
                  id="cattlePasture"
                  type="number"
                  step="0.1"
                  value={formData.cattlePasture}
                  onChange={(e) => handleInputChange("cattlePasture", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="heiferPasture">Novilhas:</Label>
                <Input
                  id="heiferPasture"
                  type="number"
                  step="0.1"
                  value={formData.heiferPasture}
                  onChange={(e) => handleInputChange("heiferPasture", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullPasture">Novilhos:</Label>
                <Input
                  id="bullPasture"
                  type="number"
                  step="0.1"
                  value={formData.bullPasture}
                  onChange={(e) => handleInputChange("bullPasture", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="calfPasture">Bezerros:</Label>
                <Input
                  id="calfPasture"
                  type="number"
                  step="0.1"
                  value={formData.calfPasture}
                  onChange={(e) => handleInputChange("calfPasture", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="bullCalfPasture">Touros/Bois:</Label>
                <Input
                  id="bullCalfPasture"
                  type="number"
                  step="0.1"
                  value={formData.bullCalfPasture}
                  onChange={(e) => handleInputChange("bullCalfPasture", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  placeholder="Ex.: 0.5"
                  className="mt-2"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </form>
  );
};

export default PropertyInfoForm;
