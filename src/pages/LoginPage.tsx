import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();
  const { signIn, user } = useAuth();

  // Redirecionar se já estiver autenticado
  useEffect(() => {
    if (user) {
      navigate("/dashboard");
    }
  }, [user, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: "Erro no login",
        description: error.message === "Invalid login credentials"
          ? "E-mail ou senha incorretos."
          : "Ocorreu um erro ao fazer login. Tente novamente.",
        variant: "destructive",
      });
      setIsLoading(false);
    } else {
      toast({
        title: "Login realizado com sucesso!",
        description: "Redirecionando para o dashboard...",
      });
      navigate("/dashboard");
    }
  };

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
            <h1 className="text-3xl font-bold text-gray-900">Login</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Acesse a plataforma de administração para gerenciar informações,
              acompanhar o formulário.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                E-mail
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 border-gray-300 focus:border-[#00703c] focus:ring-[#00703c]"
                required
              />
            </div>

            {/* Campo Senha */}
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 font-medium">
                Senha
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

            {/* Link Esqueci a senha */}
            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[#00703c] hover:underline font-medium"
                onClick={() => navigate("/forgot-password")}
              >
                Esqueci a senha
              </button>
            </div>

            {/* Botão Entrar */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#00703c] hover:bg-[#005a30] text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
