import { useEffect } from "react";

const LoadingCalculation = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-8">
      {/* Logo */}
      <div className="mb-16">
        <img src="/Logo.png" alt="Embrapa" className="h-12" />
      </div>

      {/* Loading spinner */}
      <div className="mb-12">
        <div className="w-24 h-24 relative">
          <div className="absolute inset-0 border-8 border-gray-200 rounded-full"></div>
          <div className="absolute inset-0 border-8 border-[#00703c] border-t-transparent rounded-full animate-spin"></div>
        </div>
      </div>

      {/* Loading text */}
      <div className="text-center max-w-2xl">
        <h1 className="text-3xl font-bold text-[#00703c] mb-6">
          Calculando os dados de sustentabilidade...
        </h1>
        <p className="text-gray-600 text-lg leading-relaxed">
          Estamos analisando as informações enviadas para gerar seu resultado de sustentabilidade. 
          Isso pode levar alguns instantes. Agradecemos pela sua paciência!
        </p>
      </div>
    </div>
  );
};

export default LoadingCalculation;
