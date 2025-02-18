import Database from './database';

// TODO: prevent usage of this file in a foreground context

export const singleton = new Database();