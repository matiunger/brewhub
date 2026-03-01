# brewhub

## Layout

### Header
Beericon (emoji) + Brewhub

### Sidebar (Menu)
Home
Config
Wiki:
 - list of wiki pages

## Home
should display a column of executed batch with ability to filter by type (order by date)
should display a column of draft beer batches
button to add new batch

## Config

should have diffrent tabs to edit my databases:
 - grains
 - hops
 - yeasts
 - water profiles
 - equipment
 - kegs

each one should have a list of items with properties and the ability to add/edit/delete records

## Batch page (for anything that is not beer)
show fields to edit and notes as mardown to display/edit

## Beer batch page
Here I will design the recipe entering some of the needed values and seeing calculations of other things, add real values during the brewing process.

Sections:
Recipe overview
    target numbers (OG, FG, IBU, SRM)
Select equipment
Recipe ingredients
 - Add/edit/delete grains
 - Add/edit/delete hops
 - Add/edit/delete yeast
 - Select source water profile
 - Select target water profile
Water adjustments
    CaCl, CaSO4, MgSO4
Final water profile
Water volume calculations
Preparation checklist
Molienda
Macerado
Lavado
Pre-hervido
Hervido
Whirpool
Enfriado
Fermentacion
Maduracion
Embotellado
Notes

## Wiki pages
Should be markdown.

 - Cleaning and sanitization
 - Kegging
 - Salts
 - Tips

# Database model

Batches:
brew_date
type (beer, cider, hopwater, other)
style

Cider / hop water or other batches:
brew_date
name
type
draft (boolean)
notes


Beer batches:
brew_date
name
type
notes
draft (boolean)
target_fermentar_L
target_og
target_fg
target_ibu
target_srm
equipment
grains
    id, grams
hops
    id, grams, addition_time, use (fwh, boil, whirlpool, hop stand, dry hop)
yeast
    id, quantity, temp
source_water_profile
target_water_profile

heat_up_time_min
boil_time_min
whirpool_time_min



Tasks:
item
status
notes

Equipment:
name
brewhouse_efficiency
mash_efficiency
evaporation_rate
boil_pot_diameter
fermenter_loss_l
trub_loss_l
system_loss_percent
bagasse_loss_l


Grains:
name
brand
max_yield
color_L
profile
uses

Hops:
name
alpha_acid
profile
styles
alternatives

Yeasts:
name
brand
type (liquid, dry)
temperature_range
profile
uses
attenuation

Water Profiles:
name
ca_ppm
mg_ppm
na_ppm
cl_ppm
so4_ppm
zn_ppm
hco3_ppm

Kegs:
name
number
capacity
tare_weight
notes