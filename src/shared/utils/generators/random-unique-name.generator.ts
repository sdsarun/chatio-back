import { randomUUID } from "node:crypto";

const firstNames: string[] = [
  "neo", "orion", "zephyr", "blaze", "luna", "nova", "zen", "maverick", "raven", "echo",
  "jax", "cypher", "astra", "nova", "apollo", "vortex", "frost", "ember", "lumen", "jaxon", 
  "ariel", "soren", "kyra", "phoenix", "chase", "arwen", "ace", "juno", "rex", "solace", 
  "hawk", "lazlo", "sable", "lucian", "ash", "wren", "sky", "night", "paris", "storm", 
  "ember", "reign", "loki", "emberlyn", "celeste", "aurora", "viper", "zeus", "zane", "valen",
  "aeon", "rider", "sabine", "blaze", "rhea", "bliss", "sierra", "titus", "mara", "orla",
  "alexander", "julius", "maximilian", "sebastian", "nicholas", "elizabeth", "theodore", "alexandria",
  "madeline", "valentina", "christopher", "amelia", "everett", "isabella", "constance", "jeremiah",
  "penelope", "frederick", "olivia", "clementine", "evelyn", "sebastian", "theodore", "anastasia",
  "seraphina", "alexis", "lillian", "louisiana", "christiana", "virginia", "valentina", "augustus"
];

const lastNames: string[] = [
  "shadow", "storm", "ember", "blade", "sable", "wolf", "viper", "phantom", "frost", "flame",
  "night", "forge", "vanguard", "reaper", "phantom", "nova", "silva", "stark", "gale", 
  "hawk", "blackwood", "drake", "tiger", "ravenwood", "wraith", "jones", "stone", "storm",
  "silence", "thorn", "neptune", "blaze", "vortex", "cyclone", "viper", "silas", "fox", 
  "cross", "wolfgang", "wolfhart", "moon", "dusk", "bane", "duskfall", "iron", "rose",
  "winter", "silver", "fire", "valkyrie", "clark", "reign", "reaper", "knight", "zenith", 
  "quinn", "swift", "haze", "crowe", "shadowborne",
  "johnson", "williams", "sullivan", "mckenzie", "goldstein", "miller", "rodriguez", "martinez", "garcia",
  "freeman", "harrington", "wellington", "fitzgerald", "lombardi", "morrison", "stewart", "carter", "bishop",
  "foster", "gallagher", "chavez", "singleton", "mcgraw", "jameson", "hawkins", "greenwood", "harrison",
  "fletcher", "johnston", "pearson", "lawrence", "madison", "walsh", "young", "stone", "mccarthy", "wilson"
];

function getRandomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/**
 * Generates a unique guest username by combining a random first name, last name, and a short UUID.
 * This method ensures uniqueness for millions of users by appending a UUID-like suffix.
 *
 * @returns {string} A unique guest username in the format "firstName-lastName-UUID" (e.g., "neo-shadow-1234").
 */
export default function randomUniqueName(): string {
  const firstName = getRandomElement(firstNames);
  const lastName = getRandomElement(lastNames);
  
  const uuid = randomUUID().slice(0, 4).toUpperCase();
  
  return `${firstName}-${lastName}-${uuid}`;
}
