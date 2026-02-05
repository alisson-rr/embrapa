import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { formatForAPI } from "@/lib/decimalUtils";
import { formatCurrencyInput, cleanCurrencyForAPI } from "@/lib/currencyUtils";

interface SocialInfoFormData {
  permanentEmployees: string;
  highestEducationEmployee: string;
  highestSalary: string;
  lowestEducationEmployee: string;
  lowestSalary: string;
  temporaryEmployees: string;
  outsourcedAverageSalary: string;
  // Novas perguntas sociais
  oldestFamilyMemberAge: string;
  youngestFamilyMemberAge: string;
  operationalCourses: string;
  technicalCourses: string;
  specializationCourses: string;
  hasTechnicalAssistance: string;
  technicalAssistanceType: string;
  hasProfitSharing: string;
  hasHealthPlan: string;
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
    temporaryEmployees: initialData.temporaryEmployees || "",
    outsourcedAverageSalary: initialData.outsourcedAverageSalary || "",
    // Novos campos sociais
    oldestFamilyMemberAge: initialData.oldestFamilyMemberAge || "",
    youngestFamilyMemberAge: initialData.youngestFamilyMemberAge || "",
    operationalCourses: initialData.operationalCourses || "",
    technicalCourses: initialData.technicalCourses || "",
    specializationCourses: initialData.specializationCourses || "",
    hasTechnicalAssistance: initialData.hasTechnicalAssistance || "",
    technicalAssistanceType: initialData.technicalAssistanceType || "",
    hasProfitSharing: initialData.hasProfitSharing || "",
    hasHealthPlan: initialData.hasHealthPlan || "",
  });

  // Check initial validation
  useEffect(() => {
    const basicFieldsValid = !!(
      formData.permanentEmployees && 
      formData.highestEducationEmployee && 
      formData.highestSalary && 
      formData.lowestEducationEmployee && 
      formData.lowestSalary &&
      formData.temporaryEmployees &&
      formData.outsourcedAverageSalary &&
      formData.oldestFamilyMemberAge &&
      formData.youngestFamilyMemberAge &&
      formData.hasTechnicalAssistance &&
      formData.hasProfitSharing &&
      formData.hasHealthPlan
    );
    // Se tem assistência técnica, precisa especificar o tipo
    const technicalAssistanceValid = formData.hasTechnicalAssistance === 'nao' || 
      (formData.hasTechnicalAssistance === 'sim' && !!formData.technicalAssistanceType);
    
    const isValid = basicFieldsValid && technicalAssistanceValid;
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof SocialInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleCurrencyChange = (field: keyof SocialInfoFormData, value: string) => {
    // Formata automaticamente enquanto digita
    const formattedValue = formatCurrencyInput(value);
    setFormData(prev => ({ ...prev, [field]: formattedValue }));
  };

  const handleNumberKeyPress = (e: React.KeyboardEvent) => {
    if (!/[0-9.,]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
      e.preventDefault();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Converte números para formato da API
    const apiData = {
      ...formData,
      permanentEmployees: formatForAPI(formData.permanentEmployees),
      temporaryEmployees: formatForAPI(formData.temporaryEmployees),
      highestSalary: cleanCurrencyForAPI(formData.highestSalary),
      lowestSalary: cleanCurrencyForAPI(formData.lowestSalary),
      outsourcedAverageSalary: cleanCurrencyForAPI(formData.outsourcedAverageSalary),
    };
    onSubmit(apiData);
  };

  const educationOptions = [
    { value: "sem-escolaridade", label: "Sem escolaridade" },
    { value: "fundamental-incompleto", label: "Ensino Fundamental Incompleto" },
    { value: "fundamental-completo", label: "Ensino Fundamental Completo" },
    { value: "medio-incompleto", label: "Ensino Médio Incompleto" },
    { value: "medio-completo", label: "Ensino Médio Completo" },
    { value: "tecnico-incompleto", label: "Técnico Incompleto" },
    { value: "tecnico-completo", label: "Técnico Completo" },
    { value: "superior-incompleto", label: "Superior Incompleto" },
    { value: "superior-completo", label: "Superior Completo" },
  ];


  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Número de empregados permanentes */}
      <div className="space-y-2">
        <Label htmlFor="permanentEmployees" className="text-base font-medium text-foreground">
          Qual é o número de empregados permanentes?
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
          Qual é o valor do salário bruto mensal desse funcionário? (MAIOR)
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
          Qual é o salário bruto mensal desse funcionário? (MENOR)
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

      {/* Número de funcionários temporários */}
      <div className="space-y-2">
        <Label htmlFor="temporaryEmployees" className="text-base font-medium text-foreground">
          Qual é o número de funcionários temporários utilizados no último ano safra?
        </Label>
        <Input
          id="temporaryEmployees"
          type="number"
          placeholder="Ex.: 5"
          value={formData.temporaryEmployees}
          onChange={(e) => handleInputChange("temporaryEmployees", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* Salário médio funcionários terceirizados */}
      <div className="space-y-2">
        <Label htmlFor="outsourcedAverageSalary" className="text-base font-medium text-foreground">
          Qual o salário bruto mensal médio pago aos funcionários terceirizados?
        </Label>
        <Input
          id="outsourcedAverageSalary"
          type="text"
          placeholder="Ex.: R$ 1.500,00"
          value={formData.outsourcedAverageSalary}
          onChange={(e) => handleCurrencyChange("outsourcedAverageSalary", e.target.value)}
          onKeyPress={handleNumberKeyPress}
          className="form-input"
          required
        />
      </div>

      {/* ========================================== */}
      {/* SEÇÃO: INFORMAÇÕES DA FAMÍLIA */}
      {/* ========================================== */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h4 className="text-base font-semibold text-primary">Informações da Família</h4>
        
        {/* Idade do integrante mais velho */}
        <div className="space-y-2">
          <Label htmlFor="oldestFamilyMemberAge" className="text-base font-medium text-foreground">
            Qual a idade do integrante mais velho da família que trabalha na propriedade?
          </Label>
          <Input
            id="oldestFamilyMemberAge"
            type="number"
            placeholder="Ex.: 65"
            value={formData.oldestFamilyMemberAge}
            onChange={(e) => handleInputChange("oldestFamilyMemberAge", e.target.value)}
            onKeyPress={handleNumberKeyPress}
            className="form-input"
            min="1"
            max="120"
            required
          />
        </div>

        {/* Idade do integrante mais novo */}
        <div className="space-y-2">
          <Label htmlFor="youngestFamilyMemberAge" className="text-base font-medium text-foreground">
            Qual a idade do integrante mais novo da família que trabalha na propriedade?
          </Label>
          <Input
            id="youngestFamilyMemberAge"
            type="number"
            placeholder="Ex.: 18"
            value={formData.youngestFamilyMemberAge}
            onChange={(e) => handleInputChange("youngestFamilyMemberAge", e.target.value)}
            onKeyPress={handleNumberKeyPress}
            className="form-input"
            min="1"
            max="120"
            required
          />
        </div>
      </div>

      {/* ========================================== */}
      {/* SEÇÃO: CAPACITAÇÃO */}
      {/* ========================================== */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h4 className="text-base font-semibold text-primary">Cursos de Capacitação</h4>
        <p className="text-sm text-gray-500">Quantos cursos de capacitação os funcionários/família realizaram no último ano?</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Cursos operacionais */}
          <div className="space-y-2">
            <Label htmlFor="operationalCourses" className="text-sm font-medium text-foreground">
              Operacional
            </Label>
            <p className="text-xs text-gray-500">(maquinaria, manejo, etc.)</p>
            <Input
              id="operationalCourses"
              type="number"
              placeholder="0"
              value={formData.operationalCourses}
              onChange={(e) => handleInputChange("operationalCourses", e.target.value)}
              onKeyPress={handleNumberKeyPress}
              className="form-input"
              min="0"
            />
          </div>

          {/* Cursos técnicos */}
          <div className="space-y-2">
            <Label htmlFor="technicalCourses" className="text-sm font-medium text-foreground">
              Técnico
            </Label>
            <p className="text-xs text-gray-500">(agrônomo, veterinário, etc.)</p>
            <Input
              id="technicalCourses"
              type="number"
              placeholder="0"
              value={formData.technicalCourses}
              onChange={(e) => handleInputChange("technicalCourses", e.target.value)}
              onKeyPress={handleNumberKeyPress}
              className="form-input"
              min="0"
            />
          </div>

          {/* Cursos de especialização */}
          <div className="space-y-2">
            <Label htmlFor="specializationCourses" className="text-sm font-medium text-foreground">
              Especialização
            </Label>
            <p className="text-xs text-gray-500">(pós, MBA, etc.)</p>
            <Input
              id="specializationCourses"
              type="number"
              placeholder="0"
              value={formData.specializationCourses}
              onChange={(e) => handleInputChange("specializationCourses", e.target.value)}
              onKeyPress={handleNumberKeyPress}
              className="form-input"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* ========================================== */}
      {/* SEÇÃO: ASSISTÊNCIA E BENEFÍCIOS */}
      {/* ========================================== */}
      <div className="space-y-6 pt-6 border-t border-gray-200">
        <h4 className="text-base font-semibold text-primary">Assistência e Benefícios</h4>
        
        {/* Assistência técnica */}
        <div className="space-y-2">
          <Label htmlFor="hasTechnicalAssistance" className="text-base font-medium text-foreground">
            A propriedade recebe assistência técnica?
          </Label>
          <Select value={formData.hasTechnicalAssistance} onValueChange={(value) => handleInputChange("hasTechnicalAssistance", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Tipo de assistência técnica */}
        {formData.hasTechnicalAssistance === 'sim' && (
          <div className="space-y-2 pl-6 border-l-2 border-primary/30">
            <Label htmlFor="technicalAssistanceType" className="text-base font-medium text-foreground">
              Qual o tipo de assistência técnica?
            </Label>
            <Input
              id="technicalAssistanceType"
              type="text"
              placeholder="Ex.: Emater, Cooperativa, Consultoria privada"
              value={formData.technicalAssistanceType}
              onChange={(e) => handleInputChange("technicalAssistanceType", e.target.value)}
              className="form-input"
              required
            />
          </div>
        )}

        {/* Participação nos lucros */}
        <div className="space-y-2">
          <Label htmlFor="hasProfitSharing" className="text-base font-medium text-foreground">
            Os funcionários têm participação nos lucros?
          </Label>
          <Select value={formData.hasProfitSharing} onValueChange={(value) => handleInputChange("hasProfitSharing", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Plano de saúde */}
        <div className="space-y-2">
          <Label htmlFor="hasHealthPlan" className="text-base font-medium text-foreground">
            A propriedade oferece plano de saúde aos funcionários?
          </Label>
          <Select value={formData.hasHealthPlan} onValueChange={(value) => handleInputChange("hasHealthPlan", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
              <SelectItem value="sim">Sim</SelectItem>
              <SelectItem value="nao">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </form>
  );
};

export default SocialInfoForm;
