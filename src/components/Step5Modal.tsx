import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

interface Step5ModalProps {
  onContinue: () => void;
}

const Step5Modal = ({ onContinue }: Step5ModalProps) => {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Show modal automatically when component mounts
    setIsOpen(true);
  }, []);

  const handleClose = () => {
    setIsOpen(false);
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
        <DialogTitle className="sr-only">Fase 5: Informações ambientais</DialogTitle>
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
          <div className="px-6 pb-3 flex justify-center">
            <div className="relative overflow-hidden" style={{ borderRadius: '16px', width: '316px', height: '316px' }}>
              <img
                src="/Passo5.png"
                alt="Fase 5: Informações ambientais - Ilustração com energia renovável e sustentabilidade"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

          {/* Content */}
          <div className="px-6 pb-6 text-center space-y-4">
            <h2 className="text-2xl font-bold text-primary">
              Fase 5: Informações ambientais
            </h2>
            
            <p className="text-gray-600 leading-relaxed text-base max-w-xl mx-auto">
              Nesta etapa, solicitamos dados relacionados às atividades econômicas, como produção, 
              comercialização e outras informações financeiras. Essas respostas nos ajudam a compreender 
              o impacto econômico do setor.
            </p>

            {/* Action button */}
            <div className="pt-4">
              <Button 
                onClick={handleContinue}
                className="bg-primary hover:bg-primary/90 text-white font-medium py-2.5 px-8 text-sm transition-all duration-200 hover:scale-105 shadow-lg"
                style={{ borderRadius: '16px' }}
              >
                Continuar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default Step5Modal;
