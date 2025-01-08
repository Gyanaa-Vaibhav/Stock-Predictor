import '../styles/Main.css';
import loader from '/loader.svg?url'
import add from '/add.svg?url'
import deleteIcon from '/delete_icon.svg?url';
import { MouseEvent, useEffect, useRef, useState } from 'react';
import Charts from "./Charts.tsx";
import { StockData} from "../types/Main.ts";

const Main = () => {
    const url = import.meta.env.VITE_SERVER_IP || ''
    console.log(url)

    const [showTickers, setShowTickers] = useState<boolean>(false)
    const [ticker, setTicker] = useState<string>('');
    const [tickerList, setTickerList] = useState<string[]>([])
    const [loadingReport, setLoadingReport] = useState<boolean>(false);
    const [showReport, setShowReport] = useState<boolean>(false);
    const [stockData, setStockData] = useState<string[]>([]);
    const [reportData, setReportData] = useState<string>('');

    const [reportMessage,setReportMessage] = useState<string>('');
    const [reportPrices,setReportPrices] = useState<StockData[][]>([]);

    const loadingRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if(!reportData) return

        const parsed = (JSON.parse(reportData))
        const data = tickerList.map(q => {
            return parsed[q]
        })

        setReportPrices(data)
        setReportMessage(parsed.message)
    }, [reportData, tickerList]);
    
    function handelClick(e: MouseEvent<HTMLButtonElement>) {
        e.preventDefault();
        if (ticker === '') return
        const exists = tickerList.find(t => t === ticker.toUpperCase())
        if(exists) return
        setTickerList(prev => [...prev, ticker.toUpperCase()]);
        setTicker('');
        setShowTickers(true);
    }

    function handelRestart() {
        setTickerList([]);
        setReportMessage('');
        setShowReport(false);
        setLoadingReport(false);
        setShowTickers(false);
        setReportData('');
        setStockData([]);
    }

    function handelDelete(e: string) {
        const newList = tickerList.filter(m => m !== e);
        setTickerList(newList);
    }
    
    function generateReport() {
        setLoadingReport(true);

        fetch(`${url}/stock-data`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                data:tickerList,
            })
        })
            .then(res => res.json())
            .then(data => {
                if (!data.success) {
                    setReportData(data.message)
                    setLoadingReport(false)
                    setShowReport(true)
                }

                if (data.success) {
                    if (loadingRef.current) loadingRef.current.innerText = 'Generating Report..'
                    setStockData(data.data)
                }
            })
    }


    useEffect(() => {
        if (stockData.length !== 0) {
            fetch(`${url}/prediction`, {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    data: stockData.join(''),
                })
            })
                .then(res => res.json())
                .then(data => {
                    setReportData(data.message)
                })
                .finally(() => {
                    setLoadingReport(false)
                    setShowReport(true)
                })
        }
            
    },[stockData])

    return (
        <>
            <main>
                {!loadingReport
                    ?
                    !showReport &&
                    <section className="action-panel">
                        <form id="ticker-input-form">
                            <label htmlFor="ticker-input"> Add up to 3 stock tickers below to get a super accurate stock predictions report <br/>👇 </label>
                            <div className="form-input-control">
                                <input
                                    onChange={(e) => setTicker(e.target.value)}
                                    value={ticker}
                                    type="text"
                                    id="ticker-input"
                                    placeholder="MSFT"
                                    autoComplete='off'
                                />
                                <button
                                    onClick={(e)=>handelClick(e)}
                                    className="add-ticker-btn"
                                    type="submit"
                                >
                                    <img src={add} className="add-ticker-svg" alt="add"/>
                                </button>
                            </div>
                        </form>
                        <div className="ticker-choice-display">
                            {showTickers
                                ? tickerList.map((t,i)=><div key={i} className='stock-holder'>
                                        <p>{t}</p>
                                        <img
                                            src={deleteIcon}
                                            alt="Delete Icon"
                                            onClick={()=>handelDelete(t)}
                                        />
                                    </div>
                                )
                                : 'Your tickers will appear here...'
                            }
                        </div>
                        <button
                            className={`generate-report-btn ${!showTickers && 'btn-disabled'}`}
                            type="button"
                            disabled={!showTickers}
                            onClick={generateReport}
                        >
                            Generate Report
                        </button>
                        <p className="tag-line">Always correct 15% of the time!</p>
                    </section>
                    :
                    <section className="loading-panel">
                        <img src={loader} alt="loading" />
                        <div
                            ref={loadingRef}
                            id="api-message"
                        >
                            Querying Stocks API...
                        </div>
                    </section>
                }
                {showReport &&
                    <>
                        <div className='report-screen'>
                            <Charts tickerList={tickerList} reportPrices={reportPrices}/>
                            <section className="output-panel">
                                <h2>Your Report 😜</h2>
                                <p>{reportMessage || 'Please try again API keys exhausted, Try contacting Developer for more info'}</p>
                            </section>
                            <button
                                className='generate-report-btn'
                                type="button"
                                onClick={handelRestart}
                            >
                                Start Again
                            </button>
                        </div>
                    </>
                }
            </main>
        </>
    );
}

export default Main;