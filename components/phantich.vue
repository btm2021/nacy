<template>
    <b-row>
        <b-col cols="12">
            <div class="">
                <div id="simplechart" class="kling">
                </div>
                <div>
                    <b-table :items="listIndicator"></b-table>
                </div>
            </div>
        </b-col>
    </b-row>

</template>

<script>

import { init, dispose, registerIndicator } from 'klinecharts';
import {
    ema, customRsi, absolutePriceOscillator, aroon, balanceOfPower,
    chandeForecastOscillator, communityChannelIndex, massIndex,
    qstick, kdj, rma, sma, tema, trima, trix, typicalPrice,
    vwma, vortex, awesomeOscillator, chaikinOscillator

} from 'indicatorts';
//import { DataFrame, Series } from 'danfojs'


export default {
    props: ["symbol", "timeframe"],
    methods: {
        getPricePrecision(symbol) {
            let item = this.exchangeInfo.find(i => i.symbol === symbol)
            return item.pricePrecision;
        },
        getLastData(array, num) {
            return array.slice(-num)
        },
        formatIndicator(object) {
            let result = [];

            let maxLength = 0;
            for (let key in object) {
                maxLength = Math.max(maxLength, object[key].length);
            }

            for (let i = 0; i < maxLength; i++) {
                let subArray = [];
                for (let key in object) {
                    if (object[key][i] !== undefined) {
                        subArray.push({ key: key, value: object[key][i] });
                    }
                }
                result.push(subArray);
            }

            return result


        },
        getIndicator() {

            return [
                {
                    name: 'Absolute Price Oscillator',
                    short: 'APO',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: absolutePriceOscillator(14, 30, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'Aroon',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: this.formatIndicator(aroon(this.listHigh, this.listClose))
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'EMA',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: ema(14, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'BOP',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: balanceOfPower(this.listOpen, this.listHigh, this.listLow, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'CFO',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: chandeForecastOscillator(this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'CMI',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: communityChannelIndex(14, this.listHigh, this.listLow, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'MI',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: massIndex(this.listHigh, this.listLow)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'Qtick',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: qstick(14, this.listOpen, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'KDJ',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: this.formatIndicator(kdj(9, 3, 3, this.listHigh, this.listLow, this.listClose))
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'RMA',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: rma(14, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'SMA',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: sma(14, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'tema',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: tema(14, this.listClose)
                }, {
                    name: 'Absolute Price Oscillator',
                    short: 'trima',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: trima(14, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'trix',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: trix(14, this.listClose)
                }, {
                    name: 'Absolute Price Oscillator',
                    short: 'typicalPrice',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: typicalPrice(this.listHigh, this.listLow, this.listClose)
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'vortex',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: this.formatIndicator(vortex(this.listHigh, this.listLow, this.listClose))
                },
                {
                    name: 'Absolute Price Oscillator',
                    short: 'AO',
                    help: ` function calculates a technical indicator that is used to follow trends. APO crossing above zero indicates bullish, while crossing below zero indicates bearish. Positive value is upward trend, while negative value is downward trend.`,
                    result: (awesomeOscillator(this.listHigh, this.listLow))
                },


            ]
        },
        getData() {
            let url = `https://fapi.binance.com/fapi/v1/klines?symbol=${this.symbol}&interval=1h`
            fetch(url).then(data => data.json()).then(async (data) => {
                console.log('co du lieu')
                var chart = init('simplechart');
                //close: 4976.16, high: 4977.99, low: 4970.12, open: 4972.89, timestamp: 1587660000000, volume: 204
                let newData = []
                data.map(i => {
                    let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = i;
                    newData.push({
                        open: parseFloat(open),
                        high: parseFloat(high),
                        close: parseFloat(close),
                        low: parseFloat(low),
                        volume: parseFloat(volume),
                        timestamp: time
                    })
                    this.listClose.push(parseFloat(close))
                    this.listHigh.push(parseFloat(high))
                    this.listLow.push(parseFloat(low))
                    this.listOpen.push(parseFloat(open))
                    this.listVolume.push(parseFloat(volume))
                    this.listTime.push(parseFloat(time))


                })
                this.listData = newData;
                let pricePrecision = 4;
                //this.getPricePrecision(this.symbol);
                let _listIndicator = this.getIndicator()
                //import to list 
                let newListIndicator = []
                for (let i = 0; i < newData.length; i++) {
                    let objectIndi = {
                        open: newData[i].open,
                        high: newData[i].high,
                        low: newData[i].low,
                        close: newData[i].close,
                    }
                    _listIndicator.map(indi => {
                        objectIndi[indi.short] = indi.result[i]
                    })

                    newListIndicator.push(objectIndi)
                }
                this.listIndicator = this.getLastData(newListIndicator, 5)

                let multi = 2
                let ema14 = ema(89, this.listClose)
                let rsi = customRsi(14, this.listClose)
                let t2 = Array(ema14.length)
                for (let i = 1; i < ema14.length; i++) {
                    let t1 = ema14[i]
                    let sl = t1 * (multi / 100)
                    let iff1 = (t1 > this.nz(t2[i - 1])) ? t1 - sl : t1 + sl
                    let iff2 = (t1 < this.nz(t2[i - 1]) && ema14[i - 1] < this.nz(t2[i - 1])) ? Math.min(this.nz(t2[i - 1]), t1 + sl) : iff1
                    let iff3 = (t1 > this.nz(t2[i - 1]) && ema14[i - 1] > this.nz(t2[i - 1])) ? Math.max(this.nz(t2[i - 1]), t1 - sl) : iff2
                    t2[i] = iff3
                }
                let newList1 = []
                newData.map((i, index) => {
                    newList1.push({ ...i, t2: t2[index], t1: ema14[index] })

                })

                // newData=newList1

                // var df = new DataFrame(newData)

                // df.addColumn("t1", ema14, { inplace: true })
                // df.addColumn("t2", t2, { inplace: true })
                // df.addColumn("rsi", rsi, { inplace: true })
                // // df.plot("danfo").table({});


                //    df.print()
                //debugger
                registerIndicator({
                    name: 'myBot',
                    shortName: 'myBot',
                    figures: [
                        { key: 'T1', title: 'T1: ', type: 'line' },
                        { key: 'T2', title: 'T2: ', type: 'line' }
                    ],
                    // When the calculation parameters are changed, it is hoped that the prompt is the same as the parameters, that is, the value of title needs to be changed
                    regenerateFigures: (params) => {
                        return params.map((p, i) => {
                            return { key: `T1${i + 1}`, title: `T2${p}: `, type: 'line' }
                        })
                    },
                    // Calculation results
                    calc: (kLineDataList) => {
                        return kLineDataList.map((kLineData, i) => {
                            const ma = {}
                            ma.T1 = t2[i]
                            ma.T2 = ema14[i]
                            return ma
                        })
                    }
                });
                chart.applyNewData(newData, 0);
                chart.createIndicator("VOL", { panel: 1 })

                chart.createIndicator('myBot', false, { id: "candle_pane" });
                //chart.createIndicator('VOL', true, { id: "candle_pane" });
                chart.createIndicator('RSI', false, {
                    id: "rsi", height: 50,
                    dragEnabled: true
                });
                chart.createIndicator('BOLL', false, { id: 'candle_pane' })
                chart.createIndicator('KDJ', false, {
                    id: "kdj", height: 50,
                    dragEnabled: true
                });
                chart.createIndicator('TRIX', false, {
                    id: "trix",
                    height: 50,
                    dragEnabled: true
                });
                chart.setPriceVolumePrecision(pricePrecision, pricePrecision)
                this.chart = chart;


            })
        },

        nz(val) {
            if (!val) {
                return 0
            } else {
                return val
            }
        }
    },
    destroyed: function () {
        dispose('simple_chart');
    },
    mounted() {
        let url = 'https://fapi.binance.com/fapi/v1/exchangeInfo'
        let fet = fetch(url).then(data => data.json()).then(data => {
            this.exchangeInfo = data.symbols;
            console.log('load exchange complete')

            this.getData()
        })

    },
    data() {
        return {
            listOpen: [],
            listClose: [],
            listHigh: [],
            listLow: [],
            listVolume: [],
            listTime: [],



            listData: [],
            chart: null,
            exchangeInfo: [],
            listIndicator: []

        }
    }
}
</script>

<style>
.kling {
    height: 500px;
    width: 100%;
}
</style>