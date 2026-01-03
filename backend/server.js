const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const Repository = require('./models/Repository');

const app = express();
const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/knowledge-stats';

app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes

// Ingest Data from CSV
app.post('/api/ingest', async (req, res) => {
    const results = [];
    // In Docker, csv is mounted at /app/repository-owners.csv, same dir as server.js
    let csvPath = path.join(__dirname, 'repository-owners.csv');

    if (!fs.existsSync(csvPath)) {
        // Fallback for local dev if run from backend dir but csv is in parent
        csvPath = path.join(__dirname, '../repository-owners.csv');
    }

    if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ error: 'CSV file not found', searchedPath: csvPath });
    }

    // Clear existing data? Or update? Let's clear for simplicity in this demo/tool.
    await Repository.deleteMany({});

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
            // Map CSV columns to Schema
            // CSV headers: 仓库链接,开启合入管控,所属业务板块,所属子板块,所属团队,领域看护人,备注,知识库
            // Note: CSV headers might be in Chinese. We need to handle that.
            // Let's debug what keys we get if needed, but assuming standard matching.

            // Helper to find key safely since encoding/spaces might be tricky
            const getValue = (row, keyPart) => {
                const key = Object.keys(row).find(k => k.includes(keyPart));
                return key ? row[key] : '';
            };

            results.push({
                url: getValue(data, '仓库链接'),
                mergeControl: getValue(data, '开启合入管控'),
                businessSegment: getValue(data, '所属业务板块'),
                subSegment: getValue(data, '所属子板块'),
                team: getValue(data, '所属团队'),
                caretaker: getValue(data, '领域看护人'),
                remark: getValue(data, '备注'),
                knowledgeBase: getValue(data, '知识库') === '1', // Convert '1' to true, '0' to false
                name: getValue(data, '仓库链接').split('/').pop() // simplistic name extraction
            });
        })
        .on('end', async () => {
            try {
                await Repository.insertMany(results, { ordered: false });
                res.json({ message: 'Data ingestion successful', count: results.length });
            } catch (error) {
                // Ignore duplicate key errors if some succeed
                if (error.code === 11000 || error.writeErrors) {
                    console.warn('Some duplicates ignored during ingestion');
                    res.json({ message: 'Data ingestion successful (with potential duplicates ignored)', count: results.length });
                } else {
                    console.error('Ingestion error', error);
                    res.status(500).json({ error: 'Failed to ingest data', details: error.message });
                }
            }
        });
});

// Get Repositories with Search
app.get('/api/repos', async (req, res) => {
    try {
        const { search, businessSegment } = req.query;
        let query = {};

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: 'i' } },
                { url: { $regex: search, $options: 'i' } },
                { caretaker: { $regex: search, $options: 'i' } }
            ];
        }

        if (businessSegment) {
            query.businessSegment = businessSegment;
        }

        const repos = await Repository.find(query);
        res.json(repos);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch repositories' });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
