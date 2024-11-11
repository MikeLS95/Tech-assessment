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

type SortField = "rank" | "name" | "price" | "percent_change";

export default function Home() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortField, setSortField] = useState<SortField>("rank");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [searchQuery, setSearchQuery] = useState("");

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

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  const filteredCoins = searchQuery
    ? coins.filter((coin) =>
        coin.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : coins;

  const sortedCoins = [...filteredCoins].sort((a, b) => {
    let compareA, compareB;
    switch (sortField) {
      case "rank":
        compareA = a.cmc_rank;
        compareB = b.cmc_rank;
        break;
      case "name":
        compareA = a.name.toLowerCase();
        compareB = b.name.toLowerCase();
        break;
      case "price":
        compareA = a.quote.USD.price;
        compareB = b.quote.USD.price;
        break;
      case "percent_change":
        compareA = a.quote.USD.percent_change_24h;
        compareB = b.quote.USD.percent_change_24h;
        break;
    }

    if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
    if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
    return 0;
  });

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

        <div className="mb-4">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for a cryptocurrency..."
            className="w-full p-2 rounded-md bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {!searchQuery && (
          <div className="grid grid-cols-4 gap-2 sm:gap-4 font-semibold mb-4 px-2 sm:px-4 text-sm sm:text-base">
            <button onClick={() => handleSort("rank")} className="text-left">
              # {sortField === "rank" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </button>
            <button onClick={() => handleSort("name")} className="text-left">
              Name{" "}
              {sortField === "name" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </button>
            <button onClick={() => handleSort("price")} className="text-left">
              Price{" "}
              {sortField === "price" ? (sortOrder === "asc" ? "▲" : "▼") : ""}
            </button>
            <button
              onClick={() => handleSort("percent_change")}
              className="text-left"
            >
              24h %{" "}
              {sortField === "percent_change"
                ? sortOrder === "asc"
                  ? "▲"
                  : "▼"
                : ""}
            </button>
          </div>
        )}

        {/* Coin Rows */}
        <div className="space-y-2">
          {sortedCoins.slice(0, 25).map((coin) => (
            <CoinRow key={coin.id} coin={coin} />
          ))}
        </div>
      </div>
    </div>
  );
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
          onError={() => setImageSrc("/coins/default.png")} // Fallback to a default image if the icon fails to load
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
