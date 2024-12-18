import axios from 'axios';

const api = axios.create({
    baseURL: 'https://api.artic.edu/api/v1/',
});

export const fetchArtworks = (page: number) => {
    return api.get(`artworks?page=${page}`);
};
