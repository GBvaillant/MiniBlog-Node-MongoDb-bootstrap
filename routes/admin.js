const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require("../models/Categoria")
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')


router.get('/', (req, res) => {
    res.render('./admin/index')
})

router.get('/posts', (req, res) => {
    res.send('Pagina de posts')
})

router.get('/categorias', (req, res) => {
    Categoria.find().lean().sort({ date: 'desc' }).then((categorias) => {
        res.render('./admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar as categorias")
        res.redirect("/admin")
    })

})

router.get('/categorias/add', (req, res) => {
    res.render('./admin/addcategorias')
})

//ADD categorias + validações 
router.post('/categorias/nova', (req, res) => {
    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome invalido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    if (erros.length > 0) {
        res.render('admin/addcategorias', { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash('success_msg', 'Categoria criada com sucesso')
            res.redirect("/admin/categorias")
        }).catch((err) => {
            req.flash('error_msg', 'Houve um erro ao salvar a categoria')
            res.redirect("/admin")
        })
    }

})

router.get('/categorias/edit/:id', (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        res.redirect('/admin/categorias')
    })

})

//Editar categoria
router.post('/categorias/edit', (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao editar")
            res.redirect('/admin/categorias')
            //console.log(err)
        })


    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao editar categorias")
        res.redirect("/admin/categorias")
    })
})

router.post('/categorias/deletar', (req, res) => {
    Categoria.deleteOne({ _id: req.body.id }).then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect('/admin/categorias')
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar categoria")
        res.redirect('/admin/categorias')
    })
})

router.get("/postagens", (req, res) => {
    Postagem.find().lean().populate("categoria").sort({ data: "desc" }).then((postagens) => {
        res.render('./admin/postagens', { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar postagens")
        res.redirect('/admin')
    })

})

router.get('/postagens/add', (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('./admin/addpostagem', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao carregar")
        res.redirect('/admin')
    })

})

//Add postagem + validação básica
router.post('/postagens/nova', (req, res) => {

    var erros = []

    if (req.body.categoria == '0') {
        erros.push({ texto: "Categoria inválida" })
    }
    if (erros.length > 0) {
        res.render('admin/addpostagem', { erros: erros })
    } else {
        const novaPostagem = {
            titulo: req.body.titulo,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria,
            slug: req.body.slug
        }

        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg", "Postagem criada com sucesso")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao criar a postagem")
            res.redirect('/admin/postagens')
            console.log(err)
        })
    }
})

router.get('/postagens/edit/:id', (req, res) => {
    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {

        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagens', { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect('/admin/postagens')
        })

    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar a lista")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagem/edit", (req, res) => {

    Postagem.findOne({ _id: req.body.id }).then((postagem) => {

        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Erro ao salvar edição")
        res.redirect("/admin/postagens")
    })
})

router.get('/postagens/deletar/:id', (req, res) => {
    Postagem.deleteOne({ _id: req.params.id }).then(() => {
        req.flash("success_msg", "Postagem deletada com sucesso")
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash("error_msg", "Erro ao deletar postagem")
        res.redirect('/admin/postagens')
    })
})
module.exports = router 