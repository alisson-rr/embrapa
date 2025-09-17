import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import embrapaLogo from "@/assets/embrapa-logo-white.png";
import agricultureHero from "@/assets/agriculture-hero.jpg";

interface WelcomeModalProps {
  onStart: () => void;
  onContinue: () => void;
}

const WelcomeModal = ({ onStart, onContinue }: WelcomeModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal automatically when component mounts
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
  };

  const handleStart = () => {
    handleClose();
    onStart();
  };

  const handleContinue = () => {
    handleClose();
    onContinue();
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent className="max-w-lg w-[90vw] p-0 gap-0 rounded-2xl overflow-hidden">
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 z-10 p-1 rounded-full bg-white/80 hover:bg-white transition-colors"
          aria-label="Fechar modal"
        >
          <X className="h-5 w-5 text-muted-foreground" />
        </button>

        <div className="flex flex-col">
          {/* Header with logo */}
          <div className="bg-primary p-6 text-center">
            <div className="flex justify-center">
              <img 
                src={embrapaLogo} 
                alt="Embrapa" 
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Hero image */}
          <div className="relative">
            <img
              src={agricultureHero}
              alt="Agricultura sustentável"
              className="w-full h-48 sm:h-56 object-cover"
            />
          </div>

          {/* Content */}
          <div className="p-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              Bem-vindo ao formulário Embrapa
            </h2>
            
            <p className="text-muted-foreground leading-relaxed">
              Aqui você pode organizar sua propriedade, medir sua produtividade e 
              descobrir como melhorar os níveis socioambientais. Preencha e receba 
              um relatório completo!
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button 
                onClick={handleStart}
                className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-medium"
              >
                Iniciar questionário →
              </Button>
              
              <Button 
                onClick={handleContinue}
                variant="outline"
                className="flex-1 border-primary text-primary hover:bg-primary/5"
              >
                Continuar respondendo
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default WelcomeModal;