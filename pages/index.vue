<template>
  <div>
    <div>
      <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand href="#">Nacy</b-navbar-brand>
        <b-navbar-nav>
          <b-nav-text href="#">BTC:{{btcprice}}
            <span v-if="btcStatus" style="color:blue">&#8593;</span>
            <span v-else style="color:red">&#8595;</span>
          </b-nav-text>
          <b-nav-text href="#">ETH:{{ethprice}}
            <span v-if="ethStatus" style="color:blue">&#8593;</span>
            <span v-else style="color:red">&#8595;</span>
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
      <b-row>
        <b-col class="col-xs-12 col-sm-12 col-md-12 col-lg-3">
          <b-input v-model="filter" autocomplete="off" type="search" class="m-2 text-uppercase"></b-input>
          <b-table :sort-by.sync="sortBy" :sort-desc.sync="sortDesc" :sort-direction="sortDirection" :filter="filter"
            style="font-size:10px;text-align: center;" :fields="fields" :items="dataList" show-empty small hover striped
            responsive>
            <template #cell(name)="data">
              <span @click="phantich(data.item.name,data.item.timeframe)" class="symName">{{data.item.name}}</span>
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
              <b-table-simple bordered class="mt-2" style="font-size:12px" hover small responsive v-if="itemPhanTich">
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
              <b-container style="font-size:12px">
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

                    <b-table class="mr-2" :fields="fieldsAlert" small hover striped :items="alertList"
                      v-if="alertList.length>0" show-empty>
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

  data() {
    return {
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
      this.btcprice = btcprice
      if (this.ethprice != 0) {
        if (btcprice > this.ethprice) {
          this.ethStatus = true;
        } else {
          this.ethStatus = false
        }
      }
      this.ethprice = ethprice

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
              this.play();
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
      this.status = false
      let api = 'https://api.allorigins.win/raw?url=https://slategreyfamiliarbug.baotrinh1.repl.co/indicator?timestamp='
      api = 'https://slategreyfamiliarbug.baotrinh1.repl.co/indicator?timestamp='
      this.$axios.get(`${api}${new Date().getTime()}`).then(data => {
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