const express = require("express");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;


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
    const { population, date } = await getWorldPopulation();
    res.send(`
        <h1>Hello World!</h1>
        <h1>Maapallon väkiluku on</h1>
        <p><strong>Päivämäärä:</strong> ${date}</p>
        <p><strong>Väkiluku:</strong> ${population}</p>
    `);
});

app.listen(PORT, () => {
    console.log(`Palvelin käynnistetty portissa ${PORT}`);
});
