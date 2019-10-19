let express = require("express")
let app = express()
let multer = require("multer")
let upload = multer({ 
    dest: __dirname + '/uploads/' 
  }) 
let cookieParser = require('cookie-parser')
app.use(cookieParser());
app.use('/images', express.static(__dirname + '/uploads')) 
let threads = []
let passwordsAccoc = {}
let sessions = {}
let users = {}


let h = (element, children) => {
    return '<' + element +'>' + children.join('\n') + '</' + element.split(' ').shift() + '>' 
}
let makePage = (curuser,recipient) => {
    let threadElements = threads.map(post => {
        // return '<div><h2>' + post.desc + '</h2><h4>' + post.user + '</h4></div>'
        let currPosername = post.user.username;
        let threadCounts = threads.filter(post=> {return post.user.username === currPosername}).length
        // return h('div', [ 
        //     h('h2', [post.desc]),
        //     h('h4', [post.user.username + " " + threadCounts]),
        //     h('img src="' + post.path + '" height="100px"', [])]) 
        return `<div><h2>${post.desc}</h2><img src="${post.path}" height="100px"/><h4><span style="color:${post.user.color};">${post.user.username}</span> - ${threadCounts}</h4></div>`;
    });

    const messageElements = users[curuser].messages.map((message) => {
        return `<div><h2>${message.content}</h2><h4><span>${message.username}</span></h4></div>`;
    });

    console.log(threads)
    console.log(curuser)
    return h('html',[
            h('body',[ 
                h('div', [curuser]),
                h('div', threadElements),
                h('form action="/thread" method="POST" enctype="multipart/form-data"', [
                    h('input type="file" name="funny-image"', []),
                    h('input type="text" name= "description"', [] ), 
                    h('input type="submit"', []),
                ]),
                h('h3', ['Change username']),
                h('form action="/set/name" method="POST" enctype="multipart/form-data"', [
                        h('input type="text" name= "newname"', [] ), 
                        h('input type="submit"', []),
                    ]),    
                h('h3', ['Change username color']),
                h('form action="/set/color" method="POST" enctype="multipart/form-data"', [
                            h('input type="text" name= "color"', [] ), 
                            h('input type="submit"', [])
                        ]),
                h('h3', ['Send message']),
                h('form action="/send-message" method="POST" enctype="multipart/form-data"', [
                    h(`input type="text" name= "recipient" value="${recipient || ''}"`, [] ),        
                    h('input type="text" name= "message"', [] ), 
                    h('input type="submit"', [])
                    ]),
                h('div', messageElements),                
                ])
            ]
            )
}

app.post("/send-message", upload.none(), (req,res) => {
    const sessionId = req.cookies.sid;
    const user = sessions[sessionId];
    const recipient = req.body.recipient;
    users[recipient].messages.push({
        content: req.body.message,
        username: user.username,
    });
    res.send(makePage(user.username, req.body.recipient));
})
app.post("/set/name", upload.none(), (req, res) => {
    const sessionId = req.cookies.sid;
    const user = sessions[sessionId];
    const newUsername = req.body.newname;
    users[newUsername] = user;
    delete users[user.username];
    user.username = newUsername;
    res.send(makePage(user.username));

})

app.post("/set/color", upload.none(), (req, res) => {
    const sessionId = req.cookies.sid;
    const user = sessions[sessionId];
    user.color = req.body.color;

    res.send(makePage(user.username));   

})


app.post("/thread", upload.single('funny-image'), (req, res) => {
    console.log("creating a new thread", req.body)
    let sessionId = req.cookies.sid
    let user = sessions[sessionId]
    let file = req.file
    let frontendPath = (file === undefined) ? undefined : '/images/' + file.filename 

    if (user.username === undefined) {
        return res.sendFile(__dirname + "/public/index.html") 
    }

    threads.push({
            user: user,
            desc: req.body.description,
            path: frontendPath
        })        
    
    res.send(makePage(user.username))
})
app.post("/login", upload.none(), (req,res) => {
    console.log("request to /login", req.body)
    if (passwordsAccoc[req.body.username] !== req.body.password)  {
        res.send("<html><body> invalid username or passwor </body></html>")
        return
    }
    let sessionId = '' + Math.floor(Math.random()* 1000000)
    sessions[sessionId] = users[req.body.username];

    res.cookie('sid',sessionId);
    res.send(makePage(req.body.username))
})
app.post("/signup", upload.none(), (req,res) => {
    console.log("request to /signup", req.body)
    let username = req.body.username
    // check if the username taken is just to check if the username in the passwordAccoc is undefined or not
    if (passwordsAccoc[username] !== undefined) {
        return res.send('<html><body> Username taken </body></html>');
      }
    passwordsAccoc[req.body.username] = req.body.password
    users[username] = {
        username: username,
        color: 'black',
        messages: [],
        };
    res.send("<html><body> signup successful </body></html>")
})
app.get("/", (req,res) => {    
    console.log("end point '/'")
    let sessionId = req.cookies.sid
    let user = sessions[sessionId]
    if (user !== undefined)    // if(!username) 
    {
        res.send(makePage(user.username))
    }        
    else
    {
       res.sendFile(__dirname + "/public/index.html") 
    } 

})
app.listen(4000, () => {
    console.log("server started")
})