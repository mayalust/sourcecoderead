<template>
  <div>
    <ps-table v-model="pageInfo" :headers="headers">
      <tr v-for="(item, inx) in datas" :key="inx">
        <td v-text="item.label" @click="click(item)"></td>
      </tr>
    </ps-table>

    {{ pageInfo }}
  </div>
</template>
<script>
import Vue from "vue";
import modal from "./modal.vue";
import PsTable from "./components/ps-table.js";
const Main = {
  data() {
    return {
      headers: [],
      pageInfo: {
        page: 0,
        pageSize: 10,
        checks: {}
      },
      datas: new Array(20)
        .join(",")
        .split(",")
        .map((n, i) => {
          return {
            id: i,
            label: i
          };
        })
    };
  },
  components: {
    PsTable
  },
  methods: {
    click(item) {
      console.log(item.id);
    }
  },
  mounted() {
    const b = async function() {
      let c = await Promise.resolve("123");
      return c;
    };
    b().then(d => {
      console.log(d);
    });
  }
};
export default Main;
</script>
<style scoped>
.box {
  display: flex;
}
</style>