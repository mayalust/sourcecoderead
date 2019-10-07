let {
    parse
} = require("url"),
    hashsum = require("hash-sum"),
    psfile = require("ps-file"),
    pathLib = require("path"),
    queryString = require("querystring"),
    http = require("http"),
    httpProxy = require("http-proxy"),
    proxy = httpProxy.createProxyServer(),
    app = express();
const obj = {
    code: 0,
    data: {
        b: 20
    },
    message: null
}
app.listen(9000);
app.static(pathLib.resolve(__dirname));
app.post("/api/rest/post/test", (req, res) => {
    res.writeHead(200, {
        "Cache-Control": "max-age=60000"
    });
    res.write(JSON.stringify(obj));
    res.end();
});
app.get("/api/rest/post/test", (req, res) => {
    res.writeHead(200, {
        "Cache-Control": "max-age=60000"
    });
    res.write(JSON.stringify(obj));
    res.end();
});

function express() {
    class Express {
        constructor() {
            this.middleWares = [];
            this.posts = [];
            this.ajax = [];
            this.app = http.createServer((req, res) => {
                const urlObj = parse(req.url),
                    extRegex = /api\/rest\/post/,
                    pathname = urlObj.pathname,
                    run = () => {
                        this.handleServerBack(req, res);
                    }
                if (extRegex.test(pathname)) {
                    return proxy.web(req, res, {
                        target: "http://36.110.36.118:11780"
                    }, run)
                }
                run();
            });
        }
        getContentType(type) {
            if (type == "js") {
                return "application/javascript;charset=utf-8";
            }
            if (type == "css") {
                return "text/css;charset=utf-8";
            }
            if (type == "html") {
                return "text/html;charset=utf-8";
            }
        }
        static(path) {
            this.static = (req, res, next) => {
                let ETag = req.headers["if-none-match"],
                    urlObj = parse(req.url),
                    extRegex = "\\.([^.]+)$",
                    pathname = urlObj.pathname,
                    match = new RegExp(extRegex).exec(pathname),
                    type = match && match[1];
                psfile(path)
                    .read(pathname)
                    .then(d => {
                        let hash = hashsum(d);
                        if (ETag == hash) {
                            res.writeHead(304, {
                                "Cache-Control": "max-age=2000000",
                                "Content-Type": this.getContentType(type)
                            });
                            return res.end();
                        }
                        res.writeHead(200, {
                            "Cache-Control": "max-age=2000000",
                            "Content-Type": this.getContentType(type),
                            ETag: hash
                        });
                        res.write(d);
                        return res.end();
                    })
                    .catch(e => {
                        next();
                    });
            };
        }
        handleServerBack(req, res) {
            let queue = [...this.middleWares, this.static, ...this.ajax],
                gen = queue.entries();

            const recursive = ({
                done,
                value
            }) => {
                if (done != true) {
                    let [index, fn] = value;
                    fn(req, res, () => {
                        recursive(gen.next());
                    });
                } else {
                    this.error(req, res);
                }
            }
            recursive(gen.next());
        }
        error(req, res) {
            res.writeHead(404, {
                "Content-Type": "text/plain;charset=utf-8"
            });
            res.write("找不到指定文件" + req.url);
            res.end();
        }
        use(fn) {
            this.middleWares.push(fn);
        }
        checkInput(pathname, urlname) {
            let parameter = {};
            pathname = pathname.split("/").filter(d => d);
            urlname = urlname.split("/").filter(d => d);
            if (pathname < urlname) {
                return;
            }

            function recursive(inx) {
                if (inx < pathname.length) {
                    let path = pathname[inx];
                    if (path[0] == ":") {
                        if (path[path.length - 1] == "?") {
                            parameter[path.slice(1, -1)] = urlname[inx];
                            return recursive(inx + 1);
                        }
                        if (urlname[inx] != null) {
                            parameter[path.slice(1)] = urlname[inx];
                            return recursive(inx + 1);
                        }
                        return;
                    }
                    if (path == urlname[inx]) {
                        return recursive(inx + 1);
                    }
                    return;
                }
                return parameter;
            }
            return recursive(0);
        }
        request(m, exp, fn) {
            this.ajax.push((req, res, next) => {
                let method = req.method.toLowerCase(),
                    urlObj = parse(req.url),
                    pathname = urlObj.pathname;
                if (method != m) {
                    return next();
                }
                let params = this.checkInput(exp, pathname);
                if (params == null) {
                    return next();
                }
                req.params = params;
                return fn(req, res);
            });
        }
        get(exp, fn) {
            this.request("get", exp, fn);
        }
        post(exp, fn) {
            this.request("post", exp, fn);
        }
        listen(port) {
            this.app.listen(port);
        }
    }
    return new Express();
}