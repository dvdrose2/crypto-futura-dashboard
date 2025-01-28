import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";

interface CryptoChartProps {
  symbol: string;
}

const fetchWithRetry = async (url: string, retries = 3, delay = 1000) => {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url);
      if (response.status === 429) {
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

export const CryptoChart = ({ symbol }: CryptoChartProps) => {
  const { data, error } = useQuery({
    queryKey: ["cryptoChart", symbol],
    queryFn: async () => {
      try {
        const json = await fetchWithRetry(
          `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=7`
        );
        return json.prices.map(([timestamp, price]: [number, number]) => ({
          timestamp,
          price,
        }));
      } catch (error) {
        console.error("Error fetching chart data:", error);
        toast.error("Failed to load chart data. Please try again later.");
        throw error;
      }
    },
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 30000),
  });

  if (error) {
    return (
      <div className="h-[200px] flex items-center justify-center text-muted-foreground">
        Failed to load chart data
      </div>
    );
  }

  if (!data) {
    return (
      <div className="h-[200px] flex items-center justify-center">
        <div className="animate-pulse w-full h-full bg-primary/10 rounded" />
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#8B5CF6" stopOpacity={0.8} />
            <stop offset="95%" stopColor="#8B5CF6" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(timestamp) =>
            new Date(timestamp).toLocaleDateString()
          }
          stroke="#666"
        />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{
            backgroundColor: "rgba(0, 0, 0, 0.8)",
            border: "none",
          }}
        />
        <Area
          type="monotone"
          dataKey="price"
          stroke="#8B5CF6"
          fillOpacity={1}
          fill="url(#colorPrice)"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};