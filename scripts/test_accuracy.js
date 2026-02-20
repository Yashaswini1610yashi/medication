async function TEST_CASE(name, input, expected) {
    console.log(`\n--- Testing: ${name} ---`);
    try {
        const response = await fetch('http://localhost:3000/api/process-prescription', {
            method: 'POST',
            body: new URLSearchParams({ medicineName: input })
        });
        const data = await response.json();
        const result = data.medicines && data.medicines[0];

        if (result) {
            const nameOk = result.name.toLowerCase().includes(expected.name.toLowerCase());
            const dosageOk = result.dosage.includes(expected.dosage);
            console.log(`- Expected: ${expected.name} (${expected.dosage})`);
            console.log(`- Got: ${result.name} (${result.dosage})`);
            console.log(`- Status: ${nameOk && dosageOk ? "✅ Passed" : "❌ Failed"}`);
            return nameOk && dosageOk;
        } else {
            console.log("❌ No medicines recognized");
            return false;
        }
    } catch (err) {
        console.error(`❌ Error: ${err.message}`);
        return false;
    }
}

async function run() {
    console.log("🚀 Starting Data-Driven Accuracy Tests...");
    const results = [];
    results.push(await TEST_CASE("Amoxicillin Lookup", "Amox 500mg tid 5 days", { name: "Amoxicillin", dosage: "500" }));
    results.push(await TEST_CASE("Paracetamol Lookup", "Pcm 500mg bid", { name: "Paracetamol", dosage: "500" }));
    results.push(await TEST_CASE("Complex Case", "Lipit 20mg qd", { name: "Lipitor", dosage: "20" }));

    const passed = results.filter(r => r).length;
    console.log(`\nFinal Score: ${passed}/${results.length}`);
    console.log(`Accuracy Rate: ${((passed / results.length) * 100).toFixed(1)}%`);
}

run();
