<template>
  <b-container>
    <b-row>
      <b-col cols="12" class="text-center">
        <b-table sort-by="status" :sort-desc="true" head-variant="warning" :fields="fields" class="myTable text-center"
          style="font-size:10px !important;text-align: center; color:white !important" :items="currentDataList"
          show-empty small responsive>
          <template #cell(name)="data">
            <span @click="symbolphantich = data.item.name; $bvModal.show('m-phantich')" class="symName">{{
              data.item.name
            }}</span>
          </template>
          <template #cell(status)="data">

            <span v-if="data.item.status === 'yes'">
              <span class="dot blink_me"></span>
            </span>

            <span v-else>
              <span class="dot" style="background-color: black;"></span>
            </span>

          </template>

          <template #cell(candle)="data">
            <div class="text-center">
              <span v-if="data.item.candle === 'green'">
                <span style="color:green;font-weight: bolder;">&diams;</span>
              </span>
              <span v-else>
                <span style="color:red;font-weight: bolder;">&diams;</span>
              </span>
            </div>
          </template>

        </b-table>


      </b-col>
    </b-row>
    <b-modal :title="'Phân tích ' + symbolphantich" id="m-phantich" no-close-on-backdrop size="xl">
      <phantich :symbol="symbolphantich" />
    </b-modal>
  </b-container>

</template>

<script>
import phantich from '../components/phantich.vue'
export default {
  components: { phantich },
  methods: {
    //account

    calcStatus(data, symbol) {
      let str = 'no'
      let sideOfSignal = data.mybot89.lastSignal
      let currentPrice = parseFloat(data.close)
      let t1 = data.mybot89.t1;
      let t2 = data.mybot89.t2;
      let candle = (data.close > data.open) ? "green" : "red"
      if (sideOfSignal === "LONG" && currentPrice <= t1 && data.stoch[0] <= 30 && candle === "green") {
        //long thì giá phải chạm hoặc thấp hơn t2
        str = "yes"
      }
      if (sideOfSignal === "SHORT" && currentPrice >= t2 && data.stoch[0] >= 70 && candle === "red") {
        str = "yes"
      }
      return str;
    },
    calcScore(data, symbol) {

      //* định ngĩa chiến thuận, + điểm khi đạt đủ điều kiện
      /*
      bb: {middle: 22346.26899999998, upper: 23117.81773056468, lower: 21574.720269435278, pb: 0.22231241979598781}
cci: -90.55137013430523
close: 21917.77
ema21: 22265.07571516494
ema50: 22581.785919235954
ema200: 22953.35859247612
high: 21938.16
low: 21854.01
mybot89: {t1: 22766.727367581858, t2: 23222.061914933496, lastSignal: 'SHORT', signalBegin: 0, signalCountBar: 1000, …}
open: 21894.63
rsi: 14.878740424091305
stoch: (2) [20.095153969267407, 16.89811332467407]
time: 1676019600000
tsi: (2) [-0.3982559795505232, -0.5068896512606212]
volume: 9604.9873 */
      let score = 0;
      let sideOfSignal = data.mybot89.lastSignal;

      let currentPrice = $nuxt.$store.$getPrice(symbol)
      let t1 = data.mybot89.t1;
      let t2 = data.mybot89.t2;
      let rsi = data.rsi;
      let cci = data.cci;
      let tsi = data.tsi;
      let stoch = data.stoch;
      let candleType = (data.open > data.close) ? "red" : "green"
      if (sideOfSignal === "LONG") {
        //long thì giá phải chạm hoặc thấp hơn t2
        if (currentPrice <= t1) {
          score += 2;
        }
        if (candleType === "green") {
          score += 1;
        }
        if (rsi <= 25) {
          score += 1
        }
        if (stoch[0] <= 25 && stoch[1] <= 25) {
          score += 1
        }
        if (tsi[0] < 0 && tsi[1] < 0) {
          score += 1;
        }
        if (cci < -150) {
          score += 1
        }

      } else {
        //short
        if (currentPrice >= t2) {
          score += 2;
        }
        if (candleType === "red") {
          score += 1;
        }
        if (rsi >= 75) {
          score += 1
        }
        if (stoch[0] >= 75 && stoch[1] >= 75) {
          score += 1
        }
        if (tsi[0] > 0 && tsi[1] > 0) {
          score += 1;
        }
        if (cci > 150) {
          score += 1
        }
      }
      return score;
    },
    formatPrice(priceClose, num) {
      try {
        let strPriceClose = ((String(priceClose)).split("."))[1];
        let numToFix = strPriceClose.length
        return parseFloat(num.toFixed(numToFix))
      } catch (err) {
        return parseFloat(num).toFixed(3)
      }

    },
    phantichsymbol(symbol) {
      this.symbolphantich = symbol
    },
    getLastScan() {

      console.log('load')
      let url = 'https://code.nacy.duckdns.org/getByTimeFrame?timeframe=1h'
      fetch(url).then(data => data.json()).then(data => {

        console.log('có kết quả')
        data = JSON.parse(data)
        let newData = []
        data.map(i => {
          let _data = (i.data)
          let objectData = {
            status: this.calcStatus(_data, i.id),
            name: i.symbol,
            close: _data.close,
            signal: _data.mybot89.lastSignal,
            //  score: this.calcScore(_data, i.id),
            timeframe: i.timeframe,
            t1: this.formatPrice(_data.close, _data.mybot89.t1),
            t2: this.formatPrice(_data.close, _data.mybot89.t2),
            stoch: `K:${_data.stoch[0].toFixed(0)}D:${_data.stoch[1].toFixed(0)}`,
            rsi: (_data.rsi).toFixed(0),
            cci: (_data.cci).toFixed(0),
            candle: (_data.close > _data.open) ? "green" : "red"

          }

          newData.push(objectData)
        })

        //{name,signal,barcount,score}
        this.currentDataList = newData;
        setTimeout(() => {
          console.log('refetch')
          this.getLastScan()

        }, 5000)
      })

    }


  },
  created() {

  },
  mounted() {
    this.getLastScan();

  },
  data() {
    return {
      phantichSymbol: {
        symbol: 'BTCUSDT',

        timeframe: '1h'
      },
      symbolphantich: null,
      currentSymbol: 'BTCUSDT',
      dataReady: false,
      currentDataList: [],
      fields: [
        { key: 'status', sortable: true, label: 'Status', },
        { key: 'name', label: 'Name', sortable: true },
        { key: 'signal', label: 'S', sortable: true },

        { key: 'close', label: 'Close', sortable: true },
        { key: 't1', label: 'T1', sortable: true },
        { key: 't2', label: 'T2', sortable: true },
        { key: 'candle', label: 'Candle', sortable: true },
        { key: 'stoch', label: 'stoch', sortable: true },
        { key: 'rsi', label: 'rsi', sortable: true },
        { key: 'cci', label: 'cci', sortable: true },
      ]
    }
  }
}
</script>

<style>
.blink_me {
  animation: blinker 1s linear infinite;
}

@keyframes blinker {
  50% {
    opacity: 0;
  }
}

.dot {
  height: 10px;
  width: 10px;
  background-color: red;
  border-radius: 50%;
  display: inline-block;
}

.dot:hover {
  cursor: pointer;
  background-color: rgb(229, 111, 111);
  ;
}
</style>