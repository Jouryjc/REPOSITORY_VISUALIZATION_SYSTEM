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
    const yaml = require('js-yaml');

    // In Docker, csv is mounted at /app/repository-owners.csv
    let csvPath = path.join(__dirname, 'repository-owners.csv');
    let yamlPath = path.join(__dirname, '../knowledge_profiles.yaml'); // Relative to backend dir?

    // Handle Docker paths vs Local paths
    if (!fs.existsSync(csvPath)) {
        csvPath = path.join(__dirname, '../repository-owners.csv');
    }

    // Check for profiles yaml
    if (!fs.existsSync(yamlPath)) {
        let altPath = path.join(__dirname, 'knowledge_profiles.yaml');
        if (fs.existsSync(altPath)) yamlPath = altPath;
    }

    // Normalization helper
    const normalizeRepoUrl = (url) => {
        if (!url) return '';
        let clean = url.trim();
        // Remove protocol/domain prefix (http://.../ or git@...:)
        // Regex: start with http/https -> slash, or start with git@ -> colon
        clean = clean.replace(/^(https?:\/\/[^\/]+\/|git@[^:]+:)/, '');
        // Remove .git suffix
        clean = clean.replace(/\.git$/, '');
        return clean;
    };

    let profiledRepos = new Set();
    if (fs.existsSync(yamlPath)) {
        try {
            const doc = yaml.load(fs.readFileSync(yamlPath, 'utf8'));
            let items = [];
            if (doc.profiles) {
                items = Object.values(doc.profiles);
            } else {
                items = Object.values(doc);
            }

            items.forEach((item) => {
                if (item.knowledge && Array.isArray(item.knowledge)) {
                    item.knowledge.forEach(k => {
                        if (k.repo) {
                            const normalized = normalizeRepoUrl(k.repo);
                            if (normalized) {
                                profiledRepos.add(normalized);
                                const parts = normalized.split('/');
                                if (parts.length >= 2) {
                                    profiledRepos.add(`${parts[parts.length - 2]}/${parts[parts.length - 1]}`);
                                }
                            }
                        }
                    });
                }
            });
            console.log(`Loaded ${profiledRepos.size} profiled entries from YAML`);
        } catch (e) {
            console.error("Failed to parse knowledge_profiles.yaml", e);
        }
    } else {
        console.warn("knowledge_profiles.yaml not found at", yamlPath);
    }

    if (!fs.existsSync(csvPath)) {
        return res.status(404).json({ error: 'CSV file not found', searchedPath: csvPath });
    }

    await Repository.deleteMany({});

    fs.createReadStream(csvPath)
        .pipe(csv())
        .on('data', (data) => {
            const getValue = (row, keyPart) => {
                const key = Object.keys(row).find(k => k.includes(keyPart));
                return key ? row[key] : '';
            };

            const url = getValue(data, '仓库链接');
            const kbVal = getValue(data, '知识库');
            const isKb = kbVal === '1';

            let hasProfile = false;

            if (url) {
                const normalized = normalizeRepoUrl(url);
                const shortMatch = normalized.split('/').slice(-2).join('/');

                if (profiledRepos.has(normalized) || profiledRepos.has(shortMatch)) {
                    hasProfile = true;
                }
            }

            results.push({
                url: url,
                mergeControl: getValue(data, '开启合入管控'),
                businessSegment: getValue(data, '所属业务板块'),
                subSegment: getValue(data, '所属子板块'),
                team: getValue(data, '所属团队'),
                caretaker: getValue(data, '领域看护人'),
                remark: getValue(data, '备注'),
                knowledgeBase: isKb,
                hasProfile: hasProfile,
                name: url.split('/').pop()
            });
        })
        .on('end', async () => {
            const kbCount = results.filter(r => r.knowledgeBase).length;
            const withProfileCount = results.filter(r => r.knowledgeBase && r.hasProfile).length;
            console.log(`Ingested ${results.length} repos. KBs: ${kbCount}, With Profile: ${withProfileCount}`);

            try {
                await Repository.insertMany(results, { ordered: false });
                res.json({ message: 'Data ingestion successful', count: results.length, stats: { kbCount, withProfileCount } });
            } catch (error) {
                if (error.code === 11000 || error.writeErrors) {
                    console.warn('Some duplicates ignored during ingestion');
                    res.json({ message: 'Data ingestion successful (with duplicates)', count: results.length, stats: { kbCount, withProfileCount } });
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
