import csv

# Path to your CSV file
csv_file = "universities.csv"

# Output file for the generated JS code
output_file = "generated_university_seed.js"

# Open the CSV file and parse its contents
with open(csv_file, "r", encoding="ISO-8859-1") as csvfile:
    reader = csv.DictReader(csvfile)
    universities = []

    for row in reader:
        # Append each university as a dictionary
        universities.append({
            "name": row["Institution"],  # Replace with your column names
            "location": row["Country"]
        })

# Generate the JavaScript code for the seed data
with open(output_file, "w", encoding="utf-8") as jsfile:
    jsfile.write("// Auto-generated seed data for universities\n")
    jsfile.write("const universities = [\n")
    for uni in universities:
        jsfile.write(f"  {{ name: \"{uni['name']}\", location: \"{uni['location']}\" }},\n")
    jsfile.write("];\n\n")
    jsfile.write("module.exports = universities;\n")

print(f"Seed data written to {output_file}")
