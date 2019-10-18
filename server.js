let express = require("express")
let app = express()
let multer = require("multer")
let upload = multer()
let cookieParser = require('cookie-parser')
app.use(cookieParser());
let threads = []
let passwordsAccoc = {}
let sessions = {}
let h = (element, children) => {
    return '<' + element +'>' + children.join('\n') + '</' + element.split(' ').shift() + '>' 
}
let makePage = (curuser) => {
    let threadElements = threads.map(post => {
        return '<div><h2>' + post.desc + '</h2><h4>' + post.user + '</h4></div>'
    })

    console.log(threads)
    console.log(curuser)
    return h('html',[
            h('body',[ 
                h('div', [curuser]),
                h('div', threadElements),
                h('form action="/thread" method="POST" enctype="multipart/form-data"', [
                    h('input type="text" name= "description"', [] ), 
                    h('input type="submit"', [])])])])
}
app.post("/thread", upload.none(), (req, res) => {
    console.log("creating a new thread", req.body)
    let sessionId = req.cookies.sid
    let username = sessions[sessionId]
    if (username !== undefined) {
        threads.push({
            user: username,
            desc: req.body.description
        })
        
    }
    res.send(makePage(username))
    
})
app.post("/login", upload.none(), (req,res) => {
    console.log("request to /login", req.body)
    if (passwordsAccoc[req.body.username] !== req.body.password)  {
        res.send("<html><body> invalid username or passwor </body></html>")
        return
    }
    let sessionId = '' + Math.floor(Math.random()* 1000000)
    sessions[sessionId] = req.body.username
    res.cookie('sid',sessionId);
    res.send(makePage(sessions[sessionId]))
})
app.post("/signup", upload.none(), (req,res) => {
    console.log("request to /signup", req.body)
    let username = req.body.username
    // check if the username taken is just to check if the username in the passwordAccoc is undefined or not
    if (passwordsAccoc[username] !== undefined) {
        return res.send('<html><body> Username taken </body></html>');
      }
    passwordsAccoc[req.body.username] = req.body.password
    res.send("<html><body> signup successful </body></html>")
})
app.get("/", (req,res) => {    
    console.log("end point '/'")
    let sessionId = req.cookies.sid
    let username = sessions[sessionId]
    if (username !== undefined)     
    {
        res.send(makePage(username))
    }        
    else
    {
       res.sendFile(__dirname + "/public/index.html") 
    } 

})
app.listen(4000, () => {
    console.log("server started")
})