# AI DEFENDER

A space shooter game where you defend against rogue AI entities using neural beams!

## Play Now!

Play AI DEFENDER online at: [https://yourusername.github.io/ai-defender](https://yourusername.github.io/ai-defender)

## Features

- Fast-paced space shooter gameplay
- Multiple difficulty levels
- Power-ups and special abilities
- Leaderboard system with Supabase backend
- Social sharing on X (Twitter)

## How to Play

1. Use arrow keys to move your ship
2. Press SPACE to fire neural beams
3. Collect power-ups to enhance your abilities
4. Survive as long as possible and score points
5. Submit your score to the global leaderboard
6. Share your achievements on social media

## Setting Up Supabase

This game uses Supabase as a backend for the leaderboard system. To set it up:

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and anon key
4. Update the `supabase-config.js` file with your credentials:

```javascript
const SUPABASE_URL = 'your-project-url';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

5. Run the SQL commands in `supabase-schema.sql` in the Supabase SQL Editor to create the necessary tables and functions

## Database Schema

The game uses a simple database schema:

- `leaderboard` table:
  - `id`: UUID (primary key)
  - `player_initials`: VARCHAR(3) (player's 3-letter initials)
  - `player_email`: VARCHAR(255) (player's email)
  - `score`: INTEGER (player's score)
  - `difficulty`: VARCHAR(10) (easy, medium, hard)
  - `created_at`: TIMESTAMP (when the score was submitted)
  - `user_id`: UUID (reference to anonymous user)

## Social Sharing

The game includes social sharing features that allow players to share their scores on X (Twitter). This helps promote the game and create a community around it.

When a player submits their score, they can click the "Share on X" button to post their achievement with a link back to the game.

## Hosting on GitHub Pages

This game is hosted on GitHub Pages. If you want to host your own version:

1. Fork this repository
2. Go to your repository settings
3. Navigate to "Pages" in the left sidebar
4. Under "Source", select "main" branch
5. Click "Save"
6. Your game will be available at `https://yourusername.github.io/repository-name`

## Troubleshooting

If you encounter issues with the Supabase connection:

1. Check your Supabase URL and anon key in `supabase-config.js`
2. Make sure the Supabase project is active
3. Verify that the database schema has been set up correctly
4. Check the browser console for error messages

If the game is offline, scores will be saved locally and can be submitted when the connection is restored.

## Development

This game is built with:

- p5.js for rendering and game logic
- Supabase for backend services
- Web APIs for social sharing

To modify the game:

1. Edit `sketch.js` for game logic
2. Edit `supabase-config.js` for backend configuration
3. Edit `index.html` for layout and dependencies

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Credits

- Game developed by [Your Name]
- Inspired by classic space shooters
- Built with p5.js and Supabase 