import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { PriceTicker } from "@/components/PriceTicker";
import { CryptoCard } from "@/components/CryptoCard";
import { toast } from "sonner";

const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
        // If rate limited, wait longer before next retry
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
        continue;
      }
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
};

const Index = () => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["cryptoData"],
    queryFn: async () => {
      try {
        // First fetch the markets data
        const markets = await fetchWithRetry(
          "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&sparkline=false"
        );
        
        // Then fetch detailed data with delay between requests
        const detailedData = await Promise.all(
          markets.map(async (crypto: any, index: number) => {
            // Add delay between requests to avoid rate limiting
            await new Promise(resolve => setTimeout(resolve, index * 1000));
            
            try {
              const detail = await fetchWithRetry(
                `https://api.coingecko.com/api/v3/coins/${crypto.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
              );
              
              return {
                ...crypto,
                description: detail.description?.en?.split(". ")[0] + "." || "No description available.",
              };
            } catch (error) {
              console.error(`Error fetching details for ${crypto.id}:`, error);
              return {
                ...crypto,
                description: "Description temporarily unavailable.",
              };
            }
          })
        );
        
        return detailedData;
      } catch (error) {
        console.error("Error fetching crypto data:", error);
        toast.error("Failed to fetch some cryptocurrency data. Please try again later.");
        throw error;
      }
    },
    refetchInterval: 30000,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  if (error) {
    toast.error("Failed to load cryptocurrency data. Please try again later.");
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-16">
        <PriceTicker />
        <main className="container mx-auto px-4 py-8">
          <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
            Cryptocurrency Market
          </h1>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 glass animate-pulse rounded-xl" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {data?.map((crypto: any) => (
                <CryptoCard
                  key={crypto.id}
                  name={crypto.name}
                  symbol={crypto.id}
                  price={crypto.current_price}
                  marketCap={crypto.market_cap}
                  description={crypto.description}
                  priceChange={crypto.price_change_percentage_24h}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default Index;