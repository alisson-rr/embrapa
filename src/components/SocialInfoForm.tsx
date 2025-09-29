import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface SocialInfoFormData {
  permanentEmployees: string;
  highestEducationEmployee: string;
  highestSalary: string;
  lowestEducationEmployee: string;
  lowestSalary: string;
  familyMembers: string;
  familyMembersLevel: string;
  technicalAssistance: string;
}

interface SocialInfoFormProps {
  onSubmit: (data: SocialInfoFormData) => void;
  initialData?: Partial<SocialInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
}

const SocialInfoForm = ({ onSubmit, initialData = {}, onValidationChange }: SocialInfoFormProps) => {
  const [formData, setFormData] = useState<SocialInfoFormData>({
    permanentEmployees: initialData.permanentEmployees || "",
    highestEducationEmployee: initialData.highestEducationEmployee || "",
    highestSalary: initialData.highestSalary || "",
    lowestEducationEmployee: initialData.lowestEducationEmployee || "",
    lowestSalary: initialData.lowestSalary || "",
    familyMembers: initialData.familyMembers || "",
    familyMembersLevel: initialData.familyMembersLevel || "",
    technicalAssistance: initialData.technicalAssistance || "",
  });

  // Check initial validation
  useEffect(() => {
    const isValid = !!(
      formData.permanentEmployees && 
      formData.highestEducationEmployee && 
      formData.highestSalary && 
      formData.lowestEducationEmployee && 
      formData.lowestSalary &&
      formData.familyMembers &&
      (formData.familyMembers === "nao" || formData.familyMembersLevel) &&
      formData.technicalAssistance
    );
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof SocialInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (field: keyof SocialInfoFormData, value: string) => {
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

  const handleNumberKeyPress = (e: React.KeyboardEvent) => {
    if (!/[0-9.,]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const educationOptions = [
    { value: "nao-estudou", label: "NÃO ESTUDOU" },
    { value: "basico", label: "BÁSICO" },
    { value: "medio", label: "MÉDIO" },
    { value: "superior", label: "SUPERIOR" },
  ];

  const familyMembersOptions = [
    { value: "sim", label: "Sim" },
    { value: "nao", label: "Não" },
  ];

  const familyMembersLevelOptions = [
    { value: "operacional", label: "Operacional" },
    { value: "tecnico", label: "Técnico" },
    { value: "especializacao", label: "Especialização" },
  ];

  const technicalAssistanceOptions = [
    { value: "empresa-publica", label: "Empresa pública" },
    { value: "empresa-privada", label: "Empresa Privada" },
    { value: "revenda-insumos", label: "Revenda de insumos" },
    { value: "particular", label: "Particular" },
    { value: "outro", label: "Outro, (qual?)" },
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Número de empregados permanentes */}
      <div className="space-y-2">
        <Label htmlFor="permanentEmployees" className="text-base font-medium text-foreground">
          Qual o número de empregados permanentes?
        </Label>
        <Input
          id="permanentEmployees"
          type="number"
          placeholder="Ex.: 10"
          value={formData.permanentEmployees}
          onChange={(e) => handleInputChange("permanentEmployees", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Escolaridade do funcionário com maior salário */}
      <div className="space-y-2">
        <Label htmlFor="highestEducationEmployee" className="text-base font-medium text-foreground">
          Qual é a escolaridade do funcionário com o maior salário da propriedade?
        </Label>
        <Select value={formData.highestEducationEmployee} onValueChange={(value) => handleInputChange("highestEducationEmployee", value)} required>
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
            {educationOptions.map((option) => (
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

      {/* Salário mensal do funcionário com maior salário */}
      <div className="space-y-2">
        <Label htmlFor="highestSalary" className="text-base font-medium text-foreground">
          Qual é o salário mensal desse funcionário?
        </Label>
        <Input
          id="highestSalary"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.highestSalary}
          onChange={(e) => handleCurrencyChange("highestSalary", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Escolaridade do funcionário com menor salário */}
      <div className="space-y-2">
        <Label htmlFor="lowestEducationEmployee" className="text-base font-medium text-foreground">
          Qual é a escolaridade do funcionário com o menor salário da propriedade?
        </Label>
        <Select value={formData.lowestEducationEmployee} onValueChange={(value) => handleInputChange("lowestEducationEmployee", value)} required>
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
            {educationOptions.map((option) => (
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

      {/* Salário mensal do funcionário com menor salário */}
      <div className="space-y-2">
        <Label htmlFor="lowestSalary" className="text-base font-medium text-foreground">
          Qual é o salário mensal desse funcionário?
        </Label>
        <Input
          id="lowestSalary"
          type="text"
          placeholder="Ex.: R$ 1.000,00"
          value={formData.lowestSalary}
          onChange={(e) => handleCurrencyChange("lowestSalary", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Integrantes da família que trabalham na propriedade */}
      <div className="space-y-2">
        <Label htmlFor="familyMembers" className="text-base font-medium text-foreground">
          Existem integrantes da família que trabalham na propriedade? / Fora da propriedade?
        </Label>
        <Select value={formData.familyMembers} onValueChange={(value) => handleInputChange("familyMembers", value)} required>
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
            {familyMembersOptions.map((option) => (
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

      {/* Nível e quantidade - condicional */}
      {formData.familyMembers === "sim" && (
        <div className="space-y-2">
          <Label htmlFor="familyMembersLevel" className="text-base font-medium text-foreground">
            Caso Sim/ Nível e quantidade:
          </Label>
          <Select value={formData.familyMembersLevel} onValueChange={(value) => handleInputChange("familyMembersLevel", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
              {familyMembersLevelOptions.map((option) => (
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
      )}

      {/* Assistência técnica */}
      <div className="space-y-2">
        <Label htmlFor="technicalAssistance" className="text-base font-medium text-foreground">
          Recebe assistência técnica? (1) sim (2) não
        </Label>
        <Select value={formData.technicalAssistance} onValueChange={(value) => handleInputChange("technicalAssistance", value)} required>
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Selecione" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
            {technicalAssistanceOptions.map((option) => (
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

export default SocialInfoForm;
