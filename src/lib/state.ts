import { writable } from "svelte/store";

const createCurrentDeck = () => {
    const store = writable(null);
    return {
        set: store.set,
        update: store.update,
        subscribe: store.subscribe
    };
};
export const currentDeck = createCurrentDeck();
