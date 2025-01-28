import { useQuery } from "@tanstack/react-query";
import { Navbar } from "@/components/Navbar";
import { PriceTicker } from "@/components/PriceTicker";
import { CryptoCard } from "@/components/CryptoCard";

const Index = () => {
  const { data, isLoading } = useQuery({
    queryKey: ["cryptoData"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=12&sparkline=false"
      );
      const markets = await response.json();
      
      // Fetch additional data for descriptions
      const detailedData = await Promise.all(
        markets.map(async (crypto: any) => {
          const detailResponse = await fetch(
            `https://api.coingecko.com/api/v3/coins/${crypto.id}?localization=false&tickers=false&market_data=false&community_data=false&developer_data=false`
          );
          const detail = await detailResponse.json();
          return {
            ...crypto,
            description: detail.description.en.split(". ")[0] + ".",
          };
        })
      );
      
      return detailedData;
    },
    refetchInterval: 30000,
  });

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