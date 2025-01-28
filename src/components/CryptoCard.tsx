import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CryptoChart } from "./CryptoChart";

interface CryptoCardProps {
  name: string;
  symbol: string;
  price: number;
  marketCap: number;
  description: string;
  priceChange: number;
}

export const CryptoCard = ({
  name,
  symbol,
  price,
  marketCap,
  description,
  priceChange,
}: CryptoCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card className="glass">
      <CardHeader>
        <CardTitle className="flex justify-between">
          <span>{name}</span>
          <span className="text-sm bg-primary/20 px-2 py-1 rounded">
            {symbol.toUpperCase()}
          </span>
        </CardTitle>
        <CardDescription>
          <div className="flex justify-between mt-2">
            <span>${price.toLocaleString()}</span>
            <span
              className={`${
                priceChange >= 0 ? "text-green-500" : "text-red-500"
              }`}
            >
              {priceChange.toFixed(2)}%
            </span>
          </div>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <CryptoChart symbol={symbol} />
        </div>
        <div className="space-y-4">
          <div>
            <span className="text-sm text-muted-foreground">Market Cap</span>
            <p className="font-medium">${marketCap.toLocaleString()}</p>
          </div>
          <div>
            <Button
              variant="ghost"
              className="w-full justify-between"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              Project Details
              {isExpanded ? <ChevronUp /> : <ChevronDown />}
            </Button>
            {isExpanded && (
              <p className="mt-2 text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};