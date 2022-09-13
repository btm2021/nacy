<template>
  <div class="full-height">
    <div>
      <b-navbar toggleable="lg" type="dark" variant="info">
        <b-navbar-brand href="#">NavBar</b-navbar-brand>

        <b-navbar-toggle target="nav-collapse"></b-navbar-toggle>

        <b-collapse id="nav-collapse" is-nav>
          <b-navbar-nav>
            <b-nav-item href="#">Link</b-nav-item>
            <b-nav-item href="#" disabled>Disabled</b-nav-item>
          </b-navbar-nav>

          <!-- Right aligned nav items -->
          <b-navbar-nav class="ml-auto">
            <b-nav-form>
              <b-form-input size="sm" class="mr-sm-2" placeholder="Search"></b-form-input>
              <b-button size="sm" class="my-2 my-sm-0" type="submit">Search</b-button>
            </b-nav-form>

            <b-nav-item-dropdown text="Lang" right>
              <b-dropdown-item href="#">EN</b-dropdown-item>
              <b-dropdown-item href="#">ES</b-dropdown-item>
              <b-dropdown-item href="#">RU</b-dropdown-item>
              <b-dropdown-item href="#">FA</b-dropdown-item>
            </b-nav-item-dropdown>

            <b-nav-item-dropdown right>
              <!-- Using 'button-content' slot -->
              <template #button-content>
                <em>User</em>
              </template>
              <b-dropdown-item href="#">Profile</b-dropdown-item>
              <b-dropdown-item href="#">Sign Out</b-dropdown-item>
            </b-nav-item-dropdown>
          </b-navbar-nav>
        </b-collapse>
      </b-navbar>
    </div>


    <div class="full-height">I am a DIV that will stretch to fit the whole width and height of the browser window!</div>
    <!-- <div class="main container-fluid h-100">
      <b-row>
        <b-col cols="2">
          <div id="yellow">
            xxx
          </div>
        </b-col>

        <b-col class="myCol" cols="10" style="background-color:Red">
          <div>
            <VueTradingView class="chart" :options="chartOptions"></VueTradingView>

          </div>

        </b-col>
      </b-row>
    </div> -->

  </div>

</template>

<script>

import VueTradingView from 'vue-trading-view2'
export default {
  components: { VueTradingView },
  data() {
    return {
      chartOptions: {

        "symbol": "BINANCE:BTCUSDTPERP",
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
      }
    }
  }
}

</script>
<style >
html,
body {
  height: 100%;
  margin: 0;
}

.full-height {
  height: 100%;
  background: yellow;
}
</style>