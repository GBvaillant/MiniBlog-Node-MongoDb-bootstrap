// Carregando módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require("./routes/admin")
const path = require('path')
const mongoose = require('mongoose')
const session = require('express-session')
const flash = require('connect-flash')
const router = require('./routes/admin')
require("./models/Postagem")
const Postagem = mongoose.model("postagens")
require('./models/Categoria')
const Categoria = mongoose.model('categorias')



//Configs

// Sessão
app.use(session({
    secret: 'cursonode',
    resave: true,
    saveUninitialized: true,
    // cookie: { secure: true }
}))
app.use(flash())
// app.use('/admin', router)

// Middleware
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg')
    res.locals.error_msg = req.flash('error_msg')
    next()
})

// bodyparser
app.use(bodyParser.urlencoded({ extended: true }))
app.use(bodyParser.json())
//handlebars
app.engine('handlebars', handlebars.engine({
    defaultLayout: 'main'
}))
app.set('view engine', 'handlebars')
//mongoose
mongoose.Promise = global.Promise
mongoose.connect('mongodb://127.0.0.1:27017/blogapp').then(() => {
    console.log('Conectado ao mongo com sucesso !!')
}).catch((err) => {
    console.log('Erro ao conectar ' + err)
})
// public
app.use(express.static(path.join(__dirname, '/public')))
// Rotas
app.get('/', (req, res) => {

    Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render("index", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno")
        res.redirect("/404")
    })

})

app.get('/postagem/:slug', (req, res) => {
    Postagem.findOne({ slug: req.params.slug }).lean().then((postagem) => {
        if (postagem) {
            res.render('postagem/index', { postagem: postagem })
        } else {
            req.flash("error_msg", "Esta postagem não existe")
            res.redirect('/')
        }
    }).catch((err) => {
        req.flash("error_msg", "Erro interno")
        res.redirect('/')
    })
})

app.get('/404', (re, res) => {
    res.send('Erro 404!')
})

//Listar as categorias
app.get('/categorias', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("categorias/index", { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Erro interno ao listar as categorias")
    })
})

app.get('/categorias/:slug', (req, res) => {
    Categoria.findOne({ slug: req.params.slug }).lean().then((categoria) => {
        if (categoria) {
            Postagem.find({ categoria: categoria._id }).lean().then((postagens) => {

                res.render('categorias/postagens', { postagens: postagens, categoria: categoria })
            }).catch((err) => {
                req.flash('error_msg', "Houve um erro ao listar os posts")
                res.redirect('/')
            })
        } else {
            req.flash("error_msg", "esta categoria não existe")
            res.redirect("/")
        }
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro interno ao carregar a pagina")
        res.redirect('/')
        console.log(err)
    })
})

app.use('/admin', admin)

// Outros
const PORT = 8081
app.listen(PORT, () => {
    console.log('Servidor rodando...')
})
