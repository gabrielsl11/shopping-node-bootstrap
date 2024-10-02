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
app.engine('handlebars', engine({defaultLayout: 'main'}))
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

app.get('/:situation', (req, res) => {
    let sql = 'SELECT * FROM products ORDER BY id DESC;'
    conn.query(sql, (err, ok) => {
        res.render('home', { products: ok, situation: req.params.situation })
    })
})

app.post('/register', (req, res) => {
    // console.log(req.body)
    // console.log(req.files.image.name)
    // res.end()
    try {
        let name = req.body.name
        let price = req.body.price
        let image = req.files.image.name

        if (name == '' || price == '' || isNaN(price)) {
            res.redirect('/registerError')
        } else {
            let sql = `INSERT INTO products (name, price, image) VALUES ('${name}', '${price}', '${image}');`

            conn.query(sql, (err, ok) => {
                if (err) {
                    throw err
                } else {
                    req.files.image.mv(__dirname + '/images/' + req.files.image.name)
                    console.log(ok)
                }
            })

            res.redirect('/registerOk')
        }
    } catch (err) {
        res.redirect('/registerError')
    }
})

app.get('/delete/:id&:image', (req, res) => {
    try {
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

        res.redirect('/deleteOk')
    } catch (err) {
        res.redirect('/deleteError')
    }
})

app.get('/updating/:id', (req, res) => {
    // console.log(req.params.id)
    // res.end()
    let sql = `SELECT * FROM products WHERE id = ${req.params.id}`
    conn.query(sql, (err, ok) => {
        if (err) {
            throw err
        } else {
            res.render('updating', { product: ok[0] })
        }
    })
})

app.post('/update', (req, res) => {
    let id = req.body.id
    let name = req.body.name
    let price = req.body.price
    let imageName = req.body.imageName

    if (name == 0 || price == 0 || isNaN(price)) {
        res.redirect('updateError')
    } else {
        try {
            // let image = req.files.image.name
            // res.send('Image will be updated!')
            let image = req.files.image
            let sql = `UPDATE products SET name = '${name}', price = '${price}', image = '${image.name}' WHERE id = ${id}`
            conn.query(sql, (err, ok) => {
                if (err) throw err

                fs.unlink(__dirname + '/images/' + imageName, (err_img) => {
                    console.log('Image was not removed!')
                })

                image.mv(__dirname + '/images/' + image.name)
            })
        } catch (err) {
            // res.send('Image will not be updated!')
            let sql = `UPDATE products SET name = '${name}', price = '${price}' WHERE id = ${id}`

            conn.query(sql, (err, ok) => {
                if (err) {
                    throw err
                }
            })
        }

        res.redirect('/updateOk')
    }
})

//////////////
// Servidor //
//////////////

const port = 8080
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})