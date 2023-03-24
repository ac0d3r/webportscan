function Scanner(host = "127.0.0.1", limit = 10) {
    this.host = host;
    this.limit = limit;
    this.ports = [];

    this.probe = (port) => {
        return fetch(`http://${this.host}:${port}`, {
            method: 'HEAD',
            mode: 'no-cors',
        }).then(resp => {
            this.ports.push(port);
        }).catch(e => {
            const err = e.message;
            if (err.includes("exceeded while awaiting") ||
                err.includes("ssl") ||
                err.includes("cors") ||
                err.includes("invalid") ||
                err.includes("protocol")) this.ports.push(port);;
            try {/*do nothing*/ } catch (e) { }
        });
    };
    this.scan = async (start, end) => {
        const resultList = [];
        const executing = [];
        for (let port = start; port < end; port++) {
            const p = this.probe(port);
            resultList.push(p);
            if (this.limit <= end) {
                const e = p.then(() => {
                    return executing.splice(executing.indexOf(e), 1);
                });
                executing.push(e);
                if (executing.length >= this.limit) {
                    await Promise.race(executing);
                }
            }
        }
        return Promise.all(resultList);
    }
}
s = new Scanner();
s.scan(8000, 8100).then(() => {
    s.ports.forEach(item => {
        console.log("Opened Port:", item);
    });
});



function Fuzzer(addrs, limit = 10) {
    this.addrs = addrs;
    this.limit = limit;
    this.reports = [];

    this.probe = (addr) => {
        const url = `http://${addr}`;
        return fetch(url, {
            method: 'Get',
        }).then(resp => {
            this.reports.push({ status: resp.status, url: url });
        }).catch(e => {
            try {/*do nothing*/ } catch (e) { }
        });
    };
    this.scan = async () => {
        const resultList = [];
        const executing = [];

        for (const addr of this.addrs) {
            const p = this.probe(addr);
            resultList.push(p);
            if (this.limit <= this.addrs.length) {
                const e = p.then(() => {
                    return executing.splice(executing.indexOf(e), 1);
                });
                executing.push(e);
                if (executing.length >= this.limit) {
                    await Promise.race(executing);
                }
            }
        }
        return Promise.all(resultList);
    }
}

f = new Fuzzer([
    "127.0.0.1:80",
    "127.0.0.1:5000",
    "127.0.0.1:7000",
    "127.0.0.1:7890",
    "127.0.0.1:8233",
    "127.0.0.1:8440",
    "127.0.0.1:8830",
    "127.0.0.1:8831",
    "127.0.0.1:8829",
    "127.0.0.1:61750",
]);

f.scan().then(() => {
    f.reports.forEach(item => {
        console.log("Opened Port:", item);
    });
});