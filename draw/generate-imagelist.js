const fs = require('fs');
const path = require('path');

const imageDir = path.join(__dirname, 'images');
const outputFile = path.join(__dirname, 'imageList.js');

const imageDatabase = {};

try {
    // Read categories (subdirectories in the images folder)
    const categories = fs.readdirSync(imageDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory())
        .map(dirent => dirent.name);

    categories.forEach(category => {
        const categoryDir = path.join(imageDir, category);
        // Read image files in each category directory
        const imageFiles = fs.readdirSync(categoryDir)
            .filter(file => /\.(png|jpg|jpeg|gif|svg)$/i.test(file));
        
        // Store paths in the database object
        imageDatabase[category] = imageFiles.map(file => `images/${category}/${file}`);
    });

    // Create the file content
    const fileContent = `const imageDatabase = ${JSON.stringify(imageDatabase, null, 4)};`;

    // Write the content to imageList.js
    fs.writeFileSync(outputFile, fileContent, 'utf8');

    console.log(`Successfully generated imageList.js with ${Object.keys(imageDatabase).length} categories.`);

} catch (error) {
    console.error('Error generating image list:', error);
    // Create an empty file on error to prevent site breakage
    if (!fs.existsSync(outputFile)) {
        fs.writeFileSync(outputFile, 'const imageDatabase = {};', 'utf8');
    }
}
