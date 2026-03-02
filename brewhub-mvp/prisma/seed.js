const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const wikiPages = [
  {
    slug: 'cleaning',
    title: 'Cleaning & Sanitization',
    content: `## Why Clean & Sanitize?

Proper cleaning and sanitization are crucial for successful brewing. 
Cleaning removes dirt, debris, and organic matter, while sanitizing 
kills microorganisms that can spoil your beer.

## Cleaning

- Rinse equipment immediately after use
- Use PBW (Powdered Brewery Wash) or similar cleaner
- Soak for 15-30 minutes for stubborn residue
- Scrub with soft brush - avoid scratching plastic
- Rinse thoroughly with hot water

## Sanitization

- Clean first, then sanitize
- Use Star San, Iodophor, or similar sanitizer
- Follow manufacturer's dilution instructions
- Contact time: usually 1-2 minutes
- No rinse needed for most sanitizers
- Sanitize anything that touches wort/beer after boiling

## Tips

- Never use abrasive scrubbers on fermenters
- Replace scratched plastic equipment
- Store equipment dry to prevent mold
- Make fresh sanitizer solution for each brew day`,
  },
  {
    slug: 'kegging',
    title: 'Kegging',
    content: `## Equipment Needed

- Cornelius (Corny) kegs or Sanke kegs
- CO2 tank and regulator
- Gas and liquid disconnects
- Beverage and gas tubing
- Tap or faucet

## Keg Preparation

1. Disassemble keg completely
2. Clean all parts with PBW
3. Replace o-rings if needed
4. Sanitize all parts
5. Reassemble keg

## Transferring Beer

1. Sanitize keg and all equipment
2. Purge keg with CO2
3. Transfer beer from fermenter to keg
4. Seal keg and pressurize to 30 PSI
5. Check for leaks with soapy water

## Carbonation Methods

### Force Carbonation (Fast)

- Set regulator to 30-40 PSI
- Shake keg vigorously for 5-10 minutes
- Let settle for 24 hours
- Reduce to serving pressure (8-12 PSI)

### Set and Forget (Slow)

- Set regulator to desired carbonation pressure (10-12 PSI)
- Wait 1-2 weeks at serving temperature
- Most consistent results`,
  },
  {
    slug: 'salts',
    title: 'Salts',
    content: `## Common Brewing Salts

### Calcium Chloride (CaCl₂)

- Increases Calcium and Chloride
- Enhances malt sweetness and fullness
- Good for: Malty styles, porters, stouts
- Typical use: 1-5 grams per batch

### Calcium Sulfate (Gypsum) (CaSO₄)

- Increases Calcium and Sulfate
- Enhances hop bitterness and crispness
- Good for: IPAs, pale ales, hoppy beers
- Typical use: 2-10 grams per batch

### Magnesium Sulfate (Epsom Salt) (MgSO₄)

- Increases Magnesium and Sulfate
- Can enhance hop character
- Use sparingly - too much creates harsh bitterness
- Typical use: 0-3 grams per batch

### Sodium Chloride (Table Salt) (NaCl)

- Increases Sodium and Chloride
- Rounds out malt flavors
- Use non-iodized salt only
- Typical use: 0-2 grams per batch

### Baking Soda (NaHCO₃)

- Increases Sodium and Bicarbonate
- Raises mash pH
- Use when brewing very dark beers
- Typical use: 0-5 grams per batch

## Target Water Profiles

### Pale Ale / IPA

- Ca: 100-150 ppm
- SO4: 200-400 ppm
- Cl: 50-100 ppm

### Malty Styles (Stout, Porter)

- Ca: 50-100 ppm
- SO4: 50-100 ppm
- Cl: 100-200 ppm

### Light Lagers

- Very soft water
- Minimal adjustments
- Focus on pH control`,
  },
  {
    slug: 'tips',
    title: 'Tips',
    content: `## General Tips

- Keep detailed notes of every batch
- Temperature control is crucial - especially during fermentation
- Patience is key - rushing leads to mistakes
- Start with simple recipes and build complexity gradually
- Always have a backup plan (extra yeast, extra ingredients)

## Mashing Tips

- Mash temperature affects body: Lower (65°C) = drier, Higher (70°C) = sweeter
- Check mash pH - aim for 5.2-5.6
- Stir mash well to prevent dough balls
- Mash out at 75-78°C for easier sparging

## Boiling Tips

- Vigorous boil is important for DMS removal
- Don't overfill - account for hot break foam
- Add Irish Moss or Whirlfloc in last 15 minutes for clarity
- Late hop additions preserve aroma

## Fermentation Tips

- Pitch adequate yeast - use a starter for high gravity beers
- Oxygenate wort before pitching
- Keep fermentation temperature stable
- Avoid moving fermenter during active fermentation
- Give beer enough time - rushing leads to off-flavors

## Common Off-Flavors

- **Butter/Butterscotch:** Diacetyl - warm fermentation, inadequate yeast health
- **Green Apple:** Acetaldehyde - premature racking, incomplete fermentation
- **Solvent/Chemical:** Esters - fermentation too warm
- **Vinyl/Plastic:** Chlorophenol - using chlorinated water
- **Skunky:** Lightstruck - exposure to UV light (use brown bottles)
- **Oxidized/Cardboard:** Oxygen exposure - minimize splashing, purge with CO2

## Record Keeping

Track these for every batch:

- Recipe and ingredient sources
- Mash temperature and duration
- Original gravity (OG)
- Fermentation temperature and duration
- Final gravity (FG)
- Tasting notes after conditioning
- What to improve next time`,
  },
];

async function main() {
  console.log('Seeding wiki pages...');
  
  for (const page of wikiPages) {
    await prisma.wikiPage.upsert({
      where: { slug: page.slug },
      update: {},
      create: page,
    });
    console.log(`Created/Updated: ${page.title}`);
  }
  
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });