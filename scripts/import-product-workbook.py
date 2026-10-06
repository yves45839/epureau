"""Import the supplied EPUREAU workbook without executing its formulas.

Usage: python scripts/import-product-workbook.py path/to/workbook.xlsx
The original rows and image provenance are retained in the JSON manifest.
Existing CMS records remain authoritative over these new catalogue seeds.
"""
import hashlib
import json
import posixpath
import re
import sys
import unicodedata
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
NS = {"m": "http://schemas.openxmlformats.org/spreadsheetml/2006/main",
      "x": "http://schemas.openxmlformats.org/drawingml/2006/spreadsheetDrawing",
      "a": "http://schemas.openxmlformats.org/drawingml/2006/main"}
REL = "{http://schemas.openxmlformats.org/officeDocument/2006/relationships}"


def clean(value):
    return re.sub(r"[ \t\r]+", " ", value or "").strip()


def slug(value):
    value = unicodedata.normalize("NFKD", value).encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", "-", value).strip("-")


def run(filename):
    products = {}
    assets = ROOT / "public/images/products/imported"
    assets.mkdir(parents=True, exist_ok=True)
    with zipfile.ZipFile(filename) as z:
        strings = ["".join(si.itertext()) for si in ET.fromstring(z.read("xl/sharedStrings.xml")).findall("m:si", NS)]
        sheet_names = [s.get("name") for s in ET.fromstring(z.read("xl/workbook.xml")).findall("m:sheets/m:sheet", NS)]
        rich_rels = {r.get("Id"): posixpath.normpath("xl/richData/" + r.get("Target")) for r in ET.fromstring(z.read("xl/richData/_rels/richValueRel.xml.rels"))}
        rich_images = [rich_rels[r.get(REL + "id")] for r in ET.fromstring(z.read("xl/richData/richValueRel.xml"))]
        for number, sheet_name in enumerate(sheet_names, 1):
            sheet = ET.fromstring(z.read(f"xl/worksheets/sheet{number}.xml"))
            images = {}
            for cell in sheet.findall(".//m:c", NS):
                if cell.get("vm"):
                    row = int(re.sub(r"\D", "", cell.get("r")))
                    images.setdefault(row, []).append({"file": rich_images[int(cell.get("vm")) - 1], "description": "Image intégrée à la cellule " + cell.get("r")})
            drawing = sheet.find("m:drawing", NS)
            if drawing is not None:
                sheet_rels = {r.get("Id"): posixpath.normpath("xl/worksheets/" + r.get("Target")) for r in ET.fromstring(z.read(f"xl/worksheets/_rels/sheet{number}.xml.rels"))}
                drawing_file = sheet_rels[drawing.get(REL + "id")]
                relfile = posixpath.dirname(drawing_file) + "/_rels/" + posixpath.basename(drawing_file) + ".rels"
                drawing_rels = {r.get("Id"): posixpath.normpath(posixpath.dirname(drawing_file) + "/" + r.get("Target")) for r in ET.fromstring(z.read(relfile))}
                for anchor in ET.fromstring(z.read(drawing_file)):
                    row = anchor.find("x:from/x:row", NS)
                    blip = anchor.find(".//a:blip", NS)
                    description = anchor.find(".//x:cNvPr", NS)
                    if row is not None and blip is not None:
                        images.setdefault(int(row.text) + 1, []).append({"file": drawing_rels[blip.get(REL + "embed")], "description": description.get("descr", "") if description is not None else ""})
            category = ""
            for row in sheet.findall("m:sheetData/m:row", NS):
                index = int(row.get("r"))
                cells = {}
                for c in row.findall("m:c", NS):
                    v = c.find("m:v", NS)
                    if v is not None:
                        cells[re.sub(r"\d", "", c.get("r"))] = clean(strings[int(v.text)] if c.get("t") == "s" else v.text)
                name = cells.get("E" if number in [1, 7] else "D", "")
                if not name or index < (8 if number in [1, 3, 4, 6, 7] else 9):
                    continue
                usage = cells.get("H" if number in [1, 7] else "F", "") if number in [1, 5, 7] else ""
                packaging = cells.get("F" if number in [1, 7] else "G" if number == 5 else "E", "") if number != 6 else ""
                if number in [1, 5] and not usage and not packaging:
                    category = name
                    continue
                if number == 2 and name == "REACTIFS DIVERS":
                    category = "Réactifs divers"
                    continue
                brand = "ECOLAB" if number in [1, 7] else "NALCO" if number == 4 else "LOVIBOND" if number == 2 and index < 50 else "Autres marques" if number in [5, 6] else "Commodités & Réactifs"
                if number == 5:
                    brand = "ECOLAB" if index in [12, 16, 17, 27, 28, 33, 36, 37, 38, 39, 44, 46, 48, 50] else "Autres marques"
                family = category if number in [1, 5] else "Réactifs Lovibond" if number == 2 and index < 50 else "Réactifs divers" if number == 2 else "Commodités" if number == 3 else "Traitement des eaux industrielles" if number == 4 else "Matériels et équipements" if number == 6 else "Hygiène agroalimentaire"
                key = slug(brand + " " + name)
                source = {"sheet": sheet_name, "row": index, "name": name, "packaging": packaging, "usage": usage, "compatibility": cells.get("I", "") if number in [1, 7] else ""}
                if key in products:
                    products[key]["sources"].append(source)
                    continue
                candidates = images.get(index, [])
                # Reject unrelated variants and pictures whose type contradicts the row.
                rejected = {"image25.jpeg", "image35.png", "image40.jpeg", "image58.jpeg"}
                candidates = [im for im in candidates if Path(im["file"]).name not in rejected]
                if name.lower() == "p3-topax 990":
                    candidates = []  # Workbook repeats the unrelated Topaz LD1 packshot.
                chosen = candidates[-1] if candidates else None
                image = ""
                if chosen:
                    extension = Path(chosen["file"]).suffix
                    target = assets / (key + extension)
                    target.write_bytes(z.read(chosen["file"]))
                    image = "/images/products/imported/" + target.name
                compat = source["compatibility"] if source["compatibility"] not in ["-", ""] else ""
                products[key] = {"slug": key, "data": {"nom": name, "reference": name, "marque": brand, "categorie": family, "gamme": family, "usage": usage, "secteurs": "", "forme": packaging, "points": "", "image": image, "texte": usage, "compatibilite": compat, "fiche": "", "sourceUrl": ""}, "sources": [source], "imageSource": {"type": "workbook", **chosen} if chosen else None}
        output = {"workbook": Path(filename).name, "sha256": hashlib.sha256(Path(filename).read_bytes()).hexdigest(), "products": list(products.values())}
        (ROOT / "src/content/imported-products.json").write_text(json.dumps(output, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
        print(json.dumps({"products": len(products), "images": sum(bool(p["data"]["image"]) for p in products.values()), "sourceRows": sum(len(p["sources"]) for p in products.values())}))


if __name__ == "__main__":
    run(sys.argv[1])
