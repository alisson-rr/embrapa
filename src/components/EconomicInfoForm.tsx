import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EconomicInfoFormData {
  grossIncome: string;
  financingPercentage: string;
  productionCost: string;
  propertyValue: string;
  managementSystem: string;
}

interface EconomicInfoFormProps {
  onSubmit: (data: EconomicInfoFormData) => void;
  initialData?: Partial<EconomicInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
}

const EconomicInfoForm = ({ onSubmit, initialData = {}, onValidationChange }: EconomicInfoFormProps) => {
  const [formData, setFormData] = useState<EconomicInfoFormData>({
    grossIncome: initialData.grossIncome || "",
    financingPercentage: initialData.financingPercentage || "",
    productionCost: initialData.productionCost || "",
    propertyValue: initialData.propertyValue || "",
    managementSystem: initialData.managementSystem || "",
  });

  // Check initial validation
  useEffect(() => {
    const isValid = !!(formData.grossIncome && formData.financingPercentage && formData.productionCost && formData.propertyValue && formData.managementSystem);
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof EconomicInfoFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  const handleCurrencyChange = (field: keyof EconomicInfoFormData, value: string) => {
    // Remove tudo exceto números, vírgulas e pontos
    let cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Se o campo está vazio, deixa vazio
    if (!cleanValue) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Adiciona R$ no início
    const formattedValue = 'R$ ' + cleanValue;
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handlePercentageChange = (field: keyof EconomicInfoFormData, value: string) => {
    // Remove tudo exceto números, vírgulas e pontos
    let cleanValue = value.replace(/[^\d.,]/g, '');
    
    // Se o campo está vazio, deixa vazio
    if (!cleanValue) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Adiciona % no final
    const formattedValue = cleanValue + '%';
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
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

  const managementSystemOptions = [
    { value: "sim", label: "Sim" },
    { value: "nao", label: "Não" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Renda bruta da propriedade */}
      <div className="space-y-2">
        <Label htmlFor="grossIncome" className="text-base font-medium text-foreground">
          Qual a renda bruta da propriedade?
        </Label>
        <Input
          id="grossIncome"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.grossIncome}
          onChange={(e) => handleCurrencyChange("grossIncome", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Percentual da renda destinado para financiamentos */}
      <div className="space-y-2">
        <Label htmlFor="financingPercentage" className="text-base font-medium text-foreground">
          Qual percentual da renda é destinado para o pagamento dos financiamentos?
        </Label>
        <Input
          id="financingPercentage"
          type="text"
          placeholder="Ex.: 10%"
          value={formData.financingPercentage}
          onChange={(e) => handlePercentageChange("financingPercentage", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Custo total de produção */}
      <div className="space-y-2">
        <Label htmlFor="productionCost" className="text-base font-medium text-foreground">
          Qual o custo total de produção para os produtos produzidos na propriedade?
        </Label>
        <Input
          id="productionCost"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.productionCost}
          onChange={(e) => handleCurrencyChange("productionCost", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Valor da propriedade de porteira fechada */}
      <div className="space-y-2">
        <Label htmlFor="propertyValue" className="text-base font-medium text-foreground">
          Qual o valor da propriedade de porteira fechada?
        </Label>
        <Input
          id="propertyValue"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.propertyValue}
          onChange={(e) => handleCurrencyChange("propertyValue", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Sistema de gestão da propriedade */}
      <div className="space-y-2">
        <Label htmlFor="managementSystem" className="text-base font-medium text-foreground">
          Utiliza algum sistema de gestão da propriedade?
        </Label>
        <Select value={formData.managementSystem} onValueChange={(value) => handleInputChange("managementSystem", value)} required>
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
            {managementSystemOptions.map((option) => (
              <SelectItem 
                key={option.value} 
                value={option.value}
                className="text-base cursor-pointer hover:bg-accent focus:bg-accent"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    </form>
  );
};

export default EconomicInfoForm;
