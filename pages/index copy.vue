<template>
  <div>
    <div>
      <b-navbar toggleable="lg" type="dark">
        <b-navbar-brand href="#">Nacy</b-navbar-brand>
        <b-navbar-nav>
          <b-nav-text href="#" style="color:white">
            BTC:
            <span v-if="btcStatus" style="color:#0CCB80">{{ btcprice }}&#8593;</span>
            <span v-else style="color:#F23545">{{ btcprice }}&#8595;</span>
          </b-nav-text>
          <b-nav-text href="#" style="color:white">ETH:
            <span v-if="ethStatus" style="color:#0CCB80">{{ ethprice }}&#8593;</span>
            <span v-else style="color:#F23545">{{ ethprice }}&#8595;</span>
          </b-nav-text>
          <b-nav-text href="#" style="color:white">BTCD%:
            <span v-if="btcdomchangestatus" style="color:#0CCB80">{{ btcdomchange }}&#8593;</span>
            <span v-else style="color:#F23545">{{ btcdomchange }}&#8595;</span>
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
    <b-modal size="lg" @show="getAllAccountJSON" id="modalChangeAccount" title="Chỉnh sửa Account">
      <b-button variant="success">Thêm Account</b-button>
      <div>

      </div>
      <b-table bordered fixed :fields="chinhsuaaccountfields" :items="ListAccountsJSON" show-empty small hover striped>
        <template #cell(role)="data">
          <b-badge variant="warning" v-if="data.item.role === 'master'">Master</b-badge>

          <b-badge variant="success" v-else>Slave</b-badge>
        </template>
        <template #cell(status)="data">
          <div class="text-center" @click="toggleStatus(data.item)">
            <b-badge variant="success" v-if="(data.item.status)">V</b-badge>
            <b-badge variant="danger" v-else>X</b-badge>
          </div>
        </template>

        <template #cell(apikey)="data">
          <span class="text-center">{{ getShort(data.item.apikey) }}</span>
        </template>

        <template #cell(apisec)="data">
          <span class="text-center">{{ getShort(data.item.apisec) }}</span>
        </template>
        <template #cell(tool)="data" class="text-center">
          <span @click="accountDelete(data.item)">❌</span>
        </template>
      </b-table>
    </b-modal>
    <b-modal ok-only hide-footer ref="" id="modalChangeServer" title="Chỉnh sửa Server">
      <b-button variant="danger" @click="sendResetServer">Restart Server</b-button>
    </b-modal>

    <b-modal :hide-footer="true" ok-only id="calcModal" title="Tính PNL Future Binance">
      <b-form @submit.prevent="calcPNL" @show="onResetCalc" @reset="onResetCalc">
        <b-form-group>
          <b-form-radio-group v-model="calc.side" :options="['LONG', 'SHORT']" button-variant="outline-primary" buttons>
          </b-form-radio-group>
        </b-form-group>

        <b-form-group>
          <label>Đòn bẩy</label>
          <b-form-input type="range" step="1" min="1" max="125" v-model="calc.levage" required>
          </b-form-input>
          <span>X{{ calc.levage }}</span>
        </b-form-group>

        <b-form-group>
          <label>Số tiền</label>
          <b-form-input type="range" min="1000" max="10000" step="500" v-model="calc.margin" required>
          </b-form-input>
          <span>Sau Đòn Bẩy <code>{{ calc.margin }}</code> <b> USDT</b>: Vốn thực :
            <code>{{ (parseFloat(calc.margin) / parseFloat(calc.levage)).toFixed(1) }}</code><b> USDT</b></span>
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
            <b-td>{{ calc.entry }}</b-td>
            <b-td><b>Giá Đóng</b></b-td>
            <b-td>{{ calc.close }}</b-td>
          </b-tr>
          <b-tr>

            <b-td><b>Vị thế</b></b-td>
            <b-td><span v-if="(calc.side === 'LONG')" style="color:#0CCB80">{{ calc.side }}</span><span
                style="color:#F23545" v-else>{{ calc.side }}</span></b-td>
            <b-td><b>Vốn</b></b-td>
            <b-td>{{ calc.margin }}</b-td>
          </b-tr>

          <b-tr>
            <b-td><b>PNL</b></b-td>
            <b-td><span v-if="(calc.pnl > 0)" style="color:#0CCB80">{{ calc.pnl }}</span><span style="color:#F23545"
                v-else>{{ calc.pnl }}</span></b-td>
            <b-td><b>ROE %</b></b-td>
            <b-td><span v-if="(calc.pnl > 0)" style="color:#0CCB80">{{ calc.roe }}</span><span style="color:#F23545"
                v-else>{{ calc.roe }}</span></b-td>

          </b-tr>
        </b-tbody>

      </b-table-simple>
    </b-modal>
    <b-sidebar width="800px" backdrop shadow id="sidebar-mod" title="Copytrade">

      <div class="px-3 py-2">
        <b-dropdown style="" class="mx-1" right variant="success" text="Cấu Hình">
          <b-dropdown-item v-b-modal.modalChangeMaster>Thay đổi acc Master</b-dropdown-item>
          <b-dropdown-item v-b-modal.modalChangeAccount>Chỉnh sửa tài khoản</b-dropdown-item>
          <b-dropdown-item v-b-modal.modalChangeServer>Tắt mở server</b-dropdown-item>
        </b-dropdown>
        <b-row>
          <b-col xs="12" sm="12" md="12" lg="6" v-for="(account, index) in allAccount" :key="index">
            <span><b>{{ account.name }}</b> *Tổng tiền :
              <code>{{ parseFloat(String(parseFloat(account.totalWalletBalance).toFixed(0))) }}</code> *Pnl :
              <code>{{ parseFloat(String(parseFloat(account.totalCrossUnPnl).toFixed(1))) }}</code></span>
            <span><br /><b>Vị thế</b></span>
            <b-table fixed :fields="positionFields" small style="font-size:12px" hover striped bordered
              :items="account.positions" show-empty>
              <template #cell(tool)="data">
                <b-button size="sm" variant="danger"
                  @click="thanhlyvithe({ account: account.name, symbol: data.item.symbol, orderId: data.item.orderId })">X
                </b-button>
              </template>
            </b-table>
            <span><b>Lệnh chờ</b></span>
            <b-table fixed small style="font-size:12px" hover striped bordered :items="account.openorder"
              :fields="orderWaitFields" show-empty>
              <template #cell(tool)="data">

                <b-button size="sm" variant="danger"
                  @click="deleteOrder({ account: account.name, symbol: data.item.symbol, orderId: data.item.orderId })">X
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

      <b-tabs lazy small pills justified>
        <b-tab :active="tf.default" style="background-color:black" :title="tf.name" v-for="(tf, indextf) in listlinkscan"
          :key="indextf">
          <b-row style="border:10px red;margin-top:5px">
            <b-col xs="12" sm="12" md="12" lg="3">
              <b-input v-model="filter" autocomplete="off" type="search" class="text-uppercase"></b-input>
              <b-table head-variant="warning" fixed class="myTable" :sort-by.sync="sortBy" :sort-desc.sync="sortDesc"
                :sort-direction="sortDirection" :filter="filter" style="font-size:10px;text-align: center; "
                :fields="fields" :items="tf.dataList" show-empty small responsive>
                <template #cell(name)="data">
                  <span @click="phantich(data.item.name, data.item.timeframe)" class="symName">{{ data.item.name }}</span>
                </template>
                <template #cell(priceChangePercent)="data">
                  <span style="color:#F23545"
                    v-if="data.item.priceChangePercent < 0">{{ data.item.priceChangePercent }}%</span>
                  <span style="color:#0CCB80" v-else>{{ data.item.priceChangePercent }}%</span>
                </template>

                <template #cell(funding)="data">
                  <span style="color:#F23545" v-if="data.item.funding < 0">{{ data.item.funding }}%</span>
                  <span style="color:#0CCB80" v-else>{{ data.item.funding }}%</span>
                </template>
                <template #cell(lastPrice)="data">
                  <span style="color:#F23545" v-if="data.item.priceStatus === 'down'">{{ data.item.lastPrice }}</span>
                  <span style="color:#0CCB80" v-else-if="data.item.priceStatus === 'up'">{{ data.item.lastPrice }}</span>
                  <span style="color:white" v-else>{{ data.item.lastPrice }}</span>
                </template>

              </b-table>
            </b-col>
            <b-col xs="12" sm="12" md="12" lg="9">
              <b-row>
                <b-col cols="12">
                  <VueTradingView :key="tdvLink" :symbol="tdvLink" class="chart" style="height:70vh;width:70vw"
                    :options="tf.chartOptions">
                  </VueTradingView>

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

                          </b-form-group>

                          <b-button type="submit" variant="primary">Thêm</b-button>
                        </b-form>
                      </b-col>
                      <b-col cols="6">

                        <b-table class="mr-2 myTable" style="color:white" :fields="fieldsAlert" small striped
                          :items="alertList" v-if="alertList.length > 0" show-empty>
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
        </b-tab>
      </b-tabs>


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

      ],
    }
  },
  data() {
    return {
      currentDataList: [],
      ListAccountsJSON: [],
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
          "Stochastic@tv-basicstudies",
          "ZigZag@tv-basicstudies"
        ]
      },
      dataVolume: [],
      dataList: [],
      fields: [
        { key: "name" },
        { key: "timeframe", label: 'T' },
        { key: "lastPrice", label: 'price' },
        {
          key: 'symbolQuote.priceChangePercent', label: '%',
          sortable: true
        },
        {
          key: "rsi14.value.value",
          label: "RSI",
          sortable: true
        }, {
          key: "volumeC",
          sortable: true,
          label: 'Vol(M)',
        },
        //{
        //   key: 'symbolQuote.volume',
        //   label: 'Vol(M)',
        //   sortable: true,
        //   formatter: (value, key, item) => {
        //     if (parseFloat(value) > 0) {
        //       return (parseFloat(value) * item.lastPrice / 1000000).toFixed(0);
        //     } else {
        //       return 0
        //     }
        //   }
        // },
        {
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
      sortDesc: true,
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
        }, {
          key: 'entryPrice', formatter: (value, key, item) => {

            return (parseFloat(item.entryPrice))
          }
        }, {
          key: 'price', formatter: (value, key, item) => {
            let a = this.getRealtimePrice(item.symbol)
            return a;
          }
        },
        {
          key: 'initialMargin', label: 'Size', formatter: (value, key, item) => {

            return (parseFloat(item.initialMargin)).toFixed(1)
          }
        },
        {
          key: 'unrealizedProfit', label: 'PNL', formatter: (value, key, item) => {

            return (parseFloat(item.unrealizedProfit)).toFixed(1)
          }
        },


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
      chinhsuaaccountfields: [
        { key: "id" },
        { key: 'role' },
        { key: 'status' },
        { key: 'apikey' },
        { key: 'apisec' },
        { key: 'tool' },
      ],
      listlinkscan: [
        {
          name: '5m',
          url: 'https://scan5m.baotrinh1.repl.co',
          tdvtime: '5',
          default: false,
          dataList: [],
          chartOptions: {
            "autosize": true,
            "symbol": "BINANCE:BTCUSDTPERP",
            "interval": "5",
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
              "Stochastic@tv-basicstudies",
              "ZigZag@tv-basicstudies"
            ]
          }
        },
        {
          name: '15m',
          url: 'https://scan15m.baotrinh1.repl.co',
          tdvtime: '15',
          dataList: [],
          default: true,
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
              "Stochastic@tv-basicstudies",
              "ZigZag@tv-basicstudies"
            ]
          }
        },
        {
          name: '1h',
          url: 'https://scan1h.baotrinh1.repl.co',
          tdvtime: '1h',
          default: false,
          chartOptions: {
            "autosize": true,
            "interval": "60",
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
              "Stochastic@tv-basicstudies",
              "ZigZag@tv-basicstudies"
            ]
          }
        },
        {
          name: '4h',
          url: 'https://scan4h.baotrinh1.repl.co',
          tdv: '4h',
          default: false,
          dataList: [],
          chartOptions: {
            "autosize": true,
            "interval": "240",
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
              "Stochastic@tv-basicstudies",
              "ZigZag@tv-basicstudies"
            ]
          }
        }
      ]
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
      this.realtimePrice = d;

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
    toggleStatus(data) {
      let id = data.id;
      let link = this.linkbase + "acc"
      let status = (data.status) ? "TẮT" : "BẬT"

      this.$bvModal.msgBoxConfirm(`Bạn muốn ${status} account ${id} `, {
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
            if (status) {
              this.$axios.post(link, {
                action: (data.status) ? "turnoff" : "turnon",
                idAccount: id,
                infoAccount: JSON.stringify({ hello: 'world' })
              }).then(data => {
                this.$bvToast.toast(`${(data.status) ? "Tắt" : "Bật"} account ${id} thành công, server sẽ reload trong 1s`, {
                  title: 'Thông báo',
                  autoHideDelay: 5000,
                  appendToast: true,
                  variant: 'success'
                })
                this.$bvModal.hide('modalChangeAccount');
              })
            }
          }
        })
    },
    accountDelete(data) {
      let link = this.linkbase + "acc"
      this.$bvModal.msgBoxConfirm(`Bạn muốn Xóa account ${data.id} `, {
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
            this.$axios.post(link, {
              action: "delete",
              idAccount: data.id,
              infoAccount: JSON.stringify({ hello: 'world' })
            }).then(data => {
              this.$bvToast.toast(`Xóa account ${data.id} thành công, server sẽ reload trong 1s`, {
                title: 'Thông báo',
                autoHideDelay: 5000,
                appendToast: true,
                variant: 'success'
              })
              this.$bvModal.hide('modalChangeAccount');
            })

          }
        })
    },
    getShort(str) {
      return `${str[0]}${str[1]}${str[2]}...${str[str.length - 3]}${str[str.length - 2]}${str[str.length - 1]}`
    },
    sendResetServer() {
      let link = this.linkbase + 'acc';
      this.$axios.post(link, {
        action: 'restartserver',
        idAccount: '',
        infoAccount: JSON.stringify({ hello: 'world' })
      })
      this.$bvToast.toast(`Khởi động lại server thành công`, {
        title: 'Thông báo',
        autoHideDelay: 5000,
        appendToast: true,
        variant: 'info'
      })
      this.$bvModal.hide('modalChangeServer')

    },
    getRealtimePrice(sym) {
      let item;
      if (this.realTimePrice.length > 0) {
        item = this.realTimePrice.find(i => {
          return false;
        })

      }
      if (item) {
        return parseFloat(item.p)
      } else {
        return 0;
      }
    },
    handleOkChangeAccountMaster() {
      // let link = 'http://localhost:3000/' + 'acc';
      // this.$axios.post(link, {
      //   action: 'setmaster',
      //   idAccount: 'bao1',
      //   infoAccount: JSON.stringify({ hello: 'world' })
      // })
      if (this.changeAccMaster) {
        let link = this.linkbase + 'acc';
        this.$axios.post(link, {
          action: 'setmaster',
          idAccount: this.changeAccMaster,
          infoAccount: JSON.stringify({ hello: 'world' })
        }).then(data => {
          this.$bvToast.toast(`Thay đổi master thành công, vui lòng chờ server reload`, {
            title: 'Thông báo',
            autoHideDelay: 5000,
            appendToast: true,
            variant: 'success'
          })
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

    getAllAccountJSON() {

      let link = this.linkbase + 'acc';
      this.$axios.post(link, {
        action: 'read',
        idAccount: '99999',
        infoAccount: JSON.stringify({ hello: 'world' })
      }).then(data => {
        this.ListAccountsJSON = data.data.ListAccount
      })

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
            let link = this.linkbase + "orderdelete"
            this.$axios.post(link, {
              account: info.account,
              symbol: info.symbol,
              orderId: info.orderId,
              action: "deleteorder"
            }).then(data => {
              this.$bvToast.toast(`Xóa ORDER ${info.symbol} trên account ${info.account} thành công`, {
                title: 'Thông báo',
                autoHideDelay: 5000,
                appendToast: true,
                variant: 'success'
              })
            })
            console.log(info)
          }
        })
        .catch(err => {
          // An error occurred
          this.$bvToast.toast(`có lỗi`, {
            title: 'Lỗi',
            autoHideDelay: 5000,
            appendToast: true,
            variant: 'danger'
          })
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
      this.tdvLink = `BINANCE:${name}PERP`
      let item = this.dataList.find(item => {
        return item.name === name && item.timeframe === timeframe
      })
      if (item) {
        this.itemPhanTich = item;
        this.priceAlert = item.lastPrice;
      }
    },
    getData() {
      //* get all infomation and update
      this.listlinkscan.map(async (item) => {
        let url = `${item.url}/indicator?timestamp=${new Date().getTime()}`
        let re = await this.$axios.get(url);
        let newData = []
        re.data.map(item1 => {
          let v = 0;
          if (item1.symbolQuote) {
            v = (item1.symbolQuote.volume * item1.lastPrice / 1000000).toFixed(0);
          }
          item1.volumeC = v;
          newData.push(item1)
        })
        item.dataList = newData

      })



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
        let newData = []
        data.data.map(item => {

          let v = 0;
          if (item.symbolQuote) {
            v = (item.symbolQuote.volume * item.lastPrice / 1000000).toFixed(0);
          }
          item.volumeC = v;
          newData.push(item)
        })
        //lay chenh lech gia

        this.dataList = newData;
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