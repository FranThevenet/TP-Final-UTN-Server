import express from "express"
import mysql from "mysql2"
import cors from "cors"
import dotenv from "dotenv"


const app = express()

dotenv.config()

app.use(cors({ origin: "*" }))

app.use(express.json())


//Database Connection
const database = mysql.createConnection({
    host: process.env.DATABASE_HOST,
    port: process.env.DATABASE_PORT,
    database: process.env.DATABASE_NAME,
    password: process.env.DATABASE_PASSWORD,
    user: process.env.DATABASE_USER
})


//Routes
app.get("/usuarios", (req, res) => {

    database.query("SELECT * FROM usuarios", (error, datos) => {

        if(error) return res.status(500).send(error)

        res.status(200).json(datos)
    })
})


app.post("/registrar", (req, res) => {
    const { username, email, fullname, password } = req.body

    database.query("INSERT INTO usuarios (username, email, fullname, password) VALUES (?, ?, ?, ?)",
        [username, email, fullname, password],
        (error, resultado) => {
            if(error) return res.status(500).send(error)

            res.status(201).json(resultado)
        }
    )
})


app.post("/iniciar-sesion", (req, res) => {
    const { identifier, password } = req.body

    const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/g


    function passwordIsValid(passwordFromClient, passwordFromDB) {
        return passwordFromClient === passwordFromDB
    }


    if(emailRegex.test(identifier)) {
        
        database.query("SELECT * FROM usuarios WHERE email = ?",
            [identifier],
            (error, datos) => {
                if(error) return res.status(400).json(error)

                const usuario = {...datos[0]}

                if(passwordIsValid(password, usuario.password)) {
                    res.status(200).json(usuario)
                } else {
                    res.status(400).json({ message: "Contrasena incorrecta!" })
                }
            }
        )

    } else {
        
        database.query("SELECT * FROM usuarios WHERE username = ?",
            [identifier],
            (error, datos) => {
                if(error) return res.status(400).json(error)

                const usuario = {...datos[0]}

                if(passwordIsValid(password, usuario.password)) {
                    res.status(200).json(usuario)
                } else {
                    res.status(400).json({ message: "Contrasena incorrecta!" })
                }

                
            }
        )

    }


})



app.listen(3000, () => {
    console.log("Sistema levantado en puerto 3000")
})

