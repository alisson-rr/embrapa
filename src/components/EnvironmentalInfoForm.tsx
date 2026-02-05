import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ChevronDown, ChevronUp } from "lucide-react";

interface FertilizerData {
  culture: string;
  formula: string;
  totalQuantity: string;
}

interface HerbicideData {
  culture: string;
  herbicides: string;
  applicationsQuantity: string;
}

interface FungicideData {
  culture: string;
  fungicides: string;
  applications: string;
}

interface InsecticideData {
  culture: string;
  insecticides: string;
  applications: string;
}

interface OtherPesticideData {
  culture: string;
  pesticideName: string;
  applications: string;
}

interface EnvironmentalInfoFormData {
  organicMatterPercentage: string;
  calciumQuantity: string;
  fertilizers: FertilizerData[];
  herbicides: HerbicideData[];
  fungicides: FungicideData[];
  insecticides: InsecticideData[];
  otherPesticides: OtherPesticideData[];
  fuelConsumption: string;
  electricityExpense: string;
}

interface CropData {
  name: string;
  plantingMonth: string;
  areaPercentage: string;
}

interface EnvironmentalInfoFormProps {
  onSubmit: (data: EnvironmentalInfoFormData) => void;
  initialData?: Partial<EnvironmentalInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
  availableCrops?: CropData[];
}

const EnvironmentalInfoForm = ({ 
  onSubmit, 
  initialData = {}, 
  onValidationChange,
  availableCrops = []
}: EnvironmentalInfoFormProps) => {
  // Lista de culturas disponíveis (vindas do formulário de propriedade)
  const cropOptions = availableCrops.filter(crop => crop.name).map(crop => crop.name);
  const [formData, setFormData] = useState<EnvironmentalInfoFormData>({
    organicMatterPercentage: initialData.organicMatterPercentage || "3,5%",
    calciumQuantity: initialData.calciumQuantity || "2000 kg",
    fertilizers: initialData.fertilizers || [],
    herbicides: initialData.herbicides || [],
    fungicides: initialData.fungicides || [],
    insecticides: initialData.insecticides || [],
    otherPesticides: initialData.otherPesticides || [],
    fuelConsumption: initialData.fuelConsumption || "500 litros/mês",
    electricityExpense: initialData.electricityExpense || "R$ 1.500",
  });


  // Check validation
  useEffect(() => {
    const basicFieldsValid = !!(
      formData.organicMatterPercentage && 
      formData.calciumQuantity && 
      formData.fuelConsumption && 
      formData.electricityExpense
    );
    
    onValidationChange?.(basicFieldsValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof EnvironmentalInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (field: keyof EnvironmentalInfoFormData, value: string) => {
    let cleanValue = value.replace(/[^\d.,]/g, '');
    if (!cleanValue) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    const formattedValue = 'R$ ' + cleanValue;
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const addFertilizer = () => {
    setFormData(prev => ({
      ...prev,
      fertilizers: [...prev.fertilizers, { culture: "", formula: "", totalQuantity: "" }]
    }));
  };

  const removeFertilizer = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fertilizers: prev.fertilizers.filter((_, i) => i !== index)
    }));
  };

  const handleFertilizerChange = (index: number, field: keyof FertilizerData, value: string) => {
    const newFertilizers = [...formData.fertilizers];
    newFertilizers[index] = { ...newFertilizers[index], [field]: value };
    setFormData(prev => ({ ...prev, fertilizers: newFertilizers }));
  };

  const addHerbicide = () => {
    setFormData(prev => ({
      ...prev,
      herbicides: [...prev.herbicides, { culture: "", herbicides: "", applicationsQuantity: "" }]
    }));
  };

  const removeHerbicide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      herbicides: prev.herbicides.filter((_, i) => i !== index)
    }));
  };

  const handleHerbicideChange = (index: number, field: keyof HerbicideData, value: string) => {
    const newHerbicides = [...formData.herbicides];
    newHerbicides[index] = { ...newHerbicides[index], [field]: value };
    setFormData(prev => ({ ...prev, herbicides: newHerbicides }));
  };

  const addFungicide = () => {
    setFormData(prev => ({
      ...prev,
      fungicides: [...prev.fungicides, { culture: "", fungicides: "", applications: "" }]
    }));
  };

  const removeFungicide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      fungicides: prev.fungicides.filter((_, i) => i !== index)
    }));
  };

  const handleFungicideChange = (index: number, field: keyof FungicideData, value: string) => {
    const newFungicides = [...formData.fungicides];
    newFungicides[index] = { ...newFungicides[index], [field]: value };
    setFormData(prev => ({ ...prev, fungicides: newFungicides }));
  };

  const addInsecticide = () => {
    setFormData(prev => ({
      ...prev,
      insecticides: [...prev.insecticides, { culture: "", insecticides: "", applications: "" }]
    }));
  };

  const removeInsecticide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      insecticides: prev.insecticides.filter((_, i) => i !== index)
    }));
  };

  const handleInsecticideChange = (index: number, field: keyof InsecticideData, value: string) => {
    const newInsecticides = [...formData.insecticides];
    newInsecticides[index] = { ...newInsecticides[index], [field]: value };
    setFormData(prev => ({ ...prev, insecticides: newInsecticides }));
  };

  const addOtherPesticide = () => {
    setFormData(prev => ({
      ...prev,
      otherPesticides: [...prev.otherPesticides, { culture: "", pesticideName: "", applications: "" }]
    }));
  };

  const removeOtherPesticide = (index: number) => {
    setFormData(prev => ({
      ...prev,
      otherPesticides: prev.otherPesticides.filter((_, i) => i !== index)
    }));
  };

  const handleOtherPesticideChange = (index: number, field: keyof OtherPesticideData, value: string) => {
    const newOtherPesticides = [...formData.otherPesticides];
    newOtherPesticides[index] = { ...newOtherPesticides[index], [field]: value };
    setFormData(prev => ({ ...prev, otherPesticides: newOtherPesticides }));
  };

  const handleNumberKeyPress = (e: React.KeyboardEvent) => {
    if (!/[0-9.,]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Pergunta 1: Percentual de matéria orgânica */}
      <div className="space-y-2">
        <Label htmlFor="organicMatterPercentage" className="text-base font-medium text-foreground">
          Qual o percentual de matéria orgânica do solo?
        </Label>
        <Input
          id="organicMatterPercentage"
          type="text"
          placeholder="Ex.: 3,5%"
          value={formData.organicMatterPercentage}
          onChange={(e) => handleInputChange("organicMatterPercentage", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Pergunta 2: Quantidade de calcário */}
      <div className="space-y-2">
        <Label htmlFor="calciumQuantity" className="text-base font-medium text-foreground">
          Qual a quantidade de calcário aplicada no último ano?
        </Label>
        <Input
          id="calciumQuantity"
          type="text"
          placeholder="Ex.: 2000 kg"
          value={formData.calciumQuantity}
          onChange={(e) => handleInputChange("calciumQuantity", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Pergunta 3: Adubos NPK por cultura */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Label className="text-base font-medium text-foreground">
            Qual a quantidade de adubo utilizada (NPK)?
          </Label>
          <button
            type="button"
            onClick={addFertilizer}
            className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
          >
            + Adicionar Cultura
          </button>
        </div>
        {formData.fertilizers.map((fertilizer, index) => (
          <div key={index} className="p-4 border border-input rounded-md space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Cultura {index + 1}</span>
              {formData.fertilizers.length > 0 && (
                <button
                  type="button"
                  onClick={() => removeFertilizer(index)}
                  className="text-red-500 hover:text-red-700 text-sm"
                >
                  Remover
                </button>
              )}
            </div>
            {cropOptions.length > 0 ? (
              <Select
                value={fertilizer.culture}
                onValueChange={(value) => handleFertilizerChange(index, "culture", value)}
              >
                <SelectTrigger className="form-input">
                  <SelectValue placeholder="Selecione a cultura" />
                </SelectTrigger>
                <SelectContent>
                  {cropOptions.map((crop) => (
                    <SelectItem key={crop} value={crop}>
                      {crop}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                placeholder="Cultura (cadastre culturas na etapa 2)"
                value={fertilizer.culture}
                onChange={(e) => handleFertilizerChange(index, "culture", e.target.value)}
                className="form-input"
              />
            )}
            <Input
              placeholder="Fórmula do Adubo (ex: 20-10-10)"
              value={fertilizer.formula}
              onChange={(e) => handleFertilizerChange(index, "formula", e.target.value)}
              className="form-input"
            />
            <Input
              placeholder="Quantidade por hectare (kg/ha)"
              value={fertilizer.totalQuantity}
              onChange={(e) => handleFertilizerChange(index, "totalQuantity", e.target.value)}
              onKeyPress={handleNumberKeyPress}
              className="form-input"
            />
          </div>
        ))}
      </div>

      {/* Pergunta 4: Defensivos */}
      <div className="space-y-6">
        <Label className="text-base font-medium text-foreground">
          Qual a quantidade de defensivos utilizada?
        </Label>

        {/* Herbicidas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-primary">i. Herbicida</Label>
            <button
              type="button"
              onClick={addHerbicide}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              + Adicionar
            </button>
          </div>
          {formData.herbicides.map((herbicide, index) => (
            <div key={index} className="p-3 border border-input rounded-md space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Herbicida {index + 1}</span>
                {formData.herbicides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeHerbicide(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remover
                  </button>
                )}
              </div>
              {cropOptions.length > 0 ? (
                <Select
                  value={herbicide.culture}
                  onValueChange={(value) => handleHerbicideChange(index, "culture", value)}
                >
                  <SelectTrigger className="form-input text-sm">
                    <SelectValue placeholder="Selecione a cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Cultura (cadastre culturas na etapa 2)"
                  value={herbicide.culture}
                  onChange={(e) => handleHerbicideChange(index, "culture", e.target.value)}
                  className="form-input text-sm"
                />
              )}
              <Input
                placeholder="Quais Herbicidas"
                value={herbicide.herbicides}
                onChange={(e) => handleHerbicideChange(index, "herbicides", e.target.value)}
                className="form-input text-sm"
              />
              <Input
                placeholder="Nº aplicações e dose por hectare (L/ha ou kg/ha)"
                value={herbicide.applicationsQuantity}
                onChange={(e) => handleHerbicideChange(index, "applicationsQuantity", e.target.value)}
                className="form-input text-sm"
              />
            </div>
          ))}
        </div>

        {/* Fungicidas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-primary">ii. Fungicida</Label>
            <button
              type="button"
              onClick={addFungicide}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              + Adicionar
            </button>
          </div>
          {formData.fungicides.map((fungicide, index) => (
            <div key={index} className="p-3 border border-input rounded-md space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Fungicida {index + 1}</span>
                {formData.fungicides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeFungicide(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remover
                  </button>
                )}
              </div>
              {cropOptions.length > 0 ? (
                <Select
                  value={fungicide.culture}
                  onValueChange={(value) => handleFungicideChange(index, "culture", value)}
                >
                  <SelectTrigger className="form-input text-sm">
                    <SelectValue placeholder="Selecione a cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Cultura (cadastre culturas na etapa 2)"
                  value={fungicide.culture}
                  onChange={(e) => handleFungicideChange(index, "culture", e.target.value)}
                  className="form-input text-sm"
                />
              )}
              <Input
                placeholder="Quais Fungicidas"
                value={fungicide.fungicides}
                onChange={(e) => handleFungicideChange(index, "fungicides", e.target.value)}
                className="form-input text-sm"
              />
              <Input
                placeholder="Nº aplicações e dose por hectare (L/ha ou kg/ha)"
                value={fungicide.applications}
                onChange={(e) => handleFungicideChange(index, "applications", e.target.value)}
                className="form-input text-sm"
              />
            </div>
          ))}
        </div>

        {/* Inseticidas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-primary">iii. Inseticida</Label>
            <button
              type="button"
              onClick={addInsecticide}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              + Adicionar
            </button>
          </div>
          {formData.insecticides.map((insecticide, index) => (
            <div key={index} className="p-3 border border-input rounded-md space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Inseticida {index + 1}</span>
                {formData.insecticides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeInsecticide(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remover
                  </button>
                )}
              </div>
              {cropOptions.length > 0 ? (
                <Select
                  value={insecticide.culture}
                  onValueChange={(value) => handleInsecticideChange(index, "culture", value)}
                >
                  <SelectTrigger className="form-input text-sm">
                    <SelectValue placeholder="Selecione a cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Cultura (cadastre culturas na etapa 2)"
                  value={insecticide.culture}
                  onChange={(e) => handleInsecticideChange(index, "culture", e.target.value)}
                  className="form-input text-sm"
                />
              )}
              <Input
                placeholder="Quais Inseticidas"
                value={insecticide.insecticides}
                onChange={(e) => handleInsecticideChange(index, "insecticides", e.target.value)}
                className="form-input text-sm"
              />
              <Input
                placeholder="Nº aplicações e dose por hectare (L/ha ou kg/ha)"
                value={insecticide.applications}
                onChange={(e) => handleInsecticideChange(index, "applications", e.target.value)}
                className="form-input text-sm"
              />
            </div>
          ))}
        </div>

        {/* Outros Defensivos */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold text-primary">iv. Outro (especificar)</Label>
            <button
              type="button"
              onClick={addOtherPesticide}
              className="px-3 py-1 text-sm bg-primary text-white rounded hover:bg-primary/90"
            >
              + Adicionar
            </button>
          </div>
          {formData.otherPesticides.map((other, index) => (
            <div key={index} className="p-3 border border-input rounded-md space-y-2 bg-gray-50">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium">Outro {index + 1}</span>
                {formData.otherPesticides.length > 0 && (
                  <button
                    type="button"
                    onClick={() => removeOtherPesticide(index)}
                    className="text-red-500 hover:text-red-700 text-xs"
                  >
                    Remover
                  </button>
                )}
              </div>
              {cropOptions.length > 0 ? (
                <Select
                  value={other.culture}
                  onValueChange={(value) => handleOtherPesticideChange(index, "culture", value)}
                >
                  <SelectTrigger className="form-input text-sm">
                    <SelectValue placeholder="Selecione a cultura" />
                  </SelectTrigger>
                  <SelectContent>
                    {cropOptions.map((crop) => (
                      <SelectItem key={crop} value={crop}>
                        {crop}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  placeholder="Cultura (cadastre culturas na etapa 2)"
                  value={other.culture}
                  onChange={(e) => handleOtherPesticideChange(index, "culture", e.target.value)}
                  className="form-input text-sm"
                />
              )}
              <Input
                placeholder="Qual?"
                value={other.pesticideName}
                onChange={(e) => handleOtherPesticideChange(index, "pesticideName", e.target.value)}
                className="form-input text-sm"
              />
              <Input
                placeholder="Nº aplicações e dose por hectare (L/ha ou kg/ha)"
                value={other.applications}
                onChange={(e) => handleOtherPesticideChange(index, "applications", e.target.value)}
                className="form-input text-sm"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Pergunta 5: Combustível */}
      <div className="space-y-2">
        <Label htmlFor="fuelConsumption" className="text-base font-medium text-foreground">
          Qual a quantidade de combustível utilizada (mensal ou anual)?
        </Label>
        <Input
          id="fuelConsumption"
          type="text"
          placeholder="Ex.: 1000 litros/mês"
          value={formData.fuelConsumption}
          onChange={(e) => handleInputChange("fuelConsumption", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Pergunta 6: Energia elétrica */}
      <div className="space-y-2">
        <Label htmlFor="electricityExpense" className="text-base font-medium text-foreground">
          Qual o valor da despesa com energia elétrica (mensal ou anual)?
        </Label>
        <Input
          id="electricityExpense"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.electricityExpense}
          onChange={(e) => handleCurrencyChange("electricityExpense", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>
    </form>
  );
};

export default EnvironmentalInfoForm;
