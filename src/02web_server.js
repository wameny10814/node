const http =require('http')
const fs =require('fs')

const server =http.createServer((req, res)=>{
    res.writeHead(200,{
        'Content-Type':'text/html'
    });
    res.end(`<h2>hola</h2><p>${req.url}</p>`);
});

server.listen(3000);