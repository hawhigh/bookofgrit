
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5001;

// Middleware
app.use(cors());
app.use(express.json());

// Logger
app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
    next();
});

// Database Setup
const sequelize = new Sequelize({
    dialect: 'sqlite',
    storage: './database.sqlite',
    logging: false
});

// Chapter Model
const Chapter = sequelize.define('Chapter', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false
    },
    price: {
        type: DataTypes.STRING,
        defaultValue: '$3'
    },
    borderClass: {
        type: DataTypes.STRING,
        defaultValue: 'border-primary'
    },
    colorClass: {
        type: DataTypes.STRING,
        defaultValue: 'text-primary'
    },
    glow: {
        type: DataTypes.STRING,
        defaultValue: 'glow-cyan'
    },
    img: {
        type: DataTypes.TEXT,
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT,
        defaultValue: 'CLASSIFIED_INTEL_REDACTED'
    },
    content: {
        type: DataTypes.TEXT,
        defaultValue: 'NO ONE IS COMING TO SAVE YOU. DO THE WORK.'
    }
});

// Sync Database
sequelize.sync().then(async () => {
    console.log('Database synced');

    // Seed with initial data if empty
    const count = await Chapter.count();
    if (count === 0) {
        await Chapter.bulkCreate([
            {
                id: 'CH_01',
                name: 'The Void',
                price: '$3',
                borderClass: 'border-primary',
                colorClass: 'text-primary',
                glow: 'glow-cyan',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAsY68-HDaa2jNGV0f03uraeN1eAqz_z6KJdGELGwpfgV_IyaDsmNm2pUIj2CJopuOyrHLGHBhzaFEW4bSg7IwJ-h7tCXv37K4bHeQQNu4xjbR-Z7sIK3rK5CxFi1R4dufN5xFBtACCgXrI4cTbdlMCQMU9S-bVS557EShmVJerHO1WPZR8ZJdEu9rTI-YyCwg2-jTyA3K3D-k0fp3EWETdZu_8J9UFV0AU1nD4uKrflSJ-QCIsg1NLfo7rxfr-nITIal9-FpkOniZB',
                description: 'A deep dive into the mental state required to start. When you have nothing, you have everything to gain. This chapter covers the elimination of safety nets.'
            },
            {
                id: 'CH_02',
                name: 'Pain Tolerance',
                price: '$3',
                borderClass: 'border-fire',
                colorClass: 'text-fire',
                glow: 'glow-orange',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAuh9yajP2K2UokzC7ClDOOXipnj6G6thi0OzOv94tkXWtGDVl0dEnviC-6576FdKLS31wC_yPy4-nVxK2fqIAhvbecAFRogwdBnmndq16MPdnNr5_abVr8mAfJNY9JZHqNwSr244rPrC4nMj65BOa6xQIBuDDtGkH2yCqKygfBgMDTJsIjfNAVQHU7Gh9tNg-rDao62BLMbp1JKCQsqxqcwcfGZ23gyH72_j5q9Wdnbknj01wxnD0YLK8oDr32VUBlUqCNDB_1xgY0',
                description: 'Pain is the only yardstick of progress. Understanding the difference between discomfort and damage. Learn to weaponize your struggle.'
            },
            {
                id: 'CH_03',
                name: 'Legacy War',
                price: '$3',
                borderClass: 'border-neon-magenta',
                colorClass: 'text-neon-magenta',
                glow: 'glow-magenta',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuC56kH_70TDlN9SyKgcd-f4074AztZff3B4A2Y04L_KrjaZF8QLytUNtIUD8Kg6a3WO04zeBGmLNAnw2T5tHnlrl2eTF3TzAmiimbqOAWPqYgFWtqkYuilGoC9YSeiixfAMX-L03LY1CIdwk7g_5GLKIyTi6dnsTqO1Uq9KqDKtfu8BqEAOcE66Eg4-tOz1rcDqsF197HDbUfR3v8h3TT-btXDZh8a98tx7-OzEzEReZGr40rMhqOWrQFUQE9u44NT25wi4j_CzHEYw',
                description: 'What will they say when you are gone? This chapter focuses on long-term strategy and building something that outlasts your biological existence.'
            },
            {
                id: 'CH_04',
                name: 'Final Stand',
                price: '$3',
                borderClass: 'border-zinc-500',
                colorClass: 'text-zinc-500',
                glow: 'border-white/50',
                img: 'https://lh3.googleusercontent.com/aida-public/AB6AXuAmffZph4QDexI5jYr49CCmsRxz_ynZIQPdmfDkbLEgj4y7Yi5iVymxj3UTjJp9-N6J_qM7lfY0MaExbUGpf2Y_VveR4yXRoXdmk_S6TI1Bt7y3IFPyPhulf42xH4aFv45FuijLtWH3F7vF8hnHHWYIr5jSAC-IBQVyqhpazomWHorUpw14GC2KAibvKiLoZQxghokSfOqcqvR6K4x24N-YDYp-1U-ERYvjhtf9R_7G6hwrvO_pzoefIDFMy-acsOR2puoWlGsQsxup',
                description: 'The end-game manual. When everything is on the line and exhaustion sets in. How to find the secondary fuel source within.'
            }
        ]);
    }
});

// API Routes
app.get('/api/chapters', async (req, res) => {
    try {
        const chapters = await Chapter.findAll({ order: [['id', 'ASC']] });
        res.json(chapters);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/chapters', async (req, res) => {
    try {
        const chapter = await Chapter.create(req.body);
        res.status(201).json(chapter);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.put('/api/chapters/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findByPk(req.params.id);
        if (!chapter) return res.status(404).json({ error: 'Not found' });
        await chapter.update(req.body);
        res.json(chapter);
    } catch (err) {
        res.status(400).json({ error: err.message });
    }
});

app.delete('/api/chapters/:id', async (req, res) => {
    try {
        const chapter = await Chapter.findByPk(req.params.id);
        if (!chapter) return res.status(404).json({ error: 'Not found' });
        await chapter.destroy();
        res.status(204).send();
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on port ${PORT} (Bound to 0.0.0.0)`);
});
