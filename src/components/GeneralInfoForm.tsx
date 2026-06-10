import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface GeneralInfoFormData {
  // Seção 1: Informações Gerais
  propertyName: string;
  municipality: string;
  state: string;
  bioma: string;
  geolocation: string;
  birthPlace: string;
  
  // Seção 2: Caracterização do Entrevistado
  name: string;
  age: string;
  profession: string;
  education: string;
  yearsInAgriculture: string;
}

interface GeneralInfoFormProps {
  onSubmit: (data: GeneralInfoFormData) => void;
  initialData?: Partial<GeneralInfoFormData>;
  onValidationChange?: (isValid: boolean) => void;
}

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

const biomaOptions = [
  { value: "amazonia", label: "Amazônia" },
  { value: "caatinga", label: "Caatinga" },
  { value: "cerrado", label: "Cerrado" },
  { value: "mata-atlantica", label: "Mata Atlântica" },
  { value: "pampa", label: "Pampa" },
  { value: "pantanal", label: "Pantanal" },
];

const stateOptions = [
  { value: "AC", label: "Acre" },
  { value: "AL", label: "Alagoas" },
  { value: "AP", label: "Amapá" },
  { value: "AM", label: "Amazonas" },
  { value: "BA", label: "Bahia" },
  { value: "CE", label: "Ceará" },
  { value: "DF", label: "Distrito Federal" },
  { value: "ES", label: "Espírito Santo" },
  { value: "GO", label: "Goiás" },
  { value: "MA", label: "Maranhão" },
  { value: "MT", label: "Mato Grosso" },
  { value: "MS", label: "Mato Grosso do Sul" },
  { value: "MG", label: "Minas Gerais" },
  { value: "PA", label: "Pará" },
  { value: "PB", label: "Paraíba" },
  { value: "PR", label: "Paraná" },
  { value: "PE", label: "Pernambuco" },
  { value: "PI", label: "Piauí" },
  { value: "RJ", label: "Rio de Janeiro" },
  { value: "RN", label: "Rio Grande do Norte" },
  { value: "RS", label: "Rio Grande do Sul" },
  { value: "RO", label: "Rondônia" },
  { value: "RR", label: "Roraima" },
  { value: "SC", label: "Santa Catarina" },
  { value: "SP", label: "São Paulo" },
  { value: "SE", label: "Sergipe" },
  { value: "TO", label: "Tocantins" },
];

const GeneralInfoForm = ({ onSubmit, initialData = {}, onValidationChange }: GeneralInfoFormProps) => {
  const [formData, setFormData] = useState<GeneralInfoFormData>({
    propertyName: initialData.propertyName || "",
    municipality: initialData.municipality || "",
    state: initialData.state || "",
    bioma: initialData.bioma || "",
    geolocation: initialData.geolocation || "",
    birthPlace: initialData.birthPlace || "",
    name: initialData.name || "",
    age: initialData.age || "",
    profession: initialData.profession || "",
    education: initialData.education || "",
    yearsInAgriculture: initialData.yearsInAgriculture || "",
  });

  // Validação
  useEffect(() => {
    const isValid = !!(
      formData.propertyName &&
      formData.municipality &&
      formData.state &&
      formData.bioma &&
      formData.geolocation &&
      formData.birthPlace &&
      formData.name &&
      formData.age &&
      formData.profession &&
      formData.education &&
      formData.yearsInAgriculture
    );
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof GeneralInfoFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = 
    formData.propertyName &&
    formData.municipality &&
    formData.state &&
    formData.bioma &&
    formData.geolocation &&
    formData.birthPlace &&
    formData.name &&
    formData.age &&
    formData.profession &&
    formData.education &&
    formData.yearsInAgriculture;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* ============================================ */}
      {/* SEÇÃO 1: INFORMAÇÕES GERAIS */}
      {/* ============================================ */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">1. Informações Gerais</h3>
          <p className="text-sm text-gray-500 mt-1">Dados básicos sobre a propriedade</p>
        </div>

        {/* Nome da Propriedade */}
        <div className="space-y-2">
          <Label htmlFor="propertyName" className="text-base font-medium text-foreground">
            Nome da Propriedade
          </Label>
          <Input
            id="propertyName"
            type="text"
            placeholder="Ex: Fazenda Santa Helena"
            value={formData.propertyName}
            onChange={(e) => handleInputChange("propertyName", e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="state" className="text-base font-medium text-foreground">
            Estado
          </Label>
          <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione o estado" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)] max-h-[300px]">
              {stateOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Município */}
        <div className="space-y-2">
          <Label htmlFor="municipality" className="text-base font-medium text-foreground">
            Município
          </Label>
          <Input
            id="municipality"
            type="text"
            placeholder="Ex: Campo Grande"
            value={formData.municipality}
            onChange={(e) => handleInputChange("municipality", e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Bioma */}
        <div className="space-y-2">
          <Label htmlFor="bioma" className="text-base font-medium text-foreground">
            Bioma
          </Label>
          <Select value={formData.bioma} onValueChange={(value) => handleInputChange("bioma", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione o bioma" />
            </SelectTrigger>
            <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)]">
              {biomaOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Geolocalização */}
        <div className="space-y-2">
          <Label htmlFor="geolocation" className="text-base font-medium text-foreground">
            Geolocalização (coordenadas GPS)
          </Label>
          <Input
            id="geolocation"
            type="text"
            placeholder="Ex: -15.8267, -47.9218"
            value={formData.geolocation}
            onChange={(e) => handleInputChange("geolocation", e.target.value)}
            className="form-input"
            required
          />
        </div>

      </div>

      {/* ============================================ */}
      {/* SEÇÃO 2: CARACTERIZAÇÃO DO ENTREVISTADO */}
      {/* ============================================ */}
      <div className="space-y-6">
        <div className="pb-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-primary">2. Caracterização do Entrevistado</h3>
          <p className="text-sm text-gray-500 mt-1">Informações pessoais do respondente</p>
        </div>

        {/* Nome */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-base font-medium text-foreground">
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            placeholder="Insira o seu nome completo"
            value={formData.name}
            onChange={(e) => handleInputChange("name", e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Idade */}
        <div className="space-y-2">
          <Label htmlFor="age" className="text-base font-medium text-foreground">
            Idade
          </Label>
          <Input
            id="age"
            type="number"
            placeholder="Digite a sua idade"
            value={formData.age}
            onChange={(e) => handleInputChange("age", e.target.value)}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                e.preventDefault();
              }
            }}
            className="form-input"
            min="1"
            max="120"
            required
          />
        </div>

        {/* Local de nascimento */}
        <div className="space-y-2">
          <Label htmlFor="birthPlace" className="text-base font-medium text-foreground">
            Local de nascimento
          </Label>
          <Input
            id="birthPlace"
            type="text"
            placeholder="Ex: São Paulo, SP"
            value={formData.birthPlace}
            onChange={(e) => handleInputChange("birthPlace", e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Profissão */}
        <div className="space-y-2">
          <Label htmlFor="profession" className="text-base font-medium text-foreground">
            Profissão
          </Label>
          <Input
            id="profession"
            type="text"
            placeholder="Digite a sua profissão"
            value={formData.profession}
            onChange={(e) => handleInputChange("profession", e.target.value)}
            className="form-input"
            required
          />
        </div>

        {/* Escolaridade */}
        <div className="space-y-2">
          <Label htmlFor="education" className="text-base font-medium text-foreground">
            Escolaridade
          </Label>
          <Select value={formData.education} onValueChange={(value) => handleInputChange("education", value)} required>
            <SelectTrigger className="form-input">
              <SelectValue placeholder="Selecione a opção" />
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

        {/* Há quanto tempo está na atividade agropecuária */}
        <div className="space-y-2">
          <Label htmlFor="yearsInAgriculture" className="text-base font-medium text-foreground">
            Há quanto tempo está na atividade agropecuária? (em anos)
          </Label>
          <Input
            id="yearsInAgriculture"
            type="number"
            placeholder="Digite"
            value={formData.yearsInAgriculture}
            onChange={(e) => handleInputChange("yearsInAgriculture", e.target.value)}
            onKeyPress={(e) => {
              if (!/[0-9]/.test(e.key) && e.key !== 'Backspace' && e.key !== 'Delete' && e.key !== 'Tab' && e.key !== 'Enter') {
                e.preventDefault();
              }
            }}
            className="form-input"
            min="0"
            max="100"
            required
          />
        </div>
      </div>

      {/* Hidden submit button for form validation */}
      <Button type="submit" className="hidden" disabled={!isFormValid} />
    </form>
  );
};

export default GeneralInfoForm;
