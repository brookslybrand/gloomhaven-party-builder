import { Class, Perk } from '@prisma/client'

export { classPerks, sortPerks }

let classPerks = new Map<Class, Omit<Perk, 'characterId'>[]>([
  [
    'BRUTE',
    [
      createPerk('Remove two (-1) cards', 1),
      createPerk('Replace one (-1) card with one (+1) card', 1),
      createPerk('Add two (+1) cards', 2),
      createPerk('Add one (+3) card', 1),
      createPerk('Add three rolling PUSH-1 cards', 2),
      createPerk('Add two rolling PIERCE-3 cards', 1),
      createPerk('Add one rolling STUN card', 2),
      createPerk('Add one rolling DISARM card and one rolling MUDDLE card', 1),
      createPerk('Add one rolling ADD TARGET card', 2),
      createPerk('Add one (+1) Shield-1, Self card', 1),
      createPerk('Ignore negative item effects and add one (+1) card', 1),
    ],
  ],
  [
    'CRAGHEART',
    [
      createPerk('Remove four (+0) cards', 1),
      createPerk('Replace one (-1) card with one (+1) card', 3),
      createPerk('Add one (-2) card and two (+2) cards', 1),
      createPerk('Add one (+1) IMMOBILIZE card', 2),
      createPerk('Add one (+2) MUDDLE card', 2),
      createPerk('Add two rolling PUSH-2 cards', 1),
      createPerk('Add two rolling earth cards', 2),
      createPerk('Add two rolling wind cards', 1),
      createPerk('Ignore negative item effects', 1),
      createPerk('Ignore negative scenario effects', 1),
    ],
  ],
  [
    'MINDTHIEF',
    [
      createPerk('Remove two (-1) cards', 2),
      createPerk('Remove four (+0) cards', 1),
      createPerk('Replace two (+1) cards with two (+2) cards', 1),
      createPerk('Replace one (-2) card with one (+0) card', 1),
      createPerk('Add one (+2) ice card', 2),
      createPerk('Add two rolling (+1) cards', 2),
      createPerk('Add three rolling PULL-1 cards', 1),
      createPerk('Add three rolling MUDDLE cards', 1),
      createPerk('Add two rolling IMMOBILIZE cards', 1),
      createPerk('Add one rolling STUN card', 1),
      createPerk('Add one rolling DISARM card and rolling MUDDLE card', 1),
      createPerk('Ignore negative scenario effects', 1),
    ],
  ],
  [
    'SCOUNDREL',
    [
      createPerk('Remove two (-1) cards', 2),
      createPerk('Remove four (+0) cards', 1),
      createPerk('Replace one (-2) card with one (+0) card', 1),
      createPerk('Replace one (-1) card with one (+1) card', 1),
      createPerk('Replace one (+0) card with one (+2) card', 2),
      createPerk('Add two rolling (+1) cards', 2),
      createPerk('Add two rolling PIERCE-3 cards', 1),
      createPerk('Add two rolling POISON cards', 2),
      createPerk('Add two rolling MUDDLE cards', 1),
      createPerk('Add one INVISIBLE card', 1),
      createPerk('Ignore negative scenario effects', 1),
    ],
  ],
  [
    'SPELLWEAVER',
    [
      createPerk('Remove four (+0) cards', 1),
      createPerk('Replace one (-1) card with one (+0) card', 2),
      createPerk('Add two (+1) cards', 2),
      createPerk('Add one (+0) STUN card', 1),
      createPerk('Add one (+1) WOUND card', 1),
      createPerk('Add one (+1) IMMOBILIZE card', 1),
      createPerk('Add one (+1) CURSE card', 1),
      createPerk('Add one (+2) fire card', 2),
      createPerk('Add one (+2) ice card', 2),
      createPerk('Add one rolling earth and one rolling air card', 1),
      createPerk('Add one rolling sun and one rolling moon card', 1),
    ],
  ],
  [
    'TINKERER',
    [
      createPerk('Remove two (-1) cards', 2),
      createPerk('Replace one (-2) card with one (+0) card', 1),
      createPerk('Add two (+1) cards', 1),
      createPerk('Add one (+3) card', 1),
      createPerk('Add two rolling fire cards', 1),
      createPerk('Add three rolling MUDDLE cards', 1),
      createPerk('Add one (+1) WOUND card', 2),
      createPerk('Add one (+1) IMMOBILIZE card', 2),
      createPerk('Add one (+1) heal-2 card', 2),
      createPerk('Add one (+0) ADD TARGET card', 1),
      createPerk('Ignore negative scenario effects', 1),
    ],
  ],
])

function createPerk(
  name: string,
  available: number
): Omit<Perk, 'characterId'> {
  return {
    name,
    available,
    acquired: 0,
  }
}

function sortPerks(classValue: Class, perks: Pick<Perk, 'name'>[]) {
  let originalPerks = classPerks.get(classValue)
  if (originalPerks === undefined) {
    throw new Error(`No perks found for class ${classValue}`)
  }
  let perkOrder = new Map(originalPerks.map(({ name }, idx) => [name, idx]))
  let perksCopy = [...perks]
  perksCopy.sort((a, b) => {
    let aIdx = perkOrder.get(a.name) ?? -Infinity
    let bIdx = perkOrder.get(b.name) ?? Infinity
    return aIdx - bIdx
  })
  return perksCopy
}
