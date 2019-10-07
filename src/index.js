import Vue from "vue";
import Vuex from "vuex";
import main from "./main.vue";
import VueRouter from "vue-router";
import elementUi from "element-ui";
//import "element-ui/lib/theme-chalk/index.css";
const {
    Store
} = Vuex, router = new VueRouter({
    routes: [{
        name: "a",
        path: "/",
        component: {
            render(h) {
                return h("el-row", {
                    attrs: {
                        id: "abc"
                    }
                }, [
                    h("el-col", {
                        props: {
                            span: 5
                        },
                        domProps: {
                            innerText: "ABCDEF"
                        }
                    }),
                    h("el-col", {
                        props: {
                            span: 19
                        },
                        domProps: {
                            innerText: "PPP"
                        }
                    })
                ]);
            }
        }
    }]
});
Vue.use(elementUi);
Vue.use(VueRouter);
Vue.use(Vuex);
let store = new Store({
    state: {
        a: 123
    },
    getters: {
        c(state) {
            let {
                a
            } = state;
            return a * 7
        }
    },
    modules: {
        test: {
            namespaced: true,
            state: {
                b: 456
            },
            getters: {
                d(state, getters, rootState, rootGetters) {
                    let {
                        b
                    } = state;
                    return b * 9;
                }
            }
        }
    },
    plugins: [
        function (store) {

        }
    ]
});
let [el] = document.getElementsByTagName("app-vue");
main.store = store;
main.router = router;
new Vue(main).$mount(el);