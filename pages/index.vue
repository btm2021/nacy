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
        <b-navbar-nav class="ml-auto">
          <b-nav-text href="#" style="color:white" right v-b-modal.calcModal>
            🎀
          </b-nav-text>

        </b-navbar-nav>
      </b-navbar>
    </div>

    <b-modal @ok="handleOkChangeAccountMaster" @show="resetModalChangeAccountMaster" id="modalChangeMaster"
      title="Thay đổi Acc Master">
      <b-container>

        <b-form-group label="Chọn Acc Master">
          <b-form-select v-model="changeAccMaster" :options="optionChangeAccMaster"></b-form-select>
        </b-form-group>

      </b-container>
    </b-modal>
    <b-modal id="modalChangeAccount" title="Chỉnh sửa Account">
      <p class="my-4">Hello from modal!</p>
    </b-modal>
    <b-modal id="modalChangeServer" title="Chỉnh sửa Server">
      <p class="my-4">Hello from modal!</p>
    </b-modal>
    <b-sidebar width="800px" backdrop shadow id="sidebar-mod" title="Copytrade">

      <div class="px-3 py-2">
        <b-dropdown class="mx-1" right variant="success" text="Cấu Hình">
          <b-dropdown-item v-b-modal.modalChangeMaster>Thay đổi acc Master</b-dropdown-item>
          <b-dropdown-item v-b-modal.modalChangeAccount>Chỉnh sửa tài khoản</b-dropdown-item>
          <b-dropdown-item v-b-modal.modalChangeServer>Tắt mở server</b-dropdown-item>
        </b-dropdown>
        <b-row>
          <b-col xs="12" sm="12" md="12" lg="6" v-for="(account,index) in allAccount" :key="index">
            <span><b>{{account.name}}</b> *Tổng tiền :
              <code>{{parseFloat(String(parseFloat(account.totalWalletBalance).toFixed(0)))}}</code> *Pnl :
              <code>{{parseFloat(String(parseFloat(account.totalCrossUnPnl).toFixed(1)))}}</code></span>
            <span><br /><b>Vị thế</b></span>
            <b-table fixed :fields="positionFields" small style="font-size:12px" hover striped bordered
              :items="account.positions" show-empty>
              <template #cell(tool)="data">
                <b-button size="sm" variant="danger"
                  @click="thanhlyvithe({account:account.name,symbol:data.item.symbol,orderId:data.item.orderId})">X
                </b-button>
              </template>
            </b-table>
            <span><b>Lệnh chờ</b></span>
            <b-table fixed small style="font-size:12px" hover striped bordered :items="account.openorder"
              :fields="orderWaitFields" show-empty>
              <template #cell(tool)="data">

                <b-button size="sm" variant="danger"
                  @click="deleteOrder({account:account.name,symbol:data.item.symbol,orderId:data.item.orderId})">X
                </b-button>
              </template>
            </b-table>
          </b-col>
        </b-row>

        <b-table small style="font-size:12px" hover striped bordered :items="msgStreamCp" :fields="msgStreamCpFields"
          show-empty></b-table>

      </div>
    </b-sidebar>

    <div class="main container-fluid">
      <b-modal :hide-footer="true" ok-only id="calcModal" title="Tính PNL Future Binance">
        <b-form @submit.prevent="calcPNL" @show="onResetCalc" @reset="onResetCalc">
          <b-form-group>
            <b-form-radio-group v-model="calc.side" :options="['LONG','SHORT']" button-variant="outline-primary"
              buttons>
            </b-form-radio-group>
          </b-form-group>

          <b-form-group>
            <label>Đòn bẩy</label>
            <b-form-input type="range" step="1" min="1" max="125" v-model="calc.levage" required>
            </b-form-input>
            <span>X{{calc.levage}}</span>
          </b-form-group>

          <b-form-group>
            <label>Số tiền</label>
            <b-form-input type="range" min="1000" max="10000" step="500" v-model="calc.margin" required>
            </b-form-input>
            <span>Sau Đòn Bẩy <code>{{calc.margin}}</code> <b> USDT</b>: Vốn thực :
              <code>{{(parseFloat(calc.margin)/parseFloat(calc.levage)).toFixed(1)}}</code><b> USDT</b></span>
          </b-form-group>
          <b-form-group>
            <label>Entry</label>
            <b-form-input v-model="calc.entry" required>
            </b-form-input>
          </b-form-group>
          <b-form-group>
            <label>Exit</label>
            <b-form-input v-model="calc.close" required>
            </b-form-input>
          </b-form-group>
          <b-form-row>
            <b-col>
              <b-button type="submit" block variant="primary">Tính</b-button>
            </b-col>

            <b-col>
              <b-button type="reset" block variant="danger">Reset</b-button>
            </b-col>
          </b-form-row>


        </b-form>
        <b-table-simple fixed bordered class="text-center mt-2" v-if="calcStatus" responsive>

          <b-tbody>
            <b-tr>

              <b-td><b>Giá Entry</b></b-td>
              <b-td>{{calc.entry}}</b-td>
              <b-td><b>Giá Đóng</b></b-td>
              <b-td>{{calc.close}}</b-td>
            </b-tr>
            <b-tr>

              <b-td><b>Vị thế</b></b-td>
              <b-td><span v-if="(calc.side==='LONG')" style="color:#0CCB80">{{calc.side}}</span><span
                  style="color:#F23545" v-else>{{calc.side}}</span></b-td>
              <b-td><b>Vốn</b></b-td>
              <b-td>{{calc.margin}}</b-td>
            </b-tr>

            <b-tr>
              <b-td><b>PNL</b></b-td>
              <b-td><span v-if="(calc.pnl>0)" style="color:#0CCB80">{{calc.pnl}}</span><span style="color:#F23545"
                  v-else>{{calc.pnl}}</span></b-td>
              <b-td><b>ROE %</b></b-td>
              <b-td><span v-if="(calc.pnl>0)" style="color:#0CCB80">{{calc.roe}}</span><span style="color:#F23545"
                  v-else>{{calc.roe}}</span></b-td>

            </b-tr>
          </b-tbody>

        </b-table-simple>
      </b-modal>
      <b-row style="border:10px red">
        <b-col xs="12" sm="12" md="12" lg="3">
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
        <b-col xs="12" sm="12" md="12" lg="9">
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
            <b-col class="mt-2" cols="12">
              <b-table style="font-size:12px;color: aliceblue !important;display: none;" class="myTable"
                :items="dataVolume" show-empty small></b-table>
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
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        {
          hid: 'description',
          name: 'description',
          content: 'my website description'
        }
      ],
    }
  },
  data() {
    return {

      calcStatus: true,
      calc: {
        entry: null,
        close: null,
        levage: 20,
        side: 'SHORT',
        margin: 4000,
        roe: 0,
        pnl: 0,
      },
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
      dataVolume: [],
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
      orderLink: '',
      positionLink: '',
      urlLink: "https://baotm.duckdns.org/indicator",
      volumeLink: 'https://baotm.duckdns.org/volumeAlert',
      btcdomchange: 0,
      btcdomchangestatus: false,
      copytradeconnection: null,
      msgStreamCp: [],
      allAccount: [],
      infoAccountFields: [
        { key: 'name' },

      ],
      positionFields: [
        { key: 'symbol' },
        {
          key: 'side', formatter: (value, key, item) => {
            return (parseFloat(item.notional) > 0) ? "LONG" : "SHORT"
          }
        },
        { key: 'unrealizedProfit', label: 'PNL' },

        { key: 'tool', label: '#' },
      ],
      orderWaitFields: [
        { key: 'symbol' },
        {
          key: 'side', formatter: (value, key, item) => {
            return (item.side === 'BUY') ? 'LONG' : 'SHORT'
          }
        },
        {
          key: 'price', label: 'Entry', formatter: (value, key, item) => {
            return (parseFloat(item.price)).toFixed(1)
          }
        },
        {
          key: 'initMargin', label: 'Vốn',
          formatter: (value, key, item) => {

            return (parseFloat(item.price) * parseFloat(item.origQty) / 20).toFixed(1)
          }
        },

        { key: 'tool', label: '#' },

      ],
      msgStreamCpFields: [

        {
          key: 'time', label: "Thời gian ",
          formatter: (value, key, item) => {
            return this.$moment(item.time).format('hh:mm:ss a')
          }
        },
        { key: 'text', label: "thông báo" }
      ],
      changeAccMaster: '',
      optionChangeAccMaster: [],
      linkbase: 'https://nacy.duckdns.org/',
    }
  },
  mounted() {
    this.$pnSubscribe({ channels: ['mychannel'], withPresence: true });
    this.$pnGetMessage('mychannel', this.receptor);

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
      if (this.btcdomchange != 0) {
        this.title += ` D:${this.btcdomchange.toFixed(2)}%`
      }
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
    handleOkChangeAccountMaster() {
      if (this.changeAccMaster) {
        let link = this.linkbase + 'acc';
        this.$axios.post(link, {

        })

      } else {
        this.$bvToast.toast(`Vui Lòng Chọn 1 Acc để set thành Master`, {
          title: 'Lỗi',
          autoHideDelay: 5000,
          appendToast: true,
          variant: 'danger'
        })
      }
    },
    resetModalChangeAccountMaster() {
      this.changeAccMaster = null;
    },
    setOptionChangeAccountMaster() {
      this.allAccount.forEach(acc => {
        this.optionChangeAccMaster.push(acc.name)
      })
    },
    deleteOrder(info) {
      this.$bvModal.msgBoxConfirm(`Bạn muốn xóa ORDER ${info.symbol} trên account ${info.account}`, {
        title: 'Xác nhận',
        size: 'sm',
        buttonSize: 'sm',
        okVariant: 'danger',
        okTitle: 'YES',
        cancelTitle: 'NO',
        footerClass: 'p-2',
        hideHeaderClose: false,
        centered: true
      })
        .then(value => {
          if (value) {
            //call
            // this.$axios.post(this.orderLink, {
            //   action: 'setmaster',
            //   idAccount: info.account,
            //   infoAccount: []
            // }).then(data => {
            //   console.log(data.data)
            // })
          }
        })
        .catch(err => {
          // An error occurred
        })
    },
    receptor(msg) {
      this.msgStreamCp.push({ text: JSON.parse(msg.message), time: new Date() })
    },
    calcPNL() {
      /*Unrealized PNL = position size * direction of order * (mark price - entry price)
ROE% =Unrealized PNL in USDT / entry margin = ( ( mark Price - entry Price ) * direction of order * size ) / （position_amount * contract_multiplier * mark_price* IMR）
*/
      let entryPrice = parseFloat(this.calc.entry)
      let exitPrice = parseFloat(this.calc.close)
      let margin = parseFloat(this.calc.margin)
      let side = (this.calc.side === 'LONG') ? 1 : -1
      let levage = parseFloat(this.calc.levage)
      let unPNL = (margin / entryPrice) * side * (exitPrice - entryPrice)
      let ROE = (unPNL / margin * 100 * levage)
      this.calc.roe = parseFloat(ROE.toFixed(2));
      this.calc.pnl = parseFloat(unPNL.toFixed(2));
    },
    onResetCalc() {
      this.calc = {
        entry: null,
        close: null,
        levage: 20,
        side: null,
        margin: 4000,
        roe: 0,
        pnl: 0,
      }
      this.calcStatus = false
    },
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
      let urlInfo = 'https://nacy.duckdns.org/infoAccount'
      this.$axios.post(urlInfo, {
        action: 'all'
      }).then(data => {
        this.allAccount = data.data;
        this.optionChangeAccMaster = []
        this.setOptionChangeAccountMaster();

      })
      this.$axios.get(`https://www.binance.com/fapi/v1/ticker/24hr?symbol=BTCDOMUSDT`).then(data => {
        this.btcdomchange = parseFloat(data.data.priceChangePercent)
        if (this.btcdomchange > 0) {
          this.btcdomchangestatus = true;
        } else {
          this.btcdomchangestatus = false
        }
      })
      this.status = false
      this.$axios.get(`${this.volumeLink}?timestamp=${new Date().getTime()}`).then(data => {

        this.dataVolume = data.data;
      })

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