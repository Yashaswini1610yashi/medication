import { verifyDrug } from "./src/lib/fda";

async function testFDA() {
    console.log("Testing FDA Verification...");

    const drugs = ["Atorvastatin", "Lipitor", "Meftal-P", "Amoxicillin"];

    for (const drug of drugs) {
        console.log(`\nVerifying: ${drug}`);
        const info = await verifyDrug(drug);
        if (info) {
            console.log("  SUCCESS:");
            console.log(`  Brand: ${info.brand_name}`);
            console.log(`  Generic: ${info.generic_name}`);
            console.log(`  Purpose: ${info.purpose?.substring(0, 100)}...`);
        } else {
            console.log("  NOT FOUND");
        }
    }
}

testFDA();
