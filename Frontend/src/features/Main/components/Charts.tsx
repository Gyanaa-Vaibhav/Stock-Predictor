import Chart from 'chart.js/auto';
import '../styles/Chart.css';
// import { ScriptableLineSegmentContext } from 'chart.js';
import {useEffect, useRef, useState} from 'react';
import {StockData} from "../types/Main.ts";

type tickerList= string[]
type Props = {
    tickerList:tickerList,
    reportPrices:StockData[][]
};

export default function Charts({tickerList,reportPrices}:Props) {

    const chartRef = useRef<Chart | null>(null);

    const [datae,setData] = useState<StockData[]>([]);
    const [currentChart,setCurrentChart] = useState<string>('');
    const [noData,setNoData] = useState<boolean>(false);

    function handelClick(d:string,s:number){
        setCurrentChart(d)
        if(reportPrices[s] === undefined){
            setNoData(true)
            return
        }
        setNoData(false)
        setData(reportPrices[s])
    }

    useEffect(() => {
        setCurrentChart(tickerList[0])
        if(reportPrices[0] === undefined){
            setNoData(true)
        }
        setNoData(false)
        setData(reportPrices[0]);
    }, [reportPrices, tickerList]);

    useEffect(() => {
        const ctx = document.getElementById("price-chart") as HTMLCanvasElement;

        if (chartRef.current) {
            chartRef.current.destroy();
        }

        if(noData) return
        if (datae && datae.length > 0) {
            chartRef.current = new Chart(ctx, {
                type: "line",
                data: {
                    labels: datae.map((row) => {
                        const day = String(new Date(row.date).getDate()).padStart(2, "0");
                        const month = String(new Date(row.date).getMonth() + 1).padStart(2, "0");
                        const year = String(new Date(row.date).getFullYear());
                        return `${day}/${month}/${year}`;
                    }),
                    datasets: [
                        {
                            label: `${currentChart} Price Data`,
                            data: datae.map((row) => row.price),
                            borderColor: "rgb(78,198,88)",
                            borderWidth: 2,
                            spanGaps: true,
                            segment: {
                                borderColor: (ctx) => {
                                    const index = ctx.p0DataIndex;
                                    if (index >= datae.length - 3) {
                                        return 'rgb(128, 128, 128)';
                                    }
                                    return ctx.p0.parsed.y > ctx.p1.parsed.y ? 'rgb(192,75,75)' : 'rgb(78,198,88)';
                                },
                                borderDash: (ctx) => {
                                    const index = ctx.p0DataIndex;
                                    return index >= datae.length - 3 ? [6, 6] : undefined;
                                },
                            },
                            pointBackgroundColor: (ctx) => {
                                const index = ctx.dataIndex;
                                if (index >= datae.length - 3) {
                                    return 'rgb(128, 128, 128)';
                                }
                                if (index === 0) {
                                    return 'rgb(78,198,88)';
                                }
                                return datae[index].price > datae[index - 1].price
                                    ? 'rgb(78,198,88)'
                                    : 'rgb(192,75,75)';
                            },
                            pointBorderColor: (ctx) => {
                                const index = ctx.dataIndex;
                                if (index >= datae.length - 3) {
                                    return 'rgb(128, 128, 128)';
                                }
                                if (index === 0) {
                                    return 'rgb(78,198,88)';
                                }
                                return datae[index].price > datae[index - 1].price
                                    ? 'rgb(78,198,88)'
                                    : 'rgb(192,75,75)';
                            },
                        },
                    ],
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    aspectRatio: 1.5,
                    plugins: {
                        legend: {
                            display: true,
                            labels: {
                                boxWidth: 0,
                                font:{
                                    size:16,
                                    style: 'italic',
                                },
                            },
                        },
                    },
                    elements: {
                        line: {
                            borderWidth: 2,
                            tension: 0.2,
                        },
                        point: {
                            radius: 4,
                        },
                    },
                    layout: {
                        padding: {
                            top: 20,
                            bottom: 10,
                        },
                    },
                },
            });
        }
    }, [datae, currentChart]);


    return (
        <>
            <div className='canvas'>
            <h1>Price Chart</h1>
            <div className='chat-data-name'>
                {tickerList.map((m,i)=><p
                    key={m}
                    onClick={()=>handelClick(m,i)}
                    id={`${currentChart === m ? 'active' : ''}`}
                    className={`chart-name`}
                >
                    {m}
                </p>)
                }
            </div>
                {!noData
                    ? <canvas id="price-chart"></canvas>
                    : <h2 className='no-data'>No data available</h2>
                }
            </div>
        </>
    );
}
