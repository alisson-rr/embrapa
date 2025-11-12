import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff, CheckCircle2, Circle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

interface PasswordValidation {
  match: boolean;
  minLength: boolean;
  hasNumber: boolean;
  hasUpperCase: boolean;
}

const ResetPasswordPage = () => {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { updatePassword } = useAuth();

  const [validation, setValidation] = useState<PasswordValidation>({
    match: false,
    minLength: false,
    hasNumber: false,
    hasUpperCase: false,
  });

  // Validar senha em tempo real
  useEffect(() => {
    const minLength = password.length >= 6;
    const hasNumber = /\d/.test(password);
    const hasUpperCase = /[A-Z]/.test(password);
    const match = password !== "" && password === confirmPassword;

    setValidation({
      match,
      minLength,
      hasNumber,
      hasUpperCase,
    });
  }, [password, confirmPassword]);

  const isFormValid = 
    validation.match &&
    validation.minLength &&
    validation.hasNumber &&
    validation.hasUpperCase;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isFormValid) {
      toast({
        title: "Senha inválida",
        description: "Por favor, atenda todos os requisitos de senha.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    const { error } = await updatePassword(password);

    if (error) {
      toast({
        title: "Erro ao redefinir senha",
        description: error.message || "Ocorreu um erro. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Senha redefinida com sucesso!",
        description: "Você será redirecionado para o login.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  };

  const ValidationItem = ({ 
    isValid, 
    text 
  }: { 
    isValid: boolean; 
    text: string;
  }) => (
    <div className="flex items-center gap-2">
      {isValid ? (
        <CheckCircle2 className="h-4 w-4 text-[#00703c]" />
      ) : (
        <Circle className="h-4 w-4 text-gray-400" />
      )}
      <span className={`text-sm ${isValid ? "text-[#00703c]" : "text-gray-600"}`}>
        {text}
      </span>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Lado esquerdo - Logo */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#d8e5dc] items-center justify-center p-12">
        <img
          src="/Logo.png"
          alt="Embrapa"
        />
      </div>

      {/* Lado direito - Formulário */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo mobile */}
          <div className="lg:hidden flex justify-center mb-8">
            <img
              src="/Logo.png"
              alt="Embrapa"
              className="h-16 w-auto object-contain"
            />
          </div>

          {/* Cabeçalho */}
          <div className="space-y-2">
            <h1 className="text-3xl font-bold text-gray-900">Redefinição de senha</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Acesse a plataforma de administração para gerenciar informações, acompanhar o formulário.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo Nova Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Digite a nova senha
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••••••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 pr-10 border-gray-300 focus:border-[#00703c] focus:ring-[#00703c]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Campo Confirmar Senha */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-gray-700 font-medium">
                Confirme a nova senha
              </Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="••••••••••••••••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-12 pr-10 border-gray-300 focus:border-[#00703c] focus:ring-[#00703c]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Validações */}
            <div className="space-y-3 py-2">
              <ValidationItem 
                isValid={validation.match} 
                text="As senhas são iguais" 
              />
              <ValidationItem 
                isValid={validation.minLength} 
                text="Contém no mínimo 6 caracteres" 
              />
              <ValidationItem 
                isValid={validation.hasNumber} 
                text="Contém pelo menos 1 número" 
              />
              <ValidationItem 
                isValid={validation.hasUpperCase} 
                text="Contém pelo menos uma letra maiúscula" 
              />
              {/* Removido: validação de caracteres especiais */}
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#00703c] hover:bg-[#005a30] text-white font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isLoading || !isFormValid}
            >
              {isLoading ? "Redefinindo..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
