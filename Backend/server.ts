import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import { dates } from './dates.js';
import {PolygonData, StockData} from "./Types";

dotenv.config()

const openAI = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const app = express();
const PORT = 5172


app.use(cors());
app.use(express.json())

app.get('/', (req, res) => {
    res.send("Hello")
})

app.post('/stock-data', async (req, res, next) => {
    console.log(req.body.data);
    const tickersArr: string[] = req.body.data
    try {
        const stockData = await Promise.all(tickersArr?.map(async (ticker: string) => {
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_KEY}`
            const response = await fetch(url)
            const stockPriceData:StockData[] = []
            const data = await response.text()
            const status = response.status
            if (status === 200) {
                return data
            } else {
                return `${ticker} data not found`
            }
        }))

        console.log(stockData)
        
        res.json({ success: true, data: stockData });
        
    } catch (err) {
        res.json({ success: false, message: 'There was an error fetching stock data. Try again after some time'})
        console.error('error: ', err)
    }
})

app.post("/prediction", async (req, res) => {
    const data = req.body.data
    const response = await openAI.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [
            {
                "role": "system",
                "content": "You are a trading assistant. When given stock price data for 3-10 days, extract the closing prices ('c') and their corresponding dates ('t'), leave the dates as is in the UNIX format. Provide the data as an object where each stock is represented by its ticker, and the data for that stock is an array of objects in this format: {price: <closing price>, date: <formatted date>}. Additionally, predict the next 3 days of prices for each stock based on trends and include these predictions in the same array, with dates incremented by one day each. Also, include a `message` field in the response containing a one-paragraph prediction of future trends. The `message` must be around 150 words and minimum of 80 words . If data is unavailable, state that in the `message` field. If there are more than 3 stocks, the report can go up to 300 words. Return the `message` field and the separate stock data as a JSON object. Do not include (```json)."
            },
            {
                "role": "user",
                "content": "Here is the stock data: " + data
            }
        ],
        max_tokens: 1000,
        temperature:0.3,
    });
    console.log(response.choices[0].message.content);
    res.json({ success: true, message: response.choices[0].message.content })
});

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);

})


// const url = `https://api.polygon.io/v2/aggs/ticker/AAPL/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_KEY}`
// const response = await fetch(url)
// const data = await response.text()
// const status =  response.status
// if (status === 200) {
//     console.log(data)
//     const parsed:PolygonData = JSON.parse(data);
//     parsed["results"].map(m=>{
//         console.log(m.c)
//         console.log(m.t)
//     })
// }

// {"ticker":"AAPL","queryCount":6,"resultsCount":6,"adjusted":true,"results":[{"v":3.3166048e+07,"vw":252.2717,"o":252.23,"c":252.2,"h":253.5,"l":250.75,"t":1735534800000,"n":421590},{"v":3.4284191e+07,"vw":250.7349,"o":252.44,"c":250.42,"h":253.28,"l":249.43,"t":1735621200000,"n":361194},{"v":5.4125614e+07,"vw":244.3548,"o":248.93,"c":243.85,"h":249.1,"l":241.8201,"t":1735794000000,"n":685396},{"v":3.8846213e+07,"vw":243.0704,"o":243.36,"c":243.36,"h":244.18,"l":241.89,"t":1735880400000,"n":493718},{"v":4.2063243e+07,"vw":245.1849,"o":244.31,"c":245,"h":247.33,"l":243.2,"t":1736139600000,"n":493845},{"v":3.9313128e+07,"vw":242.9748,"o":242.98,"c":242.21,"h":245.55,"l":241.35,"t":1736226000000,"n":462820}],"status":"OK","request_id":"9ec51009a5dbddbef348c26f1e22ea47","count":6}

// const response = await openAI.chat.completions.create({
//         model: "gpt-4o-mini",
//         messages:[
//             {
//                 "role": "system",
//                 "content": "You are a trading assistant. When given stock price data for 3-10 days, extract the closing prices ('c') and their corresponding dates ('t'), formatted as 'DD/MM/YYYY'. Provide the data as an array of objects in this format: {price: <closing price>, date: <formatted date>}. Additionally, predict the next 3 days of prices based on trends and include them in the same array, with dates incremented by one day each. Also, include a `message` field in the response containing a one-paragraph prediction of future trends. The `message` must be no more than 150 words. If data is unavailable, state that in the `message` field. If there are more than 3 stocks, the report can go up to 300 words. Return the `message` field and the `data` array as a JSON object don not use (```json)."
//             },
//             {
//                 "role": "user",
//                 "content": "Here is the stock data: " + '{"ticker":"AAPL","queryCount":6,"resultsCount":6,"adjusted":true,"results":[{"v":3.3166048e+07,"vw":252.2717,"o":252.23,"c":252.2,"h":253.5,"l":250.75,"t":1735534800000,"n":421590},{"v":3.4284191e+07,"vw":250.7349,"o":252.44,"c":250.42,"h":253.28,"l":249.43,"t":1735621200000,"n":361194},{"v":5.4125614e+07,"vw":244.3548,"o":248.93,"c":243.85,"h":249.1,"l":241.8201,"t":1735794000000,"n":685396},{"v":3.8846213e+07,"vw":243.0704,"o":243.36,"c":243.36,"h":244.18,"l":241.89,"t":1735880400000,"n":493718},{"v":4.2063243e+07,"vw":245.1849,"o":244.31,"c":245,"h":247.33,"l":243.2,"t":1736139600000,"n":493845},{"v":3.9313128e+07,"vw":242.9748,"o":242.98,"c":242.21,"h":245.55,"l":241.35,"t":1736226000000,"n":462820}],"status":"OK","request_id":"9ec51009a5dbddbef348c26f1e22ea47","count":6}'
//             }
//         ],
//         max_tokens: 450,
//         temperature:0.3,
//     });
// const output = (response.choices[0].message.content);
// console.log(output)
// console.log("Parsed", JSON.parse(output));