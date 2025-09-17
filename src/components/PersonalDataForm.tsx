import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface PersonalDataFormData {
  name: string;
  age: string;
  occupation: string;
  education: string;
  yearsInAgriculture: string;
}

interface PersonalDataFormProps {
  onSubmit: (data: PersonalDataFormData) => void;
  initialData?: Partial<PersonalDataFormData>;
}

const educationOptions = [
  { value: "sem-escolaridade", label: "Sem escolaridade" },
  { value: "fundamental-incompleto", label: "Ensino Fundamental Incompleto" },
  { value: "fundamental-completo", label: "Ensino Fundamental Completo" },
  { value: "medio-incompleto", label: "Ensino Médio Incompleto" },
  { value: "medio-completo", label: "Ensino Médio Completo" },
  { value: "tecnico-incompleto", label: "Técnico Incompleto" },
  { value: "tecnico-completo", label: "Técnico Completo" },
];

const PersonalDataForm = ({ onSubmit, initialData = {} }: PersonalDataFormProps) => {
  const [formData, setFormData] = useState<PersonalDataFormData>({
    name: initialData.name || "",
    age: initialData.age || "",
    occupation: initialData.occupation || "",
    education: initialData.education || "",
    yearsInAgriculture: initialData.yearsInAgriculture || "",
  });

  const handleInputChange = (field: keyof PersonalDataFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const isFormValid = formData.name && formData.age && formData.occupation && formData.education && formData.yearsInAgriculture;

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
          className="form-input"
          min="1"
          max="120"
          required
        />
      </div>

      {/* Ocupação */}
      <div className="space-y-2">
        <Label htmlFor="occupation" className="text-base font-medium text-foreground">
          Ocupação
        </Label>
        <Input
          id="occupation"
          type="text"
          placeholder="Digite a sua ocupação"
          value={formData.occupation}
          onChange={(e) => handleInputChange("occupation", e.target.value)}
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
          className="form-input"
          min="0"
          max="100"
          required
        />
      </div>

      {/* Hidden submit button for form validation */}
      <Button type="submit" className="hidden" disabled={!isFormValid} />
    </form>
  );
};

export default PersonalDataForm;