const Game = require('../models/Game.model');

class GameService {
async getGames({ page = 1, limit = 10, genre, platform, search }) {
  const query = {};
  if (genre) query.genre = new RegExp(genre, 'i'); 
  if (platform) query.platform = new RegExp(platform, 'i');
  if (search) query.title = new RegExp(search, 'i');

  console.log('Query being executed:', query); 

  const total = await Game.countDocuments(query); 
  const games = await Game.find(query)
    .skip((page - 1) * limit)
    .limit(limit)
    .populate('category');

  console.log('Raw games from DB:', games);

  if (games.length === 0) {
    console.log('No games found with query:', query);
  }

  return {
    page: parseInt(page),
    limit: parseInt(limit),
    total: total,
    games: games.map(game => ({ game: { ...game.toObject(), id: game._id } }))
  };
}

  async getGame(id) {
    const game = await Game.findById(id).populate('category');
    if (!game) throw new Error('Game not found');
    return game;
  }

  async checkGameExists(title) {
    const existingGame = await Game.findOne({ title });
    return !!existingGame;
  }

  async createGame(data) {
    const { title } = data;
    const gameExists = await this.checkGameExists(title);
    if (gameExists) throw new Error('Game already exists');

    const game = new Game(data);
    return await game.save();
  }

  async updateGame(id, data) {
    const game = await Game.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    if (!game) throw new Error('Game not found');
    return game;
  }

  async deleteGame(id) {
    const game = await Game.findByIdAndDelete(id);
    if (!game) throw new Error('Game not found');
  }
}

module.exports = new GameService();