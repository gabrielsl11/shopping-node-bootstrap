////////////////////////////
// Importação dos módulos //
////////////////////////////

const { engine } = require('express-handlebars')
const fileUpload = require('express-fileupload')
const express = require('express')
const mysql = require('mysql2')
// const path = require('path')
const fs = require('fs')
const app = express()

///////////////////
// Configurações //
///////////////////

// Conexão com o banco de dados
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'shopping'
})

// Verificação de conexão
conn.connect((err) => {
    if (err) {
        throw err
    } else {
        console.log('Succesfully connected!')
    }
})

// Configuração do Handlebars
app.engine('handlebars', engine({ defaultLayout: 'main' }))
app.set('view engine', 'handlebars')
app.set('views', './views')

// Manipulação de requisições (Middleware)
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Configuração para arquivos estáticos
app.use(express.static('public'))

// Referenciando o diretório de imagens
app.use('/images', express.static('./images'))
// Habilitando o upload de arquivos
app.use(fileUpload())

///////////
// Rotas //
///////////

app.get('/', (req, res) => {
    let sql = 'SELECT * FROM products ORDER BY id DESC;'
    conn.query(sql, (err, ok) => {
        res.render('home', { products: ok })
    })

})

app.post('/register', (req, res) => {
    // console.log(req.body)
    // console.log(req.files.image.name)
    // res.end()
    let name = req.body.name
    let price = req.body.price
    let image = req.files.image.name

    let sql = `INSERT INTO products (name, price, image) VALUES ('${name}', '${price}', '${image}');`

    // Somente o 'conn.query(sql)' funcionaria para inserção de novos registros.
    conn.query(sql, (err, ok) => {
        if (err) {
            throw err
        } else {
            req.files.image.mv(__dirname + '/images/' + req.files.image.name)
            console.log(ok)
        }
    })

    res.redirect('/')
})

app.get('/delete/:id&:image', (req, res) => {
    // console.log(req.params.id)
    // console.log(req.params.image)
    // res.end()
    let sql = `DELETE FROM products WHERE id = ${req.params.id}`
    conn.query(sql, (err, ok) => {
        if (err) {
            throw err
        } else {
            fs.unlink(__dirname + '/images/' + req.params.image, (err_img) => {
                console.log('Could not remove image!')
            })
        }
    })

    res.redirect('/')
})

//////////////
// Servidor //
//////////////

const port = 8080
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})