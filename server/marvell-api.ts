import fetch from 'node-fetch';
import md5 from 'md5';

const API = 'https://gateway.marvel.com:443/v1/public/';
const key = '2f3e569af21ffe71193bd620a1b6792f';
const pkey = 'e4079be510019aa183b3a06ed4fefbda34833c58';

const getHash = () => {
  const ts = new Date().getMilliseconds();
  return `&ts=${ts}&hash=${md5(ts + pkey + key)}`;
};

export const fetchResource = (res, queryParams = '') => {
  const url = `${API}${res}?apikey=${key}${getHash()}${queryParams}`;
  return fetch(url);
};
