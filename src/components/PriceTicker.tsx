import { useQuery } from "@tanstack/react-query";

interface CryptoPrice {
  id: string;
  symbol: string;
  current_price: number;
  price_change_percentage_24h: number;
}

export const PriceTicker = () => {
  const { data } = useQuery({
    queryKey: ["cryptoPrices"],
    queryFn: async () => {
      const response = await fetch(
        "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=10&sparkline=false"
      );
      return response.json() as Promise<CryptoPrice[]>;
    },
    refetchInterval: 30000,
  });

  if (!data) return null;

  return (
    <div className="w-full overflow-hidden bg-black/20 py-2">
      <div className="crypto-ticker flex gap-8">
        {data.map((crypto) => (
          <div key={crypto.id} className="flex items-center gap-2 whitespace-nowrap">
            <span className="font-medium">{crypto.symbol.toUpperCase()}</span>
            <span>${crypto.current_price.toLocaleString()}</span>
            <span
              className={`${
                crypto.price_change_percentage_24h >= 0
                  ? "text-green-500"
                  : "text-red-500"
              }`}
            >
              {crypto.price_change_percentage_24h.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};