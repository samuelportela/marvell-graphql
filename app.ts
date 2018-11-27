import Bundler from 'parcel-bundler';

const bundler: any = new Bundler('./app/index.html');
export const appMiddleware = bundler.middleware();