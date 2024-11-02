import React, { useState } from 'react';
import { 
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription
} from "@/components/ui/card";
import { Zap, ThermometerSun, Shield, Timer, Wrench, DollarSign, X } from 'lucide-react';

// Dialog component implementation
const Dialog = ({ open, onOpenChange, children }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm">
      <div className="fixed left-[50%] top-[50%] z-50 w-full max-w-2xl translate-x-[-50%] translate-y-[-50%] p-6">
        <div className="bg-white rounded-lg shadow-lg relative">
          <button 
            onClick={() => onOpenChange(false)}
            className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </button>
          {children}
        </div>
      </div>
    </div>
  );
};

const DialogContent = ({ children }) => (
  <div className="p-6">{children}</div>
);

const DialogHeader = ({ children }) => (
  <div className="mb-4">{children}</div>
);

const DialogTitle = ({ children }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);

export const Marketplace = () => {
  const [selectedProvider, setSelectedProvider] = useState(null);

  const prices = [
    { provider: 'SolarTech', price: 5000 },
    { provider: 'SunPower', price: 6000 },
    { provider: 'Green Energy', price: 5500 },
    { provider: 'EcoSun', price: 5800 },
  ];

  const safetyMeasures = [
    { provider: 'SolarTech', measures: ['Fire-resistant materials', 'Anti-theft features'] },
    { provider: 'SunPower', measures: ['Surge protection', 'Tamper-proof design'] },
    { provider: 'Green Energy', measures: ['Weather resistance', 'Grounding systems'] },
    { provider: 'EcoSun', measures: ['UV protection', 'Child-safe designs'] },
  ];

  const urls = [
    { provider: 'SolarTech', url: 'https://solartech.com' },
    { provider: 'SunPower', url: 'https://sunpower.com' },
    { provider: 'Green Energy', url: 'https://greenenergy.com' },
    { provider: 'EcoSun', url: 'https://ecosun.com' },
  ];

  const panelEfficiency = [
    { provider: 'SolarTech', efficiency: 20.3 },
    { provider: 'SunPower', efficiency: 22.5 },
    { provider: 'Green Energy', efficiency: 21.0 },
    { provider: 'EcoSun', efficiency: 19.5 },
  ];

  const panelTemp = [
    { provider: 'SolarTech', tempCoefficient: -0.4 },
    { provider: 'SunPower', tempCoefficient: -0.3 },
    { provider: 'Green Energy', tempCoefficient: -0.35 },
    { provider: 'EcoSun', tempCoefficient: -0.5 },
  ];

  const panelWarranty = [
    { provider: 'SolarTech', warranty: '25 years' },
    { provider: 'SunPower', warranty: '25 years' },
    { provider: 'Green Energy', warranty: '20 years' },
    { provider: 'EcoSun', warranty: '15 years' },
  ];

  const installationPrices = [
    { provider: 'SolarTech', installationPrice: 1500 },
    { provider: 'SunPower', installationPrice: 2000 },
    { provider: 'Green Energy', installationPrice: 1800 },
    { provider: 'EcoSun', installationPrice: 1600 },
  ];

  const providers = prices.map(priceData => {
    const provider = priceData.provider;
    return {
      ...priceData,
      safetyMeasures: safetyMeasures.find(item => item.provider === provider).measures,
      url: urls.find(item => item.provider === provider).url,
      efficiency: panelEfficiency.find(item => item.provider === provider).efficiency,
      tempCoefficient: panelTemp.find(item => item.provider === provider).tempCoefficient,
      warranty: panelWarranty.find(item => item.provider === provider).warranty,
      installationPrice: installationPrices.find(item => item.provider === provider).installationPrice,
    };
  });

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const ProviderDetails = ({ provider }) => (
    <>
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <h3 className="font-semibold">Pricing</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Base Price: {formatPrice(provider.price)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Wrench className="w-4 h-4" />
              <span>Installation: {formatPrice(provider.installationPrice)}</span>
            </div>
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4" />
              <span>Total: {formatPrice(provider.price + provider.installationPrice)}</span>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h3 className="font-semibold">Technical Specs</h3>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              <span>Efficiency: {provider.efficiency}%</span>
            </div>
            <div className="flex items-center gap-2">
              <ThermometerSun className="w-4 h-4" />
              <span>Temp Coefficient: {provider.tempCoefficient}%/°C</span>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold">Warranty & Safety</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Timer className="w-4 h-4" />
            <span>Warranty: {provider.warranty}</span>
          </div>
          <div className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-1" />
            <div>
              <span className="block">Safety Features:</span>
              <ul className="list-disc list-inside text-sm">
                {provider.safetyMeasures.map((measure, idx) => (
                  <li key={idx}>{measure}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t">
        <a 
          href={provider.url}
          className="text-blue-600 hover:underline flex items-center gap-2"
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit {provider.provider} Website
        </a>
      </div>
    </div>
    </>
  );

  return (
    <div className="w-full col-span-4">
      <div className="flex flex-nowrap justify-center items-center overflow-x-auto gap-4 pb-4">
        {providers.map((provider) => (
          <Card 
            key={provider.provider}
            className="min-w-[300px] cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedProvider(provider)}
          >
            <CardHeader>
              <CardTitle className="text-xl font-bold">{provider.provider}</CardTitle>
              <CardDescription>
                Base Price: {formatPrice(provider.price)}
              </CardDescription>
            </CardHeader>

            <CardContent>
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4" />
                <span>Efficiency: {provider.efficiency}%</span>
              </div>
              <div className="text-sm text-blue-600">Click for more details</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={!!selectedProvider} onOpenChange={() => setSelectedProvider(null)}>
        {selectedProvider && (
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{selectedProvider.provider} Details</DialogTitle>
            </DialogHeader>
            <ProviderDetails provider={selectedProvider} />
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
};

export default Marketplace;