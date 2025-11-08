// Drawing prompts for Secret Artist - Simple real-life objects
const objectNouns = [
  // Animals
  'Cat', 'Dog', 'Bird', 'Fish', 'Horse', 'Cow', 'Pig', 'Chicken', 'Duck', 'Rabbit',
  'Turtle', 'Frog', 'Snake', 'Bear', 'Lion', 'Tiger', 'Elephant', 'Giraffe', 'Monkey', 'Penguin',
  'Owl', 'Eagle', 'Butterfly', 'Bee', 'Spider', 'Shark', 'Whale', 'Dolphin', 'Octopus', 'Crab',

  // Food & Drink
  'Pizza', 'Burger', 'Hot Dog', 'Taco', 'Sandwich', 'Ice Cream', 'Cookie', 'Cake', 'Donut', 'Apple',
  'Banana', 'Orange', 'Strawberry', 'Watermelon', 'Grapes', 'Carrot', 'Broccoli', 'Corn', 'Bread', 'Cheese',
  'Coffee', 'Tea', 'Soda', 'Milk', 'Water Bottle', 'Cupcake', 'Pie', 'Popcorn', 'French Fries', 'Egg',

  // Transportation
  'Car', 'Truck', 'Bus', 'Bicycle', 'Motorcycle', 'Train', 'Airplane', 'Helicopter', 'Boat', 'Ship',
  'Sailboat', 'Rocket', 'Skateboard', 'Scooter', 'Hot Air Balloon', 'Submarine', 'Tractor', 'Fire Truck', 'Ambulance', 'Police Car',

  // Nature
  'Tree', 'Flower', 'Sun', 'Moon', 'Star', 'Cloud', 'Mountain', 'Ocean', 'River', 'Lake',
  'Rainbow', 'Snowflake', 'Leaf', 'Mushroom', 'Cactus', 'Palm Tree', 'Pine Tree', 'Rose', 'Daisy', 'Sunflower',

  // Buildings & Structures
  'House', 'Castle', 'Tower', 'Bridge', 'Lighthouse', 'Barn', 'Church', 'School', 'Hospital', 'Store',
  'Apartment', 'Skyscraper', 'Windmill', 'Tent', 'Igloo', 'Pyramid', 'Fence', 'Gate', 'Door', 'Window',

  // Household Objects
  'Chair', 'Table', 'Bed', 'Lamp', 'Clock', 'Mirror', 'Picture Frame', 'Vase', 'Cup', 'Plate',
  'Fork', 'Spoon', 'Knife', 'Bowl', 'Pot', 'Pan', 'Bottle', 'Book', 'Pillow', 'Blanket',
  'Couch', 'TV', 'Computer', 'Phone', 'Remote Control', 'Trash Can', 'Bucket', 'Broom', 'Vacuum', 'Washing Machine',

  // Tools & Objects
  'Hammer', 'Screwdriver', 'Wrench', 'Saw', 'Drill', 'Scissors', 'Pencil', 'Pen', 'Paintbrush', 'Ruler',
  'Stapler', 'Tape', 'Glue', 'Paper', 'Envelope', 'Stamp', 'Key', 'Lock', 'Rope', 'Chain',

  // Clothing & Accessories
  'Hat', 'Shirt', 'Pants', 'Dress', 'Shoes', 'Boots', 'Socks', 'Gloves', 'Scarf', 'Tie',
  'Belt', 'Watch', 'Ring', 'Necklace', 'Earrings', 'Sunglasses', 'Umbrella', 'Backpack', 'Purse', 'Wallet',

  // Sports & Recreation
  'Ball', 'Baseball', 'Basketball', 'Football', 'Soccer Ball', 'Tennis Ball', 'Golf Ball', 'Bowling Ball', 'Frisbee', 'Kite',
  'Bat', 'Racket', 'Hockey Stick', 'Golf Club', 'Skateboard', 'Surfboard', 'Snowboard', 'Skis', 'Sled', 'Jump Rope',

  // Musical Instruments
  'Guitar', 'Piano', 'Drums', 'Violin', 'Trumpet', 'Flute', 'Saxophone', 'Microphone', 'Speaker', 'Headphones',

  // Shapes & Symbols
  'Heart', 'Star', 'Circle', 'Square', 'Triangle', 'Diamond', 'Arrow', 'Cross', 'Checkmark', 'Question Mark',
];

const adjectives = [
  'Big', 'Small', 'Tall', 'Short', 'Wide', 'Narrow', 'Long', 'Round', 'Square', 'Flat',
  'Curved', 'Pointy', 'Smooth', 'Rough', 'Shiny', 'Dull', 'Bright', 'Dark', 'Colorful', 'Plain',
  'Old', 'New', 'Fancy', 'Simple', 'Broken', 'Fixed', 'Open', 'Closed', 'Full', 'Empty',
];

// Generate drawing prompts by combining adjectives with nouns (50% chance)
// or just using nouns alone (50% chance)
export const drawingPrompts = objectNouns.flatMap(noun => {
  const prompts = [noun]; // Always include the plain noun

  // Add a few adjective combinations for variety
  const randomAdjectives = adjectives.slice(0, 3);
  randomAdjectives.forEach(adj => {
    prompts.push(`${adj} ${noun}`);
  });

  return prompts;
});

// Story prompts for Story Remix
export const storyPrompts = [
  'Once upon a time in a magical kingdom...',
  'It was a dark and stormy night when suddenly...',
  'In the year 2525, humans discovered...',
  'The detective knew something was wrong when...',
  'Nobody expected what would happen at the party...',
  'The treasure map led them to...',
  'On the first day of school, they found...',
  'The secret door in the basement opened to reveal...',
  'When the clock struck midnight...',
  'The last thing they remembered was...',
];

// Story twist prompts
export const storyTwists = [
  'Add a character who is actually a time traveler',
  'Introduce a magical object that changes everything',
  'Make something explode (but everyone is okay)',
  'Add an unexpected animal character',
  'Reveal that it was all a dream... or was it?',
  'Introduce a villain with a silly weakness',
  'Add a dance party',
  'Make someone discover they have superpowers',
  'Add a mysterious stranger with important news',
  'Include a chase scene',
];

// Fact or Fiction question categories
export const factCategories = [
  'Tell us about an embarrassing moment',
  'Share an unusual talent or skill you have',
  'Describe a strange food you\'ve eaten',
  'Tell us about a weird dream you remember',
  'Share an interesting place you\'ve visited',
  'Describe something you\'re afraid of',
  'Tell us about a time you got lost',
  'Share a hidden talent',
  'Describe your most unusual pet or animal encounter',
  'Tell us about a time you broke something',
];

// Mission Mayhem mission descriptions
export const missions = [
  'Explore the Ancient Temple',
  'Hack the Mainframe',
  'Retrieve the Secret Documents',
  'Disable the Security System',
  'Rescue the Hostage',
  'Plant the Tracking Device',
  'Steal the Rare Artifact',
  'Decode the Message',
  'Sabotage the Enemy Base',
  'Escape the Facility',
];
