#!/usr/bin/env node

/**
 * Script to generate config.js from JSON files
 * Run: node generate-config.js
 */

const fs = require('fs');
const path = require('path');

// List of JSON files to read
const jsonFiles = [
    'config.json',
    'words_random1.json',
    'synonyms_random1.json',
    'synonyms_4th_grade.json',
    'synonyms_5th_grade.json',
    'synonyms_6th_grade.json',
    'farsi_words_1.json'
];

const outputFile = 'config.js';

try {
    // Read config.json
    const configData = JSON.parse(fs.readFileSync('config.json', 'utf8'));
    
    // Read all word pool files
    const wordPools = configData.word_pools.map(poolDef => {
        const fileName = poolDef.file;
        if (fs.existsSync(fileName)) {
            const poolData = JSON.parse(fs.readFileSync(fileName, 'utf8'));
            return poolData;
        }
        return poolDef;
    });

    // Read manifest.json
    const manifestData = JSON.parse(fs.readFileSync('manifest.json', 'utf8'));

    // Create config.js content
    const configContent = `// Auto-generated configuration file - DO NOT EDIT MANUALLY
// Run: node generate-config.js to regenerate

const CONFIG_DATA = {
    config: ${JSON.stringify(configData.config, null, 2)},
    wordPools: ${JSON.stringify(wordPools, null, 2)},
    manifest: ${JSON.stringify(manifestData, null, 2)}
};

// Make it available globally
if (typeof window !== 'undefined') {
    window.CONFIG_DATA = CONFIG_DATA;
}

// Node.js export for further processing if needed
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CONFIG_DATA;
}
`;

    // Write to config.js
    fs.writeFileSync(outputFile, configContent, 'utf8');
    console.log(`✓ Successfully generated ${outputFile}`);
    console.log(`  - Config settings: ${Object.keys(configData.config).length} properties`);
    console.log(`  - Word pools: ${wordPools.length} pools`);
    console.log(`  - Manifest: included`);

} catch (error) {
    console.error('Error generating config.js:', error.message);
    process.exit(1);
}
