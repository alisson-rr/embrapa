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
  managementSystemName: string;
  decisionMakerSalary: string;
  productCommercialization: string;
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
    managementSystemName: initialData.managementSystemName || "",
    decisionMakerSalary: initialData.decisionMakerSalary || "",
    productCommercialization: initialData.productCommercialization || "",
  });

  // Check initial validation
  useEffect(() => {
    const basicFieldsValid = !!(formData.grossIncome && formData.financingPercentage && formData.productionCost && formData.propertyValue && formData.managementSystem && formData.decisionMakerSalary && formData.productCommercialization);
    const managementSystemValid = formData.managementSystem === 'nao' || (formData.managementSystem === 'sim' && !!formData.managementSystemName);
    const isValid = basicFieldsValid && managementSystemValid;
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof EconomicInfoFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  const handleCurrencyChange = (field: keyof EconomicInfoFormData, value: string) => {
    // Remove tudo exceto números
    let cleanValue = value.replace(/[^\d]/g, '');
    
    // Se o campo está vazio, deixa vazio
    if (!cleanValue) {
      setFormData(prev => ({ ...prev, [field]: '' }));
      return;
    }
    
    // Converte para número e formata com separador de milhares
    const numberValue = parseInt(cleanValue);
    const formattedNumber = numberValue.toLocaleString('pt-BR');
    
    // Adiciona R$ no início
    const formattedValue = 'R$ ' + formattedNumber;
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
          Qual o percentual da renda é destinado para o pagamento dos financiamentos?
        </Label>
        <p className="text-sm text-gray-500">(bancário, trades, revenda de insumos)</p>
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
          Qual o custo total de produção?
        </Label>
        <p className="text-sm text-gray-500">Para os produtos produzidos na propriedade</p>
        <Input
          id="productionCost"
          type="text"
          placeholder="Ex.: R$ 50.000,00"
          value={formData.productionCost}
          onChange={(e) => handleCurrencyChange("productionCost", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Valor de mercado da propriedade */}
      <div className="space-y-2">
        <Label htmlFor="propertyValue" className="text-base font-medium text-foreground">
          Qual o valor de mercado da propriedade? De porteira fechada
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

      {/* Se usa sistema de gestão, perguntar qual */}
      {formData.managementSystem === 'sim' && (
        <div className="space-y-2 pl-6 border-l-2 border-primary/30">
          <Label htmlFor="managementSystemName" className="text-base font-medium text-foreground">
            Qual?
          </Label>
          <Input
            id="managementSystemName"
            type="text"
            placeholder="Ex.: Software XYZ"
            value={formData.managementSystemName}
            onChange={(e) => handleInputChange("managementSystemName", e.target.value)}
            className="form-input"
            required
          />
        </div>
      )}

      {/* Valor do salário para o tomador de decisão */}
      <div className="space-y-2">
        <Label htmlFor="decisionMakerSalary" className="text-base font-medium text-foreground">
          Qual o valor do salário bruto mensal para o tomador de decisão?
        </Label>
        <Input
          id="decisionMakerSalary"
          type="text"
          placeholder="Ex.: R$ 5.000,00"
          value={formData.decisionMakerSalary}
          onChange={(e) => handleCurrencyChange("decisionMakerSalary", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Como é a comercialização da produção */}
      <div className="space-y-2">
        <Label htmlFor="productCommercialization" className="text-base font-medium text-foreground">
          Como é a comercialização da produção?
        </Label>
        <p className="text-sm text-gray-500">
          (Ex: venda direta ao consumidor, cooperativa, agroindústria, atravessador, exportação, mercado local)
        </p>
        <Input
          id="productCommercialization"
          type="text"
          placeholder="Descreva como é feita a comercialização"
          value={formData.productCommercialization}
          onChange={(e) => handleInputChange("productCommercialization", e.target.value)}
          className="form-input"
          required
        />
      </div>
    </form>
  );
};

export default EconomicInfoForm;
