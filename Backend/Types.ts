interface PriceData {
    v: number;       // Volume
    vw: number;      // Volume-weighted average price
    o: number;       // Open price
    c: number;       // Close price
    h: number;       // High price
    l: number;       // Low price
    t: number;       // Timestamp (Unix Epoch in milliseconds)
    n: number;       // Number of trades
}

interface PolygonData {
    ticker: string;
    queryCount: number;
    resultsCount: number;
    adjusted: boolean;
    results: PriceData[];
    status: string;
    request_id: string;
    count: number;
}

type StockData = {
    price:number
    date:string
}

export {PolygonData,StockData}
