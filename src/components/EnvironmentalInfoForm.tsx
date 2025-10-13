import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ChevronDown, ChevronUp } from "lucide-react";

interface CultureData {
  name: string;
  area: string;
  production: string;
  nitrogenFertilizer: string;
  phosphorusFertilizer: string;
  potassiumFertilizer: string;
  limingQuantity: string;
  pesticidesQuantity: string;
}

interface PastureData {
  name: string;
  area: string;
  nitrogenFertilizer: string;
  phosphorusFertilizer: string;
  potassiumFertilizer: string;
  limingQuantity: string;
}

interface EnvironmentalInfoFormData {
  organicMatterPercentage: string;
  calciumQuantity: string;
  cultures: CultureData[];
  pastures: PastureData[];
  monthlyFuelConsumption: string;
  monthlyElectricityExpense: string;
}

interface EnvironmentalInfoFormProps {
  onSubmit: (data: EnvironmentalInfoFormData) => void;
  initialData?: Partial<EnvironmentalInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
  hasCultures?: boolean;
  hasPastures?: boolean;
}

const EnvironmentalInfoForm = ({ 
  onSubmit, 
  initialData = {}, 
  onValidationChange,
  hasCultures = false,
  hasPastures = false
}: EnvironmentalInfoFormProps) => {
  const [formData, setFormData] = useState<EnvironmentalInfoFormData>({
    organicMatterPercentage: initialData.organicMatterPercentage || "",
    calciumQuantity: initialData.calciumQuantity || "",
    cultures: initialData.cultures || [],
    pastures: initialData.pastures || [],
    monthlyFuelConsumption: initialData.monthlyFuelConsumption || "",
    monthlyElectricityExpense: initialData.monthlyElectricityExpense || "",
  });

  const [expandedCultures, setExpandedCultures] = useState<number[]>([]);
  const [expandedPastures, setExpandedPastures] = useState<number[]>([]);

  // Initialize cultures and pastures based on props
  useEffect(() => {
    if (hasCultures && formData.cultures.length === 0) {
      setFormData(prev => ({
        ...prev,
        cultures: [
          {
            name: "Cultura 1 - Milho",
            area: "",
            production: "",
            nitrogenFertilizer: "",
            phosphorusFertilizer: "",
            potassiumFertilizer: "",
            limingQuantity: "",
            pesticidesQuantity: "",
          },
          {
            name: "Cultura 2 - Trigo",
            area: "",
            production: "",
            nitrogenFertilizer: "",
            phosphorusFertilizer: "",
            potassiumFertilizer: "",
            limingQuantity: "",
            pesticidesQuantity: "",
          },
        ]
      }));
    }

    if (hasPastures && formData.pastures.length === 0) {
      setFormData(prev => ({
        ...prev,
        pastures: [
          {
            name: "Pastagem 1 - Naturais",
            area: "",
            nitrogenFertilizer: "",
            phosphorusFertilizer: "",
            potassiumFertilizer: "",
            limingQuantity: "",
          },
          {
            name: "Pastagem 2 - Artificiais",
            area: "",
            nitrogenFertilizer: "",
            phosphorusFertilizer: "",
            potassiumFertilizer: "",
            limingQuantity: "",
          },
        ]
      }));
    }
  }, [hasCultures, hasPastures]);

  // Check validation
  useEffect(() => {
    const basicFieldsValid = !!(
      formData.organicMatterPercentage && 
      formData.calciumQuantity && 
      formData.monthlyFuelConsumption && 
      formData.monthlyElectricityExpense
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

  const handleCultureChange = (index: number, field: keyof CultureData, value: string) => {
    const newCultures = [...formData.cultures];
    newCultures[index] = { ...newCultures[index], [field]: value };
    setFormData(prev => ({ ...prev, cultures: newCultures }));
  };

  const handlePastureChange = (index: number, field: keyof PastureData, value: string) => {
    const newPastures = [...formData.pastures];
    newPastures[index] = { ...newPastures[index], [field]: value };
    setFormData(prev => ({ ...prev, pastures: newPastures }));
  };

  const toggleCulture = (index: number) => {
    setExpandedCultures(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
  };

  const togglePasture = (index: number) => {
    setExpandedPastures(prev => 
      prev.includes(index) ? prev.filter(i => i !== index) : [...prev, index]
    );
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
      {/* Percentual de matéria orgânica do solo */}
      <div className="space-y-2">
        <Label htmlFor="organicMatterPercentage" className="text-base font-medium text-foreground">
          Qual o percentual de matéria orgânica do solo?
        </Label>
        <Input
          id="organicMatterPercentage"
          type="text"
          placeholder="Ex.: 10"
          value={formData.organicMatterPercentage}
          onChange={(e) => handleInputChange("organicMatterPercentage", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Quantidade de calcário aplicada */}
      <div className="space-y-2">
        <Label htmlFor="calciumQuantity" className="text-base font-medium text-foreground">
          Qual a quantidade de calcário aplicada no último ano?
        </Label>
        <Input
          id="calciumQuantity"
          type="text"
          placeholder="Ex.: 10"
          value={formData.calciumQuantity}
          onChange={(e) => handleInputChange("calciumQuantity", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Cultures Section */}
      {hasCultures && formData.cultures.map((culture, index) => (
        <div key={index} className="space-y-2">
          <button
            type="button"
            onClick={() => toggleCulture(index)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-input rounded-md hover:bg-accent/50 transition-colors"
          >
            <span className="text-base font-medium text-primary">{culture.name}</span>
            {expandedCultures.includes(index) ? (
              <ChevronUp className="h-5 w-5 text-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-primary" />
            )}
          </button>
          
          {expandedCultures.includes(index) && (
            <div className="space-y-4 pl-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Área destinada (ha)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 10"
                  value={culture.area}
                  onChange={(e) => handleCultureChange(index, "area", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Produção total (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 1000"
                  value={culture.production}
                  onChange={(e) => handleCultureChange(index, "production", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Fertilizante nitrogenado (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={culture.nitrogenFertilizer}
                  onChange={(e) => handleCultureChange(index, "nitrogenFertilizer", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Fertilizante fosfatado (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={culture.phosphorusFertilizer}
                  onChange={(e) => handleCultureChange(index, "phosphorusFertilizer", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Fertilizante potássico (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={culture.potassiumFertilizer}
                  onChange={(e) => handleCultureChange(index, "potassiumFertilizer", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Quantidade de calcário (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={culture.limingQuantity}
                  onChange={(e) => handleCultureChange(index, "limingQuantity", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Quantidade de agrotóxicos (L ou kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 10"
                  value={culture.pesticidesQuantity}
                  onChange={(e) => handleCultureChange(index, "pesticidesQuantity", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Pastures Section */}
      {hasPastures && formData.pastures.map((pasture, index) => (
        <div key={index} className="space-y-2">
          <button
            type="button"
            onClick={() => togglePasture(index)}
            className="w-full flex items-center justify-between px-4 py-3 bg-white border border-input rounded-md hover:bg-accent/50 transition-colors"
          >
            <span className="text-base font-medium text-primary">{pasture.name}</span>
            {expandedPastures.includes(index) ? (
              <ChevronUp className="h-5 w-5 text-primary" />
            ) : (
              <ChevronDown className="h-5 w-5 text-primary" />
            )}
          </button>
          
          {expandedPastures.includes(index) && (
            <div className="space-y-4 pl-4 pt-2">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Área destinada (ha)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 10"
                  value={pasture.area}
                  onChange={(e) => handlePastureChange(index, "area", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Fertilizante nitrogenado (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={pasture.nitrogenFertilizer}
                  onChange={(e) => handlePastureChange(index, "nitrogenFertilizer", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Fertilizante fosfatado (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={pasture.phosphorusFertilizer}
                  onChange={(e) => handlePastureChange(index, "phosphorusFertilizer", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Fertilizante potássico (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={pasture.potassiumFertilizer}
                  onChange={(e) => handlePastureChange(index, "potassiumFertilizer", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-foreground">
                  Quantidade de calcário (kg)
                </Label>
                <Input
                  type="text"
                  placeholder="Ex.: 100"
                  value={pasture.limingQuantity}
                  onChange={(e) => handlePastureChange(index, "limingQuantity", e.target.value)}
                  onKeyPress={handleNumberKeyPress}
                  className="form-input"
                />
              </div>
            </div>
          )}
        </div>
      ))}

      {/* Quantidade mensal de combustível utilizada */}
      <div className="space-y-2">
        <Label htmlFor="monthlyFuelConsumption" className="text-base font-medium text-foreground">
          Qual a quantidade mensal de combustível utilizada (Litros)?
        </Label>
        <Input
          id="monthlyFuelConsumption"
          type="text"
          placeholder="Ex.: 10"
          value={formData.monthlyFuelConsumption}
          onChange={(e) => handleInputChange("monthlyFuelConsumption", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Valor mensal da despesa com energia elétrica */}
      <div className="space-y-2">
        <Label htmlFor="monthlyElectricityExpense" className="text-base font-medium text-foreground">
          Qual o valor mensal da despesa com energia elétrica?
        </Label>
        <Input
          id="monthlyElectricityExpense"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.monthlyElectricityExpense}
          onChange={(e) => handleCurrencyChange("monthlyElectricityExpense", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>
    </form>
  );
};

export default EnvironmentalInfoForm;
