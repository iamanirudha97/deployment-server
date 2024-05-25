const express = require("express");
const httpProxy =require('http-proxy')

const app = express();
const PORT = 8000;

const base_Url = `https://vercel-clone-project-output.s3.us-east-2.amazonaws.com/__outputs`
const proxy = httpProxy.createProxy();

app.use((req, res) => {
    const hostname = req.hostname;
    const subdomain = hostname.split('.')[0];
    console.log(subdomain);

    const resolvesTo = `${base_Url}/${subdomain}`

    return proxy.web(req, res, {target: resolvesTo, changeOrigin: true });
})

proxy.on('proxyReq', (proxyReq, req, res) => {
    const url = req.url;
    if(url === '/'){
        proxyReq.path += 'index.html'
    }
    return proxyReq
})

app.listen(PORT, ()=> {
    console.log(`REVERSE PROXY SERVER RUNNING ON ${PORT}`);
})
