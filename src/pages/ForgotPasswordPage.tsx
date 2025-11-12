import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();
  const { resetPassword } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const { error: resetError } = await resetPassword(email);

    if (resetError) {
      setError("Não há e-mail cadastrado. Entre em contato com o suporte para cadastrar seu e-mail.");
      setIsLoading(false);
    } else {
      setEmailSent(true);
      toast({
        title: "E-mail enviado!",
        description: "Verifique sua caixa de entrada e spam.",
      });
      setIsLoading(false);
    }
  };

  const maskEmail = (email: string) => {
    if (!email.includes("@")) return email;
    const [username, domain] = email.split("@");
    const maskedUsername = username.slice(0, 3) + "***";
    return `${maskedUsername}@${domain}`;
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
            <h1 className="text-3xl font-bold text-gray-900">Esqueci minha senha</h1>
            <p className="text-gray-600 text-sm leading-relaxed">
              Digite seu e-mail abaixo para receber o link de recuperação de senha.
            </p>
          </div>

          {/* Formulário */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Campo E-mail */}
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 font-medium">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="Digite seu e-mail"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError("");
                  setEmailSent(false);
                }}
                className={`h-12 border-gray-300 focus:border-[#00703c] focus:ring-[#00703c] ${
                  error ? "border-red-500 focus:border-red-500 focus:ring-red-500" : ""
                }`}
                required
                disabled={isLoading}
              />
            </div>

            {/* Mensagem de sucesso */}
            {emailSent && !error && (
              <div className="flex items-start gap-3 p-4 bg-green-50 border border-green-200 rounded-lg">
                <Mail className="h-5 w-5 text-[#00703c] flex-shrink-0 mt-0.5" />
                <div className="text-sm text-gray-700">
                  <p>
                    Nós enviamos um e-mail para <strong>{maskEmail(email)}</strong>
                  </p>
                  <p className="mt-1">Confira também a sua caixa de spam.</p>
                </div>
              </div>
            )}

            {/* Mensagem de erro */}
            {error && (
              <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Botão Enviar */}
            <Button
              type="submit"
              className="w-full h-12 bg-[#00703c] hover:bg-[#005a30] text-white font-medium text-base"
              disabled={isLoading}
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </Button>

            {/* Link voltar ao login */}
            <div className="text-center">
              <button
                type="button"
                className="text-sm text-[#00703c] hover:underline font-medium"
                onClick={() => navigate("/login")}
              >
                Voltar ao login
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
