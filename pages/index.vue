<template>
  <div>
    <div>
      <b-navbar toggleable="lg" type="dark">
        <b-navbar-brand href="#">Nacy</b-navbar-brand>
        <b-navbar-nav>
          <b-nav-text href="#" style="color:white">
            BTC:
            <span v-if="btcStatus" style="color:#0CCB80">{{btcprice}}&#8593;</span>
            <span v-else style="color:#F23545">{{btcprice}}&#8595;</span>
          </b-nav-text>
          <b-nav-text href="#" style="color:white">ETH:
            <span v-if="ethStatus" style="color:#0CCB80">{{ethprice}}&#8593;</span>
            <span v-else style="color:#F23545">{{ethprice}}&#8595;</span>
          </b-nav-text>
          <b-nav-text href="#" style="color:white">BTCD%:
            <span v-if="btcdomchangestatus" style="color:#0CCB80">{{btcdomchange}}&#8593;</span>
            <span v-else style="color:#F23545">{{btcdomchange}}&#8595;</span>
          </b-nav-text>
        </b-navbar-nav>
        <b-navbar-nav class="ml-auto">
          <b-nav-text right>
            <span v-if="isAdmin || isMod" v-b-toggle.sidebar-mod> &#129409;</span>
          </b-nav-text>
        </b-navbar-nav>
      </b-navbar>
    </div>
    <b-sidebar backdrop shadow id="sidebar-mod" title="Sidebar">
      <div class="px-3 py-2">
        <p>
          mod:{{isMod}}admin:{{isAdmin}}
          Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
          in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
        </p>
        <b-img src="https://picsum.photos/500/500/?image=54" fluid thumbnail></b-img>
      </div>
    </b-sidebar>

    <div class="main container-fluid">
      <b-row style="border:10px red">
        <b-col class="col-xs-12 col-sm-12 col-md-12 col-lg-3">
          <b-input v-model="filter" autocomplete="off" type="search" class="m-2 text-uppercase"></b-input>
          <b-table head-variant="warning" fixed class="myTable" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
            :sort-direction="sortDirection" :filter="filter" style="font-size:10px;text-align: center; "
            :fields="fields" :items="dataList" show-empty small responsive>
            <template #cell(name)="data">
              <span @click="phantich(data.item.name,data.item.timeframe)" class="symName">{{data.item.name}}</span>
            </template>
            <template #cell(priceChangePercent)="data">
              <span style="color:#F23545" v-if="data.item.priceChangePercent<0">{{data.item.priceChangePercent}}%</span>
              <span style="color:#0CCB80" v-else>{{data.item.priceChangePercent}}%</span>
            </template>

            <template #cell(funding)="data">
              <span style="color:#F23545" v-if="data.item.funding<0">{{data.item.funding}}%</span>
              <span style="color:#0CCB80" v-else>{{data.item.funding}}%</span>
            </template>
            <template #cell(lastPrice)="data">
              <span style="color:#F23545" v-if="data.item.priceStatus==='down'">{{data.item.lastPrice}}</span>
              <span style="color:#0CCB80" v-else-if="data.item.priceStatus==='up'">{{data.item.lastPrice}}</span>
              <span style="color:white" v-else>{{data.item.lastPrice}}</span>
            </template>

          </b-table>
        </b-col>
        <b-col class="col-xs-12 col-sm-12 col-md-12 col-lg-9">
          <b-row>
            <b-col cols="12">
              <VueTradingView :key="tdvLink" :symbol="tdvLink" class="chart" style="height:70vh;width:70vw"
                :options="chartOptions">
              </VueTradingView>
            </b-col>
            <b-col class="mt-2" cols-sm="12" cols="7">
              <b-table-simple bordered class="mt-2 myTable" style="font-size:12px" small responsive v-if="itemPhanTich">
                <b-thead>
                  <b-tr>
                    <b-th>Mô tả</b-th>
                    <b-th>Giá trị</b-th>
                    <b-th>Đánh giá</b-th>
                    <b-th>Trend</b-th>
                  </b-tr>
                </b-thead>
                <b-tbody>
                  <b-tr>
                    <b-td>EMA20</b-td>
                    <b-td>{{itemPhanTich.ema20.value.value}}</b-td>
                    <b-td>{{itemPhanTich.ema20.danhgia}}</b-td>
                    <b-td>{{itemPhanTich.ema20.value.trend}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-td>EMA100</b-td>
                    <b-td>{{itemPhanTich.ema100.value.value}}</b-td>

                    <b-td>{{itemPhanTich.ema100.danhgia}}</b-td>

                    <b-td>{{itemPhanTich.ema100.value.trend}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-td>EMA200</b-td>
                    <b-td>{{itemPhanTich.ema200.value.value}}</b-td>
                    <b-td>{{itemPhanTich.ema200.danhgia}}</b-td>
                    <b-td>{{itemPhanTich.ema200.value.trend}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-td>RSI14</b-td>
                    <b-td colspan="2">{{itemPhanTich.rsi14.value.value}}</b-td>
                    <b-td>{{itemPhanTich.rsi14.danhgia}}</b-td>
                  </b-tr>

                  <b-tr>
                    <b-td>BollingBand</b-td>
                    <b-td>BB Trên {{itemPhanTich.bb.value.upper}}</b-td>
                    <b-td>BB Giữa {{itemPhanTich.bb.value.middle}}</b-td>
                    <b-td>BB Dưới {{itemPhanTich.bb.value.lower}}</b-td>
                  </b-tr>
                  <b-tr>
                    <b-td colspan="2">Volume</b-td>
                    <b-td colspan="2">{{itemPhanTich.volume.danhgia}}</b-td>
                  </b-tr>
                </b-tbody>

              </b-table-simple>
            </b-col>
            <b-col class="mt-2" cols-sm="12" cols="5">
              <b-container style="font-size:12px;color:white">
                <b-row>
                  <b-col cols="6">
                    <b-form ref="formAlert" @submit.prevent="onSubmit" v-if="itemPhanTich">
                      <b-form-group :label="`Cảnh báo giá ${itemPhanTich.name}`"
                        description="Tool sẽ cảnh báo giá khi giá thực tế chạm giá cảnh báo">
                        Giá cao hơn <b-form-input class="mb-4" size="sm" autocomplete="off" v-model="priceAlert">
                        </b-form-input>
                        <!--                        
                        Giá thấp hơn <b-form-input size="sm" autocomplete="off" v-model="priceAlert">
                        </b-form-input> -->
                      </b-form-group>

                      <b-button type="submit" variant="primary">Thêm</b-button>
                    </b-form>
                  </b-col>
                  <b-col cols="6">

                    <b-table class="mr-2 myTable" style="color:white" :fields="fieldsAlert" small striped
                      :items="alertList" v-if="alertList.length>0" show-empty>
                      <template #cell(tool)="data">
                        <span class="toolDelete" @click="deleteAlert(data.item.name)"
                          style="text-align: center;color:blue">
                          X
                        </span>
                      </template>
                    </b-table>
                  </b-col>
                </b-row>
              </b-container>
            </b-col>
          </b-row>
        </b-col>
      </b-row>

    </div>
    <div class="fab-container" @click="toTheTop">
      <div class="button iconbutton">
        <span>&#128079;</span>
      </div>
    </div>
  </div>

</template>
<script>

import VueTradingView from 'vue-trading-view2'

export default {
  components: { VueTradingView },
  head() {
    return {
      title: this.title,
    }
  },
  data() {
    return {
      title: "Nacy",
      btcprice: 0,
      btcStatus: false,
      ethprice: 0,
      ethStatus: false,
      connection: null,
      itemAlert: null,
      priceAlert: 0,
      rsiAlert: 0,
      alertList: [],
      chartOptions: {
        "autosize": true,
        "interval": "15",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "locale": "vi_VN",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "withdateranges": true,
        "hide_side_toolbar": false,
        "allow_symbol_change": true,
        "studies": [
          "BB@tv-basicstudies",
          "Stochastic@tv-basicstudies"
        ]
      },
      dataList: [],
      fields: [
        { key: "name" },
        { key: "timeframe", label: 'T' },
        { key: "lastPrice", label: 'price' },
        {
          key: 'priceChangePercent', label: '%',
          sortable: true
        },
        {
          key: "rsi14.value.value",
          label: "RSI",
          sortable: true
        }, {
          key: "funding",
          label: "Fund",
          sortable: true
        },
      ],
      fieldsAlert: [
        {
          key: 'name',
        },
        {
          key: 'price',
        },
        {
          key: 'tool'
        }
      ],
      filter: '',
      sortBy: 'rsi14.value.value',
      sortDesc: false,
      sortDirection: 'desc',
      itemPhanTich: null,
      tdvLink: 'BINANCE:BTCUSDTPERP',
      realTimePrice: [],
      fundingratelist: [],
      status: false,
      isMod: false,
      isAdmin: false,
      urlLink: "https://scanner5m-15m.baotrinh1.repl.co/indicator",
      btcdomchange: 0,
      btcdomchangestatus: false
    }
  },
  mounted() {
    let role = this.$route.query.r
    if (role === "m") {
      this.isMod = true;
    }
    if (role === "a") {
      this.isAdmin = true;
    }
    this.getData();

    setInterval(() => {
      this.getData();
    }, 1000 * 5);
    console.log("Starting connection to Binance Server")
    //this.connection = new WebSocket("wss://fstream.binance.com/ws/!ticker@arr")
    this.connection = new WebSocket("wss://fstream.binance.com/ws/!markPrice@arr@1s")
    this.connection.onmessage = (event) => {

      let d = JSON.parse(event.data);

      this.alertCheck(d)
      let btcprice = parseFloat((d.find(item => item.s === "BTCUSDT")).p);
      let ethprice = parseFloat((d.find(item => item.s === "ETHUSDT")).p);

      if (this.btcprice != 0) {
        if (btcprice > this.btcprice) {
          this.btcStatus = true;
        } else {
          this.btcStatus = false
        }
      }
      this.btcprice = parseFloat(String(btcprice.toFixed(2)))
      if (this.ethprice != 0) {
        if (btcprice > this.ethprice) {
          this.ethStatus = true;
        } else {
          this.ethStatus = false
        }
      }
      this.ethprice = parseFloat(String(ethprice.toFixed(2)))
      this.title = `B:${parseFloat(String(btcprice.toFixed(2)))} E:${parseFloat(String(ethprice.toFixed(2)))}`

      d.forEach(item => {
        this.dataList.forEach(dl => {
          if (dl.name === item.s) {
            dl.funding = parseFloat(String((parseFloat(item.r) * 100).toFixed(3)))
          }
        })
      })
    }
  },
  methods: {
    toTheTop() {
      window.scrollTo(0, 0);
    },
    getLongShortRatio() {

    },

    makeAlert(data, priceAlert, close) {
      this.$bvToast.toast(`Cặp ${data} Giá hiện tại ${close} đang cao hơn giá cảnh báo ${priceAlert}`, {
        title: 'Cảnh Báo Giá',
        autoHideDelay: 5000,
        appendToast: true,
        variant: 'warning'
      })
      this.deleteAlert(data)
      this.play().then(() => {
        this.play().then(() => {
          this.play().then(() => {
            this.play().then(() => {
              this.play().then(() => {
                this.play().then(() => {
                  this.play();
                })
              })
            })
          })
        })
      })
    },
    async play() {
      return new Promise(function (resolve, reject) {   // return a promise
        var audio = new Audio('BEEP1.wav');                     // create audio wo/ src
        audio.preload = "auto";                      // intend to play through
        audio.autoplay = true;                       // autoplay when loaded
        audio.onerror = reject;                      // on error, reject
        audio.onended = resolve;                     // when done, resolve
      });
    },

    alertCheck(data) {
      this.alertList.forEach(alert => {
        let nameAlert = alert.name
        let priceAlert = parseFloat(alert.price);
        data.forEach(item => {
          let close = parseFloat(item.p)
          let symbol = item.s
          if (symbol === nameAlert) {
            if (close >= priceAlert) {
              this.makeAlert(nameAlert, priceAlert, close)
            }
          }
        })

      })
    },
    deleteAlert(name) {
      let i = this.alertList.filter(i => i.name != name)
      this.alertList = i
    },
    onSubmit() {
      let objectAlert = {
        name: this.itemPhanTich.name,
        price: this.priceAlert,
      }
      this.alertList.push(objectAlert)
    },
    phantich(name, timeframe) {
      let item = this.dataList.find(item => {
        return item.name === name && item.timeframe === timeframe
      })
      if (item) {
        this.itemPhanTich = item;
        this.tdvLink = `BINANCE:${item.name}PERP`
        this.priceAlert = item.lastPrice;
      }
    },

    getData() {
      console.log('fetch again')
      this.$axios.get(`https://www.binance.com/fapi/v1/ticker/24hr?symbol=BTCDOMUSDT`).then(data => {
        this.btcdomchange = parseFloat(data.data.priceChangePercent)
        if (this.btcdomchange > 0) {
          this.btcdomchangestatus = true;
        } else {
          this.btcdomchangestatus = false
        }
      })
      this.status = false


      this.$axios.get(`${this.urlLink}?timestamp=${new Date().getTime()}`).then(data => {
        for (let i = 0; i < this.dataList.length; i++) {
          for (let a = 0; a < data.data.length; a++) {
            if (this.dataList[i].name === data.data[a].name) {
              let status = "";
              if (this.dataList[i].lastPrice > data.data[a].lastPrice) {
                status = "up";
              }
              if (this.dataList[i].lastPrice < data.data[a].lastPrice) {
                status = "down";
              }
              if (this.dataList[i].lastPrice === data.data[a].lastPrice) {
                status = "none"
              }
              data.data[a].priceStatus = status;

            }
          }
        }

        //lay chenh lech gia
        this.$axios.get(`https://www.binance.com/fapi/v1/ticker/24hr`).then(data1 => {
          data1.data.forEach(item => {
            let s = item.symbol;
            let c = item.priceChangePercent;
            for (let a = 0; a < data.data.length; a++) {
              if (data.data[a].name === s) {
                data.data[a].priceChangePercent = parseFloat(String(parseFloat(c).toFixed(1)))
              }
            }
          })
        })

        this.dataList = data.data;
        //cap nhat itemphantich
        if (this.itemPhanTich) {
          this.itemPhanTich = this.dataList.find(item => {
            return item.name === this.itemPhanTich.name && item.timeframe === this.itemPhanTich.timeframe
          })
        }
      })
    }
  }
}

</script>
<style>
html,
body {
  height: 100%;
  background-color: #161A1E;
  ;
}

.myTable table {
  color: #e6eaee !important;
}

.symName:hover {
  color: red;
  cursor: pointer;
}

.fab-container {
  position: fixed;
  bottom: 50px;
  right: 50px;
  cursor: pointer;
  font-size: 50px;
  padding: 5px;
  color: blue
}


.toolDelete {
  cursor: pointer;
  color: red !important;
}
</style>