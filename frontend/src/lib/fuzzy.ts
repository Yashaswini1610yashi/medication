/**
 * Industry-standard Levenshtein distance for fuzzy matching drug names.
 */
export function getLevenshteinDistance(a: string, b: string): number {
    const matrix = Array.from({ length: a.length + 1 }, (_, i) => [i]);
    for (let j = 1; j <= b.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= a.length; i++) {
        for (let j = 1; j <= b.length; j++) {
            const cost = a[i - 1].toLowerCase() === b[j - 1].toLowerCase() ? 0 : 1;
            matrix[i][j] = Math.min(
                matrix[i - 1][j] + 1,
                matrix[i][j - 1] + 1,
                matrix[i - 1][j - 1] + cost
            );
        }
    }
    return matrix[a.length][b.length];
}

export function fuzzyMatch(input: string, choices: string[], threshold = 0.7): string | null {
    if (!input) return null;

    let bestMatch = null;
    let minDistance = Infinity;

    const cleanInput = input.trim().toLowerCase();

    for (const choice of choices) {
        const cleanChoice = choice.trim().toLowerCase();

        // Exact match
        if (cleanInput === cleanChoice) return choice;

        // Starts with (high weight in medicine)
        if (cleanChoice.startsWith(cleanInput) || cleanInput.startsWith(cleanChoice)) {
            return choice;
        }

        const distance = getLevenshteinDistance(cleanInput, cleanChoice);
        const similarity = 1 - distance / Math.max(cleanInput.length, cleanChoice.length);

        if (similarity >= threshold && distance < minDistance) {
            minDistance = distance;
            bestMatch = choice;
        }
    }

    return bestMatch;
}
