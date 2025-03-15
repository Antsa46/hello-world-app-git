const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;

app.use("/photos", express.static("photos"));
app.use(express.static("public"));

async function getMoonDistance() {
    try {
        const today = new Date();
        const tomorrow = new Date();
        tomorrow.setDate(today.getDate() + 1);

        const startDate = today.toISOString().split("T")[0]; 
        const stopDate = tomorrow.toISOString().split("T")[0]; 

        console.log(`Haetaan NASA API:sta aikavälille: ${startDate} - ${stopDate}`);

        const response = await axios.get("https://ssd.jpl.nasa.gov/api/horizons.api", {
            params: {
                format: "text",
                COMMAND: "301",
                OBJ_DATA: "NO",
                MAKE_EPHEM: "YES",
                EPHEM_TYPE: "VECTORS",
                CENTER: "500@399",
                START_TIME: startDate,
                STOP_TIME: stopDate,
                STEP_SIZE: "1d",
                VEC_TABLE: "2",
            }
        });

        console.log("NASA API Response:\n", response.data);

        // Etsitään X, Y ja Z koordinaatit Regexillä
        const match = response.data.match(/X\s*=\s*([\d\-.E+]+)\s*Y\s*=\s*([\d\-.E+]+)\s*Z\s*=\s*([\d\-.E+]+)/);
        
        if (!match) {
            console.log("Ei löytynyt koordinaatteja!");
            return "Ei tietoa";
        }

        // Muunnetaan koordinaatit numeroiksi
        const x = parseFloat(match[1]);
        const y = parseFloat(match[2]);
        const z = parseFloat(match[3]);

        // Lasketaan Kuun etäisyys Pythagoraan lauseella
        const distance = Math.sqrt(x ** 2 + y ** 2 + z ** 2).toFixed(2);

        console.log(`Laskettu Kuun etäisyys Maasta: ${distance} km`);
        return distance;

    } catch (error) {
        console.error("Virhe haettaessa Kuun etäisyyttä:", error);
        return "Tietoa ei saatavilla";
    }
}



async function getWorldPopulation() {
    try {
        const response = await axios.get("https://d6wn6bmjj722w.population.io/1.0/population/World/today-and-tomorrow/");
        console.log("API-vastaus:", response.data);

        const population = response.data.total_population[0].population;
        const date = response.data.total_population[0].date;

        return { population, date };
    } catch (error) {
        console.error("Virhe haettaessa väkilukua:", error);
        return { population: "Tietoa ei saatavilla", date: "Ei päivämäärää" };
    }
}

app.get("/", async (req, res) => {
    try {
        const { population, date } = await getWorldPopulation();
        const moonDistance = await getMoonDistance(); // 🔹 Haetaan Kuun etäisyys

        res.send(`
        <!DOCTYPE html>
        <html lang="fi">
        <head>
            <meta charset="UTF-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>Maapallon väkiluku</title>
            <link rel="stylesheet" href="/styles.css">
        </head>
        <body>
            <div class="container">
                <h1>Hello World!</h1>
                <h2>Maapallon väkiluku on tänään:</h2>
                <p><strong>Päivämäärä:</strong> ${date}</p>
                <p><strong>Väkiluku:</strong> ${population}</p>
                <p><strong>Kuun etäisyys Maasta:</strong> ${moonDistance} km</p>
                <img src="/photos/kuu.jpg" alt="Kuu">
            </div>
        </body>
        </html>
        `);
    } catch (error) {
        console.error("Virhe käsiteltäessä pyyntöä:", error);
        res.status(500).send("Jokin meni pieleen!");
    }
});

app.listen(PORT, () => {
    console.log(`Palvelin käynnistetty portissa ${PORT}`);
});
