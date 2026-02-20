export interface FDADrugInfo {
    brand_name: string;
    generic_name: string;
    purpose?: string;
    indications_and_usage?: string;
    warnings?: string;
    dosage_and_administration?: string;
    stop_use?: string;
    do_not_use?: string;
}

/**
 * Searches openFDA for drug information based on a brand or generic name.
 * Uses the public API with a rate limit of 240 requests per minute.
 */
export async function verifyDrug(name: string): Promise<FDADrugInfo | null> {
    try {
        // Sanitize the name for the query
        const sanitizedName = encodeURIComponent(name.trim().replace(/[^a-zA-Z0-9 ]/g, ""));

        // Search by both brand_name and generic_name using the .exact field for better precision if possible, 
        // but default to standard search for flexibility.
        const url = `https://api.fda.gov/drug/label.json?search=(openfda.brand_name:"${sanitizedName}"+openfda.generic_name:"${sanitizedName}")&limit=1`;

        const response = await fetch(url);

        if (!response.ok) {
            if (response.status === 404) return null;
            throw new Error(`FDA API error: ${response.statusText}`);
        }

        const data = await response.json();

        if (!data.results || data.results.length === 0) {
            return null;
        }

        const result = data.results[0];
        const openfda = result.openfda || {};

        return {
            brand_name: openfda.brand_name ? openfda.brand_name[0] : name,
            generic_name: openfda.generic_name ? openfda.generic_name[0] : (openfda.brand_name ? openfda.brand_name[0] : name),
            purpose: result.purpose ? result.purpose[0] : undefined,
            indications_and_usage: result.indications_and_usage ? result.indications_and_usage[0] : undefined,
            warnings: result.warnings ? result.warnings[0] : undefined,
            dosage_and_administration: result.dosage_and_administration ? result.dosage_and_administration[0] : undefined,
            stop_use: result.stop_use ? result.stop_use[0] : undefined,
            do_not_use: result.do_not_use ? result.do_not_use[0] : undefined,
        };
    } catch (error) {
        console.error(`Error verifying drug "${name}" with openFDA:`, error);
        return null;
    }
}
