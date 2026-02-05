import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

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
      <DialogContent 
        className="max-w-3xl w-[90vw] p-0 gap-0 overflow-hidden border-0 shadow-2xl [&>button]:hidden" 
        style={{ borderRadius: '16px' }}
      >
        <DialogTitle className="sr-only">Bem-vindo ao Formulário Embrapa</DialogTitle>
        {/* Close button */}
        <button
          onClick={handleClose}
          className="absolute top-6 right-6 z-10 p-2 rounded-full bg-white/80 hover:bg-white transition-all duration-200 hover:scale-110 shadow-md"
          aria-label="Fechar modal"
        >
          <X className="h-6 w-6 text-gray-600" />
        </button>

        <div className="flex flex-col bg-white">
          {/* Header with logo */}
          <div className="bg-white p-6 text-center">
            <div className="flex justify-center">
              <img 
                src="/Logo.png" 
                alt="Embrapa" 
                className="h-12 w-auto"
              />
            </div>
          </div>

          {/* Hero image */}
          <div className="px-6 pb-3">
            <div className="relative overflow-hidden" style={{ borderRadius: '16px' }}>
              <img
                src="/banner.png"
                alt="Agricultura sustentável - Tratores trabalhando em plantação"
                className="w-full h-48 sm:h-56 object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              Bem-vindo ao formulário Embrapa
            </h2>
            
            <p className="text-gray-600 leading-relaxed text-base max-w-xl mx-auto">
              Aqui você pode organizar sua propriedade, medir sua produtividade e 
              descobrir como melhorar os níveis socioambientais. Preencha e receba 
              um relatório completo!
            </p>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3 pt-4 justify-center max-w-md mx-auto">
              <Button 
                onClick={handleStart}
                className="flex-1 bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-5 text-sm transition-all duration-200 hover:scale-105 shadow-lg"
                style={{ borderRadius: '16px' }}
              >
                Iniciar questionário
              </Button>
              
              <Button 
                onClick={handleContinue}
                variant="outline"
                className="flex-1 border-2 border-primary text-primary hover:bg-primary/5 font-medium py-2.5 px-5 text-sm transition-all duration-200 hover:scale-105"
                style={{ borderRadius: '16px' }}
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
