import { goto } from "$app/navigation";

export const createNewDeck = async () => {
    goto("/deck");
};
