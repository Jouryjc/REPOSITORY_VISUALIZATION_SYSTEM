const mongoose = require('mongoose');

const repositorySchema = new mongoose.Schema({
    url: { type: String, required: true, unique: true },
    name: { type: String }, // Extracted from URL if needed, or just part of display
    mergeControl: { type: String }, // 开启合入管控
    businessSegment: { type: String }, // 所属业务板块
    subSegment: { type: String }, // 所属子板块
    team: { type: String }, // 所属团队
    caretaker: { type: String }, // 领域看护人 (can be split later if needed)
    remark: { type: String }, // 备注
    knowledgeBase: { type: Boolean, default: false }, // 知识库 (0 or 1 in CSV)
    description: { type: String }, // Optional
    // 3D Layout coordinates (calculated later)
    position: {
        x: { type: Number },
        y: { type: Number },
        z: { type: Number }
    }
});

module.exports = mongoose.model('Repository', repositorySchema);
