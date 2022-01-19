export function extractLanguageFromCode(code = ``) {
    return code.length > 2 ? code.split(/[-_]/)[0].toLowerCase() : code.toLowerCase()
}