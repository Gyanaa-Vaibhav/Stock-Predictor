// types for Main
type StockData = {
    price:number
    date:number
}

type DataItem = [string, StockData[],string];

type StockPriceData = {
    name:string[],
    data:StockData[][]
}

export type {DataItem,StockPriceData,StockData}