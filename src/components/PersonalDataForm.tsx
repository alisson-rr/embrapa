import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatForAPI, formatForDisplay } from "@/lib/decimalUtils";

interface PersonalDataFormData {
  name: string;
  age: string;
  profession: string;
  education: string;
  yearsInAgriculture: string;
  propertyName: string;
  municipality: string;
  state: string;
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalDataFormData) => void;
  initialData?: Partial<PersonalDataFormData>;
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

const PersonalDataForm = ({ onSubmit, initialData = {}, onValidationChange }: PersonalDataFormProps) => {
  const [formData, setFormData] = useState<PersonalDataFormData>({
    name: initialData.name || "João da Silva",
    age: initialData.age || "45",
    profession: initialData.profession || "Agricultor",
    education: initialData.education || "medio-completo",
    yearsInAgriculture: initialData.yearsInAgriculture || "20",
    propertyName: initialData.propertyName || "Fazenda Teste",
    municipality: initialData.municipality || "Campo Grande",
    state: initialData.state || "MS",
  });

  // Check initial validation
  useEffect(() => {
    const isValid = !!(formData.name && formData.age && formData.profession && formData.education && formData.yearsInAgriculture && formData.propertyName && formData.municipality && formData.state);
    onValidationChange?.(isValid);
  }, [formData, onValidationChange]);

  const handleInputChange = (field: keyof PersonalDataFormData, value: string) => {
    const newFormData = { ...formData, [field]: value };
    setFormData(newFormData);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Converte números decimais para formato da API (ponto)
    const apiData = {
      ...formData,
      age: formatForAPI(formData.age),
      yearsInAgriculture: formatForAPI(formData.yearsInAgriculture),
    };
    onSubmit(apiData);
  };

  const isFormValid = formData.name && formData.age && formData.profession && formData.education && formData.yearsInAgriculture && formData.propertyName && formData.municipality && formData.state;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Nome do respondente */}
      <div className="space-y-2">
        <Label htmlFor="name" className="text-base font-medium text-foreground">
          Nome do respondente
        </Label>
        <Input
          id="name"
          type="text"
          placeholder="Insira o seu nome"
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

      {/* Nome da Propriedade */}
      <div className="space-y-2">
        <Label htmlFor="propertyName" className="text-base font-medium text-foreground">
          Nome da Propriedade
        </Label>
        <Input
          id="propertyName"
          type="text"
          placeholder="Digite o nome da propriedade"
          value={formData.propertyName}
          onChange={(e) => handleInputChange("propertyName", e.target.value)}
          className="form-input"
          required
        />
      </div>

      {/* Município */}
      <div className="space-y-2">
        <Label htmlFor="municipality" className="text-base font-medium text-foreground">
          Município
        </Label>
        <Input
          id="municipality"
          type="text"
          placeholder="Digite o município"
          value={formData.municipality}
          onChange={(e) => handleInputChange("municipality", e.target.value)}
          className="form-input"
          required
        />
      </div>

      {/* Estado (UF) */}
      <div className="space-y-2">
        <Label htmlFor="state" className="text-base font-medium text-foreground">
          Estado (UF)
        </Label>
        <Select value={formData.state} onValueChange={(value) => handleInputChange("state", value)} required>
          <SelectTrigger className="form-input">
            <SelectValue placeholder="Selecione o estado" />
          </SelectTrigger>
          <SelectContent className="bg-popover border-input shadow-[var(--shadow-card)] max-h-[300px]">
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

      {/* Hidden submit button for form validation */}
      <Button type="submit" className="hidden" disabled={!isFormValid} />
    </form>
  );
};

export default PersonalDataForm;