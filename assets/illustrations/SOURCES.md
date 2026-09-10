# Visuels métiers EPUREAU — génération du 9 septembre 2026

Méthode : outil de génération d'images intégré (`image_gen`), trois générations distinctes en parallèle. Aucun appel API par script ni clé API externe.

Les scènes sont fictives et illustrent les métiers dans un contexte ouest-africain. Elles ne représentent pas les salariés ou les réalisations d'EPUREAU. Le site affiche « Illustration générée » à proximité des bannières et une mention sous les cartes métiers. Les photos des projets réels restent dans `public/images/projets-ci` et les fichiers d'origine du dépôt.

Dimensions natives : **1672 × 941 pixels** par image. La demande de 2560 × 1440 n'a pas été honorée par l'outil ; aucun agrandissement artificiel n'a été appliqué. Export WebP qualité 86 pour le site, fichiers PNG conservés.

| Usage | Original | Fichier du site | Poids WebP |
| --- | --- | --- | --- |
| Traitement de l'eau | [ingenierie.png](ingenierie.png) | [ingenierie.webp](../../public/images/illustrations/ingenierie.webp) | 323 Ko |
| Industrie | [industrie.png](industrie.png) | [industrie.webp](../../public/images/illustrations/industrie.webp) | 216 Ko |
| Hygiène | [hygiene.png](hygiene.png) | [hygiene.webp](../../public/images/illustrations/hygiene.webp) | 137 Ko |

Les très petits marquages synthétiques sur les vêtements et machines ne sont pas des marques EPUREAU, NALCO ou ECOLAB. Aucun logo de ces entreprises n'a été ajouté aux visuels.

## Prompt complet — traitement de l'eau

```text
Use case: photorealistic-natural.
Asset type: landscape photographic illustration for EPUREAU Côte d'Ivoire industrial services website, explicitly to be identified in the website as an AI illustration, never a real project reference.
Style: sharp documentary corporate photography, dignified and technically plausible. Eye-level 28mm lens. Rich navy and natural whites, realistic materials and skin texture.
Output: exactly one separate landscape image, 16:9, target 2560x1440 pixels or largest available landscape.
Constraints: fictional people, no identifiable real persons; no EPUREAU, NALCO or ECOLAB logos, no logos of any kind, no lettering, no invented project claims, no UI, no watermarks. No stock luxury resort aesthetic.
Primary request: A modern realistic medium-scale industrial water treatment site in coastal Côte d'Ivoire, with orderly blue pipes, stainless process tanks under a shaded metal canopy, ochre soil and modest tropical greenery. Two Black West African engineers in correct navy workwear and safety helmets are inspecting the equipment.
Composition: wide realistic site at human scale, engineers together in the right half, the left half shows an open uncluttered environment suitable for website text overlay, but do not render any text.
Lighting: bright natural early morning light.
Avoid: overscale futuristic plant, implausible pipe connections, exaggerated tropical jungle.
```

## Prompt complet — industrie

```text
Use case: photorealistic-natural.
Asset type: landscape photographic illustration for EPUREAU Côte d'Ivoire industrial services website, explicitly to be identified in the website as an AI illustration, never a real project reference.
Style: sharp documentary corporate photography, dignified and technically plausible. Eye-level 28mm lens. Rich navy and natural whites, realistic materials and skin texture.
Output: exactly one separate landscape image, 16:9, target 2560x1440 pixels or largest available landscape.
Constraints: fictional people, no identifiable real persons; no EPUREAU, NALCO or ECOLAB logos, no logos of any kind, no lettering, no invented project claims, no UI, no watermarks. No stock luxury resort aesthetic.
Primary request: A modern food and beverage production utilities room typical of a West African industrial facility. Stainless steel tanks and orderly blue process piping. A Black West African female engineer wearing navy workwear and a safety helmet inspects gauges.
Composition: engineer in the right third, machinery across the left, wide industrial room at realistic human scale.
Lighting: crisp natural industrial light.
Avoid: futuristic machinery, luxury interiors, branded machines or readable labels.
```

## Prompt complet — hygiène

```text
Use case: photorealistic-natural.
Asset type: landscape photographic illustration for EPUREAU Côte d'Ivoire industrial services website, explicitly to be identified in the website as an AI illustration, never a real project reference.
Style: sharp documentary corporate photography, dignified and technically plausible. Eye-level 28mm lens. Rich navy and natural whites, realistic materials and skin texture.
Output: exactly one separate landscape image, 16:9, target 2560x1440 pixels or largest available landscape.
Constraints: fictional people, no identifiable real persons; no EPUREAU, NALCO or ECOLAB logos, no logos of any kind, no lettering, no invented project claims, no UI, no watermarks. No stock luxury resort aesthetic.
Primary request: A professional institutional laundry typical of a modern Abidjan hotel or clinic, with industrial washing machines and clean folded white linen. A Black West African laundry technician wears clean work clothes and appropriate protective gloves while working with clean linen, with no contamination.
Composition: wide room, machinery across the full frame, technician in the right third.
Lighting: bright clean natural light.
Avoid: luxury resort styling, hospital patients, contaminated laundry, branded machines or readable labels.
```
