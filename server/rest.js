const app = require('express')()
const delay = require('delay')
const fs = require('fs')
const Binance = require('node-binance-api')
const binance = new Binance();
const config = require('./config.json')
const delaytime = config.timedelay
const timeframe = config.timeframe
const checktrendperiod = config.checktrend
const volumeCheck = config.alert.volume
const ta = require('technicalindicators');
app.get('/indicator', (req, res) => {
    fs.readFile('./scaner.json', 'utf8', (err, data) => {
        if (err) {
            res.json({ error: 404 })
        } else {
            res.json(JSON.parse(data))
        }
    })
})
async function getData(symbol, time) {
    return new Promise((resolve, reject) => {
        try {
            binance.candlesticks(symbol, time, (error, ticks, symbol) => {
                if (error) {
                    reject(error)
                } else {
                    resolve({
                        "name": symbol,
                        "time": time,
                        "ticks": [...ticks]
                    })
                }
            })
        }
        catch (err) {
            console.log('**** fetch error - limit IP')
            // console.log(err)
            reject(err)
        }

    }).catch((err) => {
        // console.log(err)
    });
}
const checkTrend = (data) => {
    let result = "SIDE"
    if (data[data.length - 1] > data[data.length - checktrendperiod - 1]) {
        result = "UP"
    } else {
        result = "DOWN"
    }
    return result
}
const getRSI = (symbolInfo, data, period) => {
    let a = ta.RSI.calculate({ values: data, period })
    let result = {}
    result = { value: a[a.length - 1], trend: checkTrend(a) }
    symbolInfo[`rsi${period}`] = result
    let danhgia = "";
    danhgia = `RSI ${a[a.length - 1]} đang nằm trong đoạn 40-80`
    if (a[a.length - 1] >= 80) {
        //RSI hơn 80
        danhgia = `RSI hiện tại ${a[a.length - 1]} đang cao hơn mức 80, trạng thái chờ SHORT`
    }
    if (a[a.length - 1] <= 30) {
        //RSI hơn 80
        danhgia = `RSI hiện tại ${a[a.length - 1]} đang nhỏ hơn mức 30, trạng thái chờ LONG`
    }

    symbolInfo[`rsi${period}`] = { value: result, danhgia }
    return symbolInfo
}
const getEMA = (symbolInfo, data, period) => {
    let ema = ta.EMA.calculate({ values: data, period })
    let result = {}
    result = { value: parseFloat(String((ema[ema.length - 1]).toFixed(4))), trend: checkTrend(ema) }
    let danhgia = "";
    if (data[data.length - 1] > ema[ema.length - 1]) {
        danhgia = `Giá hiện tại đang cao hơn EMA${period}, khả năng cao giá sẽ kéo về ngang EMA`
    } else {
        danhgia = `Giá hiện tại đang thấp hơn EMA${period}, khả năng cao giá sẽ kéo về ngang EMA`
    }
    symbolInfo[`ema${period}`] = { value: result, danhgia }
    return symbolInfo;
}
const getBB = (symbolInfo, data, period, stdDev) => {
    let a = ta.BollingerBands.calculate({ values: data, period, stdDev })
    let result = {}
    result = (a[a.length - 1])
    result.upper = parseFloat(String((result.upper).toFixed(4)))
    result.middle = parseFloat(String((result.middle).toFixed(4)))
    result.lower = parseFloat(String((result.lower).toFixed(4)))

    let danhgia = "";
    if (data[data.length - 1] > a[a.length - 1].middle) {
        //giá cáo hơn BB mid
        danhgia = `Giá hiện tại ${data[data.length - 1]} đang cao hơn BB Mid ${a[a.length - 1].middle}`
    } else {
        danhgia = `Giá hiện tại ${data[data.length - 1]} đang thấp hơn BB Mid ${a[a.length - 1].middle}`
    }
    symbolInfo[`bb`] = { value: result, danhgia }
    return symbolInfo
}
const getMACD = (symbolInfo, data, fastPeriod, slowPeriod, signalPeriod) => {
    let a = ta.MACD.calculate({
        values: data,
        fastPeriod,
        slowPeriod,
        signalPeriod,
        SimpleMAOscillator: false,
        SimpleMASignal: false,
    })
    let result = {}
    result = a[a.length - 1]
    let danhgia = "chưa hiểu";
    symbolInfo[`macd`] = { value: result, danhgia }
    return symbolInfo
}
const getPattern = (symbolInfo, data) => {

}
const getIndicator = (data) => {
    let allList = []
    data.map(item => {
        let symbolInfo = {
            lastPrice: 0,
            timeframe: ""
        }
        let tick = item.ticks;
        let dataClose = []
        let dataVolume = []
        //let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = [...tick]
        tick.map(i => {
            let [time, open, high, low, close, volume, closeTime, assetVolume, trades, buyBaseVolume, buyAssetVolume, ignored] = i
            dataClose.push(parseFloat(close));
            dataVolume.push(parseFloat(volume))
        })
        symbolInfo.lastPrice = dataClose[dataClose.length - 1]
        symbolInfo.name = item.name
        symbolInfo.timeframe = item.time
        //  symbolInfo = getRSI(symbolInfo, dataClose, (config.indicator.find(i => i.name === "rsi")).config.period)
        symbolInfo = getEMA(symbolInfo, dataClose, 20)
        symbolInfo = getEMA(symbolInfo, dataClose, 100)//ema20
        symbolInfo = getEMA(symbolInfo, dataClose, 200)//ema200
        symbolInfo = getRSI(symbolInfo, dataClose, 14)//rsi
        symbolInfo = getBB(symbolInfo, dataClose, (config.indicator.find(i => i.name === "bb")).config.period, (config.indicator.find(i => i.name === "bb")).config.sdtDev)
        symbolInfo = getVolumeChange(symbolInfo, dataVolume, volumeCheck)
        allList.push(symbolInfo)
    })
    return (allList)
}
const getVolumeChange = (symbolInfo, data, volumeCheck) => {
    //nếu volume bơm x2 
    if ((data[data.length - 1] / data[data.length - 2]) >= volumeCheck) {
        danhgia = "Volume Tăng mạnh"
    }
    if ((data[data.length - 2] / data[data.length - 1]) >= volumeCheck) {
        danhgia = "Volume Giảm mạnh"
    }
    else {
        danhgia = "Volume bình thường"
    }
    symbolInfo[`volume`] = { value: data[data.length - 1], danhgia }
    return symbolInfo
}
const main1 = async () => {

    PriceList = await binance.futuresPrices();
    let pairList = (JSON.parse(fs.readFileSync('./pairList.json', 'utf8'))).pairList;
    let TokenList = []
    console.log('===========================')
    pairList.forEach(i => {
        timeframe.forEach(time => {
            TokenList.push(getData(i, time));
        })
    })
    Promise.all(TokenList).then(data => {
        if (data) {
            AllData = []
            for (let i = 0; i < data.length; i++) {
                let item = data[i]
                if (item != undefined) {
                    AllData.push(item)
                }
            }
            let final = getIndicator(AllData);
            fs.writeFile("./scaner.json", JSON.stringify(final), "utf-8", (data, err) => {

                console.log('done')
            })
            delay(delaytime * 1000).then(data => {
                main1()
            });
        } else {
            console.log('fetch error, reload after 30s')
            delay(delaytime * 1000).then(data => {
                main1()
            });
        }
    });
}

main1();
module.exports = app