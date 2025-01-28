import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { useQuery } from "@tanstack/react-query";

interface CryptoChartProps {
  symbol: string;
}

export const CryptoChart = ({ symbol }: CryptoChartProps) => {
  const { data } = useQuery({
    queryKey: ["cryptoChart", symbol],
    queryFn: async () => {
      const response = await fetch(
        `https://api.coingecko.com/api/v3/coins/${symbol.toLowerCase()}/market_chart?vs_currency=usd&days=7`
      );
      const json = await response.json();
      return json.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      }));
    },
  });

  if (!data) return null;

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