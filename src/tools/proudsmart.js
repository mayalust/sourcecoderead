import Vue from "vue";
class Modal {
    constructor(modal) {
        this.dom = document.createElement("app-modal");
        document.body.appendChild(this.dom);
        modal.el = this.dom;
        new Vue(modal);
    }
    submit() {
        this.dom.remove()
    }
    cancel() {
        this.dom.remove()
    }
}
class ProudSmart {
    post(url, p) {
        return new Promise((res, rej) => {
            const xhr = new XMLHttpRequest,
                baseUrl = ["api", "rest", "post"],
                param = typeof p == "object" ? p : [p],
                paths = baseUrl.concat(url.split(/[.\\\/]/));
            xhr.open("POST", `/${paths.join("/")}`);
            xhr.send(JSON.stringify(param));
            xhr.onreadystatechange = e => {
                if (xhr.readyState == 4) {
                    let json = JSON.parse(xhr.responseText);
                    if (xhr.status >= 200 && xhr.status < 300) {
                        if (json.code == 0) {
                            return res(json.data);
                        }
                    }
                    return rej(json);
                }
            }
            xhr.onerror = e => {
                rej(e);
            }
        })
    }
    login(username, pw) {
        return this.post("userLoginUIService.login", [username, pw])
    }
    modal(modal) {
        return new Modal(modal);
    }
}
const install = Vue => {
    Vue.mixin({
        beforeCreate: psInit
    })
}

function psInit() {
    var options = this.$options;
    if (options.ps) {
        this.$ps = typeof options.ps === 'function' ?
            options.ps() :
            options.ps;
    } else if (options.parent && options.parent.$ps) {
        this.$ps = options.parent.$ps;
    }
}
export default {
    install: install,
    ProudSmart: ProudSmart,
    version: "1.0.0"
}