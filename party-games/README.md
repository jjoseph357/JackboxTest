# 🎮 Party Games - The Ultimate Collection

A fun and engaging collection of party games inspired by Jackbox Party Packs! Perfect for game nights, family gatherings, or any social event. Play with 2-16 players on a single device!

## 🎯 Features

- **5 Unique Games** - Social deduction, storytelling, comedy, strategy, and battle royale games
- **Up to 16 Players** - Perfect for large groups
- **Customizable Rounds** - Choose how many rounds to play each game
- **Single Device** - One person hosts, everyone plays together
- **All Ages Welcome** - Family-friendly content for everyone
- **Beautiful UI** - Modern, colorful, and intuitive interface
- **No Sign-up Required** - Just download and play!

## 🎲 Games Included

### 🎨 Secret Artist
A social deduction drawing game where players describe drawings based on a prompt, but one player is the "Secret Artist" who doesn't know what the prompt is! Can you figure out who the imposter is?

- **Players:** 3-16
- **Type:** Social Deduction
- **Duration:** ~15 minutes

**How to Play:**
1. Each player receives the same drawing prompt (except the Secret Artist)
2. Players take turns describing what they would draw
3. After all descriptions, players vote on who they think the Secret Artist is
4. Points awarded based on successful detection or evasion!

### 📖 Story Remix
A collaborative storytelling game where players create a wild story together, one sentence at a time. Watch out for plot twists that shake things up!

- **Players:** 3-16
- **Type:** Creative/Comedy
- **Duration:** ~10 minutes

**How to Play:**
1. The game starts with an opening sentence
2. Players take turns adding to the story
3. Every few rounds, a plot twist card adds chaos to the narrative
4. Vote for your favorite contribution at the end!

### 🤔 Fact or Fiction
Share facts about yourself - but some are true and some are made up! Can your friends tell which is which?

- **Players:** 3-16
- **Type:** Social/Comedy
- **Duration:** ~15 minutes

**How to Play:**
1. Each player submits one true fact and two false facts about themselves
2. Other players guess which facts are true or false
3. Earn points for correct guesses and for fooling others
4. Learn surprising things about your friends!

### 🕵️ Mission Mayhem
A team-based strategy game where players complete missions together - but beware! Hidden saboteurs are working against the team.

- **Players:** 5-16
- **Type:** Strategy/Social Deduction
- **Duration:** ~20 minutes

**How to Play:**
1. Players are secretly assigned as Agents or Saboteurs
2. A team leader selects players for each mission
3. All players vote to approve or reject the team
4. Selected players secretly choose to support or sabotage the mission
5. Can the Agents identify the Saboteurs before it's too late?

### ✊📄✂️ Rock Paper Scissors Battle Royale
An epic battle royale where players place rock, paper, or scissors on a battlefield! Objects hunt their prey with rocks chasing scissors, scissors chasing paper, and paper chasing rocks. Survive elimination rounds to become the ultimate champion!

- **Players:** 2-16
- **Type:** Strategy/Battle Royale
- **Duration:** ~15 minutes

**How to Play:**
1. Each player secretly places rock, paper, or scissors on the battlefield
2. Once all placed, objects spawn and start moving toward their prey
3. When objects collide, the winner survives (rock beats scissors, scissors beats paper, paper beats rock)
4. Players whose object type survives advance to the next round
5. Tournament continues with elimination rounds until one winner remains!
6. Final leaderboard shows eliminations and placement for each player

## 🚀 Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn package manager

### Installation

1. **Navigate to the project directory:**
   ```bash
   cd party-games
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Open your browser:**
   - The game will be running at `http://localhost:5173`
   - Open this on the device you'll use as the game host

### Building for Production

To create an optimized production build:

```bash
npm run build
```

The built files will be in the `dist` folder. You can serve these files using any static file server.

To preview the production build locally:

```bash
npm run preview
```

## 🎮 How to Play

### Setup
1. **Start the app** on a computer, tablet, or phone that everyone can see
2. **Connect to a display** (TV, projector, or just gather around the host's screen)
3. **Click "Start Playing"** on the main menu

### Player Setup
1. **Select the number of players** (2-16)
2. **Enter player names** (optional - players can use default names like "Player 1", "Player 2", etc.)
3. **Click Continue** to proceed to game selection

### Game Selection
1. **Choose a game** from the 5 available options
2. Each game card shows:
   - Game name and description
   - Number of players required
   - Whether you can play with your current player count

### Round Selection
1. **Choose how many rounds** you want to play (1-20 rounds)
2. Default suggestions are provided based on the selected game
3. For RPS Battle Royale, the game continues until one winner remains

### During the Game
1. **The host controls the device** and follows on-screen instructions
2. **Players provide input** either:
   - Verbally (by saying their answers aloud)
   - Privately (by taking the device and entering their response)
3. **The host manages** player turns and game progression
4. **Scores are tracked** automatically throughout the game

### After the Game
- View final scores and winners
- Return to the main menu to play again or choose a different game
- Player scores reset when you start a new game

## 💡 Tips for Best Experience

### For the Host
- **Use a large screen** when possible so everyone can see clearly
- **Read instructions aloud** to ensure all players understand
- **Give players time to think** before rushing them
- **Keep the energy up** - be enthusiastic!

### For Players
- **Be creative!** The funniest answers often win
- **Stay engaged** even when it's not your turn
- **Play fair** - don't peek at secret information!
- **Have fun!** These games are about laughs and memories

## 🛠️ Technical Details

### Built With
- **React** - Frontend framework
- **TypeScript** - Type-safe JavaScript
- **Vite** - Fast build tool and dev server
- **CSS3** - Custom styling with animations
- **HTML5 Canvas** - For RPS BR battle visualization

### Project Structure
```
party-games/
├── src/
│   ├── components/       # Reusable UI components
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── MainMenu.tsx
│   │   ├── PlayerSetup.tsx
│   │   ├── GameSelect.tsx
│   │   └── RoundSelect.tsx
│   ├── games/           # Individual game implementations
│   │   ├── SecretArtist.tsx
│   │   ├── StoryRemix.tsx
│   │   ├── FactFiction.tsx
│   │   ├── MissionMayhem.tsx
│   │   └── RPSBR.tsx
│   ├── types/           # TypeScript type definitions
│   │   └── index.ts
│   ├── utils/           # Helper functions and game data
│   │   ├── helpers.ts
│   │   └── gameData.ts
│   ├── App.tsx          # Main application component
│   ├── App.css          # Application styles
│   └── main.tsx         # Application entry point
├── public/              # Static assets
├── index.html           # HTML template
└── package.json         # Dependencies and scripts
```

## 🎨 Customization

### Adding New Games
1. Create a new game component in `src/games/`
2. Define game state types in `src/types/index.ts`
3. Add game info to `src/components/GameSelect.tsx`
4. Import and render the game in `src/App.tsx`

### Modifying Existing Games
- **Game prompts:** Edit `src/utils/gameData.ts`
- **Game rules:** Modify the respective game component in `src/games/`
- **Scoring:** Update the scoring logic in individual game files
- **Styling:** Edit `src/App.css`

### Changing Player Limits
- Update the min/max player counts in the game info objects in `GameSelect.tsx`
- Adjust game logic if needed to handle different player counts

## 🐛 Troubleshooting

### Game won't start
- Make sure Node.js is installed: `node --version`
- Try deleting `node_modules` and running `npm install` again
- Check that you're in the correct directory

### Build errors
- Run `npm run build` to see detailed error messages
- Ensure all dependencies are installed
- Check that you're using Node.js version 16 or higher

### Display issues
- Try zooming out or in using your browser's zoom controls
- The app is responsive and should work on various screen sizes
- For best experience, use a modern browser (Chrome, Firefox, Safari, Edge)

## 📝 License

This project is open source and available for personal and educational use.

## 🙏 Acknowledgments

Inspired by Jackbox Party Packs - the best party game series that brings people together!

## 🎉 Have Fun!

This project was created to bring people together for laughter and good times. Whether you're playing with family, friends, or colleagues, we hope these games create memorable moments and lots of fun!

**Enjoy your party! 🎊**

---

Made with ❤️ for game nights everywhere
