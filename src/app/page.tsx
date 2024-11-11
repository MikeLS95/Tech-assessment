"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

interface Coin {
  id: number;
  name: string;
  symbol: string;
  cmc_rank: number;
  quote: {
    USD: {
      price: number;
      percent_change_24h: number;
    };
  };
}

const CoinRow = ({ coin }: { coin: Coin }) => {
  const [imageSrc, setImageSrc] = useState(
    `/coins/${coin.symbol.toLowerCase()}.png`
  );

  return (
    <div
      key={coin.id}
      className="grid grid-cols-[auto,auto,1fr,auto,auto] gap-2 sm:gap-4 p-3 sm:p-4 bg-zinc-900 rounded-lg text-white text-sm sm:text-base hover:bg-zinc-800 transition-colors"
    >
      <div className="text-zinc-400">{coin.cmc_rank}</div>

      <div className="flex items-center justify-center">
        <Image
          src={imageSrc}
          alt={`${coin.name} logo`}
          width={24}
          height={24}
          className="mr-2"
          onError={() => setImageSrc("/coins/btc.png")}
        />
      </div>

      <div className="font-medium overflow-hidden">
        <div className="truncate">
          {coin.name}
          <span className="text-zinc-400 ml-1 hidden sm:inline">
            {coin.symbol}
          </span>
        </div>
      </div>

      <div className="truncate">
        $
        {coin.quote.USD.price.toLocaleString(undefined, {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}
      </div>

      <div
        className={
          coin.quote.USD.percent_change_24h >= 0
            ? "text-green-400"
            : "text-red-400"
        }
      >
        {coin.quote.USD.percent_change_24h.toFixed(2)}%
      </div>
    </div>
  );
};

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCoins = async () => {
      try {
        const response = await fetch("/api");
        if (!response.ok) {
          throw new Error("Failed to fetch data");
        }
        const data = await response.json();
        setCoins(data.data);
      } catch (error) {
        setError("Error fetching cryptocurrency data");
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoins();
  }, []);

  if (loading)
    return <div className="flex justify-center p-8 text-white">Loading...</div>;
  if (error)
    return <div className="flex justify-center p-8 text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="w-full sm:w-11/12 lg:max-w-3xl mx-auto text-white rounded-lg shadow-lg p-6">
        <h1 className="text-xl sm:text-2xl font-bold mb-1 text-left">
          Asset Tracker
        </h1>
        <p className="text-gray-500 text-sm mb-4">
          Track your favourite crypto assets
        </p>

        <div className="grid grid-cols-[auto,auto,1fr,auto,auto] gap-2 sm:gap-4 font-semibold mb-4 px-2 sm:px-4 text-sm sm:text-base">
          <div>#</div>
          <div></div>
          <div>Name</div>
          <div>Price</div>
          <div>24h %</div>
        </div>

        <div className="space-y-2">
          {coins.slice(0, 25).map((coin) => (
            <CoinRow key={coin.id} coin={coin} />
          ))}
        </div>
      </div>
    </div>
  );
}
