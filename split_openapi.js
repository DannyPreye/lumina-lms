const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/docs/openapi.ts');
const schemaOutPath = path.join(__dirname, 'src/docs/components/schemas/generated.ts');
const pathsOutPath = path.join(__dirname, 'src/docs/paths/generated.ts');

try {
    const content = fs.readFileSync(filePath, 'utf8');

    function extractObject(source, startSearch) {
        const keyIndex = source.indexOf(startSearch);
        if (keyIndex === -1) return null;

        // Find the first '{' after the key
        let startIndex = -1;
        for(let i = keyIndex; i < source.length; i++) {
            if(source[i] === '{') {
                startIndex = i;
                break;
            }
        }

        if (startIndex === -1) return null;

        let braceCount = 0;
        let foundStart = false;
        let extractionEnd = -1;

        for (let i = startIndex; i < source.length; i++) {
            if (source[i] === '{') {
                foundStart = true;
                braceCount++;
            } else if (source[i] === '}') {
                braceCount--;
                if (foundStart && braceCount === 0) {
                    extractionEnd = i + 1;
                    break;
                }
            }
        }

        if (startIndex !== -1 && extractionEnd !== -1) {
            // We strip the outer braces to export just the properties content if we want,
            // OR we keep them and assign to a variable.
            // The user wants modular files.
            // Let's keep the braces so it's a valid object literal.
            return source.substring(startIndex, extractionEnd);
        }
        return null;
    }

    const schemasContent = extractObject(content, 'schemas:'); // Search for property name
    const pathsContent = extractObject(content, 'paths:');

    if (schemasContent) {
        // Fix indentation or imports if necessary?
        // For now, raw extraction. We might need to add imports if the original file had them inside?
        // No, schemas usually refer to other schemas via strings "#/components/schemas/..." so no imports needed for those refs.
        // But we DO need to make sure we don't prefer to 'export const User = ...' individually.
        // The extraction gives us "{ User: { ... }, Course: { ... } }"
        const output = `export const GeneratedSchemas = ${schemasContent};`;
        fs.writeFileSync(schemaOutPath, output);
        console.log('Schemas extracted to ' + schemaOutPath);
    } else {
        console.error('Could not find schemas');
    }

    if (pathsContent) {
        const output = `export const GeneratedPaths = ${pathsContent};`;
        fs.writeFileSync(pathsOutPath, output);
        console.log('Paths extracted to ' + pathsOutPath);
    } else {
        console.error('Could not find paths');
    }

} catch (err) {
    console.error('Error:', err);
}
