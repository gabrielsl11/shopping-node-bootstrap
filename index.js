////////////////////////////
// Importação dos módulos //
////////////////////////////

const { engine } = require('express-handlebars')
const express = require('express')
const mysql = require('mysql2')
const app = express()

///////////////////
// Configurações //
///////////////////

// Conexão com o banco de dados
const conn = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '1234',
    database: 'dbexample'
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

// Configuração do Middleware para análise de requisições
app.use(express.urlencoded({ extended: false }))
app.use(express.json())

// Configuração para arquivos estáticos
app.use(express.static('public'))

///////////
// Rotas //
///////////

app.get('/', (req, res) => {
    res.render('home')
})

//////////////
// Servidor //
//////////////

const port = 8080
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`)
})