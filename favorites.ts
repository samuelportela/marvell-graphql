const favourites = {
    characters: [1009148],
    comics: [66777],
};


export const post = (req, res) => {
    console.log('post favourites');
    const favs = req.body;
    if (!favourites[favs.type].includes(favs.id) && favs.favorite) {
        favourites[favs.type].push(favs.id);
    }
    if (favourites[favs.type].includes(favs.id) && !favs.favorite) {
        favourites[favs.type] = favourites[favs.type].filter((x) => x !== favs.id);
    }
    res.send(favourites);
}

export const get = (_, res) => {
    console.log('get favourites');
    res.send(favourites);
}
