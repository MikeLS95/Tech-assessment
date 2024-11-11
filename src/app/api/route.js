import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const res = await fetch(
      "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest",
      {
        headers: {
          "Content-Type": "application/json",
          "X-CMC_PRO_API_KEY": process.env.API_KEY,
        },
      }
    );
    
    if (!res.ok) {
      throw new Error(`API responded with status: ${res.status}`);
    }

    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: "Error fetching data from CoinMarketCap" },
      { status: 500 }
    );
  }
}