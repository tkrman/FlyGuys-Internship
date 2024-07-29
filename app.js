const express = require('express');
const path = require('path');
const fs = require('fs');
const yaml = require('yaml');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const os = require('os');

// Initialize Express app
const app = express();
console.log("app: " + app);

const originalFilePath = path.join(__dirname, 'dashboards.yaml');
const writableDir = path.join(os.homedir(), 'SisenseDashboards');
const writableFilePath = path.join(writableDir, 'dashboards.yaml');

console.log(originalFilePath);

console.log(writableDir);

if (!fs.existsSync(writableDir)) {
    fs.mkdirSync(writableDir);
}

if (!fs.existsSync(writableFilePath)) {
    fs.copyFileSync(originalFilePath, writableFilePath);
}

console.log(writableFilePath);

// Middleware setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Serve the HTML files
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Load YAML file
function loadYaml() {
    try {
        console.log("Back-End: loadYaml() called!");
        console.log("Does fs.existsSync(" + writableFilePath + ")? " + fs.existsSync(writableFilePath));
        if (!fs.existsSync(writableFilePath)) {
            return {};
        }
        const file = fs.readFileSync(writableFilePath, 'utf8');
        console.log("Sending yaml data!");
        return yaml.parse(file);
    } catch (error) {
        console.error("Back-End: Error loading YAML file:", error);
        return {};
    }
}

// Save YAML file
function saveYaml(data) {
    try {
        const yamlData = yaml.stringify(data);
        fs.writeFileSync(writableFilePath, yamlData, 'utf8');
        console.log("fs.writeFileSync() called!");
        console.log(writableFilePath + ", " + yamlData);
    } catch (error) {
        console.error("Back-End: Error saving YAML file:", error);
    }
}

// Endpoint to get links and refresh time
app.get('/data/:section', (req, res) => {
    try {
        const section = req.params.section;
        const data = loadYaml();
        res.json(data[section] || { refresh: 60000, links: [] });
        console.log("Back-End: Links received from loadYaml()!");
    } catch (error) {
        console.error("Back-End: Error processing GET request:", error);
        res.sendStatus(500);
    }
});

// Endpoint to add a link
app.post('/data/:section', (req, res) => {
    try {
        const section = req.params.section;
        const url = req.body.url;

        console.log(`Back-End: Received request to add link to section: ${section}, url: ${url}`);

        const data = loadYaml();

        if (!data[section]) {
            data[section] = { refresh: 60000, links: [] };
        }

        if (url) {
            data[section].links.push({ url });
        }

        saveYaml(data);
        console.log("Link successfully added!");
        res.sendStatus(200);
    } catch (error) {
        console.error("Back-End: Error processing POST request:", error);
        res.sendStatus(500);
    }
});

// Endpoint to delete a link
app.delete('/data/:section', (req, res) => {
    try {
        const section = req.params.section;
        const index = req.body.index;

        console.log(`Back-End: Received request to delete link from section: ${section}, index: ${index}`);

        const data = loadYaml();
        console.log("loadYaml() called!");

        if (!data[section]) {
            data[section] = { refresh: 60000, links: [] };
        }

        if (index >= 0) {
            data[section].links.splice(index, 1);
        }

        saveYaml(data);
        console.log("Link successfully deleted!");
        res.sendStatus(200);
    } catch (error) {
        console.error("Back-End: Error processing DELETE request:", error);
        res.sendStatus(500);
    }
});

// Error handling
app.use((req, res, next) => {
    const err = new Error(`The requested URL ${req.originalUrl} was not found on this server.`);
    err.status = 404;
    next(err);
});

app.use((err, req, res, next) => {
    res.status(err.status || 500);
    res.json({
        message: err.message,
        error: err
    });
});

// Start the server
const PORT = process.env.PORT || 1337;
app.listen(PORT, () => {
    console.log(`Back-End: Server is running on port ${PORT}`);
});
