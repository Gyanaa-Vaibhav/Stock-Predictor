import express from 'express';
import OpenAI from 'openai';
import dotenv from 'dotenv';
import cors from 'cors';
import path from "node:path";
import * as url from "node:url";
import { dates } from './dates.js';

dotenv.config()

const openAI = new OpenAI({
    apiKey: process.env.OPENAI_KEY,
});

const __filename = url.fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename)

const homeDir = process.env.PRODUCTION
    ? path.join(__dirname, '..','..','..','html','StockPredictor')
    : path.join(__dirname,'..','..','Frontend','build')


const app = express();
const PORT = process.env.PORT || 5172;

app.use(cors());
app.use(express.json())
app.use(express.static(homeDir));

app.get('*', (req, res) => {
    res.sendFile(path.join(homeDir,'index.html'))
})

app.post('/stock-data', async (req, res, next) => {
    console.log(req.body.data);
    const tickersArr: string[] = req.body.data
    try {
        const stockData = await Promise.all(tickersArr?.map(async (ticker: string) => {            
            const url = `https://api.polygon.io/v2/aggs/ticker/${ticker}/range/1/day/${dates.startDate}/${dates.endDate}?apiKey=${process.env.POLYGON_KEY}`
            const response = await fetch(url)
            const data = await response.text()
            const status = await response.status
            if (status === 200) {
                return data
            } else {
                return `${ticker} data not found`
            }
        }))
        
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
                role: "system",
                content: "You are a trading guru. Given data on share prices over the past 3-10 days, write a report in strictly one paragraph and no more than 150 words."
            },
            {
                role: "user",
                content: "Here is the stock data: " + data + ". Remember: one paragraph, no more than 150 words. If data is not available just say that is short sentence and unavailable. Report can go up to 300 words if there are more than 3 stocks",
            },
        ],
        max_tokens: 225,
        temperature:0.3,
    });
    console.log(response.choices[0].message.content);
    res.json({ success: true, message: response.choices[0].message.content })
});

app.listen(PORT, () => {
    console.log(`Listening on Port ${PORT}`);
})


