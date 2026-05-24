#!/usr/bin/env bash
mkdir -p paulsmalt_images && cd paulsmalt_images
urls=(
  "https://paulsmalt.co.uk/wp-content/uploads/2024/09/PaulsLogoLands.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/MarisOtterBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/ExtraPaleBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/PalAleMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/LagerMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/DextrinMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/WheatMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/MunichMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/MelanoidinMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/CaraMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/AmberMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/LightCrystalBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/MediumCrystalBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/DarkCrystalBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/DoubleRoastedBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/ChocMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/RoastedBarleyBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/BlackMaltBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/RolledOatsBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/TorrWheatBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2018/06/AWeeDropBadge.svg"
  "https://paulsmalt.co.uk/wp-content/uploads/2025/02/ScottishSmokeBadge-247x412.png"
)
for u in "${urls[@]}"; do curl -O "$u"; done